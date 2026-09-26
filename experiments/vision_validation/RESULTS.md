# HF image support — original v1 validation results

**Historical snapshot:** these measurements cover the initial four-model,
inline-image implementation. For the current expanded architecture/HTTP URL
support and successful native cache-fork gates, see
[CONTINUATION_RESULTS.md](CONTINUATION_RESULTS.md). The original failed gates
and measurements below remain unchanged.

## Outcome

Image chat support is implemented and functionally verified on pretrained
Qwen3.5 dense/MoE and Gemma4/Unified models. Shared image context is processed
once, with independent question cache copies. **Strict numerical equivalence to
independent full forwards is not established in reduced precision or MoE models.**
The failed numerical gates below are preserved, not relabeled as successes.

- **216 regression tests passed, zero failures/skips**, on the GPU host.
- **92 pretrained image HTTP requests**, three questions each, across four models
  and two precision protocols. Every shared request made exactly **one image
  preprocessing call and one image-feature-stage call**, measured with hooks.
- **300 independent full-forward selected-logit comparisons**; 299 top scoring
  labels agreed. The one disagreement was a Gemma MoE FP32 Score bin.
- Eight independent-context controls made **three image-stage calls each**,
  rather than incorrectly sharing KV across different rendered contexts.
- Both HTTP aliases, PNG/JPEG/WebP, multi-image/multi-turn chat, image swaps,
  expanded-token usage, changed-image/request isolation, text after images, and
  **40 real HTTP422 rejection checks** verified. The BF16 long-chat fixtures
  reached 5,181 Qwen / 5,570 Gemma expanded branch tokens.
- Wheel built and CLI/imports checked outside the source checkout; `hf_vision`
  and the shared `common` modules are included. No publication/deployment.

These are synthetic execution checks, not a representative vision benchmark,
calibration study, sustained-throughput result, or proof for every checkpoint.

## Pretrained protocols and numeric results

One MI325X per job, models loaded sequentially, Transformers5.16.1. No experiment-only source
patches to serving inference, weight updates, or generated reasoning. Independent
references use native complete-prompt forwards and derive their own positions
and masks; they do not reuse the implementation's position helper or cache.

BF16: 13 fixtures plus alias repeat per model. FP32: the same eight multi-image
fixtures spanning four chat-compatible policies, plus alias repeat. FP32 used
highest matmul precision with Torch TF32 disabled. Different protocol sizes are
kept separate.

| Model | BF16 max absolute probability delta | FP32 max absolute probability delta | BF16 / FP32 color smoke |
|---|---:|---:|---:|
| Qwen3.5-4B | 0.0310171 | 0.000004351 | 14/14; 8/9 |
| Gemma4-12B Unified | 0.0335842 | 0.000122428 | 14/14; 9/9 |
| Gemma4-26B-A4B | 0.0589713 | 0.0347333 | 14/14; 9/9 |
| Qwen3.6-35B-A3B | 0.1998492 | 0.0156010 | 14/14; 9/9 |

A delta of 0.1998492 is about **20 percentage points**, not a tiny rounding
promise. All 180 BF16 top scoring labels agreed in this sample; that does not
guarantee decision stability elsewhere. The sole color error occurred with the
explicit experimental `universal_shared` format on Qwen4B FP32; **both cached
and independent full inference made that error**. No labels/prompts were changed
to conceal it. Do not promote that format based on this test.

The predeclared BF16 gate was delta≤0.03 plus identical top labels and correct
color smoke choices. Every model had at least one failed numeric case. The
separate, stricter FP32 gate was delta≤0.0001: Qwen4B passed the numeric gate but
failed one color case; other models had numeric failures. These jobs therefore
correctly ended with exit1, despite completed functional coverage.

## Controlled MoE diagnosis

A separate diagnostic held the independent full forward's expert **IDs/order**
fixed during cached execution, while recomputing gate weights from the current
activations. It used the worst previous FP32 branch and a low-delta control per
MoE model. This intervention is **not installed in the server**, does not copy
reference logits, and is not an accuracy improvement claim.

| Examined worst case | Natural probability delta | Fixed-route delta | Reduction |
|---|---:|---:|---:|
| Gemma26B, universal blue/red, Score | 0.0347333 | 0.00016494 | >210× |
| Qwen35B, baseline red/blue, Noul | 0.0156010 | 0.0000007293 | >20,000× |

The route table uses the auditor's double-precision softmax replay of saved
FP32 logits. Route captures verified identical full/fixed expert IDs at every layer/token.
First observed changed-route margins were approximately 2.4e-8 (Gemma) and 7.5e-9
(Qwen). All four diagnostic cases passed the **prospective** fixed-route gate
(delta≤0.001, and ≥10× reduction for large natural deltas). This demonstrates
routing amplification in these cases; it does not assert that every residual
has the same cause or make the earlier failed gates pass.

## Evidence and terminal jobs

Raw artifacts, frozen source/fixture manifests, responses, logits, route tensors,
Junit results, and authoritative job snapshots are under:
`/root/open-jev-experiments/hf-vision-validation-v1/`.

| Attempt | Job UUID | Terminal result |
|---|---|---|
| a — BF16 | `d2a22330-a5b3-4e20-9ca3-f9e5e1af3e56` | failed/1: complete functional run, numeric gates failed |
| b — initial FP32 launcher | `41abff69-f89d-4072-a511-bbf64f29243b` | failed/1: pytest async configuration was not selected; no pretrained FP32 run |
| c — corrected FP32 launcher | `ca51d0dc-2e4f-4808-b94a-a5fe691f8702` | failed/1: 216 tests passed; complete inference, numeric/one quality gate failed |
| d — route control | `2000e02e-9a5d-44f1-9614-b09f65fa0373` | succeeded/0: all diagnostic gates passed |

Independent audits: `audit-a-final.json`, `audit-c.json`, `audit-d.json` (the earlier
`audit-a.json` is also preserved). Auditors
recompile prompts, verify token hashes/mappings, reconstruct HTTP answers and
usage, recompute softmax/gates, and verify source hashes and terminal states.
Route auditing also checks saved full/fixed expert tensors and call boundaries.
A failed gate remains false in the audit output. Compact derived evidence and
source hashes are in [RESULTS.json](RESULTS.json).

Pinned checkpoint revisions:

- Qwen3.5-4B: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- Gemma4-12B: `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`
- Gemma4-26B-A4B: `4d7ae4984b7db7de8f8457170b3f1a419ee76d52`
- Qwen3.6-35B-A3B: `995ad96eacd98c81ed38be0c5b274b04031597b0`

No active jobs remain from this validation. Other workstreams were untouched.
See [image API support and limits](../../hf-server/VISION.md) before deployment.
