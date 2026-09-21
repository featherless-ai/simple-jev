# Additional benchmark integrations

All four requested projects are represented as independent endpoint suites. Source
revisions are pinned in `vendor/<project>/source.json` and copied into suite manifests.
No endpoint evaluations or published scores are included as our own measurements.

| Project | Suites | Included scope |
|---|---|---|
| [fstandhartinger/jevbench](https://github.com/fstandhartinger/jevbench) | `jevbench-original`, `jevbench-easy`, `jevbench-hard` | 72, 48 and 111 public tasks; native Choice, Noul and Score |
| [kikoncuo/jevfire](https://github.com/kikoncuo/jevfire) | `jevfire-fields` | Original synthetic cases, one batched request per case; field and exact-case accuracy |
| [erendikmenn/jev-rag-benchmark](https://github.com/erendikmenn/jev-rag-benchmark) | `rag-frozen` | Frozen-candidate batched Noul reranking; Recall@5, MRR@10, nDCG@10 |

These are adaptations, not reproductions of every upstream experiment or headline
score. Upstream licenses are preserved in `vendor/`. External dataset licenses
remain separate from code licenses. Preparation emits a `.provenance.json` sidecar
with input-file hashes; retain it alongside the dataset. Endpoint runs hash the
prepared dataset itself.

## JevBench public tiers

Public source files are vendored at the pinned revision under the upstream MIT
license. Prepare each once:

```sh
python eval/prepare_external.py jevbench-original --output eval/data/jevbench-original.jsonl
python eval/prepare_external.py jevbench-easy --output eval/data/jevbench-easy.jsonl
python eval/prepare_external.py jevbench-hard --output eval/data/jevbench-hard.jsonl
```

Native question types and criteria are preserved. Noul maps to probabilities over
`yes`/`no`; Score is compared using the argmax of its level distribution. This is
modal accuracy, not absolute error of the expected rubric score. Hard tasks can
exceed the public demo's 2k context limit; use a suitably configured endpoint.

This does not include private/withheld or unredistributed imported cases and does
not calculate the upstream four-axis JevBench Score, calibration composite,
cost assumptions, or artificial latency adjustments. Do not compare our public-tier
accuracy directly with that full composite leaderboard.

## JEVfire multi-field decisions

```sh
python eval/prepare_external.py jevfire --output eval/data/jevfire-fields.jsonl
```

Preparation loads the pinned vendored `cases.py`, not arbitrary code supplied by a
dataset. Each original case becomes one request with all its fields. Boolean fields
become choices `false`/`true`, enum order stays unchanged. Expected values remain
local. We report field accuracy and exact-case accuracy; a failed case counts all
its fields wrong. This is not the upstream constrained-generation speedup comparison,
cache-salt experiment, load test, or game benchmark. No engine-specific API is needed.

## RAG frozen retrieval

Prepare the upstream processed documents and queries following the pinned repository's
README. Match the dataset and split used by the candidate artifact. For the full
XQuAD-TR benchmark this is the 1,044-query test split. Reuse the original result file's
branch A `candidate_ids` as the frozen hybrid retrieval output, **not** its reranked
`context_ids`. No embeddings, retrieval or generation run in this integration.

```sh
python eval/prepare_external.py rag \
  --documents /path/to/documents.jsonl \
  --queries /path/to/queries.test.jsonl \
  --candidates /path/to/jev-rag-benchmark/results/xquad-tr-hybrid-fullfusion20-a-d-o.jsonl \
  --branch A --output eval/data/rag-frozen.jsonl
```

The converter requires identical query ID sets, unique candidate IDs per query and
all candidate documents to be present. Missing files/IDs fail rather than silently
rebuild a different retrieval pool. It records artifact hashes. Dataset content is
not vendored; follow XQuAD/SciFact licensing and upstream preparation instructions.

The endpoint receives the upstream relevance instruction and one Noul question per
candidate in a shared context. It never receives relevant-document IDs or reference
answers. Binary qrels are used; ties retain original candidate order. Candidate
recall exposes the retrieval ceiling. Failed requests score zero on ranking metrics.
This supports the upstream binary relevant-document export, not graded relevance.

## Running selected suites

After preparation, any combination can use the existing runner:

```sh
python eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model Qwen/Qwen3.5-4B \
  --suite eval/suites/english/jevbench-original.json \
  --suite eval/suites/english/jevbench-hard.json \
  --suite eval/suites/multilingual/jevfire-fields.json \
  --suite eval/suites/non-english/rag-frozen.json \
  --output eval/results/qwen35-4b-external
```

Swap in your 2B served model ID and a new result directory for a matched comparison.
All suites are validated before the first endpoint call. Existing datasets/results
are not overwritten. Reports stay separate; unrelated metrics are never averaged
into a global leaderboard score.
