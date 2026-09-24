"""Discovery, permissive IDs, and extended single-token Choice labels."""
import re
from unittest.mock import Mock

import httpx
import pytest
from conftest import FakeCompiler, Tokenizer
from common import ClassifierRequest, prepare_prompt
from common.prompt_builder import CHOICE_LABELS
from hf_server import BackendResult, DecisionService, PromptCompiler, create_app, load_service


class PairTokenizer(Tokenizer):
    all_special_ids = []

    def encode(self, text, **kwargs):
        match = re.search(r'(?<=\{"answer": ")([A-Z]{2})$', text)
        if match:
            a, b = match[1]
            return list(text[:-2].encode()) + [1000 + (ord(a)-65)*26 + ord(b)-65]
        return super().encode(text, **kwargs)

    def apply_chat_template(self, messages, **kwargs):
        if kwargs.get('add_generation_prompt'):
            return super().apply_chat_template(messages, **kwargs)
        assert kwargs == {'tokenize': False, 'add_generation_prompt': False,
                          'continue_final_message': True,
                          'enable_thinking': 'reasoning_content' in messages[-1]}
        return '\n'.join(f"{m['role']}: {m.get('reasoning_content', '')}{m['content'][0]['text']}"
                         for m in messages)


class Backend:
    def __init__(self):
        self.calls = 0

    async def score(self, compiled):
        self.calls += 1
        return BackendResult({q.branch_id: {label: 0.0 for label in q.output_labels}
                              for q in compiled.plan.questions}, {})


def request(n=2, model='jev-latest'):
    return {'model': model, 'state': 'A text.', 'questions': {'q': {
        'type': 'choice', 'instructions': 'Choose.',
        'criteria': {f'option-{i}': None for i in range(n)},
    }}}


@pytest.mark.parametrize('strict', [False, True])
async def test_discovery_ids_and_actual_response_name(strict):
    backend = Backend()
    service = DecisionService('public-name', FakeCompiler(), backend, enforce_model_id=strict)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(service)), base_url='http://test') as client:
        models = await client.get('/v1/models')
        assert models.status_code == 200
        assert models.json()['object'] == 'list'
        assert models.json()['data'][0]['id'] == 'public-name'
        assert models.json()['data'][0]['x_max_choice_options'] == 255
        assert backend.calls == 0
        assert (await client.get('/health')).json()['model'] == 'public-name'
        for path in ['/v1/classifier', '/v1/systemone']:
            for name in ['public-name', 'jev-latest', 'arbitrary-name']:
                response = await client.post(path, json=request(model=name))
                assert response.status_code == (422 if strict and name != 'public-name' else 200)
                if response.status_code == 200:
                    assert response.json()['model'] == 'public-name'


@pytest.mark.parametrize('n', [2, 26, 50, 51, 64, 255])
def test_choice_labels_and_mapping(n):
    compiler = PromptCompiler(PairTokenizer(), max_tokens=100000)
    compiled = compiler.compile(request(n))
    question = compiled.plan.questions[0]
    assert len(question.output_labels) == len(question.answer_labels) == len(compiled.branches[0].output_ids) == n
    assert len(set(compiled.branches[0].output_ids)) == n
    if n <= 50:
        assert question.output_labels == tuple(CHOICE_LABELS[:n])
        old = prepare_prompt(request(n))
        assert compiled.plan.questions == old.questions
        assert compiled.plan.prefix_instruction == old.prefix_instruction
    else:
        assert all(len(label) == 2 for label in question.output_labels)
        assert not any(a in b for a in question.output_labels for b in question.output_labels if a != b)
        assert all(f'"label":"{label}"' in question.instruction for label in question.output_labels)


