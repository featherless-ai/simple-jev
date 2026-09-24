"""Prompt-only policies: native formatting, frozen parity, scoring and loading."""
import hashlib
import json
import math
import sys
from unittest.mock import Mock

import httpx
import pytest

from common import ClassifierRequest, prepare_prompt
from common.prompt_builder import CHOICE_LABELS
from conftest import Tokenizer
from hf_prompt_policies import PROMPT_POLICIES, INPUT_REPEAT, STATE_REPEAT
from hf_server import BackendResult, DecisionService, PromptCompiler, create_app, load_service


class NativeTokenizer(Tokenizer):
    def apply_chat_template(self, messages, **kwargs):
        if kwargs.get('add_generation_prompt'):
            return super().apply_chat_template(messages, **kwargs)
        assert kwargs == {'tokenize': False, 'add_generation_prompt': False,
                          'continue_final_message': True,
                          'enable_thinking': 'reasoning_content' in messages[-1]}
        assert all(isinstance(m['content'], list) for m in messages)
        assert all(len(m['content']) == 1 and m['content'][0]['type'] == 'text' for m in messages)
        return '\n'.join(f"{m['role']}: {m.get('reasoning_content', '')}{m['content'][0]['text']}" for m in messages)


def request(state='An animal is a cat.'):
    return ClassifierRequest.model_validate({
        'model': 'm', 'state': state,
        'questions': {
            'choice': {'type': 'choice', 'instructions': 'Which animal?', 'criteria': {'cat': 'Cat', 'dog': 'Dog'}},
            'score': {'type': 'score', 'instructions': 'Presence?', 'criteria': ['absent', 'present']},
            'noul': {'type': 'noul', 'instructions': 'A cat?', 'criteria': {'false': 'Not a cat', 'true': 'A cat'}},
        },
    })


# Independently derived from the frozen context_repeat95/repeat95 experiment hooks.
FROZEN = {
    ('examples_binary', 'text'): '19b2f634fb15a158044fa3a6e5f7e7c9c2c45a10851f3dbe89772c0beacad46e',
    ('examples_binary', 'json'): '554820b7b7d27c525ff4b8d79d26670c7209a54d54a496d9339441a53c342629',
    ('repeat_state', 'text'): '4ca4c07fec749b833beedf058057aea63fdbea3e392ca01e350209c9bb3b1ee9',
    ('repeat_state', 'json'): '08a1edb698a51ecda9d1333af49fd2540c0d5456429d1f2674086fad693f14c2',
    ('strict_mix_repeat2', 'text'): 'a7ed7b6b6a9088e09bb8199db733605e9511f0e91c24beeeb12e6941ea2e307a',
    ('strict_mix_repeat2', 'json'): '984d88ba84fb17d7e6dbb659d8e87bfee27be3b2e33b99f27f4996b203f2bdbb',
}


