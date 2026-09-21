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
| SemIf WANLI | Public WANLI source and frozen subset identifiers | prepare_wanli.py |
| JevBench and JEVfire | Pinned bundled fixtures and labels | prepare_external.py |
| Korean study | Public Belebele, PAWS-X and KorMedMCQA; pinned upstream preparation | prepare_additional.py |
| Tool/skill catalog search | Public pinned upstream query/catalog/label files | prepare_additional.py |
| Frozen Turkish RAG | Public XQuAD preparation and committed candidate IDs | prepare_external.py |
| NPC | Bundled cases and prepared inputs | Binary battery adapter |
| Injection and code security | Original inputs and labels in public committed artifacts | prepare_security_rerank.py |
| Phishing | Public PhishNChips release and upstream deterministic preparation | prepare_security_rerank.py |
| Passage reranking | Public corpus loaders, committed candidates and qrels; documented text export | prepare_security_rerank.py |
| CodeComplex and BigCloneBench | Public original test labels and code | prepare_coding.py |
| CIFAR-10 and Oxford Pets | Public image datasets with labels | prepare_vision.py |
| MME, POPE and TallyQA | Public annotations and separately downloaded image corpora | prepare_visual_qa.py |
| MMLU, MMLU-Pro, CodeMMLU, CyberMetric, SecQA and MetaTool awareness | Public labelled releases; full conversion validated (three CodeMMLU exclusions documented) | prepare_mmlu.py / prepare_knowledge.py |
| ContractNLI, UNFAIR-ToS and CaseHOLD | Released original test data and labels; full imports validated locally | prepare_domains.py |
| LegalBench-RAG | Published archive obtained; all evidence spans validated | prepare_domains.py, domain ranking adapter |
| ToolRet | Released query/tool files and labels; all category references validated | prepare_domains.py, domain ranking adapter |
| CyberSec retrieval | Released queries/corpus/qrels; all six subsets prepared locally | prepare_domains.py, domain ranking adapter |

Split children reuse their parent's dataset and adapter with disjoint filters.
Dependencies such as Pillow, datasets or pyarrow are preparation dependencies,
not missing evaluation harnesses. Context limits and vision support still depend
on the served model; use the appropriate evaluation endpoint, not the 2K demo.
Source-data quirks and adaptations remain documented in the individual suite guides.
