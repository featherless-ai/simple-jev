"""Optional offline native-processor tests; no weights or network downloads.

Set HF_VISION_TEST_CACHE to a Hugging Face hub cache with these checkpoints.
Absent snapshots are skipped, so the portable tiny-model suite remains runnable.
"""
import copy
import os
from pathlib import Path

import pytest

from hf_server import BackendResult, DecisionService, PromptCompiler, common_prefix, create_app, unique_prompt_tokens
from test_vision import payload


@pytest.fixture(params=['Qwen--Qwen3.5-0.8B', 'google--gemma-4-12B-it', 'google--gemma-4-26B-A4B-it',
                        'Qwen--Qwen2.5-VL-3B-Instruct', 'Qwen--Qwen3-VL-2B-Instruct',
                        'google--gemma-3-4b-it'])
def native_processor(request):
    from transformers import AutoProcessor
    from huggingface_hub.constants import HF_HUB_CACHE
    cache = Path(os.environ.get('HF_VISION_TEST_CACHE', HF_HUB_CACHE))
    snapshots = cache / ('models--' + request.param) / 'snapshots'
    paths = sorted(snapshots.glob('*'))
    if not paths:
        pytest.skip('Native processor snapshot is not cached')
    return AutoProcessor.from_pretrained(paths[0], local_files_only=True)


def preserves_reasoning(processor):
    probe = processor.apply_chat_template([
        {'role': 'user', 'content': [{'type': 'text', 'text': 'Probe'}]},
        {'role': 'assistant', 'content': [{'type': 'text', 'text': '{}'}],
         'reasoning_content': 'JEV_REASONING_PROBE'}], tokenize=False,
        continue_final_message=True, enable_thinking=True)
    return 'JEV_REASONING_PROBE' in probe


@pytest.mark.parametrize('policy', ['baseline', 'shared_examples_binary', 'shared_repeat_state', 'universal_shared'])
def test_native_compilation_preserves_images_and_preprocesses_once(native_processor, policy, monkeypatch):
    p = native_processor
    original_preprocess = p.image_processor.preprocess
    calls = []
    def counted(*args, **kwargs):
        calls.append(1)
        return original_preprocess(*args, **kwargs)
    monkeypatch.setattr(p.image_processor, 'preprocess', counted)
    compiler = PromptCompiler(p.tokenizer, processor=p, prompt_policy=policy, max_choice_options=50)
    request = payload()
    original = copy.deepcopy(request)
    if policy.startswith('shared_'):
        # Capability belongs to the checkpoint's template, not the processor
        # class (Qwen3.5 and non-thinking Qwen3-VL share a processor class).
        if not preserves_reasoning(p):
            with pytest.raises(ValueError, match='reasoning content'):
                compiler.compile(request)
            return
    compiled = compiler.compile(request)
    assert len(calls) == 1  # includes all label-boundary checks on all 3 questions
    assert request == original
    assert compiler.processor is p
    prefix = common_prefix([b.token_ids for b in compiled.branches])
    for branch in compiled.branches:
        types = branch.image_mask
        assert (types[..., :len(prefix)] != 0).any()
        assert not (types[..., len(prefix):] != 0).any()
        assert branch.model_inputs['pixel_values'].numel() > 0
        assert len(branch.output_ids) == len(set(branch.output_ids))
        assert [m['role'] for m in branch.messages] == ['system', 'user', 'assistant', 'user', 'user']
    compiler.compile(request)
    assert len(calls) == 2  # no cross-request media reuse
    compiler.max_tokens = min(len(b.token_ids) for b in compiled.branches) - 1
    with pytest.raises(ValueError, match='tokens'):
        compiler.compile(request)


async def test_image_http_routes_validation_usage(native_processor):
    import httpx
    import torch
    class Scorer:
        async def score(self, compiled):
            self.compiled = compiled
            assert all(b.model_inputs is not None for b in compiled.branches)
            return BackendResult({b.branch_id: torch.arange(len(b.output_ids), dtype=torch.float32)
                                  for b in compiled.branches}, {'branch_output_tokens': 0})
    backend = Scorer()
    compiler = PromptCompiler(native_processor.tokenizer, processor=native_processor, max_choice_options=50)
    service = DecisionService('test', compiler, backend)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(service)), base_url='http://test') as client:
        for route in ['/v1/classifier', '/v1/systemone']:
            response = await client.post(route, json=payload())
            assert response.status_code == 200, response.text
            body = response.json()
            assert set(body['answers']) == {'color', 'red', 'level'}
            assert body['usage']['input_tokens'] == unique_prompt_tokens([b.token_ids for b in backend.compiled.branches])
            bad = payload()
            bad['messages'][1]['content'][1]['image_url']['url'] = 'http://127.0.0.1/private'
            rejected = await client.post(route, json=bad)
            assert rejected.status_code == 422
            assert '127.0.0.1' not in rejected.text
        compiler.processor = None
        rejected = await client.post('/v1/classifier', json=payload())
        assert rejected.status_code == 422
        assert 'vision model' in rejected.text
