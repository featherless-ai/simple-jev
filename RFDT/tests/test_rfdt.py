"""Offline checks of supervision, leakage, masked gradients, and Trainer wiring."""

import copy
import json
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import pytest
import torch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from data import read_jsonl, target_distribution, validate_record
from prepare import label_missing, split_records
from train import (
    DecisionCollator,
    DecisionTrainer,
    assert_disjoint,
    compile_rows,
    decision_logits,
    metrics,
)
from transformers import Qwen3Config, Qwen3ForCausalLM, TrainingArguments

EXAMPLES = Path(__file__).resolve().parents[1] / "examples"


def test_targets_and_invalid_distributions():
    rows = read_jsonl(EXAMPLES / "labeled.jsonl")
    request, _ = validate_record(rows[0])
    assert target_distribution(request.questions["route"], {"answer": "billing"}) == [
        1,
        0,
    ]
    assert target_distribution(request.questions["refund"], {"answer": True}) == [
        0
    ] * 8 + [1]
    assert (
        target_distribution(request.questions["refund"], {"answer": 0.5})
        == [0] * 4 + [1] + [0] * 4
    )
    score, _ = validate_record(rows[2])
    assert target_distribution(score.questions["urgency"], {"answer": 0.25}) == [
        0.75,
        0.25,
        0,
    ]
    for target in (
        {"answer": "missing"},
        {"probabilities": {"billing": 0.2, "technical": 0.2}},
        {"probabilities": {"billing": float("nan"), "technical": 1}},
        {"probabilities": {"billing": 1}},
        {"answer": "billing", "extra": True},
    ):
        with pytest.raises(ValueError):
            target_distribution(request.questions["route"], target)


def test_split_unions_context_and_source_and_rejects_overlap():
    rows = read_jsonl(EXAMPLES / "labeled.jsonl")
    duplicate = copy.deepcopy(rows[0])
    duplicate["group_id"] = rows[1]["group_id"]
    rows.append(duplicate)
    train, validation = split_records(rows, 0.4, 42)
    assert_disjoint(train, validation)
    assert split_records(rows, 0.4, 42) == (train, validation)
    with pytest.raises(ValueError, match="share"):
        assert_disjoint(rows, [duplicate])
    with pytest.raises(ValueError, match="at least two"):
        split_records([rows[0], duplicate], 0.2, 42)


def test_teacher_requests_only_missing_targets():
    row = read_jsonl(EXAMPLES / "unlabeled.jsonl")[0]
    request, _ = validate_record(row)
    args = SimpleNamespace(
        teacher_model="teacher",
        teacher_max_tokens=100,
        api_key_env="UNSET_RFDT_TEST",
        teacher_base_url="https://example.invalid/v1",
        timeout=1,
    )
    probabilities = dict.fromkeys("123456789", 0.0)
    probabilities["9"] = 1.0

    class Response:
        ok = True

        def json(self):
            return {
                "choices": [
                    {
                        "message": {
                            "content": json.dumps(
                                {
                                    "targets": {
                                        "refund": {"probabilities": probabilities}
                                    }
                                }
                            )
                        }
                    }
                ]
            }

    with patch("prepare.requests.post", return_value=Response()) as call:
        result = label_missing(row, request, ["refund"], args)
        sent = call.call_args.kwargs["json"]
        assert json.loads(sent["messages"][1]["content"])["question_ids_to_label"] == [
            "refund"
        ]
        assert set(result) == {"refund"}


def test_prompt_compilation_preserves_full_briefing():
    class Tokenizer:
        def encode(self, text, **kwargs):
            return list(text.encode())

        def apply_chat_template(self, messages, **kwargs):
            return "\n".join(m["content"] for m in messages) + "assistant: "

    row = read_jsonl(EXAMPLES / "labeled.jsonl")[0]
    rows = compile_rows([row], Tokenizer(), 10000)
    assert len(rows) == 2
    for branch in rows:
        assert b"Which team should handle this?" in bytes(branch["input_ids"])
        assert b"Does the customer ask for a refund?" in bytes(branch["input_ids"])
    assert rows[0]["allowed_ids"] == [ord("A"), ord("B")]
    with pytest.raises(ValueError, match="tokens"):
        compile_rows([row], Tokenizer(), 2)


