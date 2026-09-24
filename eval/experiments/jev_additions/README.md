# Matched Jev 1.13 additions and supported HF models

This is a four-suite, **task-by-task** comparison, not one pooled score. Grouped ContractNLI (123×17) and grouped Unfair ToS (1607×8) are alternative views of already-present individual source cases; never add them to their flattened equivalents. The two opt-in public Decision Index tasks have 3652 and 3080 single-question requests. See [reference coverage](../../notes/JEV_REFERENCE_COVERAGE.md) for historical reuse, source hashes and exclusions.

## Jev reference

`launch.py` submitted the three missing Jev 1.13 suites concurrently against OpenRouter. It reads the API credential from `/workspace/open-jev/keys/OPENROUTER_API_KEY`; it **does not** print or store the secret. It refuses to start again when its plan exists. Local ignored `eval/results/jev-additions-v1/` contains response records, all three audited reports, one recovered 429 (append-only retry journal), source hashes, logs and PIDs. `python3 eval/experiments/jev_additions/launch.py --status` checks progress. Historic grouped Unfair ToS was **not** rerun; it is checked against the archived source/adapter hashes instead. Neither the archived single-question ContractNLI result nor the HTTP smoke test is used as a grouped-model result.

## Five parallel pinned GPU runs

The local CPU-only workstation cannot serve the five supported model checkpoints. Their model IDs/revisions, policy choices, dataset hashes and source-code hashes are frozen in `/root/open-jev-experiments/jev-additions-v1/plan.json`; the matching isolated jobs and outputs are under its `jobs/` and `results/` directories. Source Python/JSON files were copied from the initial `feat/evals-main` commit. Three large prepared datasets are symlinks to this worktree for shared volume I/O, **verified by SHA256 at the start of every GPU job**. Do not change them while jobs run. The script pins Transformers, Accelerate, image digest, bf16, and a 32768-token context; CUDA is mandatory. Each MI325X job serves one model, runs all four suite requests, and invokes the audit before marking success. No missing rows are silently omitted; if a job fails, inspect it and do **not** pass it off as a score.

Model job keys: `qwen4b`, `qwen27b`, `qwen-moe`, `gemma12b`, `gemma-moe`. Submit idempotently with `/root/.bun/bin/bun eval/experiments/jev_additions/submit.ts MODEL` from the worktree. The script fetches current GPU pricing and existing network volume IDs, writes the submission first, and checks its durable existing job record before submitting. Monitor `jobs/MODEL.json` (cloud job ID), `results/MODEL/job.log` and `results/MODEL/eval/SUITE/predictions.jsonl`; do not submit another job until the current one is accounted for. GPU outputs and OpenRouter data are ignored, not pushed to Git.

## Recompute

```sh
cd /workspace/open-jev/simple-jev-evals
PYTHONPATH=eval python3 -m unittest discover -s eval -p 'test_*.py' -q
python3 eval/experiments/jev_additions/compare_new.py
# Only after all five cloud runs succeeded:
python3 eval/experiments/jev_additions/compare_new.py --require-models
```

The comparator invokes the raw-response audit, requires zero failures, matches the data and adapters by SHA256, and outputs one metric per suite. It refuses to report pending/failed models under `--require-models`. The result is an **ignored local JSON report** at `eval/results/jev-additions-v1/comparison.json`. Historical English knowledge (13 items), decision (26 items) and original text comparison are reproduced separately by `eval/reference_coverage.py`; not measured again here. When comparing models, do not label the original separate-request ContractNLI score as a grouped Jev baseline.
