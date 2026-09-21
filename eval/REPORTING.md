# Two views of the same evaluation results

Every run now writes:

- `by-category.md`: modality → language → our category → task type, with project
  and configuration scores inside each group.
- `by-project.md`: the full score for each named project/configuration represented
  in the run, recomputed from the examples across its category partitions.
- `report.json`: both views and complete adapter metrics.

The static indexes are [our categories](EVAL_CATALOG.md) and
[named projects](PROJECT_CATALOG.md). Generate them together with
`python3 eval/catalog.py --write-doc`.

## Rebuild or combine result reports

```sh
python3 eval/report.py --run eval/results/knowledge --view project
python3 eval/report.py --run eval/results/knowledge --view category
python3 eval/report.py --run eval/results/batch-a --run eval/results/batch-b --json
```

These commands read saved results only: no network or inference.
Runs must use the same model, endpoint and compatible adapter revision.
Changed scoring inputs and overlapping examples are rejected.

Prefer a full-parent manifest such as `mmlu-full.json` for a complete project
run. The runner derives category routing from its child definitions. Disjoint
child runs can also be combined. Parent/child overlap is rejected before requests
when selected together, and rejected by the reporter across separate runs.

## Full scores, not averages of percentages

A category with 100 questions and one with 1,000 questions are combined from the
1,100 underlying results—not by averaging their two accuracy percentages.
The registered adapter computes its native headline metric across the combined
examples. MME retains its sum of per-task perception scores; it is not converted
to an accuracy percentage. Category rows use the same adapter on their subset.

Projects with different benchmark conditions retain distinct rows: JevBench
original/easy/hard, SecQA v1/v2, SemIf authored/perturbed/agreement/WANLI, POPE
sampling variants and language conditions. We do not invent one number mixing
different metrics or overlapping examples. ToolRet's three disjoint tool
categories and LegalBench-RAG's four query subsets share a project configuration
and can produce a combined full-run metric under our documented protocol.

## Coverage and provenance

`complete` means all leaf suites declared for the project/configuration at run
time are represented. `partial` lists missing suites. A complete run can still
contain failed or missing predictions; these are passed as failures to the
adapter rather than omitted. Category tables show the parent project's coverage.

The runner snapshots project membership, category routing and scoring inputs.
`scoring_rows.jsonl` contains local gold and required adapter inputs, never sent
as-is to the API. Preserve it with `predictions.jsonl` and `manifest.json`.
Its checksum protects subsequent reporting from changed inputs. The dataset and
adapter hashes remain in the manifest.

Older result directories without scoring inputs/routing snapshots are rejected.
Do not reconstruct category scores from summary percentages or claim they are
complete project runs. Use the original source revision and audited data to
migrate such artifacts separately.

These are our endpoint-adaptation scores. A full score does not imply reproduction
of an upstream prompting protocol, all optional tracks, or official leaderboard
eligibility. CodeMMLU explicitly labels its malformed-row exclusions.
