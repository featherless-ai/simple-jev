"""HTTP contract tests using an in-process ASGI client and fake inference.

These exercise shared request validation, endpoint aliases, answer ordering,
unknown top-level field handling, and opt-in diagnostics. Fixed logits keep the
checks about API behavior rather than model quality. Nonzero output-token metrics
are intentional fake values that check service plumbing; real HF reports zero.
"""

import httpx
from conftest import FakeCompiler
from hf_server import BackendResult, DecisionService, create_app


async def test_multi_question_http_and_validation():
    """Verify answer IDs/order, model-name rejection, and ignored top-level extras."""

    class Backend:
        async def score(self, compiled):
            return BackendResult(
                {
                    q.branch_id: {label: 0.0 for label in q.output_labels}
                    for q in compiled.plan.questions
                },
                {},
            )

    service = DecisionService("test", FakeCompiler(), Backend(), enforce_model_id=True)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=create_app(service)), base_url="http://test"
    ) as client:
        request = {
            "model": "test",
            "state": {"some": "data"},
            "questions": {
                "first": {"type": "noul", "instructions": "yes?"},
                "second": {
                    "type": "score",
                    "instructions": "high?",
                    "criteria": ["low", "high"],
                },
            },
        }
        response = await client.post("/v1/systemone", json=request)
        assert response.status_code == 200
        assert list(response.json()["answers"]) == ["first", "second"]
        assert set(response.json()) == {"model", "answers", "usage"}
        assert set(response.json()["answers"]["first"]) == {"type", "noul"}
        request["model"] = "unloaded"
        assert (await client.post("/v1/systemone", json=request)).status_code == 422
        request["model"] = "test"
        request["unknown"] = True
        assert (await client.post("/v1/systemone", json=request)).status_code == 200


async def test_advanced_metrics_are_opt_in_and_usage_stays_deduplicated(monkeypatch):
    """Verify environment opt-in changes visibility, not public scores or usage."""

    class Backend:
        async def score(self, compiled):
            return BackendResult(
                {
                    "0": {"A": 0.0, "B": -1.0},
                    "1": {"0": -1.0, "1": 0.0},
                    "2": {str(i): 0.0 for i in range(1, 10)},
                },
                {
                    "branch_output_tokens": 3,
                    "private_engine_detail": "internal-value",
                },
            )

    body = {
        "model": "test",
        "state": "Red bicycle",
        "questions": {
            "choice": {
                "type": "choice",
                "instructions": "Color?",
                "criteria": {"red": None, "blue": None},
            },
            "score": {
                "type": "score",
                "instructions": "Red?",
                "criteria": ["no", "yes"],
            },
            "noul": {"type": "noul", "instructions": "Red?"},
        },
        "options": {"raw_logits": True},
    }
    baseline = None
    for flag in (None, "0", "false", "1", "true"):
        if flag is None:
            monkeypatch.delenv("ENABLE_OPEN_JEV_ADVANCED_METRICS", raising=False)
        else:
            monkeypatch.setenv("ENABLE_OPEN_JEV_ADVANCED_METRICS", flag)
        service = DecisionService(
            "test",
            FakeCompiler(),
            Backend(),
            metadata={"revision": "internal-revision"},
        )
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=create_app(service)),
            base_url="http://test",
        ) as client:
            response = await client.post("/v1/classifier", json=body)
        assert response.status_code == 200
        result = response.json()
        assert result["usage"] == {"input_tokens": 5, "output_tokens": 3}
        public = {
            k: {
                f: v
                for f, v in a.items()
                if f
                in {
                    "type",
                    "choice",
                    "score",
                    "noul",
                    "confidence",
                    "probabilities",
                    "legend",
                }
            }
            for k, a in result["answers"].items()
        }
        if baseline is None:
            baseline = public
        assert public == baseline
        if flag in ("1", "true"):
            assert result["metadata"]["revision"] == "internal-revision"
            assert result["metrics"]["private_engine_detail"] == "internal-value"
            assert "logits" in result["answers"]["choice"]
            assert "rating" in result["answers"]["noul"]
        else:
            assert set(result) == {"model", "answers", "usage"}
            assert result["answers"] == public
            assert "internal-" not in response.text
