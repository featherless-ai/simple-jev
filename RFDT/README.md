# Really Fancy Decision Training (RFDT)

Fine-tune a language model for a specific classification task using the same v1 prompts and answer-token scores as the HF server. Supply context or chat history, questions, and optional answers. Missing answers can be labeled by a larger model through an OpenAI-compatible chat API.

RFDT trains the existing language-model weights or a LoRA adapter; it does not add a classifier head. The scripts are an initial training workflow, not a GPU provisioning service. Run them on your own machine or an already-provisioned GPU host.

## Files

| File | Purpose |
| --- | --- |
| `prepare.py` | Validate records, label missing targets, cache successful labels, and split whole contexts/source groups. |
| `train.py` | Train with selected-label cross-entropy, or evaluate with `--eval-only`. Supports `torchrun` multi-GPU execution. |
| `export.py` | Merge a LoRA adapter into a standalone model for the HF server. |
| `data.py` | Dataset validation, target conversion, and context identity. |
| `examples/` | Small labeled and partially/unlabeled JSONL examples. These demonstrate formats, not a useful training corpus. |
| `tests/` | Offline target, split, teacher protocol, gradient, training, and save/reload checks. |

## Install

Run commands from the repository root in an activated Python 3.12+ environment. Install the PyTorch build appropriate for your hardware, then:

```bash
python -m pip install -e './hf-server[test]'
python -m pip install -r RFDT/requirements.txt
```

The second command installs PEFT for optional LoRA training/export. RFDT reuses `PromptCompiler` from the single-file HF server, including native chat rendering and answer-token stability checks. Keep `RFDT/`, `common/`, and `hf-server/` together in the checkout.

## Dataset format

Use one JSON object per line. Each record contains the existing classifier `request`, optional `targets`, and an optional `group_id` identifying its conversation or source document. `template_version` defaults to `v1`. The request's `model` is required by the existing schema, but `--model` selects the actual training model.

```json
{
  "id": "ticket-1",
  "group_id": "conversation-1",
  "template_version": "v1",
  "request": {
    "model": "student",
    "state": "I was charged twice. Please refund the duplicate payment.",
    "questions": {
      "route": {
        "type": "choice",
        "instructions": "Which team should handle this?",
        "criteria": {
          "billing": "Payments and refunds",
          "technical": "Product errors"
        }
      }
    }
  },
  "targets": {
    "route": {"answer": "billing"}
  }
}
```

Supply exactly one of `state` or text `messages`, as in the inference API. A target is either `{"answer": ...}` or `{"probabilities": {...}}`; do not supply both.

| Question | Hard/scalar answer | Probability keys |
| --- | --- | --- |
| `choice` | Public candidate ID, such as `"billing"` | Every candidate ID, in any input order. |
| `score` | Zero-based rubric index, including fractional values | Every rubric index as a string: `"0"`, `"1"`, etc. |
| `noul` | Boolean, or a number in `[0.01, 0.99]` | All nine rating bins: `"1"` through `"9"`. |

Probability distributions must be finite, nonnegative, and sum to one. A fractional score interpolates between neighboring rubric levels: `1.25` becomes 75% on level 1 and 25% on level 2. Noul scalars invert the v1 mapping `value = 0.01 + (bin - 1) * 0.98 / 8`, then interpolate neighboring bins. Boolean false/true maps to the first/last bin. This interpolation is a chosen supervision rule, not recovery of a teacher's original distribution.

Targets can be partially supplied. Missing question IDs are sent to the teacher; user targets always win. Unknown target IDs, unsupported template versions, and malformed labels fail validation.

## Prepare labeled data

```bash
python RFDT/prepare.py \
  --input RFDT/examples/labeled.jsonl \
  --output RFDT/runs/example-data
```

This writes `train.jsonl`, `validation.jsonl`, and `teacher_cache.jsonl`. The default validation fraction is 0.2 with seed 42. Whole connected groups are split together: records sharing an identical context **or** a `group_id` cannot cross the split. There must be at least two independent groups. Assign the same `group_id` to different excerpts from one conversation/document; exact-context matching alone cannot identify related excerpts.

Splitting happens before questions are expanded into individual training rows. The full original question briefing stays in each row, matching inference. No prompts are silently truncated.

## Ask a larger teacher for missing targets

Set the exact endpoint and model ID provided by your teacher service. For a GLM teacher, use the ID returned by that service's model list; no GLM model name or capability is assumed by these scripts.

```bash
export RFDT_TEACHER_API_KEY='your-api-key'

python RFDT/prepare.py \
  --input RFDT/examples/unlabeled.jsonl \
  --output RFDT/runs/teacher-data \
  --teacher-base-url https://YOUR_PROVIDER/v1 \
  --teacher-model YOUR_TEACHER_MODEL_ID
```

The script calls `/chat/completions` with `temperature=0` and requests a JSON target distribution for each missing question. It needs text JSON responses; it does not require native structured-output support or logprobs. Teacher-generated probability estimates are recorded as `teacher_authored_probabilities`, **not** represented as measured token distributions. You can supply actual teacher distributions yourself through the same `probabilities` format when available. Teacher and student align by public answer meanings, not vocabulary IDs.

Successful records are cached with the input record and teacher configuration in the cache key. Rerunning the same command reuses those records, including after an interruption. Invalid or incomplete responses stop preparation rather than entering the dataset. HTTP 429 and common transient server errors receive up to three attempts; other failures stop with an error. `--teacher-interval` defaults to one second between successful calls. `--timeout` and `--teacher-max-tokens` control the request limits. Provider-specific thinking/JSON options are not implemented in this first version.