async def test_extended_http_and_configured_limit():
    backend = Backend()
    service = DecisionService('public', PromptCompiler(PairTokenizer(), max_tokens=100000), backend)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(service)), base_url='http://test') as client:
        response = await client.post('/v1/systemone', json=request(255))
        assert response.status_code == 200
        answer = response.json()['answers']['q']
        assert list(answer['probabilities']) == list(request(255)['questions']['q']['criteria'])
        assert len(answer['probabilities']) == 255
        assert sum(answer['probabilities'].values()) == pytest.approx(1)
        assert answer['choice'] == 'option-0'
        assert (await client.post('/v1/classifier', json=request(256))).status_code == 422
        service.max_choice_options = 50
        assert (await client.post('/v1/systemone', json=request(51))).status_code == 422
        assert (await client.get('/v1/models')).json()['data'][0]['x_max_choice_options'] == 50
        assert backend.calls == 1


@pytest.mark.parametrize('policy', ['baseline', 'examples_binary', 'repeat_state', 'strict_mix_repeat2'])
async def test_extended_last_candidate_and_mixed_legacy_questions(policy):
    class LastWins(Backend):
        async def score(self, compiled):
            self.calls += 1
            return BackendResult({q.branch_id: {
                label: 20.0 if i == len(q.output_labels) - 1 else -20.0
                for i, label in enumerate(q.output_labels)
            } for q in compiled.plan.questions}, {})

    body = request(255)
    body['questions'].update({
        'legacy': request(50)['questions']['q'],
        'score': {'type': 'score', 'instructions': 'Rate.',
                  'criteria': [f'Level {i}' for i in range(50)]},
        'noul': {'type': 'noul', 'instructions': 'Is this true?'},
    })
    compiler = PromptCompiler(PairTokenizer(), max_tokens=100000, prompt_policy=policy)
    compiled = compiler.compile(body)
    questions = {q.question_id: q for q in compiled.plan.questions}
    assert questions['legacy'].output_labels == tuple(CHOICE_LABELS)
    assert questions['score'].output_labels == tuple(CHOICE_LABELS)
    noul_labels = ('A', 'B') if policy in ('examples_binary', 'repeat_state') else tuple('123456789')
    assert questions['noul'].output_labels == noul_labels
    backend = LastWins()
    service = DecisionService('public', compiler, backend)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(service)), base_url='http://test') as client:
        response = await client.post('/v1/classifier', json=body)
        assert response.status_code == 200
        answers = response.json()['answers']
        assert set(answers) == set(body['questions'])
        assert answers['q']['choice'] == 'option-254'
        assert len(answers['q']['probabilities']) == 255
        assert answers['legacy']['choice'] == 'option-49'
        assert len(answers['legacy']['probabilities']) == 50
        assert answers['score']['score'] == pytest.approx(49)
        assert answers['noul']['type'] == 'noul'
        body['questions']['score']['criteria'].append('Level 50')
        assert (await client.post('/v1/classifier', json=body)).status_code == 422
        assert backend.calls == 1


async def test_question_limit_is_separate_from_choice_limit():
    backend = Backend()
    service = DecisionService('public', FakeCompiler(), backend)
    body = request(2)
    question = body['questions']['q']
    body['questions'] = {f'q{i}': question for i in range(101)}
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(service)), base_url='http://test') as client:
        assert (await client.post('/v1/classifier', json=body)).status_code == 422
        assert backend.calls == 0
        service.max_request_branches = 256
        body['questions'] = {f'q{i}': question for i in range(256)}
        response = await client.post('/v1/classifier', json=body)
        assert response.status_code == 200
        assert len(response.json()['answers']) == 256
        service.max_request_branches = 512
        body['questions']['q256'] = question
        assert (await client.post('/v1/classifier', json=body)).status_code == 422
        assert backend.calls == 1


@pytest.mark.parametrize('options', [2, 255])
async def test_input_length_limit_cannot_be_overridden_by_request_max_tokens(options):
    backend = Backend()
    service = DecisionService('public', PromptCompiler(PairTokenizer(), max_tokens=1), backend)
    body = request(options)
    body['max_tokens'] = 100000
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(service)), base_url='http://test') as client:
        assert (await client.post('/v1/classifier', json=body)).status_code == 422
        assert backend.calls == 0


