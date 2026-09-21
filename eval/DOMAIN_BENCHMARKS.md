# Legal decisions, legal retrieval, tool retrieval and security retrieval

These suites use existing released benchmarks and gold labels. Preparation never
calls a model. Original datasets are downloaded separately, not redistributed in
this repository. Pin metadata is in `vendor/domain-benchmarks/`; prepared data
and provenance sidecars are local artifacts.

## Suites and placement

| Suite | Category | Task | Protocol |
| --- | --- | --- | --- |
| legal-contractnli | Legal | Classification / decision | Original ContractNLI test contracts × hypotheses; 3-way Choice |
| legal-unfair-tos | Legal | Classification / decision | LexGLUE UNFAIR-ToS test; eight independent Noul labels |
| legal-casehold | Legal | Classification / decision | LexGLUE CaseHOLD test; five candidate holdings, Choice |
| legal-rag-cuad | Legal | Ranking | Released CUAD retrieval questions and evidence spans |
| legal-rag-maud | Legal | Ranking | Released MAUD retrieval questions and evidence spans |
| legal-rag-contractnli | Legal | Ranking | Released ContractNLI retrieval questions and evidence spans |
| legal-rag-privacy-qa | Legal | Ranking | Released PrivacyQA retrieval questions and evidence spans |
| toolret-web | Agentic | Ranking | ToolRet web tools |
| toolret-code | Agentic | Ranking | ToolRet code tools; placement follows tool selection intent |
| toolret-customized | Agentic | Ranking | ToolRet customized tools |
| cybersec-attack-retrieval | Security | Ranking | ATT&CK technique retrieval |
| cybersec-sigma-retrieval | Security | Ranking | Sigma detection-rule retrieval |
| cybersec-cve-similarity | Security | Ranking | Similar CVE retrieval |
| cybersec-cwe-retrieval | Security | Ranking | CWE retrieval |
| cybersec-threat-report-retrieval | Security | Ranking | Threat-report retrieval |
| cybersec-soc-playbook | Security | Ranking | SOC playbook retrieval |

Legal and security suites are English. ToolRet is conservatively placed under
Multilingual: English user tasks coexist with non-English tool metadata. No
translation is applied. Each suite has one placement; related source documents
can occur in different tasks, so scores must not be pooled as independent evidence.

## Sources