@pytest.mark.parametrize('policy,kind', FROZEN)
def test_frozen_prompt_parity_and_no_mutation(policy, kind):
    req = request('An animal is a cat.' if kind == 'text' else {'animal': 'cat', 'count': 1})
    before = req.model_dump()
    compiled = PromptCompiler(NativeTokenizer(), prompt_policy=policy).compile(req)
    labels = '1234567890' + CHOICE_LABELS
    snapshot = []
    for branch, q in zip(compiled.branches, compiled.plan.questions):
        nine_bin = req.questions[q.question_id].type == 'noul' and policy == 'strict_mix_repeat2'
        snapshot.append({'messages': branch.messages, 'answer_prefix': branch.answer_prefix,
                         'output_indices': [labels.index(label) for label in q.output_labels],
                         'choice_labels': None if nine_bin else list(q.answer_labels),
                         'reasoning_content': branch.reasoning_content})
    digest = hashlib.sha256(json.dumps(snapshot, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    assert digest == FROZEN[policy, kind]
    assert req.model_dump() == before
    assert compiled.plan.template_version == f'hf-{policy}-v1'


@pytest.mark.parametrize('policy', PROMPT_POLICIES)
def test_labels_and_native_prefill(policy):
    c = PromptCompiler(NativeTokenizer(), prompt_policy=policy).compile(request())
    binary = policy in ('examples_binary', 'repeat_state')
    assert c.binary_noul_keys == (('noul',) if binary else ())
    assert c.branches[-1].output_ids == list(map(ord, 'AB' if binary else '123456789'))
    for branch, q in zip(c.branches, c.plan.questions):
        assert branch.reasoning_content == ('[thinking]\n' * 3 if policy != 'baseline' and q.question_id == 'choice' else None)
        assert branch.token_ids
    if policy == 'baseline':
        assert c.plan == prepare_prompt(request())
    if policy == 'strict_mix_repeat2':
        for branch in c.branches:
            first, second = branch.messages[-1]['content'].split(INPUT_REPEAT)
            assert first == second
    if policy == 'repeat_state':
        assert STATE_REPEAT in c.branches[0].messages[-1]['content']


@pytest.mark.parametrize('policy', PROMPT_POLICIES[1:])
@pytest.mark.parametrize('advanced', [False, True])
async def test_public_http_types_and_binary_probability(policy, advanced):
    class Backend:
        async def score(self, compiled):
            logits = {q.branch_id: {label: 0.0 for label in q.output_labels} for q in compiled.plan.questions}
            if compiled.binary_noul_keys:
                logits[compiled.plan.questions[-1].branch_id]['B'] = math.log(3)
            return BackendResult(logits, {'branch_output_tokens': 3})
    service = DecisionService('m', PromptCompiler(NativeTokenizer(), prompt_policy=policy), Backend(), advanced_metrics=advanced)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(service)), base_url='http://test') as client:
        for route in ('/v1/classifier', '/v1/systemone'):
            response = await client.post(route, json=request().model_dump(exclude_none=True))
            assert response.status_code == 200, response.text
            body = response.json()
            assert body['answers']['choice']['type'] == 'choice'
            assert body['answers']['score']['type'] == 'score'
            assert body['answers']['noul']['type'] == 'noul'
            assert body['answers']['noul']['noul'] == pytest.approx(.75 if policy != 'strict_mix_repeat2' else .5)
            assert 'choice' not in body['answers']['noul']
            assert body['usage']['output_tokens'] == 3
            assert ('metadata' in body) == advanced
            if advanced:
                assert body['metadata']['template_version'] == f'hf-{policy}-v1'


@pytest.mark.parametrize('policy', PROMPT_POLICIES[1:])
def test_chat_rejected_and_laya_not_changed(policy):
    req = request().model_dump(exclude={'state'})
    req['messages'] = [{'role': 'user', 'content': 'cat'}]
    with pytest.raises(ValueError, match='state'):
        PromptCompiler(NativeTokenizer(), prompt_policy=policy).compile(req)
    with pytest.raises(ValueError, match='Laya uses native formatting'):
        load_service('unused', backend='laya', prompt_policy=policy)


def test_invalid_policy_rejected_before_loading():
    with pytest.raises(ValueError, match='Unknown prompt policy'):
        load_service('unused', prompt_policy='bad')
    with pytest.raises(ValueError, match='Unknown prompt policy'):
        PromptCompiler(NativeTokenizer(), prompt_policy='bad')


@pytest.mark.parametrize('policy', PROMPT_POLICIES[1:])
def test_context_and_render_only(policy):
    c = PromptCompiler(NativeTokenizer(), prompt_policy=policy, max_tokens=1)
    assert all(not b.token_ids for b in c.compile(request(), render_only=True).branches)
    with pytest.raises(ValueError, match='tokens'):
        c.compile(request())


def test_template_that_discards_reasoning_fails():
    class NoReasoning(NativeTokenizer):
        def apply_chat_template(self, messages, **kwargs):
            return '\n'.join(m['content'][0]['text'] for m in messages)
    with pytest.raises(ValueError, match='did not preserve'):
        PromptCompiler(NoReasoning(), prompt_policy='examples_binary').compile(request())


