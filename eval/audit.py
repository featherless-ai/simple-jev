"""Offline completion audit: exact suite/data coverage, raw response replay and reports.

Unlike a cloud-job status check, this proves only the saved endpoint evidence.
No model loading, HTTP requests, repair, or artifact modification occurs.
"""
import argparse
import hashlib
import json
from pathlib import Path

from presets import NAMES, suite_paths
from report import collect, snapshot
from suites import load_suite, verify_evaluator


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def audit_run(root, paths, override=None):
    root = Path(root)
    loaded = [load_suite(path, override) for path in paths]
    expected = {suite['id'] for suite, _, _, _ in loaded}
    actual = {p.parent.name for p in root.glob('*/manifest.json')}
    if len(expected) != len(loaded) or actual != expected:
        raise ValueError('Executed suite set differs from the requested selection')
    verified = 0
    summaries = {}
    for suite, adapter, source, rows in loaded:
        directory = root / suite['id']
        manifest = json.loads((directory / 'manifest.json').read_text())
        verify_evaluator(manifest)
        if (manifest['suite'] != suite or manifest['rows'] != len(rows)
                or manifest['dataset_sha256'] != sha(source)
                or manifest['adapter_sha256'] != sha(Path(adapter.__file__).read_bytes())
                or manifest['reporting'] != snapshot(suite)):
            raise ValueError(f"{suite['id']}: suite, source, scorer or coverage changed")
        raw = (directory / 'scoring_rows.jsonl').read_bytes()
        expected_rows = [{k: v for k, v in row.items() if not k.startswith('_')} for row in rows]
        if (sha(raw) != manifest['scoring_rows_sha256']
                or [json.loads(line) for line in raw.splitlines() if line.strip()] != expected_rows):
            raise ValueError('Saved scoring inputs differ from the selected source')
        by_id = {row['id']: row for row in rows}
        if len(by_id) != len(rows):
            raise ValueError('Duplicate source IDs')
        records = {}
        for line in (directory / 'predictions.jsonl').read_text().splitlines():
            if not line.strip():
                continue
            record = json.loads(line)
            identifier = record['id']
            if identifier not in by_id or identifier in records:
                raise ValueError('Duplicate or unknown prediction ID')
            if 'error' in record or 'response' not in record:
                raise ValueError('Unresolved failed or missing raw response')
            parsed = adapter.parse_response(by_id[identifier], record['response'])
            if any(record.get(k) != value for k, value in parsed.items()):
                raise ValueError('Raw response and saved scoring disagree')
            records[identifier] = record
        if set(records) != set(by_id):
            raise ValueError('Missing predictions')
        summary = adapter.summarize(rows, [records[row['id']] for row in rows])
        for field in ('category', 'subcategory', 'modality', 'language_group', 'languages'):
            summary[field] = suite.get(field, [] if field == 'languages' else 'unspecified')
        if (summary.get('failed_rows')
                or summary != json.loads((directory / 'summary.json').read_text())):
            raise ValueError('Incomplete or inconsistent suite summary')
        summaries[suite['id']] = summary
        verified += len(rows)
    if summaries != json.loads((root / 'summary.json').read_text()):
        raise ValueError('Root summary differs from rescoring')
    if collect([root]) != json.loads((root / 'report.json').read_text()):
        raise ValueError('Consolidated report differs from rescoring')
    return {'complete': True, 'verified_suites': len(expected), 'verified_examples': verified,
            # Binary labels / extracted fields / otherwise benchmark examples.
            # Ranking examples are queries, not a count of HTTP question slots.
            'scored_units': sum(s.get('targets', s.get('fields', s.get('questions', s['rows'])))
                                for s in summaries.values())}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', type=Path, required=True)
    selection = parser.add_mutually_exclusive_group(required=True)
    selection.add_argument('--preset', choices=NAMES)
    selection.add_argument('--suite', type=Path, action='append')
    parser.add_argument('--input', type=Path, help='Same single-suite dataset override as execution')
    args = parser.parse_args()
    paths = suite_paths(args.preset) if args.preset else args.suite
    if args.input and len(paths) != 1:
        parser.error('--input requires exactly one suite')
    try:
        result = audit_run(args.run, paths, args.input)
    except (ValueError, KeyError, OSError, TypeError) as error:
        print(json.dumps({'complete': False, 'error': str(error)}))
        raise SystemExit(1)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