- [ContractNLI](https://stanfordnlp.github.io/contract-nli/): original ZIP, test
  labels and document text; CC BY 4.0. Evidence annotations are withheld from
  the classifier. The full test split contains 2,091 hypothesis decisions.
- [LexGLUE](https://github.com/coastalcph/lex-glue), using
  [the authors' dataset](https://huggingface.co/datasets/coastalcph/lex_glue):
  original test parquet files and label metadata. Dataset card lists CC BY 4.0;
  consult the component datasets' terms as well.
- [LegalBench-RAG](https://github.com/zeroentropy-ai/legalbenchrag):
  use the **published download**, not the generation scripts. The release contains
  corpus text and benchmark JSON with character offsets. The source code is MIT;
  original corpus terms still apply.
- [ToolRet](https://github.com/mangopy/tool-retrieval-benchmark):
  pinned [queries](https://huggingface.co/datasets/mangopy/ToolRet-Queries) and
  [tool documentation](https://huggingface.co/datasets/mangopy/ToolRet-Tools).
  Use evaluation queries, not ToolRet-Training-20w. Preserve component source
  terms. We omit the target-aware generated instruction and use the user query.
- [CyberSec Retrieval Benchmark](https://huggingface.co/datasets/alirezaaminzadeh/cybersec-retrieval-benchmark):
  original queries, corpus and binary qrels, separated by task. Its split is named
  `train` upstream although the card describes evaluation data; no new train/test
  split is invented. The brief card provides limited label-construction detail,
  so this is an exploratory baseline, not a claim of expert-verified gold.
  The Sigma corpus contains one ID shared by two different texts, including a
  gold reference. Both texts are retained in one candidate under that ID; no
  per-variant labels are invented. This grouped-ID adaptation is documented
  rather than silently discarding one document.

Pinned revisions identify remote files; preparation records SHA-256 hashes of
every consumed local file. A hash records bytes, not proof of annotation quality.
Cached local source files are reused; keep the provenance with results.

## Prepare on the evaluation node

Only parquet imports require an extra package:

```sh
python3 -m pip install -r eval/requirements-domains.txt
python3 eval/prepare_domains.py legal-contractnli \
  --sources eval/sources/domains --download \
  --output eval/data/legal-contractnli.jsonl
python3 eval/prepare_domains.py toolret-web \
  --sources eval/sources/domains --download \
  --output eval/data/toolret-web.jsonl
python3 eval/prepare_domains.py cybersec-attack-retrieval \
  --sources eval/sources/domains --download \
  --output eval/data/cybersec-attack-retrieval.jsonl
```

Repeat with the other suite IDs in the table. Files already downloaded are reused.
The importer refuses to overwrite existing output or provenance.

For LegalBench-RAG, download the existing release via the link in the upstream
README. Extract its `corpus/` and `benchmarks/` directories under
`eval/sources/domains/legalbenchrag/`, then:

```sh
python3 eval/prepare_domains.py legal-rag-cuad \
  --sources eval/sources/domains --top-k 20 --chunk-chars 1500 \
  --output eval/data/legal-rag-cuad.jsonl
```

No automatic truncation of contracts or tool descriptions occurs. A batch of 20
passages can exceed a small endpoint context limit: use adequate context, or
prepare a separately identified smaller-candidate condition. Do not compare
different candidate pools as if they were identical runs.

## Ranking adaptation

This is **frozen-candidate reranking**, not a reproduction of full-corpus embedding
retrieval. Preparation uses deterministic BM25 (k1=1.2, b=0.75), Unicode word
tokenization and corpus-ID tie breaks. It selects 20 candidates by default without
consulting qrels. Relevant documents are never forcibly inserted.

Every query counts, including queries whose gold was missed by candidate
selection. Metrics include nDCG@10 with binary gains, Recall@5/10, MRR@10,
candidate recall and failure counts. Ties in model scores retain the frozen
candidate order. Gold labels, relevance IDs and source paths are withheld from
the request. Tool questions evaluate usefulness for a task; document questions
evaluate evidence relevance.

LegalBench-RAG uses deterministic non-overlapping 1,500-character chunks over the
whole released corpus, shared by its four query subsets. Chunk boundaries do not
use gold spans. A chunk is relevant if it overlaps an original evidence span.
In addition to chunk ranking metrics, report macro character precision/recall
over the first five retrieved chunks; overlapping gold spans are unioned.
This is an explicit fixed-chunk, top-five adaptation, not the official benchmark's
arbitrary retrieval-budget protocol. Preserve the offsets to inspect results.

LegalBench-RAG's released questions involve LLM-assisted generation, as explained
by its README; do not describe every query as manually authored.

## Classification metrics

Choice suites use the existing accuracy and family-balanced metrics.
UNFAIR-ToS uses eight binary questions per original example and supports multiple
positive labels or none. The existing binary adapter reports micro-F1, all-label
accuracy, exact-set accuracy, coverage and calibration metrics. Its fixed 0.5
threshold and micro-F1 are not a reproduction of the full LexGLUE leaderboard
protocol (which also uses macro-F1). CaseHOLD remains classification, not retrieval.

## Run when ready

```sh
python3 eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model YOUR_SERVED_MODEL_ID \
  --suite eval/suites/english/legal-contractnli.json \
  --suite eval/suites/multilingual/toolret-web.json \
  --output eval/results/legal-tool-baseline
```

Prepare all selected data first. No model evaluation is part of this addition.


## Offline validation performed

- Imported complete original classification test splits: ContractNLI 2,091,
  UNFAIR-ToS 1,607 and CaseHOLD 3,600 rows.
- Prepared all six CyberSec subsets: 250 ATT&CK, 200 Sigma, 250 CVE,
  150 CWE, 250 threat-report and 250 SOC-playbook queries.
- Prepared all 5,230 ToolRet web queries; checked corpus/label references for
  all three categories (also 1,749 code and 982 customized queries).
- Prepared the 977-query LegalBench-RAG ContractNLI subset. Validated every
  released evidence span in the other subsets: CUAD 4,042, MAUD 1,676,
  PrivacyQA 194. This downloaded release totals 6,889 queries, differing from
  the paper's reported count; no rows were discarded to force that count.
- Unicode-normalized file identifiers resolve accented filenames consistently
  on macOS and Linux. Document text and character offsets are unchanged.

These are data preparation and validation checks, not model results.
