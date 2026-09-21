"""Implementation-independent, multi-suite evaluation over a Jev-compatible HTTP API.

Standard library only. Suite adapters own validation, request construction,
response parsing and metrics. The runner owns transport and per-suite artifacts.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.request


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--endpoint', required=True, help='Full URL, e.g. http://host:8000/v1/classifier or /v1/systemone')
    parser.add_argument('--model', required=True, help='Exact model ID accepted by the endpoint')
    parser.add_argument('--suite', action='append', type=Path, required=True, help='Suite JSON path; repeat for multiple suites')
    parser.add_argument('--input', type=Path, help='Override dataset for one selected suite')
    parser.add_argument('--output', type=Path, required=True, help='New directory; never overwrites a run')
    parser.add_argument('--key-env', help='Environment variable containing a bearer token')
    parser.add_argument('--delay', type=float, default=.3)
    parser.add_argument('--timeout', type=float, default=120)
    parser.add_argument('--retries', type=int, default=3, help='Retries for HTTP 429/502/503/504')
    args = parser.parse_args()
    if args.delay < 0 or args.timeout <= 0 or args.retries < 0:
        parser.error('Invalid delay, timeout or retries')
    if not args.endpoint.startswith(('http://', 'https://')) or '@' in args.endpoint or '?' in args.endpoint:
        parser.error('Use an HTTP(S) URL without embedded credentials or query parameters')
    key = os.environ.get(args.key_env) if args.key_env else None
    if args.key_env and not key:
        parser.error('Requested API-key environment variable is empty')
    from suites import load_suite
    if args.input and len(args.suite) != 1:
        parser.error('--input override requires exactly one suite')
    # Validate all suites before sending any requests or creating output.
    loaded = [load_suite(path,args.input) for path in args.suite]
    if len({suite['id'] for suite, _, _, _ in loaded}) != len(loaded):
        parser.error('Suite IDs must be unique within a run')
    seen = set()
    for suite, _, source, rows in loaded:
        digest = hashlib.sha256(source).hexdigest()
        for row in rows:
            key = (suite['project'], suite['project_configuration'], digest, row['id'])
            if key in seen:
                parser.error('Overlapping parent/child suites: select either the parent or disjoint children')
            seen.add(key)
    args.output.mkdir(parents=True,exist_ok=False)
    reports = {}
    for suite, adapter, source, rows in loaded:
        reports[suite['id']] = run_suite(args,key,suite,adapter,source,rows)
    (args.output/'summary.json').write_text(json.dumps(reports,indent=2)+'\n')
    from report import write_reports
    write_reports(args.output)
    if any(r['failed_rows'] for r in reports.values()):
        raise SystemExit(1)


def run_suite(args, key, suite, adapter, source, rows):
    output_dir = args.output/suite['id']
    output_dir.mkdir()
    manifest = {'endpoint': args.endpoint, 'model': args.model, 'dataset_sha256': hashlib.sha256(source).hexdigest(),
        'rows': len(rows), 'suite': suite, 'adapter_sha256': hashlib.sha256(Path(adapter.__file__).read_bytes()).hexdigest(), 'retries': args.retries,
        'delay': args.delay, 'timeout': args.timeout, 'started_at_unix': time.time(),
        'runner_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
    from report import snapshot
    manifest['reporting'] = snapshot(suite)
    # Keep portable scoring inputs: gold remains local, never in HTTP requests.
    scoring = ''.join(json.dumps({k:v for k,v in row.items() if not k.startswith('_')}, ensure_ascii=False)+'\n' for row in rows)
    (output_dir/'scoring_rows.jsonl').write_text(scoring)
    manifest['scoring_rows_sha256'] = hashlib.sha256(scoring.encode()).hexdigest()
    (output_dir/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    headers = {'Content-Type': 'application/json'}
    if key:
        headers['Authorization'] = 'Bearer '+key
    # No redirects: do not forward a bearer token to another endpoint.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **kw):
            return None
    opener = urllib.request.build_opener(NoRedirect)
    records = []
    with (output_dir/'predictions.jsonl').open('w') as output:
        for index, row in enumerate(rows):
            if index:
                time.sleep(args.delay)
            start = time.monotonic()
            record = {'id': row['id']}
            for attempt in range(args.retries+1):
                record['attempts'] = attempt+1
                try:
                    req = urllib.request.Request(args.endpoint, data=json.dumps(adapter.request_for(row,args.model)).encode(), headers=headers)
                    with opener.open(req, timeout=args.timeout) as response:
                        data = json.load(response)
                    record['response'] = data
                    record.update(adapter.parse_response(row,data))
                    break
                except urllib.error.HTTPError as error:
                    record['http_status'] = error.code
                    if error.code in (429,502,503,504) and attempt < args.retries:
                        try:
                            delay = max(2**attempt, float(error.headers.get('Retry-After','0')))
                        except ValueError:
                            delay = 2**attempt
                        if delay <= 120:
                            time.sleep(delay)
                            continue
                    record['error'] = f'HTTP {error.code}'
                    break
                except Exception as error:
                    # Do not persist exception text that may expose server or auth details.
                    record['error'] = type(error).__name__
                    break
            record['elapsed_seconds'] = time.monotonic()-start
            records.append(record)
            output.write(json.dumps(record)+'\n')
            output.flush()
            print(f'{index+1}/{len(rows)} {row["id"]}: {record.get("error", "ok")}', flush=True)
    report = adapter.summarize(rows,records)
    report['category'] = suite.get('category', 'unspecified')
    report['subcategory'] = suite.get('subcategory', 'unspecified')
    report['modality'] = suite.get('modality', 'unspecified')
    report['language_group'] = suite.get('language_group', 'unspecified')
    report['languages'] = suite.get('languages', [])
    (output_dir/'summary.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
    return report


if __name__ == '__main__':
    main()
