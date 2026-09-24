# Previous Jev 1.13 run versus the separated eval modes

Reference: [`eval/benchmarks/jev-1.13/2026-09-20/`](../benchmarks/jev-1.13/2026-09-20/README.md).
Those compact reports were **already present byte-for-byte** in the main-based
eval worktree; nothing was copied from the older `simple-jev-eval` checkout.
All **50 report files** in the original and main-based archive were checked
for identical relative paths and SHA256 hashes.
The old run's 65 distinct artifacts sum to **86,747 requests** across 23
project reports, with no unresolved failures. These are historical TypeSafe Jev endpoint results, **not** new
measurements. Its saved per-project reports and suite manifests contain hashes,
counts and metrics; the raw per-request predictions are not shipped in Git.

| New mode | Matching historical Jev coverage | What remains absent |
| --- | --- | --- |
| `knowledge` | **13 English items / 47,965 questions**; 88.5869% equal-item accuracy. Two further non-English Korean knowledge partitions of 100 items each: ko-en 81%, ko-ko 80%. Total **48,165 knowledge rows**. | No missing reference item in this preset. The two Korean scores are **not** folded into the English 13-item mean. |
| `decision` | **26 English items / 21,364 requests**; 87.1472% equal-item accuracy. CodeMMLU's historical mixed parent partitions into exactly 8,374 decision and 11,501 knowledge records. | No missing historical decision item. Existing requests and labels, not a fresh run. |
| `multi-decision`: Unfair ToS | **1,607 requests × 8 questions = 12,856 question slots** already evaluated on Jev. The new multi manifest uses the *same* dataset SHA256 and byte-identical `binary-battery-v1` adapter. Historical Jev F1 **35.5277%**, question accuracy **95.2007%**, exact-provision accuracy **69.6329%**. | No new Jev run required to use the historical report as a same-request-shape reference. Full raw response replay is not possible from the committed compact reports alone. |
| `multi-decision`: ContractNLI | The same **2,091 published test hypotheses** were evaluated before, accuracy **77.8575%**, dataset SHA256 identical to the source of the grouped version. | **No directly matched multi-request reference.** Jev saw 2,091 separate one-question requests. The new suite sends **123 contracts × 17 questions in one request**; a new 123-request Jev run is needed to measure this protocol. Do not relabel the old score as grouped accuracy. |

**Multi-decision overlap:** 1,607 / 1,730 contexts (12,856 / 14,947
question slots) already have a same-request-shape historical Jev result. The
remaining 123 contexts / 2,091 questions overlap in *content only*, not HTTP
request shape. The two new multi manifests duplicate underlying source cases
from the existing flattened evaluation; they must not be pooled as independent
data. `eval/run.py` rejects selecting a multi manifest alongside its original.

**Other baseline gaps and reuse candidates:** The opt-in public-source
When2Call (3,652 cases) and BANKING77 (3,080 cases) were not in the old Jev
run; benchmarking those against Jev would need **6,732 fresh requests** under
the new adaptations. The immediate multi-decision gap is **123 new Jev
requests**; closing that gap *and* benchmarking both opt-in public-source tasks
would total **6,855 fresh requests**. **These requests were subsequently submitted and audited; see the dated addendum below.** An older JevFire report covers 13 cases / 85 fields, but
five cases have only one field, so the whole suite is not in the strict
`multi-decision` preset; its **8 multi-question cases** would need raw
responses or a fresh run to obtain their own subset reference score. The old run also excluded ToolRet Web,
BigCloneBench and all vision, so it cannot supply reference scores for those.

## New Jev runs (2026-09-24)

Using the credential from `keys/OPENROUTER_API_KEY` without storing its value in logs or manifests, three independent HTTP runs were launched in parallel against `typesafe/jev-1.13`. Their raw predictions, retry history, source hashes and audit outputs are retained **locally and Git-ignored** at `eval/results/jev-additions-v1/` (launcher: `eval/experiments/jev_additions/launch.py`). All three passed `eval/audit.py`; the single HTTP 429 on BANKING77 was retried explicitly with `eval/retry.py --retry-429`, preserving the original error in `prior_results` and the append-only retry journal. These are actual model results, not synthetic smoke responses:

| New Jev suite | Requests | Scored units | Task-specific score | Failed rows after repair |
| --- | ---: | ---: | ---: | ---: |
| Grouped ContractNLI, 17 questions/request | 123 | 2,091 | question accuracy **0.7780966044954567** | 0 |
| When2Call | 3,652 | 3,652 | accuracy **0.8069550930996714** | 0 |
| BANKING77 | 3,080 | 3,080 | macro-F1 **0.7927911520554413** | 0 |

The historical ContractNLI **0.7785748445719751** is a *different single-question-per-request protocol* and must not replace the newly measured grouped score. Historical grouped Unfair ToS F1 **0.3552769070010449** remains the matching fourth-suite reference; it was **not** resubmitted. To check these metrics and the archived Unfair ToS source/adapter hashes together, run `python3 eval/experiments/jev_additions/compare_new.py` from the worktree; it rejects failed/incomplete records and writes a local comparison under `eval/results/jev-additions-v1/`.

