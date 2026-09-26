# Image chat inputs

The Transformers backend accepts images in chat `messages` for these native
cache adapters:

- **Qwen2-VL, Qwen2.5-VL, Qwen3-VL dense/MoE, Qwen3.5 dense/MoE**.
- **Gemma3, Gemma4, Gemma4 Unified**.
- **LLaVA and LLaVA-NeXT**.

Checkpoints need a native Hugging Face image processor and chat template. The
loader selects `AutoProcessor` and the native image-text model registry.
Text-only models reject image requests with HTTP 422. No image input is inferred
from JSON `state`.

Use `baseline`, `shared_examples_binary`, `shared_repeat_state`, or
`universal_shared` with chat. The legacy state-only policies remain state-only.
Existing automatic policy recommendations were selected on text tasks; they are
not newly established vision-quality recommendations. `shared_*` Choice prompts
require a template that preserves `reasoning_content`; non-thinking Qwen2.5-VL
and Qwen3-VL Instruct templates reject that format explicitly. Use `baseline`
for those checkpoints (or explicitly experiment with `universal_shared`).

## Request

Each user message may mix `text` and `image_url` blocks. Multiple images and
multiple conversation turns retain their original order. When a native template
requires strict user/assistant alternation (e.g. Gemma3), adjacent user content
is coalesced without dropping image/text blocks so the appended classifier
question can be rendered. Other templates retain the separate turns.
For example, after starting a supported model on port 8000:

```python
import base64
import json
from pathlib import Path
from urllib.request import Request, urlopen

image = base64.b64encode(Path("photo.png").read_bytes()).decode("ascii")
payload = {
    "model": "Qwen/Qwen3.5-0.8B",
    "messages": [{"role": "user", "content": [
        {"type": "text", "text": "Inspect this picture."},
        {"type": "image_url", "image_url": {
            "url": "data:image/png;base64," + image
        }},
    ]}],
    "questions": {
        "animal": {"type": "choice", "instructions": "Which animal is shown?",
                   "criteria": {"cat": None, "dog": None, "other": None}},
        "outside": {"type": "noul", "instructions": "Is the scene outdoors?"},
    },
}
request = Request("http://127.0.0.1:8000/v1/classifier",
                  data=json.dumps(payload).encode(),
                  headers={"Content-Type": "application/json"})
with urlopen(request) as response:
    print(json.load(response))
```

`/v1/systemone` accepts the identical payload. Responses use the existing
Choice/Score/Noul schema; the server scores logits, not generated descriptions.
A public image URL can replace the data URL without changing the request shape:

```json
{"type":"image_url","image_url":{"url":"https://example.com/photo.jpg"}}
```

Images are inputs only; the server does not generate images.

## Image resize configuration

Resize oversized images **to fit** a bounding box, preserving aspect ratio,
without cropping or upscaling smaller images. These are resize settings, not
rejection thresholds. Three levels are supported:

```bash
simple-jev --model YOUR_MODEL \
  --max-image-width 1920 --max-image-height 1080 \
  --default-image-max-width 1024 --default-image-max-height 768
```

- `--max-image-width` / `--max-image-height`: server hard caps on the decoded
  image passed to the native processor. A request cannot increase these caps.
- `--default-image-max-width` / `--default-image-max-height`: default request
  bounds. Defaults must not exceed corresponding hard caps.
- Per-request `media_io_kwargs.image.max_width` / `max_height`: override each
  default independently, clamped to the corresponding server hard cap:

```json
"media_io_kwargs": {"image": {"max_width": 1600, "max_height": 900}}
```

Here the request uses a 1600×900 box rather than the default 1024×768. Requesting
4096×2160 instead uses the hard 1920×1080 box. A 4000×3000 image in that box becomes
1440×1080. Omitted request axes retain their defaults. An unset server default
falls back to its hard cap; an unset hard cap imposes no bound on that axis.
All four startup options default to unset, preserving previous behavior.
Dimensions must be positive integers; null/zero are not ways to bypass a cap.

This applies identically to base64 and URL images, after EXIF orientation/RGB
conversion and before native processing, once per image occurrence per request.
Original byte/pixel/animation safety checks still apply **before** resizing.
It does not reduce upload size or avoid initial image decoding. The native
processor may subsequently resize, upscale, crop or pad to its required grid;
these are **processor-input caps**, not guarantees of final tensor dimensions,
image-token counts, GPU memory or speed. Smaller images can lose OCR/fine detail.
Laya remains text-only and rejects these options.

## Sharing and correctness

- Decode images once per request. Request-local native-processor memoization
  reuses image preprocessing across question prompts and label-boundary checks.
- Reuse follows the **actual expanded token prefix and media metadata**, not
  the policy name. When all image spans are in the common prefix, run image
  feature extraction and prefix prefill once, then give each question an
  independent copy of the model cache (including hybrid recurrent state).
- Preserve Qwen's native multidimensional RoPE positions and Gemma's
  bidirectional image attention. A cache seed must contain complete image spans.
  Fully bidirectional text configurations never use causal prefix reuse.
- Mixed templates are partitioned by compatible compiled image context. For
  contexts A, B, A, the A questions still share one prefill; only B is independent.
  Different image tensors cannot share merely because placeholder IDs match.
  Do not reuse visual-context KV solely because image URLs match.
- Image question suffixes currently run one at a time, without padding.
  Text-only requests retain the existing batched shared-prefix implementation.
  `--max-batch-tokens` still bounds shared question suffix length.
