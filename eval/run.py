"""Implementation-independent, multi-suite evaluation over a Jev-compatible HTTP API.

Standard library only. Suite adapters own validation, request construction,
response parsing and metrics. The runner owns transport and per-suite artifacts.
"""
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
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
    from presets import NAMES, suite_paths, describe
    parser.add_argument('--endpoint', help='Full URL, e.g. http://host:8000/v1/classifier or /v1/systemone')
    parser.add_argument('--model', help='Exact model ID accepted by the endpoint')
    selection = parser.add_mutually_exclusive_group(required=True)
    selection.add_argument('--suite', action='append', type=Path, help='Suite JSON path; repeat for multiple suites')
    selection.add_argument('--preset', choices=NAMES)
    parser.add_argument('--list', action='store_true', help='List selected manifests and dataset presence; no validation or HTTP calls')
    parser.add_argument('--deployment-info', type=Path, help='Optional non-secret JSON recording server revision, precision and explicit startup policy; not sent to server')
    parser.add_argument('--input', type=Path, help='Override dataset for one selected suite')
    parser.add_argument('--output', type=Path, help='New directory; never overwrites a run')
    parser.add_argument('--key-env', help='Environment variable containing a bearer token')
    parser.add_argument('--delay', type=float, default=.3)
    parser.add_argument('--timeout', type=float, default=120)
    parser.add_argument('--workers', type=int, default=1, help='Maximum concurrent HTTP requests')
    parser.add_argument('--resume', action='store_true', help='Continue an identical interrupted run; saved rows are never sent again')
    parser.add_argument('--retries', type=int, default=3, help='Retries for HTTP 429 and 5xx server errors')
    args = parser.parse_args()
    if args.preset:
        args.suite = suite_paths(args.preset)
    if args.list:
        print(json.dumps(describe(args.suite), indent=2))
        return
    if not all((args.endpoint, args.model, args.output)):
        parser.error('--endpoint, --model and --output are required for execution')
    args.deployment = json.loads(args.deployment_info.read_text()) if args.deployment_info else None
    if args.deployment is not None and not isinstance(args.deployment, dict):
        parser.error('--deployment-info must contain a JSON object without secrets')
    if args.delay < 0 or args.timeout <= 0 or args.retries < 0 or args.workers < 1:
        parser.error('Invalid delay, timeout or retries')
    if not args.endpoint.startswith(('http://', 'https://')) or '@' in args.endpoint or '?' in args.endpoint:
        parser.error('Use an HTTP(S) URL without embedded credentials or query parameters')
    key = os.environ.get(args.key_env) if args.key_env else None
    if args.key_env and not key:
        parser.error('Requested API-key environment variable is empty')
    from suites import load_suite
    if args.input and len(args.suite) != 1:
        parser.error('--input override requires exactly one suite')
    # Cross-protocol views of the same source judgments must not be run as
    # independent examples in one selection, even when IDs/grouping differ.
    declarations = [json.loads(path.read_text()) for path in args.suite]
    selected_ids = {suite['id'] for suite in declarations}
    for suite in declarations:
        if selected_ids.intersection(suite.get('overlaps_suites', [])):
            parser.error(f"{suite['id']} overlaps an explicitly selected suite")
    # Validate all suites before sending any requests or creating output.
    loaded = [load_suite(path,args.input) for path in args.suite]
    if len({suite['id'] for suite, _, _, _ in loaded}) != len(loaded):
        parser.error('Suite IDs must be unique within a run')
    seen = set()
    for suite, _, source, rows in loaded:
        digest = hashlib.sha256(source).hexdigest()
        for row in rows:
            example_key = (suite['project'], suite['project_configuration'], digest, row['id'])
            if example_key in seen:
                parser.error('Overlapping parent/child suites: select either the parent or disjoint children')
            seen.add(example_key)
    args.output.mkdir(parents=True,exist_ok=args.resume)
    reports = {}
    for suite, adapter, source, rows in loaded:
        reports[suite['id']] = run_suite(args,key,suite,adapter,source,rows)
    (args.output/'summary.json').write_text(json.dumps(reports,indent=2)+'\n')
    from report import write_reports
    write_reports(args.output)
    if any(r['failed_rows'] for r in reports.values()):
        raise SystemExit(1)


