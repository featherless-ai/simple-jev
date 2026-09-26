"""Pretrained GPU + real loopback HTTP validation of image context sharing.

No serving-source patches, checkpoint downloads, tuning, or training. Each process loads
one pinned local checkpoint and writes raw logits, responses, and gate results.
"""
import argparse
import asyncio
import copy
from dataclasses import replace
import hashlib
import json
from pathlib import Path
import platform
import socket
import sys
import time
import traceback

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'hf-server'))
from hf_server import load_service, create_app, PromptCompiler, CompiledRequest, unique_prompt_tokens


def dump(path, value):
    path.write_text(json.dumps(value, indent=2, allow_nan=False) + '\n')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def reference(model, compiled):
    import torch
    rows = {}
    with torch.inference_mode():
        for branch in compiled.branches:
            inputs = {key: value.to(device='cuda', dtype=model.dtype if value.is_floating_point() else value.dtype)
                      for key, value in branch.model_inputs.items()}
            # Native full forward derives its own positions and masks. Never reuse
            # our cached-path position helper or any prefix KV for this reference.
            out = model(**inputs, use_cache=False, logits_to_keep=1)
            rows[branch.branch_id] = out.logits[0, -1, branch.output_ids].float().cpu()
            del out, inputs
    return rows


def comparison(compiled, actual, expected):
    import torch
    rows = []
    for branch in compiled.branches:
        a, e = actual[branch.branch_id], expected[branch.branch_id]
        assert torch.isfinite(a).all() and torch.isfinite(e).all()
        pa, pe = a.softmax(-1), e.softmax(-1)
        rows.append({'branch': branch.branch_id, 'output_ids': branch.output_ids,
                     'tokens': len(branch.token_ids),
                     'tokens_sha256': hashlib.sha256(json.dumps(branch.token_ids).encode()).hexdigest(),
                     'cached_logits': a.tolist(), 'full_logits': e.tolist(),
                     'cached_probabilities': pa.tolist(), 'full_probabilities': pe.tolist(),
                     'max_logit_delta': (a - e).abs().max().item(),
                     'max_probability_delta': (pa - pe).abs().max().item(),
                     'top_label_agreement': a.argmax().item() == e.argmax().item()})
    return rows


