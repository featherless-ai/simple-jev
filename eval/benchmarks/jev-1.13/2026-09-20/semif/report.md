# Evaluation results — project

Model: typesafe/jev-1.13

| Project | Configuration | Score | Metric | Questions | Failed | Project coverage |
| --- | --- | --- | --- | --- | --- | --- |
| SemIf | authored | 0.971335 | mean_family_balanced_accuracy | 144 | 0 | complete |
| SemIf | perturbations | 1.000000 | mean_family_balanced_accuracy | 108 | 0 | complete |
| SemIf | typesafe | 0.891474 | equal_case_modal_agreement | 102 | 0 | complete |
| SemIf | wanli | 0.771005 | mean_family_balanced_accuracy | 256 | 0 | complete |

Scores are recomputed from examples. Different metrics/configurations are not averaged.
Complete means all declared suites are represented; failures and missing predictions remain in the metrics.

# Evaluation results — category

Model: typesafe/jev-1.13

| Category | Project | Configuration | Score | Metric | Questions | Failed | Project coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| text → english → general-language → classification-decision | SemIf | authored | 0.971335 | mean_family_balanced_accuracy | 144 | 0 | complete |
| text → english → general-language → classification-decision | SemIf | perturbations | 1.000000 | mean_family_balanced_accuracy | 108 | 0 | complete |
| text → english → general-language → classification-decision | SemIf | typesafe | 0.891474 | equal_case_modal_agreement | 102 | 0 | complete |
| text → english → general-language → classification-decision | SemIf | wanli | 0.771005 | mean_family_balanced_accuracy | 256 | 0 | complete |

Scores are recomputed from examples. Different metrics/configurations are not averaged.
Complete means all declared suites are represented; failures and missing predictions remain in the metrics.

## Provenance

Actual returned models: typesafe/jev-1.13-20260917. Recorded response cost: $0.025152.

See [results.json](results.json) for settings, source hashes, raw artifact locations, and cost scope. Raw predictions and scoring inputs remain in the ignored run archive.