def request_record(args, key, adapter, row):
    """One request, with bounded retries. Credentials never enter saved records."""
    headers = {'Content-Type': 'application/json'}
    if key:
        headers['Authorization'] = 'Bearer '+key
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **kw):
            return None
    opener = urllib.request.build_opener(NoRedirect)
    record = {'id': row['id']}
    start = time.monotonic()
    for attempt in range(args.retries+1):
        record['attempts'] = attempt+1
        try:
            body = adapter.request_for(row,args.model)
            # System One requires a string/object/array, even for context-free questions.
            if body.get('state', '') is None:
                body['state'] = ''
            req = urllib.request.Request(args.endpoint, data=json.dumps(body).encode(), headers=headers)
            with opener.open(req, timeout=args.timeout) as response:
                data = json.load(response)
            record['response'] = data
            record.update(adapter.parse_response(row,data))
            record.pop('http_status', None)
            break
        except urllib.error.HTTPError as error:
            record['http_status'] = error.code
            record.setdefault('http_errors', []).append({'attempt':attempt+1,'status':error.code})
            if (error.code == 429 or 500 <= error.code < 600) and attempt < args.retries:
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
            record['error'] = type(error).__name__
            break
    record['elapsed_seconds'] = time.monotonic()-start
    return record


def run_suite(args, key, suite, adapter, source, rows):
    output_dir = args.output/suite['id']
    from report import snapshot
    from suites import evaluator_hashes
    identity = {'endpoint': args.endpoint, 'model': args.model,
        'dataset_sha256': hashlib.sha256(source).hexdigest(), 'rows': len(rows),
        'suite': suite, 'adapter_sha256': hashlib.sha256(Path(adapter.__file__).read_bytes()).hexdigest(),
        'retries': args.retries, 'delay': args.delay, 'timeout': args.timeout,
        'workers': args.workers, 'reporting': snapshot(suite),
        'evaluator_sha256': evaluator_hashes(),
        'deployment': getattr(args, 'deployment', None)}
    if hasattr(adapter, 'bind_assets'):
        # Persist the asset binding separately from scoring rows, whose private
        # fields are intentionally omitted. Image retries must recheck the bytes.
        identity['asset_root'] = str(Path(rows[0]['_image_file']).parents[
            len(Path(rows[0]['image_path']).parts) - 1])
    manifest_path = output_dir/'manifest.json'
    predictions_path = output_dir/'predictions.jsonl'
    records = {}
    if args.resume and manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        if any(manifest.get(k) != v for k,v in identity.items()):
            raise ValueError('Resume requires identical model, data, protocol and execution settings')
        scoring_raw = (output_dir/'scoring_rows.jsonl').read_bytes()
        if hashlib.sha256(scoring_raw).hexdigest() != manifest['scoring_rows_sha256']:
            raise ValueError('Scoring inputs changed after the original run')
        if predictions_path.exists():
            saved = [json.loads(line) for line in predictions_path.read_text().splitlines() if line.strip()]
            records = {r['id']:r for r in saved}
            if len(records) != len(saved) or not records.keys() <= {r['id'] for r in rows}:
                raise ValueError('Invalid saved prediction IDs')
    else:
        output_dir.mkdir()
        manifest = dict(identity, started_at_unix=time.time(),
            runner_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest())
        scoring = ''.join(json.dumps({k:v for k,v in row.items() if not k.startswith('_')}, ensure_ascii=False)+'\n' for row in rows)
        (output_dir/'scoring_rows.jsonl').write_text(scoring)
        manifest['scoring_rows_sha256'] = hashlib.sha256(scoring.encode()).hexdigest()
        manifest_path.write_text(json.dumps(manifest, indent=2)+'\n')
    pending_rows = (row for row in rows if row['id'] not in records)
    # Keep at most workers futures in memory, even for 400k+ example datasets.
    with predictions_path.open('a') as output, ThreadPoolExecutor(max_workers=args.workers) as pool:
        pending = set()
        last_dispatch = 0.0
        consecutive_errors = 0
        halted = False
        def submit():
            nonlocal last_dispatch
            row = next(pending_rows, None)
            if row is None:
                return False
            time.sleep(max(0, args.delay-(time.monotonic()-last_dispatch)))
            pending.add(pool.submit(request_record,args,key,adapter,row))
            last_dispatch = time.monotonic()
            return True
        for _ in range(args.workers):
            if not submit(): break
        while pending:
            done, pending = wait(pending, return_when=FIRST_COMPLETED)
            for future in done:
                record = future.result()
                consecutive_errors = consecutive_errors+1 if 'error' in record else 0
                halted = halted or consecutive_errors >= 20 or record.get('http_status') in (401,402,403)
                records[record['id']] = record
                output.write(json.dumps(record)+'\n')
                output.flush()
                if len(records) % 100 == 0 or len(records) == len(rows) or 'error' in record:
                    print(f"{len(records)}/{len(rows)} {record['id']}: {record.get('error', 'ok')}", flush=True)
                if not halted:
                    submit()
    if halted:
        raise RuntimeError('Run paused after authorization/billing failure or 20 consecutive errors; saved predictions retained')
    ordered = [records[row['id']] for row in rows]
    report = adapter.summarize(rows,ordered)
    for field in ('category','subcategory','modality','language_group','languages'):
        report[field] = suite.get(field, [] if field=='languages' else 'unspecified')
    (output_dir/'summary.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2),flush=True)
    return report


if __name__ == '__main__':
    main()