@pytest.mark.parametrize('policy', PROMPT_POLICIES)
def test_cli(monkeypatch, policy):
    import hf_server
    import uvicorn
    service = Mock()
    load = Mock(return_value=service)
    monkeypatch.setattr(hf_server, 'load_service', load)
    monkeypatch.setattr(hf_server, 'create_app', lambda value: value)
    monkeypatch.setattr(uvicorn, 'run', Mock())
    monkeypatch.setattr(sys, 'argv', ['hf_server', '--model', 'original/checkpoint', '--classifier-prompt-policy', policy])
    hf_server.main()
    assert load.call_args.args == ('original/checkpoint',)
    assert load.call_args.kwargs['prompt_policy'] == policy


@pytest.mark.parametrize('policy', PROMPT_POLICIES)
def test_loader_preserves_checkpoint_precision_and_batch_settings(monkeypatch, policy):
    from types import SimpleNamespace
    import torch
    import transformers
    tokenizer = NativeTokenizer()
    config = SimpleNamespace(model_type='qwen3_5')
    model = Mock()
    model.eval.return_value = model
    token_load, config_load, model_load = Mock(return_value=tokenizer), Mock(return_value=config), Mock(return_value=model)
    monkeypatch.setattr(transformers.AutoTokenizer, 'from_pretrained', token_load)
    monkeypatch.setattr(transformers.AutoConfig, 'from_pretrained', config_load)
    monkeypatch.setattr(transformers.AutoModelForImageTextToText, 'from_pretrained', model_load)
    service = load_service('source/model', revision='pinned', device='cpu', dtype='float32',
                           prompt_policy=policy, max_batch_size=7, max_batch_tokens=1234,
                           max_choice_options=50)
    token_load.assert_called_once_with('source/model', revision='pinned')
    config_load.assert_called_once_with('source/model', revision='pinned')
    model_load.assert_called_once_with('source/model', revision='pinned', config=config,
                                      dtype=torch.float32, device_map='cpu')
    assert service.compiler.prompt_policy == policy
    assert service.backend.max_batch_size == 7
    assert service.backend.max_batch_tokens == 1234
    assert service._capacity == 17  # Unchanged concurrency1 + queue16.


@pytest.mark.parametrize('policy', PROMPT_POLICIES)
def test_content_sensitive_native_template_boundary_and_baseline(policy):
    class ContentSensitiveTokenizer(NativeTokenizer):
        def apply_chat_template(self, messages, **kwargs):
            if kwargs.get('add_generation_prompt'):
                assert all(isinstance(m['content'], str) for m in messages)
                return super().apply_chat_template(messages, **kwargs)
            text = super().apply_chat_template(messages, **kwargs)
            # Model the native template's content-type-sensitive system boundary.
            # The actual cached Gemma templates are separately checked against
            # saved reference token traces for every one of the 477 requests.
            system = messages[0]['content'][0]['text']
            return text.replace(system + '\nuser:', system + ' <system-end>\nuser:', 1)
    req = request()
    before = req.model_dump()
    compiled = PromptCompiler(ContentSensitiveTokenizer(), prompt_policy=policy).compile(req)
    for branch in compiled.branches:
        text = bytes(branch.token_ids).decode()
        assert (' <system-end>\nuser:' in text) == (policy != 'baseline')
        # Normalization is local to rendering; inspectable plans stay unchanged.
        assert all(isinstance(m['content'], str) for m in branch.messages)
    assert req.model_dump() == before


def test_noul_only_keeps_nine_bins_and_legacy_policy_wording():
    req = request().model_copy(update={'questions': {'noul': request().questions['noul']}})
    c = PromptCompiler(NativeTokenizer(), prompt_policy='strict_mix_repeat2').compile(req)
    assert 'Rate on a scale of 1 to 9' in c.branches[0].messages[0]['content']
    assert 'Encode probability 0.1 as 1' in c.branches[0].messages[-1]['content']
    assert c.branches[0].output_ids == list(map(ord, '123456789'))
    assert c.branches[0].reasoning_content is None
