# Eval notes

Start with the [quickstart](../README.md). Commands assume the repository root.

| Topic | Reference |
| --- | --- |
| Request contract, SemIf, adding suites | [Framework](FRAMEWORK.md) |
| Reporting by category and named project | [Reporting](REPORTING.md) |
| Category partition rules | [Splits](SPLIT_SUITES.md) |
| Dataset availability and exclusions | [Availability](AVAILABILITY_AUDIT.md) |
| MMLU and other knowledge benchmarks | [Knowledge](KNOWLEDGE_SUITES.md) |
| Separated knowledge/decision presets and shared-context requests | [Multi-decision](MULTI_DECISION.md) · [Validation](PRESET_VALIDATION.md) · [Jev reference coverage](JEV_REFERENCE_COVERAGE.md) |
| Additional public-source Decision Index tasks | [Public-source decisions](DECISION_INDEX_PUBLIC.md) |
| Code classification | [Coding](CODING_SUITES.md) |
| Legal, tool, and security retrieval | [Domains](DOMAIN_BENCHMARKS.md) |
| JevBench, JEVfire, and RAG | [External suites](EXTERNAL_SUITES.md) |
| Korean, search, and support | [Additional suites](ADDITIONAL_SUITES.md) |
| NPC, security, phishing, and reranking | [Security and agentic](SECURITY_AND_WORKFLOW_SUITES.md) |
| Image classification | [Vision](VISION_SUITES.md) |
| MME, POPE, and TallyQA | [Visual QA](VISUAL_QA_SUITES.md) |

Generate local category and project tables with
`python3 eval/catalog.py --write-doc`. The generated `EVAL_CATALOG.md` and
`PROJECT_CATALOG.md` are ignored; suite manifests are their source of truth.
