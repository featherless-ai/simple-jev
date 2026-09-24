# Matched Jev 1.13 additions and supported models

This is a four-suite, **task-by-task** comparison, not one pooled score. Grouped ContractNLI (123×17) and grouped Unfair ToS (1607×8) are alternative views of already-present individual source cases; never add them to their flattened equivalents. The two opt-in public Decision Index tasks have 3652 and 3080 single-question requests. See [reference coverage](../../notes/JEV_REFERENCE_COVERAGE.md) for historical reuse, source hashes and exclusions.

## Jev reference

`launch.py` submitted the three missing Jev 1.13 suites concurrently against OpenRouter. It reads the API credential from `/workspace/open-jev/keys/OPENROUTER_API_KEY`; it **does not** print or store the secret. It refuses to start again when its plan exists. Local ignored `eval/results/jev-additions-v1/` contains response records, all three audited reports, one recovered 429 (append-only retry journal), source hashes, logs and PIDs. `python3 eval/experiments/jev_additions/launch.py --status` checks progress. Historic grouped Unfair ToS was **not** rerun; it is checked against the archived source/adapter hashes instead. Neither the archived single-question ContractNLI result nor the HTTP smoke test is used as a grouped-model result.

## Five parallel pinned GPU runs

The local CPU-only workstation cannot serve the five supported model checkpoints. Their model IDs/revisions, policy choices, dataset hashes and source-code hashes are frozen in `/root/open-jev-experiments/jev-additions-v1/plan.json`; the matching isolated jobs and outputs are under its `jobs/` and `results/` directories. Source Python/JSON files were copied from the initial `feat/evals-main` commit. Three large prepared datasets are symlinks to this worktree for shared volume I/O, **verified by SHA256 at the start of every GPU job**. Do not change them while jobs run. The script pins Transformers, Accelerate, image digest, bf16, and a 32768-token context; CUDA is mandatory. Each MI325X job serves one model, runs all four suite requests, and invokes the audit before marking success. No missing rows are silently omitted; if a job fails, inspect it and do **not** pass it off as a score.

All five jobs succeeded and each audited **4 suites / 8,462 requests / 21,679 scored slots / 0 failed rows**. Job IDs (in that order): `d67389e7-de77-4e35-bdcf-49310a94a4e9`, `57150738-11da-4578-8545-5d4562e71872`, `30cdc781-83a9-4fe5-b90d-8a6c0465ab1b`, `5738e5f0-3d36-4baa-9f3a-87d1093a8839`, `7516c86f-84f1-4e4a-afc8-ec677c032c30`. Their audited comparison is in [Jev reference coverage](../../notes/JEV_REFERENCE_COVERAGE.md#new-jev-runs-2026-09-24).

Model job keys: `qwen4b`, `qwen27b`, `qwen-moe`, `gemma12b`, `gemma-moe`. Submit idempotently with `/root/.bun/bin/bun eval/experiments/jev_additions/submit.ts MODEL` from the worktree. The script fetches current GPU pricing and existing network volume IDs, writes the submission first, and checks its durable existing job record before submitting. Monitor `jobs/MODEL.json` (cloud job ID), `results/MODEL/job.log` and `results/MODEL/eval/SUITE/predictions.jsonl`; do not submit another job until the current one is accounted for. GPU outputs and OpenRouter data are ignored, not pushed to Git.

## Four additional native-prompt runs

The remaining entries in `simple-jev-prompt-lab/experiments/full_eval/models.json` require their native prompt runtimes rather than the five-model HF-server configuration:

| Key | Model | Frozen policy |
| --- | --- | --- |
| `qwen08b` | Qwen 3.5 0.8B | `verification_after` |
| `qwen2b` | Qwen 3.5 2B | `examples_binary` |
| `qwen9b` | Qwen 3.5 9B | `verification_both` |
| `djev` | DiffusionGemma 26B-A4B | `typed_v3` |

These were submitted in parallel on four MI325X jobs using `submit_native.ts`; pinned model revisions, container digests, selected hook hashes and shared evaluation hashes are recorded in `/root/open-jev-experiments/jev-additions-native-v1/plan.json`. Job IDs in table order: `08f15ce2-4660-4245-aed2-3721661b025f`, `62a864c9-9dd3-43dd-bad9-5e7db9dadf5c`, `7aa4f340-05a8-459b-bd96-18172590127a`, `972f0ea9-23ac-4bc6-8ae5-e024bd01c0a8`. Isolated raw results, runtime manifests, hook snapshots and audits are under that root's `results/` directory. The native runner uses the same frozen datasets/adapters as the five HF-server runs, but preserves the selected vLLM/diffusion policies and 262144-token runtime limit. Thus these are **model-plus-serving-configuration comparisons**, not a controlled architecture-only ablation. No other worktree was modified.

All four native jobs **succeeded**, each with **4 audited suites / 8,462 requests / 21,679 scored slots / zero failed rows**. Together with the five HF-server runs, the completed comparison covers all nine configured model IDs and pinned revisions. The final per-suite scores are in [reference coverage](../../notes/JEV_REFERENCE_COVERAGE.md#new-jev-runs-2026-09-24).

`run_native_client.py` adds the policy and case headers to the frozen evaluation runner. `run_native_gpu.py` starts the pinned native runtime, evaluates the four suites and audits responses before recording success. `submit_native.ts MODEL` checks the durable job record to avoid duplicate submission. Do not rerun into an existing output directory or change source files during execution.

## Recompute

```sh
cd /workspace/open-jev/simple-jev-evals
PYTHONPATH=eval python3 -m unittest discover -s eval -p 'test_*.py' -q
python3 eval/experiments/jev_additions/compare_new.py
# Require the five HF-server and four native-prompt runs:
python3 eval/experiments/jev_additions/compare_new.py --require-models --require-native
```

The comparator invokes the raw-response audit, requires zero failures, matches the data and adapters by SHA256, and outputs one metric per suite. It refuses to report pending/failed HF-server models under `--require-models` and native-prompt models under `--require-native`; use both for the full supported list. Configuration and plan hashes accompany the scores. The result is an **ignored local JSON report** at `eval/results/jev-additions-v1/comparison.json`. Historical English knowledge (13 items), decision (26 items) and original text comparison are reproduced separately by `eval/reference_coverage.py`; not measured again here. When comparing models, do not label the original separate-request ContractNLI score as a grouped Jev baseline.
