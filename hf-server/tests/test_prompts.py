"""Verify the HF adapter uses common's plan without duplicating template text.

Tests cover all question types, letter labels for an eleven-level score, original
chat preservation, context limits, shared-version validation, and text restrictions.
Adversarial byte tokenizers simulate retokenization and label-ID collisions at
the assistant boundary. No pretrained tokenizer files are needed.
"""

import pytest
from conftest import Tokenizer
from hf_server import PromptCompiler

from common import ClassifierRequest, prepare_prompt


def request():
    """Create all three question types, including the digit-to-letter score boundary."""
    return {
        "model": "m",
        "state": "red",
        "questions": {
            "color": {
                "type": "choice",
                "instructions": "Color?",
                "criteria": {"red": None, "blue": None},
            },
            "level": {
                "type": "score",
                "instructions": "Level?",
                "criteria": list(map(str, range(11))),
            },
            "truth": {"type": "noul", "instructions": "Red?"},
        },
    }


def test_compiler_renders_common_plan_and_checks_real_boundaries():
    """Match rendered IDs and selected label IDs to the shared plan for every branch."""
    body = request()
    compiler = PromptCompiler(Tokenizer())
    compiled = compiler.compile(body)
    assert compiled.plan == prepare_prompt(body)
    for branch, question in zip(compiled.branches, compiled.plan.questions):
        text = (
            Tokenizer().apply_chat_template(
                branch.messages,
                tokenize=False,
                add_generation_prompt=True,
                enable_thinking=False,
            )
            + question.answer_prefix
        )
        assert branch.token_ids == Tokenizer().encode(text)
        assert branch.output_ids == [ord(label) for label in question.output_labels]
    assert compiled.branches[1].output_ids == list(map(ord, "ABCDEFGHIJK"))
    assert (
        "Encode probability 0.1 as 1, 0.2 as 2, and so on through 0.9 as 9."
        in compiled.branches[2].messages[-1]["content"]
    )

    assert compiled.plan.questions[2].answer_prefix == '{"answer": '
    assert compiled.plan.questions[2].output_labels == tuple("123456789")
    assert compiled.branches[2].output_ids == list(map(ord, "123456789"))


def test_chat_roles_are_preserved_without_mutating_request():
    """Merge a leading system turn into copies while retaining caller-owned history."""
    body = request()
    body.pop("state")
    body["messages"] = [
        {"role": "system", "content": "Original"},
        {"role": "user", "content": "red"},
    ]
    validated = ClassifierRequest.model_validate(body)
    compiled = PromptCompiler(Tokenizer()).compile(validated)
    for branch in compiled.branches:
        assert [m["role"] for m in branch.messages] == ["system", "user", "user"]
        assert branch.messages[0]["content"].endswith("\nOriginal")
    assert validated.messages[0].content == "Original"


def test_invalid_boundary_and_duplicate_labels_rejected():
    """Fail if a label retokenizes the prompt or two labels collapse to one ID."""

    class Unstable(Tokenizer):
        def encode(self, text, **kwargs):
            ids = super().encode(text, **kwargs)
            return ids[:-2] + [0] if text.endswith('"A') else ids

    with pytest.raises(ValueError, match="single-token"):
        PromptCompiler(Unstable()).compile(request())

    class Duplicate(Tokenizer):
        def encode(self, text, **kwargs):
            ids = super().encode(text, **kwargs)
            return ids[:-1] + [ord("A")] if text.endswith('"B') else ids

    with pytest.raises(ValueError, match="distinct"):
        PromptCompiler(Duplicate()).compile(request())


@pytest.mark.parametrize(
    "patch",
    [
        {"tools": [{"type": "function"}]},
        {
            "state": None,
            "messages": [
                {"role": "user", "content": [{"type": "text", "text": "red"}]}
            ],
        },
    ],
)
def test_text_restrictions_remain(patch):
    """Shared schema acceptance must not bypass the HF text-only restrictions."""
    with pytest.raises(ValueError, match="text|tools"):
        PromptCompiler(Tokenizer()).compile({**request(), **patch})


def test_context_limit_and_version():
    """Reject oversized prompts and unsupported versions at compilation time."""
    with pytest.raises(ValueError, match="tokens"):
        PromptCompiler(Tokenizer(), max_tokens=1).compile(request())
    with pytest.raises(ValueError, match="version"):
        PromptCompiler(Tokenizer(), version="unknown").compile(request())
