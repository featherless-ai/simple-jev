# Mixed benchmark splits

Category tables show disjoint child suites instead of their aggregate parent.
Prepare the original dataset once using the existing preparation command, then
pass a child manifest to the runner. Its explicit `row_filter` selects upstream
families before validation; questions, labels, IDs and scoring are unchanged.
The full source file hash and filter in the suite manifest retain provenance.

| Parent | Child suffix → placement | Original labels |
| --- | --- | --- |
| vision-mme-perception | presence → Vision / Object presence | existence |
| vision-mme-perception | counting → Vision / Counting | count |
| vision-mme-perception | identification → Vision / Identification | posters, celebrity, scene, landmark, artwork |
| vision-mme-perception | spatial-attributes → Vision / Spatial reasoning & attributes | position, color |
| vision-mme-perception | ocr → Vision / OCR | OCR |
| jevbench-original | policies → Corporate Policies & Documents | policy |
| jevbench-original | agentic → Agentic | routing |
| jevbench-original | general → General language & Others | intent, ordinal, extraction, adequacy |
| jevbench-easy | agentic → Agentic | tool_selection |
| jevbench-easy | general → General language & Others | intent, fact, extraction |
| jevbench-hard | policies → Corporate Policies & Documents | long_policy |
| jevbench-hard | security → Security | adversarial |
| jevbench-hard | agentic → Agentic | routing_hard |
| jevbench-hard | general → General language & Others | multi_hop, judge_hard, temporal_numeric, probability, trap, ambiguous, tradeoff |

All listed text children are Classification / decision. Append the child suffix
to the parent ID, for example `jevbench-original-policies.json`.

MME keeps both questions per image together. Scores retain the original
200-point maximum per upstream category: presence/counting/OCR each max 200,
spatial/attributes max 400, identification max 1,000. Child scores sum to the
original 2,000-point perception score on complete runs. Compare matching subsets;
a child score is not a full-benchmark result.

Original parent manifests remain runnable for full-benchmark comparisons.
Do not run both parents and children when counting unique examples or costs.
Text child metrics describe the selected families, not the whole parent;
do not average child averages to reconstruct a parent score.

## Groups kept together

- SemIf families describe reasoning operations, not consistent domains.
  Candidate selection is a choice decision, not a retrieval ranking task.
- JevBench hard families such as multi-hop and temporal/numeric mix domains.
  They remain in the general catch-all rather than guessing a domain from labels.
- Korean non-English conditions now separate KorMedMCQA knowledge questions from
  Belebele passage comprehension and PAWS-X equivalence. English contains only
  the latter two tasks and has no matched medical-knowledge arm.
- JEVfire retains each multi-field case intact; splitting fields would change
  its exact-case metric and request context.
- Existing passage-retrieval suites are already separated by source dataset.
  Coding retrieval retains its Coding / Ranking placement.

No model calls are needed to prepare or select these subsets.


## Model knowledge versus supplied context

Each non-English Korean condition (`korean-public-ko-en`, `korean-public-ko-ko`)
now has two children under General language & Others:

| Child suffix | Placement | Upstream families |
| --- | --- | --- |
| knowledge | Model knowledge | kormed |
| context | Classification / decision | belebele, pawsx |

Prepare the existing parent dataset once; both children filter it without changing
questions or labels. The parent is omitted from the category tables.

Model knowledge means answering factual/domain questions without a supporting
reference passage. It is separate from ranking supplied candidates. Classification
is not automatically a knowledge test: supplied passages, rules, code or messages
can be the evidence for a decision. Conversely, retrieval may still require learned
domain concepts. This grouping does not claim to isolate training-data memorization.

KorMedMCQA is medical exam QA, not a disease-image classification benchmark.
Its upstream input-completeness review still applies. No model evaluation was run.
