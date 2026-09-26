import copy

import pytest
from jinja2.exceptions import TemplateError
from hf_server import render_chat


@pytest.mark.parametrize('left', ['image description', [{'type': 'image'}, {'type': 'text', 'text': 'description'}]])
def test_strict_template_keeps_images_text_and_prefill(left):
    messages = [{'role': 'system', 'content': 'rules'}, {'role': 'user', 'content': left},
                {'role': 'user', 'content': 'question'},
                {'role': 'assistant', 'content': '{"answer":', 'reasoning_content': 'fixed'}]
    original = copy.deepcopy(messages)
    calls = []
    class Renderer:
        def apply_chat_template(self, rows, **kwargs):
            calls.append((copy.deepcopy(rows), kwargs))
            if any(a['role'] == b['role'] == 'user' for a, b in zip(rows, rows[1:])):
                raise TemplateError('Conversation roles must alternate user/assistant')
            return 'rendered'
    assert render_chat(Renderer(), messages, tokenize=False, continue_final_message=True) == 'rendered'
    assert messages == original
    assert len(calls) == 2 and calls[0][1] == calls[1][1]
    merged = calls[1][0]
    assert [m['role'] for m in merged] == ['system', 'user', 'assistant']
    assert merged[-1] == original[-1] and merged[0] == original[0]
    if isinstance(left, str):
        assert merged[1]['content'] == left + '\n\nquestion'
    else:
        assert merged[1]['content'] == left + [{'type': 'text', 'text': '\n\n'}, {'type': 'text', 'text': 'question'}]


def test_tolerant_template_keeps_turn_boundaries():
    messages = [{'role': 'user', 'content': 'context'}, {'role': 'user', 'content': 'question'}]
    class Renderer:
        def apply_chat_template(self, rows, **kwargs):
            assert rows == messages
            return 'unmerged'
    assert render_chat(Renderer(), messages) == 'unmerged'


@pytest.mark.parametrize('error', ['Unsupported format', 'Roles must alternate'])
def test_invalid_native_conversations_are_validation_errors(error):
    class Renderer:
        def apply_chat_template(self, rows, **kwargs):
            raise TemplateError(error)
    # No adjacent user turns to fix: do not reinterpret assistant messages.
    with pytest.raises(ValueError, match='Model chat template'):
        render_chat(Renderer(), [{'role': 'assistant', 'content': 'a'}, {'role': 'assistant', 'content': 'b'}])