def test_capacity_and_boundary_fail_closed():
    with pytest.raises(ValueError, match='Tokenizer supports only'):
        PromptCompiler(Tokenizer()).validate_choice_capacity()
    with pytest.raises(ValueError, match='maximum is 50'):
        PromptCompiler(PairTokenizer(), max_choice_options=50).compile(request(51))
    with pytest.raises(ValueError, match='tokenizer-validated'):
        prepare_prompt(request(51))
    with pytest.raises(ValueError):
        ClassifierRequest.model_validate(request(256))

    class Unstable(PairTokenizer):
        def encode(self, text, **kwargs):
            if '\nassistant: ' in text and re.search(r'[A-Z]{2}$', text):
                return list(text.encode())
            return super().encode(text, **kwargs)
    with pytest.raises(ValueError, match='single-token stable'):
        PromptCompiler(Unstable(), max_tokens=100000).compile(request(51))


def test_duplicate_tokens_rejected_as_capacity_shortfall():
    class Duplicates(PairTokenizer):
        def encode(self, text, **kwargs):
            ids = super().encode(text, **kwargs)
            return ids[:-1] + [1000] if ids and ids[-1] >= 1000 else ids
    with pytest.raises(ValueError, match='only 1 distinct'):
        PromptCompiler(Duplicates()).validate_choice_capacity()


@pytest.mark.parametrize('limit', [1, 256])
def test_invalid_configuration(limit):
    with pytest.raises(ValueError, match='between 2 and 255'):
        DecisionService('public', FakeCompiler(), Backend(), max_choice_options=limit)
    with pytest.raises(ValueError, match='between 2 and 255'):
        load_service('not-loaded', max_choice_options=limit)


def test_loader_public_name_and_extended_capacity(monkeypatch):
    import transformers
    from types import SimpleNamespace
    tokenizer = PairTokenizer()
    model = Mock()
    monkeypatch.setattr(transformers.AutoTokenizer, 'from_pretrained', Mock(return_value=tokenizer))
    monkeypatch.setattr(transformers.AutoConfig, 'from_pretrained', Mock(return_value=SimpleNamespace(model_type='qwen3_5')))
    loader = Mock(return_value=model)
    monkeypatch.setattr(transformers.AutoModelForImageTextToText, 'from_pretrained', loader)
    service = load_service('physical-model', served_model_name='public-name', enforce_model_id=True)
    assert service.model == 'public-name' and service.enforce_model_id
    assert service.max_choice_options == 255
    assert len(service.compiler.validate_choice_capacity()) == 676
    assert loader.call_args.args == ('physical-model',)
    assert service.compiler.compile(request(50)).plan.questions[0].output_labels == tuple(CHOICE_LABELS)
    loader.reset_mock()
    monkeypatch.setattr(transformers.AutoTokenizer, 'from_pretrained', Mock(return_value=Tokenizer()))
    with pytest.raises(ValueError, match='Tokenizer supports only'):
        load_service('physical-model')
    loader.assert_not_called()


def test_cli_flags(monkeypatch):
    import sys
    import uvicorn
    import hf_server
    service = DecisionService('public', FakeCompiler(), Backend())
    loader = Mock(return_value=service)
    run = Mock()
    monkeypatch.setattr(hf_server, 'load_service', loader)
    monkeypatch.setattr(uvicorn, 'run', run)
    monkeypatch.setattr(sys, 'argv', ['simple-jev', '--model', 'physical',
        '--served-model-name', 'public', '--enforce-model-id', '--max-choice-options', '64'])
    hf_server.main()
    assert loader.call_args.args == ('physical',)
    assert loader.call_args.kwargs['served_model_name'] == 'public'
    assert loader.call_args.kwargs['enforce_model_id'] is True
    assert loader.call_args.kwargs['max_choice_options'] == 64
    run.assert_called_once()
