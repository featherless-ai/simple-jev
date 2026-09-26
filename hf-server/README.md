# Simple-JEV

Standalone classifier HTTP API using Hugging Face Transformers and PyTorch.
Classifier validation, prompt text, and response scoring come from the sibling
`common/` folder. Keep both folders in the checkout.
The HF package includes `common` when installed/built from this repo.

## Install and run

Use Python 3.12 or newer. Install the appropriate PyTorch build for your CPU,
CUDA or ROCm environment first, then install this package in that environment:

```bash
cd /path/to/simple-jev
python -m venv .venv
source .venv/bin/activate
# Install your hardware-specific PyTorch build here.
pip install -e './hf-server[test]'
simple-jev --model /path/to/downloaded/model --device auto \
  --dtype bfloat16 --max-model-len 32768 \
  --max-batch-size 32 --max-batch-tokens 32768 --port 8000
```

Or run the file directly from the checkout:

```bash
python hf-server/hf_server.py --model /path/to/model --device cpu --dtype float32
```

After installation, `python -m hf_server` accepts the same arguments.
Choose a context limit supported by the model. CPU testing can use
`--device cpu --dtype float32`. Model IDs from Hugging Face are also accepted;
a local model directory avoids downloading weights again.

## API

See the [complete HTTP API reference](API_REFERENCE.md) for all request fields,
options, response formats, errors, limits, metrics and server arguments.

`POST /v1/classifier` and its alias `POST /v1/systemone` return non-streaming JSON.
`GET /health` reports readiness; `GET /v1/models` lists the served model and its configured Choice limit. `/docs` provides the generated API schema.
Use `--served-model-name` to set the public name (default: `--model`). Request model strings are not checked by default, so SDK defaults such as `jev-latest` work without selecting a different checkpoint. Add `--enforce-model-id` to require the served name. Responses always identify the served model.

```json
{
  "model": "/path/to/downloaded/model",
  "messages": [{"role": "user", "content": "Mia owns a red bicycle. Her dog is named Max."}],
  "questions": {
    "color": {
      "type": "choice",
      "instructions": "What color is Mia's bicycle?",
      "criteria": {"red": null, "blue": null}
    },
    "dog": {"type": "noul", "instructions": "Is the dog named Max?"},
    "support": {
      "type": "score",
      "instructions": "How well does the context support that Mia owns a bicycle?",
      "criteria": ["Unsupported", "Supported"]
    }
  }
}
```

Supply exactly one of `messages` or `state`. State accepts text or JSON.
Chat uses the model tokenizer's chat template. Choice supports up to 255 options by default; `--max-choice-options` sets a cap from 2 to 255. Score still supports up to 50 levels.
Choice questions with at most 50 options retain their exact existing format. Larger questions use exclusively two-letter uppercase labels, validated as distinct single tokens, without mixing in single-letter labels. The Transformers loader checks capacity before loading weights and validates actual prompt boundaries on each request. Unsupported tokenizers can use `--max-choice-options 50`; options are never truncated. The server defaults to 100 scoring branches per request;
`--max-request-branches` configures the limit. The shared v1 template uses exactly one branch per question. Legacy choice/score
modes and score-format switches are no longer accepted.
Invalid input returns readable 422 errors; a full queue returns 429.

Responses contain `model`, `answers`, and `usage`. Answers include confidence.
`usage.input_tokens` counts unique token prefixes once, not the entire shared
context once per question. `usage.output_tokens` is zero: this implementation
reads logits without sampling any output tokens. Set
`ENABLE_OPEN_JEV_ADVANCED_METRICS=1` to include detailed timing and metadata.
Standard completion settings such as `max_tokens` and `temperature` are ignored.

## Configure request limits

Set these at server startup; they are independent:

| Flag | Default | Controls |
|---|---|---|
| `--max-request-branches` | `100` | Maximum questions per HTTP request (one branch per question). Set `256` for the schema maximum; larger values do not permit more than 256 questions. |
| `--max-model-len` | `16384` | Maximum tokens in each complete rendered branch: state/history, system and question instructions, options, template overhead, and repetitions. Not characters or output length. |
| `--max-choice-options` | `255` | Maximum options in each Choice question; valid settings 2–255. Score stays at 50 levels; Noul is unchanged. |

