# Public-source decision tasks (opt-in)

These suites are independently prepared from upstream test splits; **they are not
reproductions of the Decision Index 0.2 frozen row archive or leaderboard score**.
Do not merge them into historical `quick`, `decision`, or `full-text` presets or
compare scores directly to the Space. The original index selection, rendering,
and all native task metrics have not been ported. No model inference was run.

| Suite | Test rows | Report metric | Source | Limitations |
| --- | ---: | --- | --- | --- |
| `decision-index-when2call` | 3,652 | Accuracy | [nvidia/When2Call](https://huggingface.co/datasets/nvidia/When2Call), CC-BY-4.0 | Four published responses; `tools` parsed from source JSON strings. A Choice question per row. No execution of tools. |
| `decision-index-banking77` | 3,080 | 77-class macro-F1 and accuracy | [PolyAI banking77](https://huggingface.co/datasets/PolyAI/banking77), CC-BY-4.0 | All 77 original intents are options for each message. No per-item semantic rewriting or grouping. |

Pinned revisions and byte checksums are under `eval/vendor/decision-index/`.
Source content and prepared rows are deliberately ignored, not redistributed.
The CLI checks the entire file hash *before* parsing and refuses incomplete
splits or overwritten output. Gold, dataset metadata, and source identifiers
are not included in model requests. Benchmark input is not held out from public
model training, so do not make held-out claims.

```sh
python3 eval/prepare.py decision_index when2call --download \
  --output eval/data/decision-index-when2call.jsonl
python3 eval/prepare.py decision_index banking77 --download \
  --output eval/data/decision-index-banking77.jsonl
python3 eval/run.py --endpoint http://localhost:8000/v1/classifier --model YOUR_MODEL \
  --suite eval/suites/english/decision-index-when2call.json \
  --suite eval/suites/english/decision-index-banking77.json \
  --delay 0 --output eval/results/public-decisions
```

The BANKING77 suite requires a server supporting at least 77 Choice options,
plus enough context for the 77 candidates. Server 422 rejections are failures;
do not silently trim labels. Verify source licences before publishing new raw data.

For **multiple questions on one shared state**, the relevant public upstream
benchmark is ContractNLI (123 contracts and 2,091 hypothesis judgments, 17 on
average), already prepared by `eval/prepare.py domains legal-contractnli`. Its
original `choice-v1` suite flattens hypotheses into separate requests; the
new `multi-decision` preset groups all 17 per contract into one request via
`legal-contractnli-multi`. See [multi-decision instructions](MULTI_DECISION.md). BFCL, SATA-Bench, and the
home-appliance simulator are other multi-question candidates needing their own
native grouping/scoring adapters. Retrieval tasks ToolRet/BRIGHT contain many
candidate judgments per query and require ranking metrics; they are not ordinary
independent factual questions.
