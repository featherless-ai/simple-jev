"""Run the remaining supported models with their frozen native prompt runtimes."""
import hashlib
import importlib.metadata as md
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import urllib.request

ROOT = Path('/root/open-jev-experiments/jev-additions-native-v1')
SOURCE = Path('/root/open-jev-experiments/jev-additions-v1/source')
LAB = Path('/workspace/open-jev/simple-jev-prompt-lab')
DJEV = Path('/workspace/open-jev/djev-lab')
plan = json.loads((ROOT / 'plan.json').read_text())
slug = sys.argv[1]
cfg = plan['models'][slug]
out = ROOT / 'results' / slug
out.mkdir(parents=True, exist_ok=True)
if (out / 'runtime.json').exists():
    raise RuntimeError('Existing attempt; refuse to overwrite without reviewing raw results')
for path, digest in plan['dataset_hashes'].items():
    assert hashlib.sha256((SOURCE / path).read_bytes()).hexdigest() == digest, path
for path, digest in plan['frozen_source_hashes'].items():
    assert hashlib.sha256((SOURCE / path).read_bytes()).hexdigest() == digest, path
for path, digest in plan['native_source_hashes'].items():
    assert hashlib.sha256((Path('/workspace/open-jev') / path).read_bytes()).hexdigest() == digest, path
import torch
assert torch.cuda.is_available(), 'GPU required'
modelpath = Path('/root/.cache/huggingface/hub') / ('models--' + cfg['model'].replace('/', '--')) / 'snapshots' / cfg['revision']
assert modelpath.is_dir(), modelpath
base_env = {**os.environ, 'TOKENIZERS_PARALLELISM': 'false', 'MAX_JOBS': '1',
            'TORCHINDUCTOR_COMPILE_THREADS': '1', 'FULL_PROMPT_POLICY': cfg['policy'],
            'PYTHONPATH': str(LAB) + ':' + str(DJEV) + ':' + str(SOURCE),
            'HF_HUB_OFFLINE': '1'}
runtime = {'model': cfg, 'source_revision': plan['source_revision'],
           'dataset_hashes': plan['dataset_hashes'], 'native_source_hashes': plan['native_source_hashes'],
           'frozen_source_hashes': plan['frozen_source_hashes'],
           'torch': torch.__version__, 'hip': torch.version.hip,
           'gpu': torch.cuda.get_device_name(), 'image': plan['images'][slug],
           'runner_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
           'client_sha256': hashlib.sha256(Path(__file__).with_name('run_native_client.py').read_bytes()).hexdigest(),
           'started': time.time()}
procs = []
handles = []


def start(cmd, logname, url, env):
    log = (out / logname).open('x')
    handles.append(log)
    proc = subprocess.Popen(cmd, env=env, cwd=LAB, stdout=log, stderr=subprocess.STDOUT)
    procs.append(proc)
    deadline = time.monotonic() + 1800
    while True:
        if proc.poll() is not None:
            raise RuntimeError(logname + ' process exited: ' + str(proc.returncode))
        try:
            with urllib.request.urlopen(url, timeout=3) as response:
                response.read()
            return
        except (OSError, TimeoutError):
            if time.monotonic() > deadline:
                raise TimeoutError(logname + ' startup')
            time.sleep(2)


if slug == 'djev':
    sys.path.insert(0, str(DJEV))
    from runtime import install
    versions = {k: md.version(k) for k in install.MANIFEST['packages']}
    assert 'dee37d891' in versions['vllm'], versions['vllm']
    install.MANIFEST = {**install.MANIFEST, 'packages': versions}
    proof = install.install(Path(importlib.util.find_spec('vllm').origin).parent)
    (out / 'install_proof.json').write_text(json.dumps(proof, indent=2) + '\n')
    subprocess.run([sys.executable, '-m', 'pip', 'install', '--no-deps', '-e', str(DJEV)], check=True)
    frozen = out / 'hook_sources'
    frozen.mkdir()
    for name in ('hooks.py', 'hooks_round4.py', 'hooks_typed_throughput.py'):
        (frozen / name).write_bytes((DJEV / 'experiments/prompt_lab' / name).read_bytes())
    from runtime.serve import command
    cmd = command()
    cmd[2] = str(modelpath)
    for flag, value in (('--max-model-len', '262144'), ('--max-num-batched-tokens', '32768'), ('--max-num-seqs', '64')):
        cmd[cmd.index(flag) + 1] = value
    cmd += ['--skip-mm-profiling', '--enforce-eager']
    env = {**base_env, 'FULL_DJEV_SOURCE': str(frozen), 'DJEV_PROMPT_OUTPUT': str(out),
           'VLLM_USE_V2_MODEL_RUNNER': '1', 'VLLM_BATCH_INVARIANT': '0',
           'OMP_NUM_THREADS': '1', 'DJEV_UPSTREAM': 'http://127.0.0.1:8001',
           'FULL_DJEV': '1', 'FULL_DJEV_CONTEXT': '262144'}
    endpoint = 'http://127.0.0.1:8000/v1/request'