The cache and prepared files contain your context and teacher answers. Changing a remote model behind an unchanged model ID requires a fresh output directory to force relabeling. API keys are read from the environment and are not written to the cache.

## Train a student

A short local CPU run, useful for checking the workflow:

```bash
python RFDT/train.py \
  --model Qwen/Qwen3.5-0.8B \
  --train RFDT/runs/example-data/train.jsonl \
  --validation RFDT/runs/example-data/validation.jsonl \
  --output RFDT/runs/student-smoke \
  --cpu --dtype float32 --max-steps 2 --gradient-accumulation 1
```

This downloads weights if not cached and still requires memory for training. The example dataset is intentionally too small to establish model quality.

For four already-available NVIDIA GPUs with BF16 support:

```bash
torchrun --standalone --nproc_per_node=4 RFDT/train.py \
  --model Qwen/Qwen3.5-0.8B \
  --train RFDT/runs/teacher-data/train.jsonl \
  --validation RFDT/runs/teacher-data/validation.jsonl \
  --output RFDT/runs/student-lora \
  --lora --lora-rank 16 --dtype bfloat16 \
  --batch-size 2 --gradient-accumulation 8 \
  --gradient-checkpointing --epochs 3 --learning-rate 0.0001
```

This uses distributed data parallel training: every GPU holds a student replica, and gradients are synchronized. The nominal effective batch is `2 × 8 × 4 = 64` questions per optimizer step. Use substantially more examples than this demonstration dataset. Omit `--lora` for full-weight training; the default learning rate is `0.00002`. `--resume PATH_TO_CHECKPOINT` resumes Trainer state. Epoch checkpoints retain the two most recent checkpoints.

The initial implementation does not provision GPUs, shard model parameters, quantize training weights, or reuse prefix KV caches during training. Each replica must fit on its GPU. Full prompt forwards preserve gradients through the context. Vocabulary logits are currently materialized at all positions; `--batch-size 1` and gradient checkpointing help with memory. Models must support differentiable text forwards as well as the inference tokenizer contract. Multi-GPU and model-family compatibility should be checked on the intended hardware.

## What the loss trains

For each question, RFDT selects the logits at the last real prompt token, gathers the allowed answer-token IDs, and normalizes only over those labels:

```python
log_probs = selected_logits.float().log_softmax(dim=-1)
loss = -(target_probabilities * log_probs).sum()
```

The batch loss averages over questions. Hard targets give ordinary classification cross-entropy. Soft targets minimize teacher-to-student KL divergence up to the constant target entropy. There is no full-vocabulary language modeling loss and no loss on JSON scaffolding, padding, or other prompt positions. The selected-position loss still backpropagates through the context. `common/response_scoring.py` is used for inference responses only because it detaches tensors.

## Evaluate and export

Measure the original student before training using the same held-out file:

```bash
python RFDT/train.py \
  --model Qwen/Qwen3.5-0.8B \
  --validation RFDT/runs/example-data/validation.jsonl \
  --output RFDT/runs/baseline-eval --eval-only --cpu
```

Evaluate a trained LoRA adapter against its base model:

```bash
python RFDT/train.py \
  --model Qwen/Qwen3.5-0.8B --adapter RFDT/runs/student-lora \
  --validation RFDT/runs/teacher-data/validation.jsonl \
  --output RFDT/runs/adapter-eval --eval-only --dtype bfloat16
```

Every training run also evaluates its final model and writes `eval_results.json`. Metrics are soft cross-entropy (`eval_loss`), target-mode agreement, mean target-to-student KL, and mean distribution L1 distance. Mode agreement against soft teacher targets is not ground-truth accuracy. Score/Noul scalar MAE and calibration metrics are not yet included. Keep an independently labeled test set for final task-quality claims.

Full-weight output is already loadable by the HF server. Merge a LoRA adapter first (this export loads the base model in CPU memory):

```bash
python RFDT/export.py \
  --model Qwen/Qwen3.5-0.8B \
  --adapter RFDT/runs/student-lora \
  --output RFDT/runs/student-merged

python hf-server/hf_server.py \
  --model RFDT/runs/student-merged --device auto --dtype bfloat16 \
  --classifier-prompt-policy baseline
```

RFDT uses the shared baseline formatter. Pin `--classifier-prompt-policy baseline`
when serving these exports so architecture-based startup recommendations do not
replace the training prompt format. Retune deliberately before choosing another format.

Use the exact training base model and revision when merging. `--revision` is available on training and export. Send the exported model path as the inference request's `model`. For evaluation of full-weight output, pass that output directory to `train.py --model ... --eval-only`.

## Tests

```bash
python -m pytest RFDT/tests -q
```

The tests use tiny random local models and mock teacher responses. They check loss masking, gradient flow through context, overfitting a tiny batch, save/reload consistency, target validation, and group isolation. They do not establish student accuracy, teacher quality, GPU performance, or multi-GPU correctness on a particular host.

Local validation also exercised two-process CPU distributed training, LoRA with gradient checkpointing, adapter merging, and loading the merged model through the existing HF scoring backend. These checks used tiny randomly initialized Qwen3 weights; NVIDIA multi-GPU execution and live teacher labeling have not been tested here.