- The complete **expanded** prompt, including image tokens, must fit
  `--max-model-len`; no truncation is performed. Public input usage is the token
  prefix union, including expanded image tokens. Output accounting is unchanged.
  Advanced metrics distinguish `multimodal_shared_prefix`,
  `multimodal_grouped_prefix`, and `multimodal_independent`, and report
  `vision_forwards` and computed tokens. Grouped requests report `context_groups`
  and `group_prefix_tokens`; their global `prefix_tokens` is zero.
- Media/cache reuse is request-local, never a cross-request image cache.

## Current limits

- PNG, JPEG, and WebP, via inline base64 data URLs or public HTTP(S) URLs.
  Camera EXIF orientation is honored. Local filesystem paths are never opened.
- Remote URLs use standard ports (HTTP 80 / HTTPS 443), no URL userinfo, ambient
  authentication, cookies or proxies. Every DNS address must be public; the validated IP is pinned
  to the socket while preserving the original Host/TLS hostname. Each redirect
  is checked again. Loopback, private, link-local, reserved and multicast
  addresses are rejected, including private IPv4 transition encodings.
- Downloads have a 10-second wall-time limit each and a 20-second request media
  budget, at most three redirects, and bounded streaming even without a content
  length. DNS concurrency is bounded. HTTP compression is not accepted. Network
  failures return HTTP422; there is no insecure TLS or private-network fallback.
- Up to 16 images; 10 MiB encoded-image bytes each, 20 MiB total; 20 million
  decoded pixels each, 40 million total. Animated images are rejected.
- `image_url.detail` may be omitted or `"auto"`. Unsupported block fields,
  audio/video, tools, nonempty `mm_processor_kwargs`, and `media_io_kwargs`
  other than the image resize keys above return 422 rather than being silently ignored. Other modalities
  require a validated processor/cache adapter; model capability alone does not
  imply they are implemented by this server yet.
- Images are accepted only in user messages. Other roles can contain text
  strings or text blocks, subject to the model's native chat-template rules.
- Laya remains text-only. Other vision architectures are not enabled yet.

## Numerical behavior

Sharing changes forward shapes. It does **not** promise bit-identical scores to
independent complete-prompt inference. In the pretrained validation, BF16
restricted-probability differences reached about **0.20 absolute**. FP32 reduced
dense-model differences greatly, but MoE expert-routing boundaries amplified
small arithmetic changes; one FP32 Score top bin changed. An isolated route
control demonstrated this mechanism without installing any route/logit overrides
in the server. The original strict numerical gates failed and remain recorded
as failures. See the [original full-forward results](../experiments/vision_validation/RESULTS.md).

Cache-fork correctness was separately tested against fresh **native HF cached
continuations**, recomputing the image prefix for each question with the same
forward partition. Across six pretrained checkpoints and 198 native-reference
comparisons, selected-logit/probability differences were **zero**. Those native
continuation gates passed; this does not relabel the failed unchunked-forward
comparisons. See [the current validation report](../experiments/vision_validation/CONTINUATION_RESULTS.md).

`universal_shared` remains experimental: one synthetic FP32 color case was wrong
in both cached and independent inference. Neither these checks nor text-selected
prompt defaults certify vision quality or calibrated probabilities.

## Validation scope

Offline tests use real, randomly initialized tiny Transformers vision models
for all eleven architecture types listed above. Tests compare selected logits
against independent native full forwards and fresh native cache continuations,
count image-stage calls, exercise nontrivial
image grids, multiple images, unequal suffix lengths, separate templates,
request isolation, and cancellation. These establish execution correctness in
the tested CPU configuration, **not pretrained image accuracy or GPU throughput**.

Offline tests exercise native Gemma3/LLaVA processors, including processors that
do not emit `mm_token_type_ids`. HTTP transport tests use real local HTTP framing
with test-only dial substitution; production never permits private-network URLs.

Optional tests use cached native Qwen/Gemma processors (no weights/downloads) to
check chat-compatible policies (or explicit template-capability rejection), one preprocessing call per request,
expanded-token limits, label boundaries, and both HTTP routes. Integration tests
also connect those native processors to tiny real models and the HTTP service:

```bash
cd hf-server
python -m pytest tests/test_vision.py tests/test_vision_groups.py tests/test_inline_processors.py tests/test_media.py
HF_VISION_TEST_CACHE=/path/to/huggingface/hub HF_HUB_OFFLINE=1 \
  python -m pytest tests/test_vision_processors.py tests/test_vision_integration.py
```

The full regression suite passed on the GPU host: **320 tests, zero failures,
errors or skips**. The local CPU workspace has a known Torch `cpuinfo` failure
for one FP16 conversion test; that test passed on the GPU host, including its CPU
path. Reproduction from `hf-server/` in the local CPU workspace:

```bash
HF_VISION_TEST_CACHE=/path/to/huggingface/hub HF_HUB_OFFLINE=1 \
  python -m pytest -c pyproject.toml --asyncio-mode=auto --rootdir=.. tests ../common/tests -q \
  --deselect='common/tests/test_pipeline.py::test_tensor_logits_match_label_maps[float16]'
```

Current pretrained validation covers **six pinned Qwen/Gemma checkpoints** on
one MI325X per job: **54 image HTTP requests**, each with one preprocessing and
image-feature-stage call for shared context. All 54 synthetic color choices and
native-continuation gates passed. Six mixed-context controls also verified two
image-stage calls for A,A,B, not three. Real public HTTPS downloads, separate
contexts, both aliases, three image encodings, multi-image chat, usage, isolation
and HTTP422 checks are included. The prior 92-request full-forward investigation
remains separately recorded, including its failures. This is not a broad
vision-quality, throughput, or NVIDIA validation claim. See the
[current report and evidence](../experiments/vision_validation/CONTINUATION_RESULTS.md).
