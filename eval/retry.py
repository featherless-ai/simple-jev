"""Retry saved HTTP 5xx failures (optionally 429), retaining original attempts.

Successful predictions and other failures are never rerun. A flushed retry
journal preserves responses if the process stops before the atomic replacement.
Run only against an idle/completed run directory, never a concurrently writing job.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import time
from run import request_record
from suites import ADAPTERS, verify_evaluator
from report import write_reports


def retry_run(root, key, workers=16, retry_429=False):
    root=Path(root)
    reports={}
    for path in sorted(root.glob('*/manifest.json')):
        manifest=json.loads(path.read_text());suite=manifest['suite'];adapter=ADAPTERS[suite['adapter']]
        verify_evaluator(manifest)
        if hashlib.sha256(Path(adapter.__file__).read_bytes()).hexdigest()!=manifest['adapter_sha256']:
            raise ValueError('Adapter changed; use the original run revision')
        raw=(path.parent/'scoring_rows.jsonl').read_bytes()
        if hashlib.sha256(raw).hexdigest()!=manifest['scoring_rows_sha256']:
            raise ValueError('Scoring inputs changed')
        rows=[json.loads(l) for l in raw.splitlines() if l.strip()]
        predictions=path.parent/'predictions.jsonl'
        records=[json.loads(l) for l in predictions.read_text().splitlines() if l.strip()]
        indexed={r['id']:r for r in records}
        if len(indexed)!=len(records) or set(indexed)!={r['id'] for r in rows}:
            raise ValueError('Retry requires one saved prediction per example; finish/resume the run first')
        journal=path.parent/'server-retries.jsonl'
        if journal.exists():
            for line in journal.read_text().splitlines():
                record=json.loads(line)
                if record['id'] not in indexed:raise ValueError('Unknown retry ID')
                indexed[record['id']]=record
        failed=[r for r in rows if 'error' in indexed[r['id']]
                and (500<=indexed[r['id']].get('http_status',0)<600
                     or (retry_429 and indexed[r['id']].get('http_status')==429))]
        args=argparse.Namespace(**{k:manifest[k] for k in ('endpoint','model','timeout','retries')})
        if failed:
            if hasattr(adapter, 'bind_assets'):
                if not manifest.get('asset_root'):
                    raise ValueError('Image retry requires the original dataset asset_root')
                adapter.bind_assets(rows, manifest['asset_root'])
                adapter.validate(rows)
            print(f"Retrying {len(failed)} retryable HTTP failures in {suite['id']}",flush=True)
            with journal.open('a') as output,ThreadPoolExecutor(max_workers=workers) as pool:
                for record in pool.map(lambda row:request_record(args,key,adapter,row),failed):
                    previous=dict(indexed[record['id']])
                    record['prior_results']=previous.pop('prior_results',[])+[previous]
                    output.write(json.dumps(record)+'\n');output.flush()
                    indexed[record['id']]=record
            manifest.setdefault('server_retry_runs',[]).append({'time_unix':time.time(),
                'rows':len(failed),'workers':workers,
                'retry_statuses':'HTTP 429, 500-599' if retry_429 else 'HTTP 500-599',
                'runner_sha256':hashlib.sha256(Path(__file__).with_name('run.py').read_bytes()).hexdigest()})
            path.write_text(json.dumps(manifest,indent=2)+'\n')
        ordered=[indexed[row['id']] for row in rows]
        temporary=predictions.with_suffix('.tmp')
        with temporary.open('w') as out:
            for record in ordered:out.write(json.dumps(record)+'\n')
        temporary.replace(predictions)
        summary=adapter.summarize(rows,ordered)
        for field in ('category','subcategory','modality','language_group','languages'):
            summary[field]=suite.get(field,[] if field=='languages' else 'unspecified')
        (path.parent/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
        reports[suite['id']]=summary
    (root/'summary.json').write_text(json.dumps(reports,indent=2)+'\n')
    write_reports(root)
    return reports


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--run',type=Path,required=True)
    p.add_argument('--key-env',help='Bearer-token environment variable; omit for unauthenticated local endpoints')
    p.add_argument('--workers',type=int,default=16)
    p.add_argument('--retry-429',action='store_true',help='Also repair saved rate-limit failures; preserve prior attempts')
    a=p.parse_args()
    key=os.environ.get(a.key_env) if a.key_env else None
    if (a.key_env and not key) or a.workers<1:p.error('Nonempty requested key environment and positive worker count required')
    reports=retry_run(a.run,key,a.workers,a.retry_429)
    print(json.dumps({k:{'rows':v['rows'],'failed_rows':v['failed_rows']} for k,v in reports.items()}))


if __name__=='__main__':main()
