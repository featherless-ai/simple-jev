# Model knowledge and awareness benchmarks

All sources include public labels and are pinned by revision and SHA-256.
Preparation is offline apart from explicit downloads and never runs a model.
Install the optional parquet dependency with
`python3 -m pip install -r eval/requirements-domains.txt`.

| Project | Included data | Category placement |
| --- | --- | --- |
| MMLU | Full original test: 14,042 questions, 57 subjects | Business subjects → Corporate; CS → Coding; computer security → Security; law → Legal; remaining subjects → General |
| MMLU-Pro | Full released test: 12,032 questions | Business → Corporate; computer science → Coding; law → Legal; remainder → General |
| CodeMMLU | 19,875 valid-choice rows from the released 19,878 | Knowledge families → Coding / Model knowledge; completion, repair, fill-in-middle and execution prediction → Coding / Classification |
| CyberMetric | All 10,180 rows in the file named CyberMetric-10000-v1 | Security / Model knowledge |
| SecQA | Original v1 test (110) and v2 test (100), separate conditions | Security / Model knowledge |
| MetaTool | Task 1 tool-awareness decisions (1,040) | Agentic / Classification, not Model knowledge |

MMLU is the original benchmark, not MMLU-Pro; both are separately named projects.
MMLU and MMLU-Pro questions test reasoning as well as learned knowledge.
No subject is duplicated across our category placements. Agentic / Model knowledge
remains empty: MetaTool tests tool-use decisions, not factual recall.

## Preparation

```sh
python3 eval/prepare.py mmlu --download
python3 eval/prepare.py knowledge mmlu-pro --download --output eval/data/mmlu-pro.jsonl
python3 eval/prepare.py knowledge codemmlu-full --download --output eval/data/codemmlu-full.jsonl
python3 eval/prepare.py knowledge cybermetric --download --output eval/data/cybermetric.jsonl
python3 eval/prepare.py knowledge secqa-v1 --download --output eval/data/secqa-v1.jsonl
python3 eval/prepare.py knowledge secqa-v2 --download --output eval/data/secqa-v2.jsonl
python3 eval/prepare.py knowledge metatool-awareness --download --output eval/data/metatool-awareness.jsonl
```

All questions and original choice order are preserved. CodeMMLU's additional
problem descriptions are retained as state. Gold answers, source explanations,
MMLU-Pro chain-of-thought fields and MetaTool gold tool names are withheld.
No source code is executed.

MMLU uses zero-shot Choice scoring, not the classic five-shot prompt. MetaTool
uses a fixed binary awareness question with the original user query and label;
it does not request the upstream explanation or include its few-shot examples.
These are explicit Jev endpoint adaptations, not reproductions of every original
leaderboard prompting protocol.

## Release issues

CodeMMLU has three malformed rows: `k05719` and `rt01749` each have only one
choice; `k10418` has answer C but only two choices. These exact IDs are excluded,
recorded in provenance, and the named project configuration is labelled
**valid-choice release**. No labels or distractors are invented. Unknown malformed
rows fail preparation. Its original knowledge-labelled families can also contain
code reasoning; placement follows the source families.

CyberMetric's pinned file contains 10,180 entries despite its 10,000 name.
Every released row is retained. Smaller overlapping CyberMetric size variants
are not added or averaged with it.

## Reporting

Run full parents to obtain both a full project score and category breakdowns
without repeated inference:

```sh
python3 eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model YOUR_MODEL --suite eval/suites/english/mmlu-full.json \
  --suite eval/suites/english/codemmlu-full.json \
  --output eval/results/knowledge
```

MMLU reports question-weighted accuracy, subject-macro accuracy, and per-subject
and category breakdowns. Its headline score is question-weighted accuracy.
Other new knowledge projects use modal Choice accuracy. Failures count as wrong.
Only disjoint children or their parent should be selected, not both.

## Sources

- [MMLU](https://huggingface.co/datasets/cais/mmlu) — MIT dataset metadata.
- [MMLU-Pro](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro).
- [CodeMMLU dataset](https://huggingface.co/datasets/Fsoft-AIC/CodeMMLU) and
  [project](https://github.com/FSoft-AI4Code/CodeMMLU).
- [CyberMetric](https://github.com/cybermetric/CyberMetric).
- [SecQA](https://huggingface.co/datasets/zefang-liu/secqa).
- [MetaTool](https://github.com/HowieHwong/MetaTool).

Source data is not redistributed here; follow source terms. Full labelled files
were downloaded and converted for offline validation. No inference was run.
