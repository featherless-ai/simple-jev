"""Sequential local HF prompt-policy search using the native 477-case quick preset.

Standard-library orchestration only. Model execution requires the HF server's
installed dependencies and sufficient local hardware. Never changes serving defaults.
"""
import argparse
import hashlib
import importlib.metadata
import json
import math
import os
import platform
import re
import signal
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

from presets import suite_paths, describe
from suites import load_suite, evaluator_hashes

ROOT = Path(__file__).resolve().parents[1]
# Default tuning is sharing-compatible. Broader searches require explicit opt-in.
POLICIES = ('baseline', 'shared_examples_binary', 'shared_repeat_state')
ALL_POLICIES = ('baseline', 'examples_binary', 'repeat_state', 'strict_mix_repeat2',
                'shared_examples_binary', 'shared_repeat_state', 'universal_shared')
SHARING_POLICIES = POLICIES + ('universal_shared',)
COUNTS = {'jevbench-public': 231, 'semif-authored': 144, 'semif-typesafe': 102}


def write_json(path, value):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, indent=2, allow_nan=False) + '\n')
    temporary.replace(path)


def preflight():
    """Validate the complete preset before starting any model process."""
    loaded = [load_suite(p) for p in suite_paths('quick')]
    counts = {suite['id']: len(rows) for suite, _, _, rows in loaded}
    if counts != COUNTS:
        raise ValueError(f'Quick search requires exactly {COUNTS}; got {counts}')
    return {suite['id']: hashlib.sha256(raw).hexdigest()
            for suite, _, raw, _ in loaded}


def source_hashes():
    paths = [*ROOT.joinpath('common').glob('*.py'),
             *ROOT.joinpath('hf-server').glob('*.py'), Path(__file__),
             ROOT / 'eval/audit.py', ROOT / 'eval/presets.py', *suite_paths('quick')]
    result = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
              for p in paths}
    result.update({'eval/' + p: digest for p, digest in evaluator_hashes().items()})
    return result


def pin_revision(model, revision):
    """Resolve remote branches once, before loading any weights; local paths stay local."""
    if Path(model).is_dir():
        return revision
    from huggingface_hub import HfApi, constants, try_to_load_from_cache
    if constants.HF_HUB_OFFLINE:
        cached = try_to_load_from_cache(model, 'config.json', revision=revision or 'main')
        if not isinstance(cached, str):
            raise ValueError('Offline search needs a cached config/revision or a local checkpoint path')
        resolved = Path(cached).parent.name
    else:
        resolved = HfApi().model_info(model, revision=revision, timeout=30).sha
    if not isinstance(resolved, str) or not re.fullmatch(r'[0-9a-f]{40}', resolved):
        raise ValueError('Could not resolve an immutable checkpoint revision')
    return resolved


def native_total(summary):
    """Pooled native per-row correctness, not the equal-case/decision macro."""
    if set(summary) != set(COUNTS):
        raise ValueError('Missing or extra quick suites')
    total = 0
    for name, count in COUNTS.items():
        s = summary[name]
        if (s['rows'] != count or s['successful_rows'] != count
                or s['failed_rows'] != 0 or s.get('unscorable_rows', 0) != 0):
            raise ValueError(f'Incomplete suite: {name}')
        value = s['accuracy'] * count
        if not math.isfinite(value) or not 0 <= value <= count or abs(value - round(value)) > 1e-8:
            raise ValueError(f'Invalid native accuracy: {name}')
        correct = round(value)
        if 'correct' in s and s['correct'] != correct:
            raise ValueError(f'Inconsistent native count: {name}')
        total += correct
    return total


def comparison(results, policies):
    complete = [r for r in results if r['status'] == 'complete']
    best = max((r['correct'] for r in complete), default=None)
    tied = [r['policy'] for r in complete if r['correct'] == best]
    finished = len(results) == len(policies) and len(complete) == len(policies)
    return {'complete': finished, 'selection_metric': 'pooled native correct / 477',
            'sharing_compatible_only': all(p in SHARING_POLICIES for p in policies),
            'nonshared_policies': [p for p in policies if p not in SHARING_POLICIES],
            'development_selection_not_held_out': True,
            'recommended_policy': tied[0] if finished else None,
            'best_complete_policies': tied, 'tie_break': 'requested policy order',
            'results': results}


