"""Adapter contract tests, with a tiny stand-in for the optional Laya runtime."""

import sys
import types
import pytest
from hf_server import DecisionService, LayaBackend


class Agent:
    cfg = {"max_len": 512, "head_max_len": 192}

    class Tokenizer:
        mask_token = "[MASK]"

        def __call__(self, text, **kw):
            return {"input_ids": list(text)}

    tok = Tokenizer()

    def _to_internal(self, q):
        return q

    def predict(self, state, questions):
        return {
            "answers": {
                "color": {
                    "choice": "red",
                    "probabilities": {"red": 0.8, "blue": 0.2},
                    "confidence": 0.1,
                    "action": {},
                },
                "truth": {"noul": 0.7, "confidence": 0.9},
                "score": {"score": 0.8, "probabilities": {"0": 0.2, "1": 0.8}},
            },
            "usage": {"input_tokens": 40, "output_tokens": 0},
        }


@pytest.fixture
def service(monkeypatch):
    common = types.ModuleType("laya.common")
    common.serialize_state = str
    common.build_sequence = lambda tok, state, q, *args: (list(str(state)), [1, 2])
    monkeypatch.setitem(sys.modules, "laya.common", common)
    return DecisionService(
        "laya-test",
        None,
        LayaBackend(Agent(), 512),
        concurrency=1,
        advanced_metrics=True,
    )


def request():
    return {
        "model": "laya-test",
        "state": "red bicycle",
        "questions": {
            "color": {
                "type": "choice",
                "instructions": "Color?",
                "criteria": {"red": None, "blue": None},
            },
            "truth": {"type": "noul", "instructions": "Red?"},
            "score": {
                "type": "score",
                "instructions": "Support?",
                "criteria": ["no", "yes"],
            },
        },
    }


async def test_native_response_contract(service):
    result = await service.classify(request())
    assert result["answers"]["color"]["confidence"] == 0.8
    assert "action" not in result["answers"]["color"]
    assert result["answers"]["truth"] == {"type": "noul", "noul": 0.7}
    assert result["answers"]["score"]["score"] == 0.8
    assert result["metadata"]["format"] == "laya-native"
    assert result["usage"]["output_tokens"] == 0


async def test_limits_and_model_validation(service):
    data = request()
    data["state"] = "x" * 513
    with pytest.raises(ValueError, match="exceeds"):
        await service.classify(data)
    data = request()
    data["model"] = "other"
    with pytest.raises(ValueError, match="Loaded model"):
        await service.classify(data)
    data = request()
    data["options"] = {"raw_logits": True}
    with pytest.raises(ValueError, match="raw_logits"):
        await service.classify(data)


async def test_media_options_are_rejected(service):
    data = request()
    data["media_io_kwargs"] = {"video": {"fps": 1}}
    with pytest.raises(ValueError, match="text state and text chat only"):
        await service.classify(data)


async def test_text_chat_and_media_rejection(service):
    data = request()
    del data["state"]
    data["messages"] = [{"role": "user", "content": "red bicycle"}]
    assert (await service.classify(data))["answers"]["color"]["choice"] == "red"
    data["messages"][0]["content"] = [
        {"type": "image_url", "image_url": {"url": "https://example.com/a.png"}}
    ]
    with pytest.raises(ValueError, match="text messages"):
        await service.classify(data)


def test_explicit_loader_preserves_revision_and_subfolder(monkeypatch):
    from hf_server import load_service
    import huggingface_hub

    calls = {}

    def snapshot(model, **kwargs):
        calls["snapshot"] = (model, kwargs)
        return "/tmp/fake-laya-snapshot"

    def load(path, **kwargs):
        calls["load"] = (path, kwargs)
        return Agent()

    monkeypatch.setattr(huggingface_hub, "snapshot_download", snapshot)
    monkeypatch.setitem(sys.modules, "laya", types.SimpleNamespace(load=load))
    result = load_service(
        "example/laya",
        backend="laya",
        revision="pinned-revision",
        subfolder="multilingual",
        device="cpu",
    )
    assert isinstance(result.backend, LayaBackend)
    assert calls["snapshot"][1]["revision"] == "pinned-revision"
    assert calls["snapshot"][1]["allow_patterns"] == ["multilingual/*"]
    assert calls["load"][1] == {"subfolder": "multilingual", "device": "cpu"}
    assert result.metadata["backend"] == "laya"