async def run(args):
    import torch
    import transformers
    import httpx
    import uvicorn
    torch.set_num_threads(4)
    torch.set_float32_matmul_precision('highest')
    torch.backends.cuda.matmul.allow_tf32 = False
    torch.backends.cudnn.allow_tf32 = False
    args.output.mkdir(parents=True, exist_ok=False)
    assert torch.cuda.is_available(), 'No GPU; CPU fallback forbidden'
    probe = (torch.ones(16, device='cuda') * 2).sum().item()
    assert probe == 32
    torch.cuda.synchronize()
    fixtures = json.loads(args.fixtures.read_text())
    gates = fixtures['gates']
    reference_fn = reference
    if args.reference == 'native_chunks':
        from native_chunks import reference as reference_fn
    def compare(compiled, actual, expected):
        rows = comparison(compiled, actual, expected)
        if args.reference == 'native_chunks':
            for row in rows:
                row['native_chunked_logits'] = row.pop('full_logits')
                row['native_chunked_probabilities'] = row.pop('full_probabilities')
        return rows
    runtime = {'model': str(args.model), 'revision': args.model.name,
               'config_sha256': digest(args.model / 'config.json'),
               'fixtures_sha256': digest(args.fixtures), 'torch': torch.__version__,
               'transformers': transformers.__version__, 'python': platform.python_version(),
               'hip': torch.version.hip, 'gpu': str(torch.cuda.get_device_properties(0)),
               'gpu_preflight_sum': probe, 'dtype': args.dtype, 'gates': gates,
               'reference_mode': args.reference}
    dump(args.output / 'runtime.json', runtime)
    print('LOAD', args.model, flush=True)
    service = load_service(str(args.model), served_model_name='validation', device='cuda',
                           dtype=args.dtype, max_model_len=16384, prompt_policy='baseline',
                           max_choice_options=50)
    service.advanced_metrics = True
    model = service.backend.model
    family = model.config.model_type
    runtime['model_type'] = family
    runtime['attention'] = model.config.get_text_config()._attn_implementation
    runtime['loaded_dtype'] = str(model.dtype)
    dump(args.output / 'runtime.json', runtime)
    tower = (model.model.visual if family.startswith('qwen') else
             model.model.embed_vision if family == 'gemma4_unified' else model.model.vision_tower)
    counts = {'vision': 0, 'preprocess': 0}
    def vision_hook(*unused):
        counts['vision'] += 1
    hook = tower.register_forward_pre_hook(vision_hook)
    processor = service.compiler.processor
    original_preprocess = processor.image_processor.preprocess
    def preprocessing(*pos, **kw):
        counts['preprocess'] += 1
        return original_preprocess(*pos, **kw)
    processor.image_processor.preprocess = preprocessing
    import hf_media
    original_fetch = hf_media.fetch_image
    downloads = []
    def fetch_image(url, **kwargs):
        data = original_fetch(url, **kwargs)
        sha = hashlib.sha256(data).hexdigest()
        destination = args.output / ('remote-' + sha + '.image')
        if destination.exists():
            assert destination.read_bytes() == data
        else:
            destination.write_bytes(data)
        downloads.append({'url': url, 'sha256': sha, 'bytes': len(data), 'file': destination.name})
        return data
    hf_media.fetch_image = fetch_image
    original_score = service.backend.score
    capture = {}
    async def score(compiled):
        result = await original_score(compiled)
        capture.update(compiled=compiled, result=result)
        return result
    service.backend.score = score
    sock = socket.socket()
    sock.bind(('127.0.0.1', 0))
    port = sock.getsockname()[1]
    server = uvicorn.Server(uvicorn.Config(create_app(service), log_level='warning'))
    task = asyncio.create_task(server.serve(sockets=[sock]))
    records, failures = [], []
    try:
        while not server.started:
            if task.done():
                await task
                raise RuntimeError('Server failed to start')
            await asyncio.sleep(.02)
        async with httpx.AsyncClient(base_url=f'http://127.0.0.1:{port}', timeout=300) as client:
            async def check(fixture, route='/v1/classifier'):
                service.compiler = PromptCompiler(processor.tokenizer, processor=processor,
                    max_tokens=16384, prompt_policy=fixture['policy'], max_choice_options=50)
                before = dict(counts)
                before_downloads = len(downloads)
                start = time.perf_counter()
                response = await client.post(route, json=fixture['request'])
                torch.cuda.synchronize()
                seconds = time.perf_counter() - start
                observed = {k: counts[k] - before[k] for k in counts}
                assert response.status_code == 200, response.text
                body = response.json()
                compiled, actual = capture['compiled'], capture['result']
                before_reference = counts['vision']
                full = reference_fn(model, compiled)
                assert counts['vision'] - before_reference == len(compiled.branches)
                rows = compare(compiled, actual.logits, full)
                diagnostic = None
                if args.reference == 'native_chunks':
                    diagnostic = comparison(compiled, actual.logits, reference(model, compiled))
                passed = (
                    observed == {'vision': 1, 'preprocess': 1}
                    and all(r['max_probability_delta'] <= gates['max_probability_delta'] for r in rows)
                    and all(r['max_logit_delta'] <= gates.get('max_logit_delta', float('inf')) for r in rows)
                    and all(r['top_label_agreement'] for r in rows)
                    and body['answers']['color']['choice'] == fixture['expected_color']
                    and body['usage']['input_tokens'] == unique_prompt_tokens([b.token_ids for b in compiled.branches])
                    and body['metrics']['prefill_strategy'] == 'multimodal_shared_prefix'
                )
                record = {'id': fixture['id'], 'route': route, 'policy': fixture['policy'],
                          'seconds': seconds, 'observed_calls': observed, 'response': body,
                          'expected_color': fixture['expected_color'], 'comparisons': rows, 'passed': passed,
                          'remote_downloads': downloads[before_downloads:],
                          'nonchunked_full_diagnostic': diagnostic}
                records.append(record)
                dump(args.output / (fixture['id'] + '.json'), record)
                if not passed:
                    failures.append(fixture['id'])
                print('CASE', fixture['id'], 'pass', passed, 'calls', observed,
                      'max_p_delta', max(r['max_probability_delta'] for r in rows), flush=True)
                return record
            for fixture in fixtures['fixtures']:
                await check(fixture)
            # Text inference after native full-forward references must not inherit
            # multimodal positions or stale images. Then repeat original image HTTP.
            service.compiler = PromptCompiler(processor.tokenizer, processor=processor, max_choice_options=50)
            text = {'model': 'validation', 'state': 'The bicycle is green.', 'questions': {
                'color': {'type': 'choice', 'instructions': 'What color is the bicycle?',
                          'criteria': {'green': None, 'red': None}}}}
            before = dict(counts)
            response = await client.post('/v1/classifier', json=text)
            assert response.status_code == 200, response.text
            assert counts == before, 'Text requests processed stale images'
            assert response.json()['answers']['color']['choice'] == 'green'
            dump(args.output / 'text-after-images.json', response.json())
            repeated = copy.deepcopy(fixtures['fixtures'][0])
            repeated['id'] = 'repeat-via-alias'
            repeat = await check(repeated, '/v1/systemone')
            assert repeat['response']['answers'] == records[0]['response']['answers'], 'Request isolation failure'

            # All rejection probes traverse real HTTP and must fail before model work.
            rejected = []
            for kind in ['remote_url', 'invalid_base64', 'audio', 'tools', 'overlong']:
                request = copy.deepcopy(fixtures['fixtures'][0]['request'])
                if kind == 'remote_url':
                    request['messages'][1]['content'][1]['image_url']['url'] = 'http://127.0.0.1/private'
                elif kind == 'invalid_base64':
                    request['messages'][1]['content'][1]['image_url']['url'] = 'data:image/png;base64,@@@'
                elif kind == 'audio':
                    request['messages'][1]['content'][1] = {'type': 'input_audio', 'input_audio': {'data': 'AAAA', 'format': 'wav'}}
                elif kind == 'tools':
                    request['tools'] = [{'type': 'function'}]
                else:
                    service.compiler.max_tokens = 8
                before = counts['vision']
                response = await client.post('/v1/classifier', json=request)
                assert response.status_code == 422, response.text
                assert counts['vision'] == before
                rejected.append({'kind': kind, 'status': response.status_code, 'body': response.json()})
                service.compiler.max_tokens = 16384
            dump(args.output / 'rejections.json', rejected)

            # Deliberately different leading instructions: no shared media KV.
            # Recompile each independent branch; do not corrupt image-token spans.
            service.compiler = PromptCompiler(processor.tokenizer, processor=processor, max_choice_options=50)
            original = fixtures['fixtures'][0]['request']
            whole = service.compiler.compile(original)
            branches = []
            for i, key in enumerate(original['questions']):
                request = copy.deepcopy(original)
                request['messages'][0]['content'] = f'Branch identifier {i}. ' + request['messages'][0]['content']
                request['questions'] = {key: original['questions'][key]}
                branch = service.compiler.compile(request).branches[0]
                branches.append(replace(branch, branch_id=whole.branches[i].branch_id))
            separate = CompiledRequest(whole.plan, branches)
            before = counts['vision']
            result = await original_score(separate)
            observed = counts['vision'] - before
            rows = compare(separate, result.logits, reference_fn(model, separate))
            passed = (observed == len(branches) and result.metrics['prefix_tokens'] == 0
                      and all(r['max_probability_delta'] <= gates['max_probability_delta'] and r['top_label_agreement']
                              and r['max_logit_delta'] <= gates.get('max_logit_delta', float('inf')) for r in rows))
            dump(args.output / 'separate-contexts.json', {'observed_vision_calls': observed,
                 'metrics': result.metrics, 'comparisons': rows, 'passed': passed})
            if not passed:
                failures.append('separate-contexts')

            if fixtures.get('mixed_context_groups'):
                # Two questions retain their actual shared context; the third
                # uses a distinct compiled template. Only that third is independent.
                mixed = replace(whole, branches=whole.branches[:2] + [branches[2]])
                before = counts['vision']
                result = await original_score(mixed)
                observed = counts['vision'] - before
                before = counts['vision']
                expected = reference_fn(model, replace(whole, branches=whole.branches[:2]))
                expected.update(reference(model, replace(whole, branches=[branches[2]])))
                reference_calls = counts['vision'] - before
                rows = compare(mixed, result.logits, expected)
                passed = (observed == 2 and reference_calls == 3
                          and result.metrics['prefill_strategy'] == 'multimodal_grouped_prefix'
                          and result.metrics['context_groups'] == 2
                          and all(r['max_probability_delta'] <= gates['max_probability_delta'] and r['top_label_agreement']
                                  and r['max_logit_delta'] <= gates.get('max_logit_delta', float('inf')) for r in rows))
                dump(args.output / 'mixed-contexts.json', {'observed_vision_calls': observed,
                     'reference_vision_calls': reference_calls, 'metrics': result.metrics,
                     'comparisons': rows, 'passed': passed})
                if not passed:
                    failures.append('mixed-contexts')
    finally:
        server.should_exit = True
        await task
        sock.close()
        hook.remove()
        processor.image_processor.preprocess = original_preprocess
        hf_media.fetch_image = original_fetch
    summary = {'passed': not failures, 'failed_cases': failures,
               'image_http_requests': len(records), 'http_selected_logit_comparisons': sum(len(r['comparisons']) for r in records),
               'max_probability_delta': max(row['max_probability_delta'] for r in records for row in r['comparisons']),
               'color_correct': sum(r['response']['answers']['color']['choice'] == r['expected_color'] for r in records),
               'reference_mode': args.reference,
               'nonchunked_full_max_probability_delta': max((row['max_probability_delta']
                   for r in records for row in (r['nonchunked_full_diagnostic'] or [])), default=None),
               'peak_allocated_bytes': torch.cuda.max_memory_allocated(), 'scope': fixtures['scope']}
    dump(args.output / 'summary.json', summary)
    print('SUMMARY', json.dumps(summary), flush=True)
    if failures:
        raise RuntimeError('Validation gates failed: ' + ', '.join(failures))
    dump(args.output / 'complete.json', summary)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--dtype', choices=['bfloat16', 'float32'], default='bfloat16')
    parser.add_argument('--reference', choices=['full', 'native_chunks'], default='full')
    parser.add_argument('--fixtures', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        asyncio.run(run(args))
    except BaseException:
        if args.output.is_dir():
            (args.output / 'failure.txt').write_text(traceback.format_exc())
        raise