def server_command(args, policy, served_name):
    command = [sys.executable, str(ROOT / 'hf-server/hf_server.py'),
               '--model', args.model, '--served-model-name', served_name,
               '--enforce-model-id', '--classifier-prompt-policy', policy,
               '--device', args.device, '--dtype', args.dtype,
               '--max-model-len', str(args.max_model_len),
               '--max-choice-options', str(args.max_choice_options),
               '--max-batch-size', str(args.max_batch_size),
               '--max-batch-tokens', str(args.max_batch_tokens),
               '--host', '127.0.0.1', '--port', str(args.port)]
    if args.revision:
        command += ['--revision', args.revision]
    return command


def port_available(port):
    with socket.socket() as sock:
        # Allow TIME_WAIT connections from our previous server, not an active
        # listener. Do not use SO_REUSEPORT, which could share an owned port.
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(('127.0.0.1', port))


def wait_ready(process, url, served_name, timeout):
    # Ignore proxy environment variables for our loopback-only child process.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f'Server exited with code {process.returncode}; inspect server.log')
        try:
            with opener.open(url + '/health', timeout=2) as response:
                health = json.load(response)
            if health.get('model') == served_name and health.get('status') == 'ready':
                return health
        except (OSError, ValueError, urllib.error.URLError):
            pass
        time.sleep(.5)
    raise TimeoutError('Server readiness timeout; inspect server.log')


def stop_owned(process):
    if process is None or process.poll() is not None:
        return
    process.terminate()
    try:
        process.wait(timeout=30)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()


def run_policy(args, policy, directory, provenance):
    directory.mkdir()
    served = 'prompt-search-' + uuid.uuid4().hex
    command = server_command(args, policy, served)
    deployment = {**provenance, 'prompt_policy': policy, 'served_model_name': served,
                  'server_command': command}
    write_json(directory / 'deployment.json', deployment)
    result = {'policy': policy, 'status': 'failed', 'directory': str(directory)}
    server = None
    start = time.monotonic()
    try:
        port_available(args.port)  # Never reuse or stop an existing listener.
        if source_hashes() != provenance['source_sha256'] or preflight() != provenance['dataset_sha256']:
            raise ValueError('Source or datasets changed during search')
        with (directory / 'server.log').open('w') as log:
            server = subprocess.Popen(command, stdout=log, stderr=subprocess.STDOUT)
            write_json(directory / 'process.json', {'pid': server.pid,
                       'started_at_unix': time.time(), 'served_model_name': served})
            url = f'http://127.0.0.1:{args.port}'
            write_json(directory / 'health.json', wait_ready(server, url, served, args.startup_timeout))
            run = [sys.executable, str(ROOT / 'eval/run.py'), '--preset', 'quick',
                   '--endpoint', url + '/v1/classifier', '--model', served,
                   '--output', str(directory / 'eval'), '--deployment-info', str(directory / 'deployment.json'),
                   '--workers', str(args.workers), '--delay', '0', '--retries', '0',
                   '--timeout', str(args.request_timeout)]
            write_json(directory / 'eval-command.json', run)
            environment = {**os.environ, 'NO_PROXY': '127.0.0.1,localhost',
                           'no_proxy': '127.0.0.1,localhost'}
            with (directory / 'eval.log').open('w') as evaluation_log:
                completed = subprocess.run(run, stdout=evaluation_log, stderr=subprocess.STDOUT,
                                           timeout=args.eval_timeout, env=environment)
            result['evaluation_exit_code'] = completed.returncode
            if completed.returncode:
                raise RuntimeError('Evaluation failed or contains failed rows; inspect eval.log and raw records')
            with (directory / 'audit.log').open('w') as audit_log:
                audit = subprocess.run([sys.executable, str(ROOT / 'eval/audit.py'),
                                        '--run', str(directory / 'eval'), '--preset', 'quick'],
                                       stdout=audit_log, stderr=subprocess.STDOUT, timeout=300)
            if audit.returncode:
                raise RuntimeError('Native response/coverage audit failed; inspect audit.log')
            if source_hashes() != provenance['source_sha256'] or preflight() != provenance['dataset_sha256']:
                raise ValueError('Source or datasets changed during evaluation')
            summary = json.loads((directory / 'eval/summary.json').read_text())
            result.update(status='complete', correct=native_total(summary), rows=477, suites=summary)
    except KeyboardInterrupt:
        result.update(status='interrupted', error='Interrupted by user')
        raise
    except Exception as error:
        result['error'] = f'{type(error).__name__}: {error}'
    finally:
        stop_owned(server)
        result['elapsed_seconds'] = time.monotonic() - start
        write_json(directory / 'result.json', result)
    return result


