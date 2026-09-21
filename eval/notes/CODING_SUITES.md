# Code classification

Both suites have one placement: **Text-based → English → Coding → Classification / decision**. Coding
language is metadata, not a natural-language grouping. Code retrieval sits under Coding → Ranking; vulnerability detection stays under
Security → Classification / decision.

| Suite | Original data | Jev answer | Metric |
| --- | --- | --- | --- |
| `codecomplex-test` | Authors' 980-row `codecomplex-simple` test split | Seven-class Choice | Accuracy |
| `bigclonebench-test` | CodeXGLUE's 415,416 original labelled test pairs | Noul semantic equivalence | Binary F1 |

## Sources and scope

[CodeComplex](https://github.com/sybaik1/CodeComplex) includes a pre-split LLM
benchmark under `LLM-qlora/codecomplex-simple/`. We use that test split, not a new
random split of its raw corpus. The authors' system and user context are preserved
as input state; their assistant answer is withheld. A seven-option classification
question replaces generative JSON decoding. The label `np` is normalized to
`exponential`, matching the upstream scoring script (as is `factorial`, if present).
This is the LLM split, not reproduction of the paper's entire cross-validation
protocol. Problem names/tags from the raw corpus are not added as hints.

[CodeXGLUE BigCloneBench](https://github.com/microsoft/CodeXGLUE/tree/main/Code-Code/Clone-detection-BigCloneBench)
provides function source keyed by ID and original test-pair labels. Each pair is
sent as two functions with a semantic-equivalence Noul question. The fixed decision
threshold is >= 0.5. No retrieval candidates or ranking are involved. The full
415,416-pair test set is substantial; no automatic sample or truncation is applied.
Repeated functions across pairs remain as supplied by the benchmark.

CodeComplex uses the choice adapter, which reports aggregate and family-balanced accuracy.
BCB uses the binary battery adapter. For all suites, inspect failed-row counts:
accuracy counts failures as wrong, while binary probability metrics exclude failures.
Only complete runs should be compared with official complete-run F1 results.

## Prepare without model calls

Clone the sources, then check out the full revisions recorded in
`vendor/coding/SUITE.json`. The importer verifies both checkout revision and input
file hashes. No benchmark code is executed; no model weights are downloaded.

```sh
python3 eval/prepare.py coding codecomplex-test \
  --checkout /path/to/CodeComplex --output eval/data/codecomplex-test.jsonl
python3 eval/prepare.py coding bigclonebench-test \
  --checkout /path/to/CodeXGLUE --output eval/data/bigclonebench-test.jsonl

```

Prepared JSONL and provenance sidecars are ignored by Git and never overwritten.
No source code dataset is redistributed here. CodeXGLUE's license notice is
retained; consult original dataset/code terms as well. No top-level license was
present in the inspected CodeComplex checkout, so its code/data are not vendored.

## Run on the evaluation node

```sh
python3 eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model YOUR_SERVED_MODEL_ID \
  --suite eval/suites/english/codecomplex-test.json \
  --suite eval/suites/english/bigclonebench-test.json \
  --output eval/results/coding-baseline
```

Run each desired
model against the same prepared inputs and use a new result directory. Full code
can exceed small endpoint context limits; it is not silently shortened.

Validation performed: offline contract tests and import validation of all 980
CodeComplex test rows. No model evaluations were run.

## Default run selection

BigCloneBench is **opt-in** (`default_enabled: false` in its suite manifest).
Its 415,416 pairs dominate runtime; standard full-run queues skip it. CodeComplex,
CodeMMLU, code-security classification, and code-ranking suites remain enabled.
An explicit `run.py --suite eval/suites/english/bigclonebench-test.json` still runs
its full test set. Queue builders should honor `default_enabled` (default: true).
