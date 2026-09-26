# Pretrained image validation

Current results: [expanded support and native cache-fork validation](CONTINUATION_RESULTS.md).
Historical full-forward/precision diagnostics: [RESULTS.md](RESULTS.md).

Tests the production HF server, not an alternate inference implementation.
`prepare.py` generates deterministic inline PNG/JPEG/WebP images; labels remain
outside the chat context. `run.py` loads a pinned local model snapshot on a GPU,
starts a real loopback HTTP server, and records public responses and selected
logits. No pretrained weights are changed and no text is generated.

```sh
mkdir -p /path/to/new-validation
python experiments/vision_validation/prepare.py \
  --output /path/to/new-validation/fixtures.json
python experiments/vision_validation/run.py \
  --model /path/to/pinned/model/snapshot \
  --fixtures /path/to/new-validation/fixtures.json \
  --dtype bfloat16 --output /path/to/new-validation/model-result
```

The runner refuses CPU fallback and existing output directories. It verifies:

- Three simultaneous Choice/Noul/Score questions, multiple images/turns, swapped
  image contents, baseline and all three shared/chat prompt formats.
- Image preprocessing and image-feature-stage calls counted by actual hooks,
  not inferred from response metrics: one call each for shared requests.
- Selected logits compared to **independent native full forwards**, which derive
  their own positions/masks and receive no cached prefix. All values retained.
- Non-shared rendered contexts execute separately; three image-stage calls.
- Expanded-token usage, alias repeat, request isolation, text after images,
  finite scores, and HTTP422 for unsupported/malformed/overlong inputs.
- Separate semantic color-smoke and numerical gates. A model's wrong answer is
  not automatically a cache error; neither is a failed numerical gate silently
  counted as passing.

The original BF16 fixtures froze a maximum restricted-probability difference of
0.03, identical top labels, and correct simple color choices. The subsequent
FP32 diagnostic reuses the eight multi-image cases and sets a **stricter 0.0001
probability gate** to investigate reduced-precision drift. These are explicitly
different protocols; do not relabel original failures or treat the subset as a
full image-quality benchmark.

## Native continuation oracle

`--reference native_chunks` uses `native_chunks.py` to recompute the image prefix
fresh for every question, then continue via HF's native generation preparation.
It shares no serving cache or position helper. This isolates cache-fork
correctness while keeping forward shapes fixed. The executed prospective gates
were logit delta≤1e-5, probability delta≤1e-6, identical top labels and correct
color smoke answers. Non-chunked full-forward diagnostics are still recorded
separately and do not become passing by choosing this oracle.

The six-model protocol uses baseline-only fixtures because non-thinking VL
checkpoints cannot serialize the shared policies' fixed reasoning prefill. Its
frozen fixtures also include public HTTPS images; downloaded bytes/hashes are
retained for offline audit. The final frozen plan also enables mixed-context
controls: A,A,B must make two image-stage calls while matching three independent
native references. No checkpoint weights are downloaded by the runner.

```sh
python experiments/vision_validation/run.py \
  --model /path/to/pinned/model/snapshot --dtype bfloat16 \
  --reference native_chunks \
  --fixtures /root/open-jev-experiments/hf-vision-validation-v1/source-i/validation_assets/fixtures.json \
  --output /path/to/new-native-continuation-result
```

## Independent audit

`audit.py` independently recompiles frozen native prompts, verifies token hashes
and scoring labels, reconstructs HTTP answers/usage from raw logits, recomputes
softmax differences, checks actual call counters, and verifies source hashes and
terminal cloud job records. `--allow-failed-gates` permits *auditing* a completed
failed run; the output still marks failed numerical/semantic gates as failed.
It cannot bypass missing results, response/scorer inconsistencies, or incomplete
job state.

`routes.py` and `audit_routes.py` provide an isolated counterfactual for the MoE
residuals: retain full-forward expert IDs/order while recomputing gates during
cached execution. The frozen selection and prospective gates are recorded in
the validation assets. This diagnostic never changes production inference.

Raw job records, frozen sources, fixtures, logs and responses for this workstream
are preserved under `/root/open-jev-experiments/hf-vision-validation-v1/` in the
development workspace. They are not required for ordinary server operation.
See both reports linked above for measured results and their distinct scopes.
