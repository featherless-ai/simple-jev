"""Pinned public knowledge/awareness benchmarks. No model execution.

Gold answers and explanations are never sent to the model. Download only with
--download; cached bytes must match committed SHA-256. Parquet requires pyarrow.
CyberMetric uses the full 10,000-question release, not overlapping size variants.
MetaTool uses the labelled tool-awareness task, not a new factual-knowledge claim.
"""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path
import urllib.request
from adapters import choice
from prepare_external import canonical

ROOT = Path(__file__).resolve().parent
CODE_KNOWLEDGE = {'programming_syntax','api_frameworks','software_principles','dbms_sql','others'}


def convert(kind, records, family=None):
    rows = []
    for i, r in enumerate(records):
        # Three pinned malformed rows: two single choices and one out-of-range gold.
        if kind == 'codemmlu' and r.get('task_id') in ('k05719', 'rt01749', 'k10418'):
            continue
        subject = family or kind
        if kind == 'cybermetric':
            question, options, gold = r['question'], r['answers'], r['solution']
        elif kind.startswith('secqa-'):
            question, options, gold = r['Question'], {k:r[k] for k in 'ABCD'}, r['Answer']
        elif kind == 'metatool-awareness':
            if r['label'] not in ('positive','negative'):
                raise ValueError('Unknown awareness gold label')
            question = ('Does this user query require external tools? Consider real-time/external data, '
                        'specialized inputs/outputs, tasks beyond a text model, and user-specific interaction.\n'
                        + r['query'])
            options, gold = {'no':'No','yes':'Yes'}, 'yes' if r['label']=='positive' else 'no'
        else:
            values = r['options'] if kind == 'mmlu-pro' else r['choices']
            if not 2 <= len(values) <= 26:
                raise ValueError('Unexpected choice count')
            question = r['question']
            options = dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ', values))
            gold = r['answer']
            if kind == 'mmlu-pro':
                subject = r['category']
                if list(options).index(gold) != r['answer_index']:
                    raise ValueError('Inconsistent MMLU-Pro labels')
        if gold not in options:
            raise ValueError('Missing public gold answer')
        source_id = r.get('task_id', i)
        rows.append(canonical(f'{subject}-{source_id}', r.get('problem_description'), question,
                    [{'id':k,'description':v} for k,v in options.items()],
                    list(options).index(gold), subject))
    choice.validate(rows)
    return rows


def prepare(suite, sources, download=False):
    names = sorted(p.stem for p in (ROOT/'vendor/knowledge').glob('codemmlu-*.json')) if suite=='codemmlu-full' else [suite]
    rows, provenance = [], {}
    for name in names:
        meta = json.loads((ROOT/'vendor/knowledge'/f'{name}.json').read_text())
        path = sources/meta['file']
        if not path.exists():
            if not download:
                raise ValueError(f'Missing {path}; use --download')
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(urllib.request.urlopen(meta['url'], timeout=120).read())
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest()!=meta['sha256']:
            raise ValueError('Pinned source checksum mismatch')
        if name.startswith('secqa-'):
            records = list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
        elif meta['file'].endswith('.parquet'):
            import pyarrow.parquet as pq
            records = pq.read_table(io.BytesIO(raw)).to_pylist()
        else:
            records = json.loads(raw)
            if name=='cybermetric':
                records = records['questions']
        family = name.removeprefix('codemmlu-') if name.startswith('codemmlu-') else None
        rows.extend(convert(name if suite!='codemmlu-full' else 'codemmlu', records, family))
        provenance[name] = dict(meta, source_rows=len(records), excluded_ids=[r['task_id'] for r in records if name.startswith('codemmlu-') and r.get('task_id') in ('k05719','rt01749','k10418')])
    if suite=='cybermetric' and len(rows)!=10180:
        raise ValueError('Expected all 10,180 rows in the pinned CyberMetric-10000 release')
    choice.validate(rows)
    return rows, provenance


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('suite',choices=['cybermetric','secqa-v1','secqa-v2','metatool-awareness','mmlu-pro','codemmlu-full'])
    p.add_argument('--sources',type=Path,default=ROOT/'sources/knowledge')
    p.add_argument('--download',action='store_true')
    p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();sidecar=a.output.with_suffix('.provenance.json')
    if a.output.exists() or sidecar.exists(): p.error('Refusing to overwrite')
    rows,sources=prepare(a.suite,a.sources,a.download)
    content=''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows)
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(content)
    sidecar.write_text(json.dumps({'sources':sources,'rows':len(rows),
        'protocol':'classifier Choice; no generated reasoning, retrieval or tool execution',
        'dataset_sha256':hashlib.sha256(content.encode()).hexdigest(),
        'preparer_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},indent=2)+'\n')
    print(f'Prepared {len(rows)} rows; no inference performed')


if __name__=='__main__': main()
