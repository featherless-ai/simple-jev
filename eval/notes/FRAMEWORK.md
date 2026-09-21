# Framework and SemIf reference

Run evaluation suites against any implementation accepting the Jev-shaped
`model`, `state`, `questions` request. Adapters interpret native Choice, Noul,
and Score answers as required by each suite.
Python 3.10+, standard library only. No Transformers, GPU runtime, or weights are
required on the evaluator machine. The model runs on the endpoint's machine.

## SemIf baseline suites

| Suite | Rows | Purpose | Preparation |
|---|---:|---|---|
| `semif-authored` | 144 | Authored semantic decisions | Included |
| `semif-perturbations` | 108 | Option order, rephrasing, distracting context | Included |
| `semif-wanli` | 256 | Entailment, neutral, contradiction | `python eval/prepare.py wanli` |
| `semif-typesafe` | 102 | Selected published TypeSafe judgments | See below |

## Included baseline

- `data/authored144.jsonl`: SemIf's complete project-authored 144-row fixture.
- `vendor/semif/build_typesafe.py`: original verified-snapshot builder for its
  102-row TypeSafe subset, plus the original selection manifest and MIT license.
- No TypeSafe documents or model weights are bundled.

Source: https://github.com/TheoLeeCJ/SemIf
Pinned revision: `ca3ba65f142967030ecb453346e94d6f476a69df`.
Vendored files are unmodified. The authored dataset is synthetic and model-reviewed,
not human-adjudicated. TypeSafe's 102 rows span 20 selected cases, not its full
711-case benchmark. This is a first baseline, not SemIf's entire 706-row suite.

## Qwen 2B and 4B runs (on the GPU node)

Start your preferred backend separately. It must expose the classifier contract;
an ordinary chat-completions endpoint is not sufficient. Pass the exact served
model ID, which may differ from the Hugging Face ID. These example IDs assume
Qwen3.5 2B and 4B are served under their upstream names. Change them if you meant
another Qwen generation or use endpoint aliases.

```sh
python eval/run.py --endpoint http://127.0.0.1:8000/v1/classifier \
  --suite eval/suites/english/semif-authored.json \
  --model Qwen/Qwen3.5-2B --output eval/results/qwen35-2b-authored

# After loading the 4B model, or use a second endpoint:
python eval/run.py --endpoint http://127.0.0.1:8000/v1/classifier \
  --suite eval/suites/english/semif-authored.json \
  --model Qwen/Qwen3.5-4B --output eval/results/qwen35-4b-authored
```

For a System One compatible service, use its complete `/v1/systemone` URL.
For authentication, export the key in your shell and pass `--key-env JEV_API_KEY`.
Keys are never written to run files. Use HTTPS for remote authenticated services.

The runner sends only state, question, and option descriptions. Gold labels,
reference distributions and provenance are never sent. All SemIf rows use `choice`,
including binary rows, preserving SemIf's candidate-probability experiment.
The SemIf adapter does **not** evaluate native Noul or Score primitives or
force SemIf's internal prompts. Backend prompting remains implementation-specific.
One row per call makes this a quality baseline, not a shared-prefix throughput test.

## Optional TypeSafe subset

Obtain the four official public case files locally and name them:

- `eval/sources/typesafe-security_incidents-cases.js`
- `eval/sources/typesafe-agent_trace_observability-cases.js`
- `eval/sources/typesafe-invoice_processing-cases.js`
- `eval/sources/typesafe-customer_service-cases.js`

Source URLs follow `https://evals.typesafe.ai/<workflow>-cases.js`.
These are third-party records; their redistribution terms are not supplied here.
The upstream builder rejects changed snapshots using the pinned manifest hashes.
Do not remove that check to silently evaluate a different subset.

```sh
python eval/vendor/semif/build_typesafe.py \
  --source-dir eval/sources \
  --selection eval/vendor/semif/source-selection.jsonl \
  --output eval/data/typesafe102.jsonl

python eval/run.py --endpoint http://127.0.0.1:8000/v1/classifier \
  --suite eval/suites/english/semif-typesafe.json \
  --model Qwen/Qwen3.5-4B \
  --output eval/results/qwen35-4b-typesafe
```

Repeat with the 2B served model ID. The builder also retains TypeSafe's published
model distributions; these are historical references, not fresh endpoint runs.

## Output and interpretation

Each run has a directory per suite, containing `manifest.json`,
`predictions.jsonl`, and `summary.json`. A root `summary.json` collects suite
reports separately; it never averages unrelated benchmarks into one score. Existing output directories are rejected. Predictions are flushed
after each row; interrupted runs retain partial evidence, but have no final summary.
The manifest records dataset and runner SHA-256, endpoint, model ID, and settings.
Record backend revision, precision, hardware, and prompt version alongside a run
when comparing implementations; those are not inferable from an arbitrary endpoint.

Metrics:

- Accuracy over all requested rows.
- Mean family balanced accuracy: mean per-class recall within each family,
  then equal-weight mean across families (the authored baseline headline).
- Equal-case modal agreement: mean row accuracy within each `group_id`, then mean
  across cases (the TypeSafe subset headline).
- Equal-case total variation to reference distributions, only for successful
  rows with a reference. Its denominator is reported separately.