def parser():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--model', required=True)
    p.add_argument('--revision', help='Pin a checkpoint commit for reproducible comparisons')
    p.add_argument('--output', type=Path, help='New directory; never overwritten or resumed')
    scope = p.add_mutually_exclusive_group()
    scope.add_argument('--policies', nargs='+', choices=ALL_POLICIES,
                       help='Explicit subset; may include legacy non-sharing formats')
    scope.add_argument('--all-formats', action='store_true',
                       help='Opt in to all formats, including legacy non-sharing formats')
    p.add_argument('--list', action='store_true', help='Offline plan only; no model loads/downloads')
    p.add_argument('--device', default='auto')
    p.add_argument('--dtype', choices=['float32', 'float16', 'bfloat16'], default='bfloat16')
    p.add_argument('--max-model-len', type=int, default=32768)
    p.add_argument('--max-choice-options', type=int, choices=range(2, 256), default=255, metavar='2..255')
    p.add_argument('--max-batch-size', type=int, default=32)
    p.add_argument('--max-batch-tokens', type=int, default=32768)
    p.add_argument('--workers', type=int, default=1)
    p.add_argument('--port', type=int, default=8179)
    p.add_argument('--startup-timeout', type=float, default=1800)
    p.add_argument('--request-timeout', type=float, default=300)
    p.add_argument('--eval-timeout', type=float, default=14400, help='Seconds per policy evaluation')
    return p


def interrupt_search(signum, frame):
    """Let normal finally blocks stop our server on external termination too."""
    raise KeyboardInterrupt


def main(argv=None):
    p = parser(); args = p.parse_args(argv)
    if args.policies is None:
        args.policies = list(ALL_POLICIES if args.all_formats else POLICIES)
    if len(set(args.policies)) != len(args.policies):
        p.error('Policies must be unique')
    if not 1 <= args.port <= 65535 or any(not math.isfinite(v) or v <= 0 for v in (
            args.max_model_len, args.max_batch_size, args.max_batch_tokens, args.workers,
            args.startup_timeout, args.request_timeout, args.eval_timeout)):
        p.error('Limits and timeouts must be positive; port must be 1..65535')
    if args.list:
        print(json.dumps({'model': args.model, 'policies': args.policies,
                          'sharing_compatible_only': all(policy in SHARING_POLICIES for policy in args.policies),
                          'nonshared_policies': [policy for policy in args.policies if policy not in SHARING_POLICIES],
                          'suites': describe(suite_paths('quick')),
                          'commands': [server_command(args, policy, '<unique-search-id>') for policy in args.policies]}, indent=2))
        return 0
    if args.output is None:
        p.error('--output is required for execution')
    args.output = args.output.resolve()
    if args.output.exists():
        p.error('Output already exists; use a new directory')
    datasets = preflight()
    port_available(args.port)
    requested_revision = args.revision
    args.revision = pin_revision(args.model, args.revision)
    packages = {}
    for name in ['torch', 'transformers', 'tokenizers', 'accelerate', 'fastapi', 'pydantic']:
        try:
            packages[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            packages[name] = None
    provenance = {'model': args.model, 'requested_revision': requested_revision,
                  'resolved_revision': args.revision,
                  'source_sha256': source_hashes(), 'dataset_sha256': datasets,
                  'packages': packages, 'platform': platform.platform(), 'python': sys.version,
                  'settings': {k: v for k, v in vars(args).items() if k != 'output'}}
    args.output.mkdir(parents=True)
    write_json(args.output / 'search.json', provenance)
    results = []
    previous_term = signal.signal(signal.SIGTERM, interrupt_search)
    policy = args.policies[0]
    try:
        for policy in args.policies:
            result = run_policy(args, policy, args.output / policy, provenance)
            results.append(result)
            write_json(args.output / 'comparison.json', comparison(results, args.policies))
            print(policy, result['status'], f"{result.get('correct', '?')}/477", flush=True)
    except KeyboardInterrupt:
        # The interrupted policy's own result/logs are already persisted.
        partial = args.output / policy / 'result.json'
        if partial.is_file() and not any(r['policy'] == policy for r in results):
            results.append(json.loads(partial.read_text()))
        write_json(args.output / 'comparison.json', comparison(results, args.policies))
        return 130
    finally:
        signal.signal(signal.SIGTERM, previous_term)
    report = comparison(results, args.policies)
    print('Recommended policy:', report['recommended_policy'] or 'none (incomplete search)')
    return 0 if report['complete'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
