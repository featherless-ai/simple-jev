# Additional community evaluations

All suites use the same implementation-independent `run.py --endpoint URL --model ID`
runner. Preparation below does not call models. No evaluation scores are included.
Pinned revisions live in `vendor/<repository>/source.json`; use those revisions
when checking out upstream. Generated datasets and provenance sidecars stay local.

## Language separation

Manifests now live in three directories (old flat suite paths have moved):

| Directory | Contents |
| --- | --- |
| `suites/english/` | SemIf, JevBench tiers, Korean study's English condition, jevtest assertion subset |
| `suites/non-english/` | Korean content conditions and Turkish frozen RAG |
| `suites/multilingual/` | English/Spanish JEVfire and Chinese/English search reranking |

Each manifest declares `language_group` and `languages`; each run summary copies
those fields. Scores remain separate by suite; there is no pooled multilingual
or English leaderboard. `non-english` means the evaluated content is non-English;
Korean content with English instructions remains here. Search's English-query
slice is **still multilingual** because candidate metadata includes Chinese.
The existing JEVfire fixture is kept intact in the multilingual group.

Do not override a suite's input with another language or cohort and retain its
identity. Create a new manifest with the correct metadata instead.

## Korean study

Source: [mahlernim/jev-korean-benchmark](https://github.com/mahlernim/jev-korean-benchmark).

Import its reconstructed `data/pilot-v1/manifest.json`. In the pinned upstream
checkout, install its requirements and run **only** `python -m jevbench prepare`.
This downloads source datasets and reconstructs frozen inputs, without inference.
Follow its input-completeness review for medical items before evaluating them.

```sh
python3 eval/prepare_additional.py korean \
  --input /path/to/jev-korean-benchmark/data/pilot-v1/manifest.json \
  --condition en_en --output eval/data/korean-public-en-en.jsonl
python3 eval/prepare_additional.py korean \
  --input /path/to/jev-korean-benchmark/data/pilot-v1/manifest.json \
  --condition ko_en --output eval/data/korean-public-ko-en.jsonl
python3 eval/prepare_additional.py korean \
  --input /path/to/jev-korean-benchmark/data/pilot-v1/manifest.json \
  --condition ko_ko --output eval/data/korean-public-ko-ko.jsonl
```

Only public-gold stages 1 and 2 are imported: Belebele, PAWS-X, and KorMedMCQA.
Development examples, unreviewed synthetic medical cases, repeat/order variants,
and the separate MedQA extension are excluded. English and Korean conditions are
separate suites. Report results per task as well as per condition when analysing
language effects: KorMedMCQA has no matched English arm. The importer verifies
upstream manifest and request hashes, preserves prompts, option order and case IDs,
and maps PAWS-X's 0/1 labels onto native Noul no/yes. Our native adapter uses modal
accuracy and common suite metrics, not the study's full statistical analysis;
Noul ties follow our declared option order (no first).

No top-level code license was present in the inspected repository, so its code
and source texts are **not vendored**. Dataset terms remain applicable: Belebele
CC BY-SA 4.0, PAWS-X upstream Google terms, KorMedMCQA CC BY-NC 2.0. Review those
terms for your intended use. Source metadata alone is retained here.

## Search relevance

Source: [zhuyansen/jev-search-rerank-eval](https://github.com/zhuyansen/jev-search-rerank-eval) (MIT; catalog metadata belongs to its respective authors).

The importer reads the pinned checkout's committed index, queries, labels and
`results/runs.json`. It reranks the original **bge-m3 top 30**, with the original
compact candidate format and four-level Score prompt. It does not run embeddings,
rebuild retrieval, relabel data or use previous Jev predictions as predictions.

```sh
python3 eval/prepare_additional.py search --checkout /path/to/jev-search-rerank-eval \
  --form en --label-set llm --output eval/data/search-rerank-en-llm.jsonl
```

Repeat with `--form syn`, `mix`, and `sim`, and corresponding output filenames.
The four slices contain 45, 80, 38 and 1 queries respectively (164 total).
`sim` is retained as its own upstream form, not silently dropped or reclassified.
All four suite manifests are under `suites/multilingual/`.

Default `--label-set llm` uses the independent Haiku labels and avoids Jev's own
judgments contributing to ground truth. `--label-set final` uses the upstream
merged, fractionally graded labels; matching `*-final.json` manifests are provided.
Do not compare these label conditions as though they were independent datasets.

Metrics match upstream definitions: **linear-gain NDCG@10**, full returned-list
MRR, and P@3 with relevance >= 2. The ideal ranking uses the complete judged pool;
unjudged items receive zero as upstream does. Ranking uses native returned Score
values and stable ties. Failed queries count as zero. This does not reproduce
retriever comparisons, RRF fusion, bootstrap intervals or upstream headline tables.
Inputs can exceed the public demo's context limit; use a suitably sized endpoint.

## jevtest

Source: [realZachi/jevtest](https://github.com/realZachi/jevtest) (MIT).

This is a semantic assertion library, **not a fixed labelled benchmark**. We ship
`jevtest-support-subset`: six derived positive/negative assertions over its
literal polite/sloppy support-bot replies. The original fixture, assertion test,
and prompt builder are vendored for auditability. The state and native Noul
question follow the upstream `output`/expectation format. Binary labels are
inferred from the deterministic templates and identified as derived in provenance.

The suite measures modal classification accuracy at the yes/no boundary. It does
not reproduce matcher-specific confidence thresholds, batching, snapshot diffs,
context tests or prompt-injection tests. Treat it as a small semantic-regression
smoke suite, not evidence of broad model quality. No preparation is required.

## Run after preparing on the evaluation machine

```sh
python3 eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model Qwen/Qwen3.5-2B \
  --suite eval/suites/english/jevtest-support-subset.json \
  --suite eval/suites/non-english/korean-public-ko-ko.json \
  --suite eval/suites/multilingual/search-rerank-en-llm.json \
  --output eval/results/qwen35-2b-additional
```

Repeat with the exact served 4B model ID and a new output directory. Every selected
suite must be prepared before the runner sends its first request. The suites use
native Noul and Score responses; an endpoint must support those primitives.