Five separate, pinned GPU jobs were also submitted concurrently for the supported HF-server models (Qwen 4B, 27B, 35B-A3B; Gemma 12B, 26B-A4B). Each job evaluates the same four nonoverlapping request suites, including the historically covered Unfair ToS protocol, with an isolated output and no pooled/duplicate decision score. The pinned model revisions, frozen server/evaluation code hashes, dataset hashes, durable cloud job IDs and status are in `/root/open-jev-experiments/jev-additions-v1/plan.json` and `jobs/`. All five GPU jobs **succeeded**, each independently passed `eval/audit.py` with **4 suites, 8,462 requests, 21,679 scored slots and 0 failed rows**. `compare_new.py --require-models` also verified exact dataset/adapter hashes against the Jev reference and refused incomplete or failed runs. The completed model comparisons follow; these are **new HF-server evaluations**, not archived Jev runs.

| Model | Grouped ContractNLI question accuracy | Grouped Unfair ToS F1 | When2Call accuracy | BANKING77 macro-F1 |
| --- | ---: | ---: | ---: | ---: |
| Jev 1.13 (3 new, 1 archived) | 0.778096604 | 0.355276907 | 0.806955093 | 0.792791152 |
| Qwen 3.5 4B | 0.727881396 | 0.483957219 | 0.546823658 | 0.700044398 |
| Qwen 3.8 27B | 0.809182209 | 0.436183395 | 0.730284775 | 0.779503235 |
| Qwen 3.6 35B-A3B | 0.770923003 | 0.576388889 | 0.807502738 | 0.761154109 |
| Gemma 4 12B | 0.833572453 | 0.617169374 | 0.748904710 | 0.781833431 |
| Gemma 4 26B-A4B | 0.840746055 | 0.530864198 | 0.686746988 | 0.776298696 |
| Qwen 3.5 0.8B (native) | 0.472022956 | 0.010638298 | 0.166757941 | 0.115219828 |
| Qwen 3.5 2B (native) | 0.532281205 | 0.010695187 | 0.335706462 | 0.397485009 |
| Qwen 3.5 9B (native) | 0.722620756 | 0.460508701 | 0.575848850 | 0.682585162 |
| DiffusionGemma 26B-A4B (native) | 0.814921090 | 0.425041186 | 0.753285871 | 0.733692043 |

The final four entries were subsequently launched in parallel with their selected native policies (`verification_after`, `examples_binary`, `verification_both`, `typed_v3`, respectively). All four cloud jobs **succeeded** and each passed the same **4-suite / 8,462-request / 21,679-slot** audit with zero failed rows. Their runtime manifests, pinned image/model revisions, policy source hashes, job IDs and raw evidence are retained under `/root/open-jev-experiments/jev-additions-native-v1/`; see the [run instructions](../experiments/jev_additions/README.md). The union of both plans exactly matches all **nine model IDs and pinned revisions** in `simple-jev-prompt-lab/experiments/full_eval/models.json`. Across nine independent model runs this is **76,158 requests / 195,111 scored slots**, not additional unique dataset coverage. Native vLLM/diffusion policies and runtime limits differ from the HF-server runs: interpret results as model-plus-serving-configuration outcomes, not architecture-only comparisons.

**Do not average across these differently scored tasks or count grouped cases again alongside their flattened sources.** Differences here are descriptive benchmark observations, not significance claims. The SHA256 of the final nine-model locally audited, Git-ignored `eval/results/jev-additions-v1/comparison.json` is `22fb3548046d1070cd6544db6970dee9d0e91703ed3a8fbf56499b4ec8fd7a5b`. The raw per-request responses, cloud job logs and audit JSONs remain outside Git; rerun `compare_new.py --require-models --require-native` to verify the full table. The earlier five-model-only report had SHA256 `7896dd20c79bc55eda04140a1eca7193b0c00889902824a6b3521567b9a62232`.

Verify the stored historical summaries, artifact source hashes, unchanged adapters and
new request counts locally (no credentials or inference):

```sh
python3 eval/reference_coverage.py --data-root eval/data \
  --original-root /workspace/open-jev/simple-jev-eval/eval/benchmarks/jev-1.13/2026-09-20 \
  --write-combined-report eval/results/jev-1.13-reference-report.json
python3 eval/compare.py --mode knowledge \
  --report Jev=eval/results/jev-1.13-reference-report.json
python3 eval/compare.py --mode decision \
  --report Jev=eval/results/jev-1.13-reference-report.json
python3 -m unittest discover -s eval -p 'test_*.py' -q
```

`--data-root` is optional if those prepared files have not yet been generated;
with it the audit checks prepared ContractNLI/Unfair ToS SHA256 against the
archived Jev manifests, validates grouped 123×17 / 1607×8 shapes, and verifies
every one of the 2,091 grouped ContractNLI IDs, states, options and gold labels
against the original flat source. `--original-root` is optional outside this
workspace; it checks that the entire older checkout's compact report archive
matches the copy already included in this branch. `--write-combined-report`
merges the 23 compact project reports into an ignored local comparison input,
committing each file's SHA256; it does **not** invent or replay raw predictions.
The tool recomputes the 13-item knowledge, 26-item decision and 54-item text
comparison scores from this merged reference and checks the stored totals.
The verified JSON output is saved at
`/tmp/jev-reference-coverage-verified.json` in this workspace. See
[dataset and protocol validation](PRESET_VALIDATION.md). Do not confuse
this historical reference with the separately constructed Decision Index suite
or JevBench's published-vs-endpoint-rerun distinction.
