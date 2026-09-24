"""Frozen eval runner with the prior vLLM/diffusion prompt-policy HTTP headers."""
import contextvars
import importlib.util
import json
import os
from pathlib import Path
import sys
import urllib.request

SOURCE = Path('/root/open-jev-experiments/jev-additions-v1/source')
sys.path.insert(0, str(SOURCE / 'eval'))
spec = importlib.util.spec_from_file_location('jev_additions_runner', SOURCE / 'eval/run.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
case = contextvars.ContextVar('case', default='unknown')
original_request = urllib.request.Request
original_record = runner.request_record


def request(*args, **kwargs):
    if os.environ.get('FULL_DJEV') == '1' and kwargs.get('data'):
        body = json.loads(kwargs['data'])
        body['model'] = 'djev'
        if body.get('messages'):
            raise ValueError('Text-only comparison does not accept vision messages')
        kwargs['data'] = json.dumps(body).encode()
    kwargs['headers'] = {**kwargs.get('headers', {}),
                         'x-prompt-variant': os.environ['FULL_PROMPT_POLICY'],
                         'x-case-id': os.environ['FULL_SUITE_ID'] + ':' + case.get()}
    return original_request(*args, **kwargs)


def record(args, key, adapter, row):
    token = case.set(str(row['id']))
    try:
        return original_record(args, key, adapter, row)
    finally:
        case.reset(token)


urllib.request.Request = request
runner.request_record = record
if __name__ == '__main__':
    runner.main()