def test_mask_selects_real_position_and_only_allowed_logits():
    logits = torch.randn(2, 4, 12, requires_grad=True)

    class Model:
        def __call__(self, **kwargs):
            return SimpleNamespace(logits=logits)

    batch = DecisionCollator(0)(
        [
            {"input_ids": [1, 2], "allowed_ids": [3, 5], "labels": [1.0, 0.0]},
            {
                "input_ids": [1, 2, 3, 4],
                "allowed_ids": [6, 7, 8],
                "labels": [0.1, 0.2, 0.7],
            },
        ]
    )
    selected = decision_logits(Model(), batch)
    loss = -(batch["labels"] * selected.log_softmax(-1)).sum(-1).mean()
    loss.backward()
    expected = torch.zeros_like(logits, dtype=torch.bool)
    expected[0, 1, [3, 5]] = True
    expected[1, 3, [6, 7, 8]] = True
    assert torch.equal(logits.grad != 0, expected)
    assert torch.isfinite(loss)


def test_tiny_training_decreases_loss_and_updates_context(tmp_path):
    torch.set_num_threads(2)
    torch.manual_seed(7)
    model = Qwen3ForCausalLM(
        Qwen3Config(
            vocab_size=32,
            hidden_size=16,
            intermediate_size=32,
            num_hidden_layers=1,
            num_attention_heads=2,
            num_key_value_heads=2,
            head_dim=8,
        )
    )
    rows = [
        {"input_ids": [1, 2, 3], "allowed_ids": [10, 11], "labels": [1.0, 0.0]},
        {
            "input_ids": [1, 4, 5, 6],
            "allowed_ids": [10, 11, 12],
            "labels": [0.0, 0.0, 1.0],
        },
    ]
    collator = DecisionCollator(0)
    args = TrainingArguments(
        output_dir=str(tmp_path),
        use_cpu=True,
        max_steps=12,
        learning_rate=0.01,
        per_device_train_batch_size=2,
        per_device_eval_batch_size=1,
        save_strategy="no",
        report_to="none",
        remove_unused_columns=False,
        label_names=["labels"],
        disable_tqdm=True,
        optim="adamw_torch",
    )
    trainer = DecisionTrainer(
        model=model,
        args=args,
        train_dataset=rows,
        eval_dataset=rows,
        data_collator=collator,
        compute_metrics=metrics,
    )
    model.eval()
    before = trainer.compute_loss(model, collator(rows)).item()
    embedding_before = model.get_input_embeddings().weight[1].detach().clone()
    trainer.train()
    model.eval()
    after = trainer.compute_loss(model, collator(rows)).item()
    assert after < before
    assert not torch.equal(embedding_before, model.get_input_embeddings().weight[1])
    result = trainer.evaluate()
    assert result["eval_target_mode_agreement"] == 1.0
    trainer.save_model(str(tmp_path / "saved"))
    restored = Qwen3ForCausalLM.from_pretrained(tmp_path / "saved").eval()
    assert torch.allclose(
        decision_logits(model, collator(rows)),
        decision_logits(restored, collator(rows)),
        atol=1e-6,
    )


def test_preparation_resumes_without_relabeling(tmp_path, monkeypatch):
    from prepare import main

    calls = []

    def teacher(row, request, missing, args):
        calls.append(missing)
        result = {}
        for key in missing:
            q = request.questions[key]
            labels = list(q.criteria) if q.type == "choice" else list("123456789")
            result[key] = {
                "probabilities": {
                    label: float(i == 0) for i, label in enumerate(labels)
                }
            }
        return result

    monkeypatch.setattr("prepare.label_missing", teacher)
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "prepare.py",
            "--input",
            str(EXAMPLES / "unlabeled.jsonl"),
            "--output",
            str(tmp_path),
            "--teacher-base-url",
            "https://example.invalid/v1",
            "--teacher-model",
            "test",
            "--teacher-interval",
            "0",
        ],
    )
    main()
    main()
    assert len(calls) == 2  # Two records on first run; none on the second.
    rows = read_jsonl(tmp_path / "train.jsonl") + read_jsonl(
        tmp_path / "validation.jsonl"
    )
    first = next(row for row in rows if row["id"] == "teacher-1")
    assert first["targets"]["route"]["probabilities"]["billing"] == 1
    assert first["provenance"]["route"] == "provided"
