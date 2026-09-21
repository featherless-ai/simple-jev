# Evaluation results — project

Model: typesafe/jev-1.13

| Project | Configuration | Score | Metric | Questions | Failed | Project coverage |
| --- | --- | --- | --- | --- | --- | --- |
| Jev Sec Bench | code | 0.793525 | auroc_successful_only | 400 | 0 | complete |
| Jev Sec Bench | injection | 0.992753 | auroc_successful_only | 662 | 0 | complete |
| Jev Sec Bench | injection-no-context | 0.985043 | auroc_successful_only | 662 | 0 | complete |

Scores are recomputed from examples. Different metrics/configurations are not averaged.
Complete means all declared suites are represented; failures and missing predictions remain in the metrics.

# Evaluation results — category

Model: typesafe/jev-1.13

| Category | Project | Configuration | Score | Metric | Questions | Failed | Project coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| text → english → security → classification-decision | Jev Sec Bench | code | 0.793525 | auroc_successful_only | 400 | 0 | complete |
| text → multilingual → security → classification-decision | Jev Sec Bench | injection | 0.992753 | auroc_successful_only | 662 | 0 | complete |
| text → multilingual → security → classification-decision | Jev Sec Bench | injection-no-context | 0.985043 | auroc_successful_only | 662 | 0 | complete |

Scores are recomputed from examples. Different metrics/configurations are not averaged.
Complete means all declared suites are represented; failures and missing predictions remain in the metrics.

## Provenance

Actual returned models: typesafe/jev-1.13-20260917. Recorded response cost: $0.045512.

See [results.json](results.json) for settings, source hashes, raw artifact locations, and cost scope. Raw predictions and scoring inputs remain in the ignored run archive.
