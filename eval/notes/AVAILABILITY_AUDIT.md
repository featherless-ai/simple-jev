# Evaluation availability audit

Retain a suite only when labelled source data is bundled or obtainable through
the documented public preparation path, and an adapter exists in our endpoint
runner. A local prepared-file absence alone does not mean a dataset is unavailable:
large corpora and images are intentionally downloaded on the evaluation node.

This is a source/harness audit, not a claim that every full dataset was downloaded
or every model request executed locally. No inference was run.

## Removed

| Entry | Reason |
| --- | --- |
| Browser research | No integration with our classifier endpoint harness |
| LegalForecast | Actual labelled court-record release unavailable locally; requires external issuance |
| ClozeTest-maxmin | Public examples lack real gold labels |
| LEDGAR | Original task needs 100 choices; current API schema supports at most 50 |
| Full BTZSC pilot | Banking77 portion needs 72 choices; current API schema supports at most 50 |

Removed entries have no active suite manifest. No answer lists were truncated to
make incompatible benchmarks appear supported.

## Retained source and harness paths

| Group | Data availability | Harness / preparation |
| --- | --- | --- |
| SemIf authored and perturbations | Bundled labelled JSONL | Choice adapter |
| SemIf Typesafe agreement | Public reference logs, deterministic conversion; measures agreement rather than independent gold accuracy | SemIf preparation described in README |
| SemIf WANLI | Public WANLI source and frozen subset identifiers | prepare.py wanli |
| JevBench and JEVfire | Pinned bundled fixtures and labels | prepare.py external |
| Korean study | Public Belebele, PAWS-X and KorMedMCQA; pinned upstream preparation | prepare.py additional |
| Tool/skill catalog search | Public pinned upstream query/catalog/label files | prepare.py additional |
| Frozen Turkish RAG | Public XQuAD preparation and committed candidate IDs | prepare.py external |
| NPC | Bundled cases and prepared inputs | Binary battery adapter |
| Injection and code security | Original inputs and labels in public committed artifacts | prepare.py security_rerank |
| Phishing | Public PhishNChips release and upstream deterministic preparation | prepare.py security_rerank |
| Passage reranking | Public corpus loaders, committed candidates and qrels; documented text export | prepare.py security_rerank |
| CodeComplex and BigCloneBench | Public original test labels and code | prepare.py coding |
| CIFAR-10 and Oxford Pets | Public image datasets with labels | prepare.py vision |
| MME, POPE and TallyQA | Public annotations and separately downloaded image corpora | prepare.py visual_qa |
| MMLU, MMLU-Pro, CodeMMLU, CyberMetric, SecQA and MetaTool awareness | Public labelled releases; full conversion validated (three CodeMMLU exclusions documented) | prepare.py mmlu / prepare.py knowledge |
| ContractNLI, UNFAIR-ToS and CaseHOLD | Released original test data and labels; full imports validated locally | prepare.py domains |
| LegalBench-RAG | Published archive obtained; all evidence spans validated | prepare.py domains, domain ranking adapter |
| ToolRet | Released query/tool files and labels; all category references validated | prepare.py domains, domain ranking adapter |
| CyberSec retrieval | Released queries/corpus/qrels; all six subsets prepared locally | prepare.py domains, domain ranking adapter |

Split children reuse their parent's dataset and adapter with disjoint filters.
Dependencies such as Pillow, datasets or pyarrow are preparation dependencies,
not missing evaluation harnesses. Context limits and vision support still depend
on the served model; use the appropriate evaluation endpoint, not the 2K demo.
Source-data quirks and adaptations remain documented in the individual suite guides.
