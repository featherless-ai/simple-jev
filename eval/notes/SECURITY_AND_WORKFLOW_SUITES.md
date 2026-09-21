# NPC, security and passage reranking

These additions preserve the implementation-independent endpoint runner and the
English/non-English/multilingual directory split. Source revisions are recorded
in `vendor/<repository>/source.json`. No model evaluations were run.

| Project | Integration | Language placement |
| --- | --- | --- |
| [wondertwins/jev-benchmark](https://github.com/wondertwins/jev-benchmark) | Three strict NPC addressee suites, 75 cases each | English |
| [anessbelbati/jev-rerank-bench](https://github.com/anessbelbati/jev-rerank-bench) | Four-level rubric over frozen passage candidates; 14 dataset manifests | English; MIRACL French separately |
| [anisselbd/jev-phishing-bench](https://github.com/anisselbd/jev-phishing-bench) | Original nine-question battery; primary verdict scoring over 2,000 prepared emails | English |
| [Gaurav-Gosain/jev-sec-bench](https://github.com/Gaurav-Gosain/jev-sec-bench) | 662 injection messages, context ablation, and 400 code samples (200 pairs) | Injection multilingual; code with English framing |

## NPC addressee detection

Ready to run, with no preparation:

- `suites/english/npc-clean.json`
- `suites/english/npc-stt.json`
- `suites/english/npc-stt-misheard.json`

The source has 79 scenarios, four marked ambiguous. These suites retain all 75
strict cases, with identical gold across transcript variants. Original clean and
misheard cached **requests** are preserved. Missing STT requests are reconstructed
using the source's deterministic transcript transform and the unchanged clean
question battery. No upstream model responses are used as predictions or gold.
The source dataset and question builder are retained under `vendor/jev-benchmark/`.

Each request retains the full upstream question battery, including auxiliary
intent/urgency/attitude questions. Only per-NPC addressee Nouls have targets here.
Metrics include exact addressee-set accuracy, target accuracy, precision, recall,
F1, binary Brier, ECE and AUROC. Threshold is fixed at >= 0.5. Auxiliary questions
remain visible in raw responses but receive no invented gold labels. Failed
requests count as wrong for accuracy/exact-set and reduce coverage; probability
metrics explicitly exclude failures.

This is the addressee benchmark, **not the chess experiment**. Chess variants need
board/engine preparation and their own centipawn-loss scoring; they are not added
as misleading generic choice-accuracy suites. These three transcript variants
share cases and must not be pooled as independent evidence. Source license: MIT.

## Security

Use a local checkout at the pinned revision. The committed upstream result files
contain the full original inputs and labels. The importer reads those fields,
discards old scores, and preserves the original Noul + severity Score battery.
No dataset download, Go execution, or inference is needed for import.

```sh
python3 eval/prepare.py security_rerank security-injection \
  --checkout /path/to/jev-sec-bench --output eval/data/security-injection.jsonl
python3 eval/prepare.py security_rerank security-injection-no-context \
  --checkout /path/to/jev-sec-bench --output eval/data/security-injection-no-context.jsonl
python3 eval/prepare.py security_rerank security-code \
  --checkout /path/to/jev-sec-bench --output eval/data/security-code.jsonl
```

Both injection suites live under `suites/multilingual/`: the corpus skews German
and includes English and other languages. The language list is non-exhaustive.
The context condition includes the source news-assistant description; the ablation
sends bare message text with unchanged questions. It is the same labelled cohort.

Code is under `suites/english/`, referring to natural-language framing, not its
programming languages. The model sees only language and code. Vulnerability class,
secure/vulnerable pairing, gold and old predictions remain local. Matched pairs
are validated and scored for strict vulnerable-above-secure ordering, alongside
binary metrics. Ties are not pair wins; incomplete pairs are excluded with an
explicit complete-pair count. Severity is auxiliary, with no gold score here.

The source warns that the synthetic code labels are noisy. We preserve its
original labels, not the audit's relabelled subset. Source code is MIT; underlying
`deepset/prompt-injections` and `CyberNative/Code_Vulnerability_Security_DPO` dataset
terms still apply. Input texts stay in ignored generated files. No live URL or
code from benchmark inputs is executed.

## Phishing

In the pinned upstream checkout, install its dependencies and run only
`python prepare.py data`. This downloads PhishNChips v5.2, checks the upstream
release hashes and creates `data/emails.jsonl`; it does not call a model.

```sh
python3 eval/prepare.py security_rerank phishing-verdict \
  --checkout /path/to/jev-phishing-bench --output eval/data/phishing-verdict.jsonl
```

Use `suites/english/phishing-verdict.json`. The importer reads the literal
`QUESTIONS` dictionary using Python's AST literal parser without executing
`run_jev.py`. All nine original questions are sent; only the primary verdict's
normalized phishing probability is scored. The email's gold, URL category and
strategy are not sent. URLs are data only and are never visited.

Metrics include fixed-threshold accuracy, precision/recall/F1, false-positive
rate, AUROC, binary Brier, ECE and coverage. This does not reproduce signal-based
logistic regression, threshold selection, held-out controls, alternative-verdict
metrics, repeatability studies, bootstrap intervals or provider cost comparisons.
No top-level license was present in the inspected repository, so neither its
code nor email texts are vendored. PhishNChips has its own synthetic-content and
third-party URL-source terms; retain its attribution and license records.

## Passage reranking

Use `prepare.py security_rerank passage-rerank --dataset NAME`. Supported datasets:
SciFact, FiQA, NQ, NFCorpus, TREC-COVID, CodeSearchNet Python, MIRACL French, and
seven BRIGHT subsets (biology, economics, earth_science, psychology, robotics,
stackoverflow, sustainable_living). Each has its own manifest, named
`passage-rerank-NAME.json`. MIRACL is under `suites/non-english/`; others are English.

The source commits candidate IDs and qrels, but does not commit the large passage
text exports. Restore `candidates/NAME.docs.jsonl` in its checkout. To download
texts without rebuilding or replacing the frozen BM25 lists, run this in the
upstream environment (change `name`):

```python
import json
from pathlib import Path
from data.loaders import load

name = "scifact"
rows = [json.loads(line) for line in Path(f"candidates/{name}.jsonl").read_text().splitlines()]
needed = {c["did"] for r in rows for c in r["present"]}
corpus = load(name).corpus  # source data download only; no model or BM25 run
with Path(f"candidates/{name}.docs.jsonl").open("x") as output:
    for did in sorted(needed):
        output.write(json.dumps({"did": did, "text": corpus[did]}) + "\n")
```

Then, from Simple Jev:

```sh
python3 eval/prepare.py security_rerank passage-rerank --dataset scifact \
  --checkout /path/to/jev-rerank-bench --output eval/data/passage-rerank-scifact.jsonl
```

The importer preserves candidate ordering, query, qrels and source's 2,000-character
passage truncation. One native Score question per candidate uses the original
four-level rubric. Ranking uses expected Score and stable BM25-order ties.
NDCG@10 has linear gains and the complete original qrels as the ideal; MRR@10,
Recall@5 and top-pick accuracy treat relevance > 0. As upstream, only queries with
at least one relevant candidate enter ranking metrics. Failures contribute zeros
within that denominator. Both excluded-row count and failed-row count are reported.

This adds the **present-candidate rubric condition**, not the absent-candidate
AUROC test, NevIR paired negation, duels, tournaments, cascades, RRF, bootstrap
comparisons or an equal-dataset headline aggregate. Each dataset remains separate.
Upstream MIT code licensing does not replace source dataset licensing. Text
restoration may use current source snapshots: hashes record the exact inputs,
but do not prove historical text identity. Preserve your source exports for reuse.
Large batches generally need more context than the public demo endpoint supports.

## Endpoint execution, when ready

```sh
python3 eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model Qwen/Qwen3.5-2B \
  --suite eval/suites/english/npc-clean.json \
  --suite eval/suites/multilingual/security-injection.json \
  --output eval/results/qwen35-2b-npc-security
```

Repeat with the exact served 4B model ID and a new output directory. Prepare all
selected input datasets first. Preparation records hashes of consumed inputs and
refuses overwrites; summaries retain the suite's language metadata. No inference
has been run as part of these additions.