Missing/invalid responses count as wrong for agreement/accuracy. All labels must
be present, values finite and in [0,1], with sum within 2% of one; accepted values
are renormalized. Argmax ties select the first option in fixture order. A run with
any failed rows exits nonzero. Do not compare incomplete distribution metrics
against complete baseline results.

Requests are serial with a default 300 ms gap and 120 s timeout. HTTP 429/502/503/504
receive up to three retries with exponential delay and numeric Retry-After support
(up to 120 s). Network/validation failures are recorded without automatic retries.
Elapsed time includes retries and is client wall time, not GPU inference time.

No model evaluations have been run for this addition. Unit checks, when desired:

```sh
python -m unittest discover -s eval -p 'test_*.py'
```

## Adding and combining evaluations

`run.py` owns HTTP execution, retries and artifacts. `suites.py` loads versioned
suite manifests. `adapters/choice.py` owns choice-row validation, request mapping,
response interpretation and metrics. No SemIf-specific branching exists in the
transport runner. `vendor/semif/` is source preparation, not the runner.

Run multiple prepared suites against one model:

```sh
python eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model Qwen/Qwen3.5-4B \
  --suite eval/suites/english/semif-authored.json \
  --suite eval/suites/english/semif-typesafe.json \
  --output eval/results/qwen35-4b-multiple
```

All selected datasets are validated before any HTTP calls. The optional TypeSafe
suite must be built first. Repeat the command with another model and a new output
directory to compare models on exactly the same suite versions and dataset hashes.

For a new choice benchmark:

1. Add a JSONL file with the row format below (or a preparation script).
2. Add a JSON manifest under the appropriate language directory in `suites/`, selecting `choice-v1`.
3. Specify its source/revision and meaningful headline metric. Increment the suite
   version when changing selection, label mapping or scoring interpretation.
4. Pass its manifest via `--suite`; no runner edits are needed.

Minimal JSONL row (one object per line):

```json
{"id":"routing-001","group_id":"scenario-001","family":"routing","state":"Please refund my duplicate charge.","question":"Which queue?","options":[{"id":"billing","description":"Billing support"},{"id":"technical","description":"Technical support"}],"label":0}
```

`label` is a zero-based option index. `target_distribution` is optional and follows
option order. Group related paraphrases under the same `group_id`; `family` defines
balanced-accuracy aggregation. Labels and provenance remain local.

Suite manifest (dataset path is relative to this manifest):

```json
{
  "schema_version": 1,
  "id": "support-routing",
  "version": "1",
  "adapter": "choice-v1",
  "dataset": "../../data/support-routing.jsonl",
  "language_group": "english",
  "languages": ["en"],
  "headline_metric": "mean_family_balanced_accuracy",
  "source": {"description": "Our held-out support routing cases"}
}
```

For a different task format or metrics, add a trusted local adapter and register
it in `suites.py`'s `ADAPTERS`. Its interface is:

- `validate(rows)`: reject invalid input before endpoint calls.
- `request_for(row, model)`: build the endpoint request without gold labels.
- `parse_response(row, response)`: return validated prediction fields.
- `summarize(rows, records)`: return metrics, including `failed_rows`.

Rows must have a unique string `id`; other fields belong to the adapter. Responses
and errors are retained in records. Native Noul, ordinal scores, chat histories,
or composed workflow evals can use their own adapters. Implemented adapters now include `choice-v1`, `typed-v1` (native Choice/Noul/Score),
`fields-v1` (batched fields), `rag-v1` (batched Noul reranking), and
`domain-ranking-v1` (legal, tool and security retrieval). See EXTERNAL_SUITES.md for scope.

## Additional suites: perturbations and WANLI

The perturbation fixture and builder are vendored unchanged from the same pinned
SemIf revision. Its 108 rows come from 36 authored originals, so it is a related
robustness slice, **not an independent test population**. Current metrics measure
correctness on perturbed inputs; they do not measure paired prediction-flip rates
against a prior authored run. Do not pool its score with authored144.

WANLI provides external natural-language-inference examples. The subset uses
SemIf's exact frozen IDs, option order, label mapping and state/question conversion.
The dataset authors' source is https://huggingface.co/datasets/alisawuffles/WANLI
(CC-BY-4.0). Labels map entailment → supported, neutral → insufficient, and
contradiction → contradicted. Attribution and source revision remain in each row.
This is a 256-row subset, not the complete WANLI test set.

Prepare on the evaluation machine (downloads data only, not weights):

```sh
python eval/prepare.py wanli
```

Both newly downloaded and existing cached source files must match the pinned
SHA-256. Changed snapshots fail; no automatic substitution. Existing generated
outputs are never overwritten. The generated dataset and source cache are ignored
by Git. The suite loader will report a missing file until preparation is complete.

Run all three prepared quality suites against your endpoint:

```sh
python eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model Qwen/Qwen3.5-2B \
  --suite eval/suites/english/semif-authored.json \
  --suite eval/suites/english/semif-perturbations.json \
  --suite eval/suites/english/semif-wanli.json \
  --output eval/results/qwen35-2b-quality
```

Repeat with `Qwen/Qwen3.5-4B` and a distinct output directory. Use the exact IDs
served by your backend. No new evaluation results are included in this change.
