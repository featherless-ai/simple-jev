"""Launch the three missing Jev 1.13 baselines concurrently, without logging keys.

The output and launcher plan are ignored by Git. Re-running this script only
reports the saved plan; it never silently re-submits a partial/failed run.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time

EVAL = Path(__file__).resolve().parents[2]
WORKTREE = EVAL.parent
KEY_FILE = WORKTREE.parent / 'keys/OPENROUTER_API_KEY'
SUITES = ('legal-contractnli-multi', 'decision-index-when2call', 'decision-index-banking77')
ENDPOINT = 'https://openrouter.ai/api/v1/systemone'
MODEL = 'typesafe/jev-1.13'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=EVAL / 'results/jev-additions-v1')
    parser.add_argument('--key-file', type=Path, default=KEY_FILE)
    parser.add_argument('--status', action='store_true')
    args = parser.parse_args()
    plan = args.output / 'plan.json'
    if plan.exists():
        data = json.loads(plan.read_text())
        for suite, record in data['runs'].items():
            directory = args.output / 'runs' / suite / suite
            summary = directory / 'summary.json'
            print(suite, 'pid', record['pid'], 'summary',
                  'rows=' + str(json.loads(summary.read_text()).get('rows')) if summary.exists() else 'pending',
                  'log', record['log'])
        return
    if args.status:
        parser.error('No saved plan at this path')
    if args.output.exists():
        parser.error('Refusing an existing output directory without a saved plan')
    key = args.key_file.read_text().strip()
    if not key or any(ch.isspace() for ch in key):
        parser.error('Invalid key file')
    source = {}
    for suite in SUITES:
        manifest = EVAL / 'suites/english' / (suite + '.json')
        spec = json.loads(manifest.read_text())
        dataset = (manifest.parent / spec['dataset']).resolve()
        if not dataset.is_file():
            parser.error('Missing prepared data: ' + str(dataset))
        source[suite] = {'manifest_sha256': hashlib.sha256(manifest.read_bytes()).hexdigest(),
                         'dataset_sha256': hashlib.sha256(dataset.read_bytes()).hexdigest()}
    args.output.mkdir(parents=True)
    (args.output / 'runs').mkdir()
    (args.output / 'logs').mkdir()
    data = {'model': MODEL, 'endpoint': ENDPOINT, 'source': source,
            'started_at_unix': time.time(), 'runs': {},
            'key_file': str(args.key_file), 'key_value_recorded': False,
            'note': 'Concurrent CPU HTTP clients against Jev; no GPU model work; all results independently audited.'}
    env = dict(os.environ, OPENROUTER_API_KEY=key, PYTHONUNBUFFERED='1')
    for suite in SUITES:
        output = args.output / 'runs' / suite
        log_path = args.output / 'logs' / (suite + '.log')
        workers = 4 if suite == 'legal-contractnli-multi' else 8
        command = [sys.executable, str(EVAL / 'run.py'), '--endpoint', ENDPOINT,
                   '--model', MODEL, '--key-env', 'OPENROUTER_API_KEY',
                   '--suite', str(EVAL / 'suites/english' / (suite + '.json')),
                   '--workers', str(workers), '--delay', '0.02', '--timeout', '180',
                   '--retries', '3', '--output', str(output)]
        with log_path.open('x') as log:
            child = subprocess.Popen(command, cwd=WORKTREE, env=env, stdin=subprocess.DEVNULL,
                                     stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        data['runs'][suite] = {'pid': child.pid, 'log': str(log_path), 'output': str(output),
                               'command_without_key': command}
        # Durable recovery metadata before another request stream is launched.
        plan.write_text(json.dumps(data, indent=2) + '\n')
        print('submitted', suite, 'pid', child.pid)


if __name__ == '__main__':
    main()
