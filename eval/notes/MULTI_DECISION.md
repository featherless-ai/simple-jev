# Shared-context multi-decision evaluation

`--preset multi-decision` sends **one HTTP request per context** with multiple
labelled questions in its `questions` mapping. It is opt-in and distinct from
`decision`: the same ContractNLI test judgments appear in both modes, with
different HTTP request grouping. **Do not pool or sum the two modes.** This
is a protocol/quality evaluation, not a measured throughput benchmark or the
Decision Index 0.2 freeze.

| Suite | Requests | Questions per request | Metric | Preparation |
| --- | ---: | ---: | --- | --- |
| `legal-contractnli-multi` | 123 contracts | 17 published hypotheses against the same contract | Macro-F1 over three labels, per-question accuracy, all-17-correct case accuracy | Group the pinned `legal-contractnli` test rows by document ID, verifying the exact shared context; no altered labels or hypotheses |
| `legal-unfair-tos-multi` | 1,607 original test provisions | 8 binary unfair-clause questions per provision | Native F1, per-question and whole-provision accuracy | Existing pinned LexGLUE converter and unchanged native multi-question adapter; separate manifest from historical `legal-unfair-tos` |

```sh
# ContractNLI source (standard library); upstream data stays in ignored sources/.
python3 eval/prepare.py domains legal-contractnli --sources eval/sources/domains \
  --download --output eval/data/legal-contractnli.jsonl
python3 eval/prepare.py multi_decision \
  --input eval/data/legal-contractnli.jsonl \
  --output eval/data/legal-contractnli-multi.jsonl

# Unfair ToS requires pyarrow for the pinned source parquet.
python3 eval/prepare.py domains legal-unfair-tos --sources eval/sources/domains \
  --download --output eval/data/legal-unfair-tos.jsonl

python3 eval/run.py --preset multi-decision --list
python3 eval/run.py --preset multi-decision --endpoint http://localhost:8000/v1/classifier \
  --model YOUR_MODEL --workers 1 --delay 0 --output eval/results/my-multi-decision
python3 eval/audit.py --run eval/results/my-multi-decision --preset multi-decision
```

Each request contains only one original context and its questions. Gold labels,
provenance and scores stay local. The ContractNLI group check requires exactly
123 documents and 2,091 questions, **17 per document**. The batch adapter
rejects missing or extra answers; missing/failed requests count wrong for
accuracy, F1, and whole-case accuracy. Input-token usage is server-reported;
do not assume it represents physical compute. Respect context and server branch
limits: overlong contexts and HTTP 422 are recorded failures, never truncated.

The original `legal-contractnli` and `legal-unfair-tos` manifests remain
unchanged. Both multi manifests use **the same** original test rows; do not
combine their outputs with the originals as additional examples.

The existing `multilingual/jevfire-fields` is not included here: some cases
have only **one** field, so it does not meet the every-request-multi criterion.
The Decision Index's BFCL, SATA-Bench, ToolRet and BRIGHT also offer grouped
judgments/candidates but are not yet ported to this specific protocol; no
invented gold or replacement ranking metric is used.