```bash
simple-jev --model Qwen/Qwen3.8-27B --device auto --dtype bfloat16 \
  --max-request-branches 256 --max-model-len 32768 --max-choice-options 255
```

This Qwen configuration automatically selects `shared_examples_binary` when no prompt
format is specified. Three 255-choice questions consume three branches, not 765.
The limits do not guarantee that all maxima fit simultaneously: long options and
policy repetition increase input length. Violations return 422; candidates/context
are never silently truncated. Setting a larger token cap does not extend the
checkpoint's native context support or guarantee sufficient memory. The checked
255-choice prompts fit at 32K; other content may require more.

`--max-batch-size` and `--max-batch-tokens` control execution batches, not the
question-count limit. A single suffix must also fit the batch-token budget;
when using longer inputs, check that budget as well. Request `max_tokens` is not
an input-length setting and is ignored for this non-generating classifier.
See [the API limits reference](API_REFERENCE.md#limits-batching-and-cancellation).

## Prompt format selection (Transformers only)

Omitting `--classifier-prompt-policy` auto-selects a development recommendation
for known language-backbone architecture/size profiles. Matching uses the loaded
configuration (including attention/expert dimensions and vocabulary), not model
names or aliases. Unknown profiles fall back to `baseline` with a prominent
warning to run `eval/prompt_search.py` first. Laya retains its native format.

Explicit selection always overrides auto-selection. In particular, explicit
`baseline` preserves the former default prompts, scoring, and text-chat support:

```bash
simple-jev --model Qwen/Qwen3.8-27B --device auto \
  --classifier-prompt-policy shared_examples_binary
```

| Model | Sharing-constrained policy | Native development correct /477 |
|---|---|---:|
| Qwen/Qwen3.8-27B | `shared_examples_binary` |445|
| Qwen/Qwen3.6-35B-A3B | `shared_repeat_state` |432|
| Qwen/Qwen3.5-4B | `shared_examples_binary` |374|
| google/gemma-4-26B-A4B-it | `shared_examples_binary` |437|
| google/gemma-4-12B-it | `shared_repeat_state` |427|

`shared_examples_binary` and `shared_repeat_state` keep system instructions and
native thinking flags uniform across mixed-type question branches. Type-specific
instructions follow shared state/chat. State repetition stays in the shared
prefix; chat turns are not duplicated. Both support text and [image chat](VISION.md) `messages`.
The experimental explicit-only `universal_shared` moves universal rules and the
complete labelled question catalogue before state/chat; only the selected ID and
answer prefix follow it, with no fixed thinking prefill. It remains an experimental
replay/tuning option, not an automatic recommendation. These development selections
reuse the quick477 cases; they are not fresh held-out benchmark scores.

Legacy formats remain explicit options for reproduction, but are excluded from
default tuning because mixed-type system instructions can defeat context sharing:

- `examples_binary`: strict decision rules, worked examples, raw text/pretty
  JSON state once, and binary no/yes Noul scoring.
- `repeat_state`: the same format with an explicitly marked second state copy.
- `strict_mix_repeat2`: strict rules, the entire user block twice, and the
  evaluated nine-bin Noul wording/scoring. No extra worked-example block.

The three legacy policies above accept **text/JSON `state` only**, not `messages`;
use `baseline` or a shared format to preserve chat turns. Supported vision models
also accept [image chat inputs](VISION.md), sharing image processing and prefill
when the compiled context is shared. Tools remain unsupported.
Except for baseline/universal_shared, Choice branches prefill three fixed `[thinking]` lines through the model's native
chat template; Score/Noul branches answer directly. This does not generate
reasoning or output tokens. A template that drops the fixed prefill is rejected.
Binary Noul returns `{"type":"noul","noul":P(yes)}` in [0,1], with no nine-bin
0.01–0.99 remapping or nested rating diagnostics. Choice/Score math is unchanged.

These formats were selected in development-set prompt experiments, not held-out
evaluation. They are recommendations, not guaranteed optima for new revisions,
fine-tunes, or precision settings. Unregistered sizes are not guessed from nearby
models. Advanced metadata records the resolved policy and selection mode/profile.

For a new model, use the [quick prompt search](../eval/README.md#prompt-format-search):

```bash
python eval/prompt_search.py --model YOUR_MODEL --device cuda \
  --max-model-len 32768 --output eval/results/my-prompt-search
```

Run this from the repository root in the server environment after preparing the
quick datasets. By default it evaluates baseline and the two sharing-compatible
named formats with native scoring. `--all-formats` opts into all seven formats,
including legacy and experimental candidates; `--policies` selects an explicit
subset. Apply the winner explicitly. Repeated-input policies need enough context (32K
fits the checked 255-option case), and larger requests use more memory.

Named policies pass text blocks to the model's native template while
leaving baseline rendering unchanged. Prompt selection does not establish
numerical equivalence across execution environments or a throughput guarantee.
Repetition consumes additional context; the complete rendered branch remains
subject to `--max-model-len`. Advanced metadata identifies
`hf-<policy>-v1` instead of the baseline `v1` template.

Named prompt formats change prompt/scoring adapters, not model precision or
execution controls. Image-specific loading and cache handling are described in
[VISION.md](VISION.md). No worker,
stream, FP8, kernel, or other performance optimizations are included. Laya keeps
its native formatting and rejects non-baseline prompt policies at startup.
Implementation: `hf_prompt_policies.py`, packaged alongside `hf_server.py`.

## Shared-prefix execution

The following batching description applies to text-only requests. Image requests
use native expanded media tokens, image attention masks/positions, and independent
unpadded suffixes while sharing image preprocessing and prefill once; see
[VISION.md](VISION.md).

The compiler calls `common.prepare_prompt(request, version="v1")`, assembles the
returned strings with state/chat roles, and applies the model chat template.
See [the v1 specification](../common/PROMPT_STRUCTURE_V1.md). Compile each
question, find their exact common token prefix, and run that prefix once with
`use_cache=True`. For each suffix batch, copy the prefix cache and repeat its
rows with the Transformers cache API, then score the question suffixes in
parallel. The seed cache remains unchanged. Results return in request order.

Suffixes are grouped by length, bounded by both batch size and padded suffix
token budget. Each suffix selects its own final logit position. Requests execute
serially against the model; parallelism is within each request. Prefix reuse is
within a request, with no persistent cross-request cache. The prefix itself is
one forward and is not chunked by `--max-batch-tokens`.

## Scope and validation

The Transformers backend accepts text and **image chat**. Supported Qwen-VL/
Qwen3.5, Gemma3/4 and LLaVA-family checkpoints use native processors and cache
continuations. Images may be inline PNG/JPEG/WebP data URLs or bounded public
HTTP(S) URLs. Audio, video and tools are rejected. See [supported architectures,
transport security, limits and numerical behavior](VISION.md).

Models need compatible copyable Transformers caches, a native chat template,
and single-token rating/choice labels. Text suffix batching additionally needs
`reorder_cache`. Arbitrary model compatibility is not guaranteed.

The shared v1 prompt and scoring rules are the source of truth for the explicit
`baseline` format; alternative policy differences are described above.
It does not claim exact numeric equivalence with another inference engine.
Tests compare reused-cache logits against independent full-prompt forwards for
tiny Qwen, Gemma and LLaVA models, and exercise native processors, image-call
counts, cache isolation, public-URL validation, API validation,
confidence, usage accounting and endpoint aliases. They use random local models,
without downloading weights; they do not measure answer quality.

```bash
python -m pytest -c hf-server/pyproject.toml common/tests hf-server/tests -q
```

## Laya backend

Install the optional SDK and select the backend explicitly:

```bash
pip install -e './hf-server[laya,test]'
USE_TF=0 python hf-server/hf_server.py \
  --backend laya --model convaiinnovations/laya --device cpu
# Add --subfolder multilingual or --subfolder typed-decisions for those checkpoints.
```

`--backend transformers` remains the default; existing Qwen and other causal HF
model commands are unchanged. Laya loads once per process and uses its own
encoder/option-marker format, not the common v1 assistant-prefill template.
`--revision` selects the downloaded checkpoint revision. `--device auto` lets the
SDK select CUDA, MPS, or CPU; `--dtype` and the HF suffix batching controls apply
only to Transformers. Laya uses its SDK precision policy and batches the admitted
questions together; `--max-request-branches` bounds that batch.

The endpoint and `ClassifierRequest` stay the same. Send the repository ID as
`model`, including when a subfolder is selected at startup. Text `messages` are
serialized as a list of role/content objects. Images, tools, message extras, and
raw-logit diagnostics are rejected. Context overflow is rejected before inference;
the effective limit is the smaller of `--max-model-len` and the checkpoint's native
`max_len`. Laya's native formatter still budgets/truncates question and option text
according to its own `head_max_len` rules.

Choice/score probabilities retain the SDK's temperature scaling, confidence is
the largest returned probability, and Noul is its native binary positive-class
probability (not the v1 nine-bin mapping). SDK action fields are omitted. Token
usage sums the actual per-question sequences, so repeated context is counted;
output tokens are zero. Advanced metadata identifies the format as `laya-native`.
The shared admission queue and a model lock bound concurrent work; cancellation
cannot interrupt an already running PyTorch forward.

Validation on macOS (2026-09-20): 50 common/server tests passed, including tiny
Qwen/Gemma backend regression tests and Laya adapter validation. Real weights for
`convaiinnovations/laya` and `Qwen/Qwen3.5-0.8B` both returned HTTP 200 through the
ASGI classifier route on CPU for a combined choice/score/Noul request, and rejected
an incorrect model ID with HTTP 422. Laya used 93 input tokens; Qwen used 751.
This validates integration, not accuracy: the small Qwen answered the example's
Noul question incorrectly. Direct MPS loading of Qwen crashed natively on this
Mac, so this run does not establish MPS compatibility. Laya's multilingual subfolder loading is covered by adapter tests, not real-weight
inference in this validation run. Typed Decisions extension validation is below.


### Experimental 2× Laya RoPE interpolation

For the ModernBERT Typed Decisions checkpoint:

```bash
USE_TF=0 python hf-server/hf_server.py \
  --backend laya --model convaiinnovations/laya \
  --subfolder typed-decisions --device cpu \
  --rope-factor 2 --max-model-len 2048
```

This halves full-attention and sliding-attention rotary inverse frequencies,
so position p has the original rotary angle at p/2. It doubles the checkpoint's
native sequence budget (1,024 → 2,048 here); the admission limit still respects
`--max-model-len`. It does not enlarge the sliding attention window. The flag
only supports unscaled ModernBERT RoPE and rejects other backends/architectures.
The default factor is 1, preserving existing model behavior. This is experimental:
long-input execution is not evidence of accuracy or calibration, and interpolation
also changes behavior on shorter inputs. No weights or downloaded configs are
modified; changes apply to the loaded process only.

Extension validation: all 52 tests passed. Real Typed Decisions weights with 2×
interpolation returned HTTP 200 for a 1,417-token sequence and chose the requested
refund category. An oversized sequence returned HTTP 422 at the 2,048-token limit.
This is an execution smoke test, not a long-context accuracy benchmark.


### General RoPE extension

`--rope-factor 2` enables experimental linear position interpolation for either
backend. The default is 1 (no change). Finite factors greater than 1, including
fractional factors (for example `--rope-factor 1.5`), are accepted. Rotary scaling
uses the exact factor; resulting token capacities are rounded down to integers. `--laya-rope-factor` remains a CLI alias.

```bash
python hf-server/hf_server.py \
  --model Qwen/Qwen3.5-0.8B --device cpu --dtype float32 \
  --rope-factor 2 --max-model-len 2048
```

For Transformers, the server configures the text model's native linear RoPE
implementation before loading weights, retaining theta, partial-rotation, and
multimodal-axis settings. The text positional capacity is multiplied by the
factor. Existing non-default scaling schemes and missing RoPE configuration are
rejected. Vision encoder settings are not changed. Laya retains the ModernBERT
implementation described above and doubles its checkpoint sequence budget at 2×.
`--max-model-len` remains the independent input admission limit: RoPE scaling does
not multiply this setting. These options are experimental, not a promise that
all Hugging Face architectures support extended context or retain model quality.
