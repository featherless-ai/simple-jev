# Run status

**Finished**. Updated 2026-09-21 05:43:24 UTC.

Model requested: `typesafe/jev-1.13`.
Endpoint: `https://openrouter.ai/api/v1/systemone`.
Completed text suites: **65/65**. Prepared examples: **86,747**.
Failed examples in completed suites: **0**. Vision suites are excluded because Jev is text-only.

## Execution

`python3 eval/run.py --endpoint https://openrouter.ai/api/v1/systemone --model typesafe/jev-1.13 --key-env OPENROUTER_API_KEY --workers 16 --delay 0.02 --timeout 120 --retries 5 --suite SUITE --output RUN`

Up to four suites run concurrently, with 16 requests per suite (64 total). BigCloneBench (size) and ToolRet Web (32K context-limit rejections) are excluded by default at user request. Server failures are retried and original failures retained. Baseline smoke suites ran serially with zero delay and three retries. Exact settings are preserved in each suite manifest. Use `--resume` with identical settings to continue an interrupted run. Completed predictions are not repeated.

Raw evidence: `eval/results/jev-1.13-2026-09-20/` (local, ignored by Git). Each project results file includes raw artifact checksums, source/adapter hashes, returned model IDs, and recorded API cost.

## Compatibility notes

Context-free requests send an empty state string; OpenRouter rejects JSON null. An initial CodeMMLU attempt rejected for null state is retained separately and excluded from scores. Initial preflight/probe attempts are also excluded. Reported cost covers saved scored responses only.

ToolRet Web is excluded after 157 context-limit HTTP 400 rejections. Its raw results remain in `excluded-toolret-web-context-limit/`. ToolRet code/customized scores remain; project coverage is partial because the original frozen project membership includes Web.

## Active suites

None.
