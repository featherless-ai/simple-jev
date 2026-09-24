"""Frozen-source, single-model GPU execution for the Jev additions comparison."""
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import urllib.request

ROOT = Path('/root/open-jev-experiments/jev-additions-v1')
SOURCE = ROOT / 'source'
PLAN = json.loads((ROOT / 'plan.json').read_text())
slug = sys.argv[1]
model = PLAN['models'][slug]
out = ROOT / 'results' / slug
out.mkdir(parents=True, exist_ok=True)
if (out / 'runtime.json').exists():
    raise RuntimeError('Existing attempt: do not silently overwrite or resubmit')
for path, expected in PLAN['source_hashes'].items():
    assert hashlib.sha256((SOURCE / path).read_bytes()).hexdigest() == expected, path
for path, expected in PLAN['dataset_hashes'].items():
    assert hashlib.sha256((SOURCE / path).read_bytes()).hexdigest() == expected, path
import torch
assert torch.cuda.is_available(), 'GPU required; never fall back to CPU'
runtime = {'model': model, 'source_revision': PLAN['source_revision'],
           'source_hashes': PLAN['source_hashes'], 'dataset_hashes': PLAN['dataset_hashes'],
           'image': PLAN['image'], 'torch': torch.__version__, 'hip': torch.version.hip,
           'gpu': torch.cuda.get_device_name(), 'started': time.time(),
           'packages': {p: importlib.metadata.version(p) for p in
                        ('transformers', 'accelerate', 'tokenizers', 'huggingface-hub', 'fastapi', 'pydantic')},
           'runner_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
cmd = [sys.executable, str(SOURCE / 'hf-server/hf_server.py'),
       '--model', model['model'], '--revision', model['revision'],
       '--classifier-prompt-policy', model['policy'], '--device', 'cuda',
       '--dtype', 'bfloat16', '--max-model-len', '32768', '--max-batch-size', '32',
       '--max-batch-tokens', '32768', '--port', '8179']
runtime['command'] = cmd
(out / 'runtime.json').write_text(json.dumps(runtime, indent=2) + '\n')
status = {'evaluation_exit_code': None, 'audit_exit_code': None}
with (out / 'server.log').open('x') as log:
    server = subprocess.Popen(cmd, stdout=log, stderr=subprocess.STDOUT)
    try:
        deadline = time.monotonic() + 1800
        while True:
            if server.poll() is not None:
                raise RuntimeError(f'HF server exited during loading: {server.returncode}')
            try:
                with urllib.request.urlopen('http://127.0.0.1:8179/health', timeout=3) as response:
                    health = json.load(response)
                (out / 'health.json').write_text(json.dumps(health, indent=2) + '\n')
                break
            except (OSError, TimeoutError):
                if time.monotonic() > deadline:
                    raise TimeoutError('HF server startup timeout')
                time.sleep(5)
        cli = [sys.executable, str(SOURCE / 'eval/run.py'),
               '--endpoint', 'http://127.0.0.1:8179/v1/classifier',
               '--model', model['model'], '--workers', '2', '--retries', '1',
               '--delay', '0', '--timeout', '600', '--output', str(out / 'eval'),
               '--deployment-info', str(out / 'runtime.json')]
        audit = [sys.executable, str(SOURCE / 'eval/audit.py'), '--run', str(out / 'eval')]
        for suite in PLAN['suites']:
            path = str(SOURCE / 'eval/suites/english' / (suite + '.json'))
            cli.extend(['--suite', path])
            audit.extend(['--suite', path])
        status['evaluation_exit_code'] = subprocess.run(cli, check=False).returncode
        if status['evaluation_exit_code'] == 0:
            checked = subprocess.run(audit, capture_output=True, text=True, check=False)
            (out / 'audit.json').write_text(checked.stdout + '\n')
            status['audit_exit_code'] = checked.returncode
            if checked.returncode:
                status['audit_error'] = checked.stderr
        status['finished'] = time.time()
        (out / 'status.json').write_text(json.dumps(status, indent=2) + '\n')
        if status['evaluation_exit_code'] or status['audit_exit_code']:
            raise SystemExit(1)
    finally:
        server.terminate()
        try:
            server.wait(timeout=30)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()