@pytest.mark.parametrize("factor", [1.5, 2.0, 2.25])
def test_rope_extension_matches_original_scaled_position(factor):
    import torch
    from transformers import ModernBertConfig, ModernBertModel
    from hf_server import extend_laya_rope

    encoder = ModernBertModel(
        ModernBertConfig(
            hidden_size=32,
            intermediate_size=64,
            num_hidden_layers=2,
            num_attention_heads=4,
            vocab_size=100,
            pad_token_id=0,
            bos_token_id=1,
            eos_token_id=2,
            cls_token_id=1,
            sep_token_id=2,
            max_position_embeddings=8192,
            reference_compile=False,
        )
    )
    agent = types.SimpleNamespace(
        model=types.SimpleNamespace(encoder=encoder), cfg={"max_len": 1024}
    )
    rotary = encoder.rotary_emb
    x = torch.zeros(1, 1, 32)
    expected = {
        kind: rotary(x, torch.tensor([[700]]), kind) for kind in rotary.rope_type
    }
    extend_laya_rope(agent, factor)
    assert agent.cfg["max_len"] == int(1024 * factor)
    for kind, (cos, sin) in expected.items():
        actual_cos, actual_sin = rotary(x, torch.tensor([[int(700 * factor)]]), kind)
        torch.testing.assert_close(actual_cos, cos)
        torch.testing.assert_close(actual_sin, sin)
    with pytest.raises(ValueError, match="already"):
        extend_laya_rope(agent, 2)


def test_rope_extension_rejects_incompatible_backends():
    from hf_server import load_service, extend_laya_rope

    with pytest.raises(ValueError, match="finite"):
        load_service("unused", rope_factor=float("nan"))
    agent = types.SimpleNamespace(
        model=types.SimpleNamespace(
            encoder=types.SimpleNamespace(
                config=types.SimpleNamespace(model_type="other")
            )
        )
    )
    with pytest.raises(ValueError, match="ModernBERT"):
        extend_laya_rope(agent, 2)


@pytest.mark.parametrize("factor", [1.5, 2.0, 2.25])
def test_transformers_rope_configuration_and_forward(factor):
    import torch
    from transformers import Qwen3Config, Qwen3ForCausalLM
    from hf_server import configure_rope

    config = Qwen3Config(
        hidden_size=32,
        intermediate_size=64,
        num_hidden_layers=1,
        num_attention_heads=4,
        num_key_value_heads=2,
        head_dim=8,
        vocab_size=100,
        max_position_embeddings=32,
    )
    baseline = Qwen3ForCausalLM(config).model.rotary_emb.inv_freq.clone()
    configure_rope(config, factor)
    model = Qwen3ForCausalLM(config).eval()
    torch.testing.assert_close(model.model.rotary_emb.inv_freq, baseline / factor)
    assert config.max_position_embeddings == int(32 * factor)
    with torch.no_grad():
        assert model(torch.ones((1, 48), dtype=torch.long)).logits.shape == (1, 48, 100)
    with pytest.raises(ValueError, match="unscaled"):
        configure_rope(config, 2)


@pytest.mark.parametrize(
    "factor", [0, -1, 0.5, float("nan"), float("inf"), -float("inf")]
)
def test_invalid_rope_multiplier(factor):
    from hf_server import validate_rope_factor

    with pytest.raises(ValueError, match="finite and at least 1"):
        validate_rope_factor(factor)


def test_fractional_capacity_rounds_down():
    from transformers import Qwen3Config
    from hf_server import configure_rope

    config = Qwen3Config(max_position_embeddings=33)
    configure_rope(config, 1.5)
    assert config.max_position_embeddings == 49
    assert config.rope_parameters["factor"] == 1.5
