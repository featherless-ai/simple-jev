"""Optional source-backed preset audit; no model calls or dataset downloads.

Supply a directory with prepared files from the pinned converters (or an
existing private evaluation archive). The default is this checkout's eval/data.
"""
import argparse
from collections import defaultdict
import json
from pathlib import Path

from presets import suite_paths
from suites import load_suite


def verify(data_root, fallback=None):
    def source_for(filename):
        primary = data_root / filename
        if primary.is_file():
            return primary
        if fallback is not None:
            secondary = fallback / filename
            if secondary.is_file():
                return secondary
        raise FileNotFoundError(f'Missing prepared data: {primary}')

    evidence = {}
    selected = {}
    for mode in ('knowledge', 'decision', 'multi-decision'):
        ids = defaultdict(set)
        count = questions = 0
        for path in suite_paths(mode):
            declaration = json.loads(path.read_text())
            source = source_for(Path(declaration['dataset']).name)
            suite, adapter, raw, rows = load_suite(path, source)
            count += len(rows)
            for row in rows:
                n = len(adapter.request_for(row, 'AUDIT_ONLY')['questions'])
                questions += n
                if mode == 'multi-decision' and n <= 1:
                    raise ValueError('Multi-decision request contains fewer than two questions')
                if suite['id'].startswith('codemmlu-'):
                    ids['codemmlu'].add(row['id'])
        selected[mode] = ids
        evidence[mode] = {'manifests': len(suite_paths(mode)), 'requests': count,
                          'questions': questions}
    if selected['knowledge']['codemmlu'] & selected['decision']['codemmlu']:
        raise ValueError('Knowledge and decision CodeMMLU cases overlap')
    parent_path = source_for('codemmlu-full.jsonl')
    parent = {json.loads(line)['id'] for line in parent_path.read_bytes().splitlines() if line.strip()}
    if selected['knowledge']['codemmlu'] | selected['decision']['codemmlu'] != parent:
        raise ValueError('CodeMMLU partition does not reconstruct the parent')
    evidence['codemmlu_partition'] = {
        'knowledge': len(selected['knowledge']['codemmlu']),
        'decision': len(selected['decision']['codemmlu']),
        'union': len(parent), 'intersection': 0}
    return evidence


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-root', type=Path, default=Path(__file__).resolve().parent / 'data')
    parser.add_argument('--fallback-data-root', type=Path,
                        help='Explicit read-only secondary prepared-data directory')
    args = parser.parse_args()
    print(json.dumps(verify(args.data_root, args.fallback_data_root), indent=2))


if __name__ == '__main__':
    main()