else:
    for patch in ('002-open-jev-vllm-server.patch', '003-attention-padding-fp8-cudagraph.patch'):
        subprocess.run(['patch', '--batch', '--forward', '-p1', '-i', '/workspace/image-builder/patches/' + patch], cwd='/', check=True)
    sampling = Path(importlib.util.find_spec('vllm').origin).parent / 'sampling_params.py'
    text = sampling.read_text()
    assert text.count('MAX_LOGPROB_TOKEN_IDS = 128\n') == 1
    sampling.write_text(text.replace('MAX_LOGPROB_TOKEN_IDS = 128\n', 'MAX_LOGPROB_TOKEN_IDS = 512\n'))
    hook = out / 'winning_hook.py'
    hook.write_bytes((LAB / 'experiments/prompt_lab' / (cfg['hook'] + '_hooks.py')).read_bytes())
    env = {**base_env, 'PYTHONPATH': str(LAB) + ':/workspace/image-builder/overlay/opt/open-jev:' + str(SOURCE),
           'VLLM_PLUGINS': '', 'PROMPT_LAB_OUTPUT': str(out), 'FULL_HOOK_SOURCE': str(hook),
           'ENABLE_VLLM_CLASSIFIER_ADVANCE_METRICS': '1'}
    cmd = [sys.executable, '-c',
           'from experiments.full_eval.best_hook import install; install(); from vllm.entrypoints.cli.main import main; main()',
           'serve', str(modelpath), '--served-model-name', cfg['model'],
           '--host', '127.0.0.1', '--port', '8160', '--dtype', 'bfloat16',
           '--kv-cache-dtype', 'auto', '--max-model-len', '262144', '--max-logprobs', '512',
           '--max-num-batched-tokens', '32768', '--max-num-seqs', '64', '--enable-prefix-caching',
           '--skip-mm-profiling', '--limit-mm-per-prompt', '{"image":2}',
           '--gpu-memory-utilization', '0.85']
    endpoint = 'http://127.0.0.1:8160/v1/classifier'
runtime['command'] = cmd
(out / 'runtime.json').write_text(json.dumps(runtime, indent=2) + '\n')
status = {'evaluation_exit_code': None, 'audit_exit_code': None}
try:
    if slug == 'djev':
        start(cmd, 'model.log', 'http://127.0.0.1:8001/health', env)
        start([sys.executable, '-c',
               'from experiments.full_eval.djev_hook import install; install(); from djev.__main__ import main; main()',
               '--port', '8000'], 'api.log', 'http://127.0.0.1:8000/ready', env)
    else:
        start(cmd, 'model.log', 'http://127.0.0.1:8160/health', env)
    # One small real request checks prompt-policy headers and native response parsing.
    smoke = {'model': 'djev' if slug == 'djev' else cfg['model'], 'state': 'The object is blue.',
             'questions': {'color': {'type': 'choice', 'instructions': 'What color is the object?',
                                     'criteria': {'red': 'red', 'blue': 'blue'}}}}
    request = urllib.request.Request(endpoint, data=json.dumps(smoke).encode(),
                                     headers={'Content-Type': 'application/json',
                                              'x-prompt-variant': cfg['policy'], 'x-case-id': 'smoke:text'})
    with urllib.request.urlopen(request, timeout=600) as response:
        payload = json.load(response)
    assert 'answers' in payload and 'color' in payload['answers']
    (out / 'smoke.json').write_text(json.dumps(payload, indent=2) + '\n')
    args = [sys.executable, str(Path(__file__).with_name('run_native_client.py')),
            '--endpoint', endpoint, '--model', cfg['model'], '--workers', '4',
            '--retries', '3', '--delay', '0', '--timeout', '600',
            '--deployment-info', str(out / 'runtime.json'), '--output', str(out / 'eval')]
    audit = [sys.executable, str(SOURCE / 'eval/audit.py'), '--run', str(out / 'eval')]
    for suite in plan['suites']:
        suite_path = str(SOURCE / 'eval/suites/english' / (suite + '.json'))
        args.extend(['--suite', suite_path])
        audit.extend(['--suite', suite_path])
    # The case ID header is informative only; the same frozen selected policy is used across all suites.
    env['FULL_SUITE_ID'] = 'matched-additions'
    status['evaluation_exit_code'] = subprocess.run(args, cwd=LAB, env=env, check=False).returncode
    if status['evaluation_exit_code'] == 0:
        checked = subprocess.run(audit, cwd=LAB, env=env, capture_output=True, text=True, check=False)
        (out / 'audit.json').write_text(checked.stdout + '\n')
        status['audit_exit_code'] = checked.returncode
        if checked.returncode:
            status['audit_error'] = checked.stderr
    status['finished'] = time.time()
    (out / 'status.json').write_text(json.dumps(status, indent=2) + '\n')
    if status['evaluation_exit_code'] or status['audit_exit_code']:
        raise SystemExit(1)
finally:
    for proc in reversed(procs):
        proc.terminate()
        try:
            proc.wait(timeout=30)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()
    for handle in handles:
        handle.close()
