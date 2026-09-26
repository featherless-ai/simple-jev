# Image support — completed extension validation

## Merge into main

The vision work was merged with main's newer baseline Noul integer-label wording
and DOOM/UI fixes preserved. The merged tree passed **319 CPU regression tests**,
with the same single environment-specific FP16 exclusion. Evidence:
`/root/open-jev-experiments/hf-vision-validation-v1/merge-main-cpu-tests.xml`
and `.log`. The GPU results and wheel hashes below describe the frozen pre-merge
`source-i` snapshot, not a new pretrained run of the merged prompt wording.

## Implemented

- Native image chat/cache adapters for **11 architecture types**: Qwen2-VL,
  Qwen2.5-VL, Qwen3-VL dense/MoE, Qwen3.5 dense/MoE, Gemma3, Gemma4/Unified,
  LLaVA and LLaVA-NeXT. Checkpoints need compatible native processors/templates.
- PNG/JPEG/WebP from base64 data URLs or public HTTP(S), with byte/pixel/time
  limits, DNS pinning, public-address validation at every redirect, verified TLS,
  and no ambient authentication/proxies or filesystem access. TCP and TLS share
  one deadline; explicit port 0 is rejected.
- Native continuation handles model-specific masks/positions. Gemma3's strict
  alternation is accommodated without dropping or reordering image/text blocks.
- Shared image preprocessing and visual/context prefill occur **once per shared
  context**, with independent question caches. Mixed contexts A, B, A still share
  A once; B cannot force duplicate A prefills. Media values, image spans and
  compiled tokens determine compatible groups—not URLs or policy names alone.

See [API, supported inputs and limits](../../hf-server/VISION.md).

## Final verified targets — attempt i

**320 regression tests passed, no failures/errors/skips**, on the GPU host.
Local CPU: **319 passed, one deselected** for the pre-existing Torch CPU FP16
`cpuinfo` failure; that test passed on the GPU host. Tests include real tiny
models across all 11 types, native processors, HTTP transport/security, mixed
context groups, cache isolation, and cancellation between groups.

The final frozen source was tested on six pretrained BF16 checkpoints, one
MI325X, sequential models, Transformers 5.16.1:

- **54 image HTTP requests**, three questions each. Fixtures include real public
  HTTPS images, PNG/JPEG/WebP, multi-image/multi-turn context, image swaps, long
  and different-aspect-ratio inputs, and both HTTP aliases.
- Every shared HTTP request had **one actual preprocessing call and one actual
  image-feature-stage call**, measured by hooks—not inferred from metrics.
- **198 native-reference comparisons**: 162 HTTP branches, 18 all-distinct
  context branches, and 18 mixed-context branches. Across all comparisons,
  **maximum selected-logit delta 0; maximum restricted-probability delta 0**.
- Six A,A,B controls made **two actual image-stage calls**, versus three fresh
  native references. Six all-distinct controls made three calls each. No
  per-question image fallback was used for a genuinely shared subgroup.
- All **54 synthetic color choices** were correct; **30 HTTP422 probes** passed.
  Twelve real HTTPS image downloads were retained with hashes for offline replay.
  Text-after-images and repeated requests verified isolation.

The prospective native-continuation gates were selected-logit delta≤1e-5,
probability delta≤1e-6, identical top labels, and correct synthetic color choices.
They passed without expert routing overrides, logit replacement, or weight changes.

### What the numerical comparison establishes

The independent oracle recomputes the image prefix **separately for every
question**, then continues using native HF generation preparation. It derives
its own positions/masks and receives no serving cache or position helper.
Forward partition is held fixed to isolate cache-fork correctness. For the mixed
control, A's prefix is freshly recomputed for both questions and B is independently
fully forwarded. Reference hooks verify three image forwards versus the server's
two. Of the 198 comparisons, 174 exercise shared-context continuations and 24
exercise independent full forwards.

This is **not equivalence to an unchunked full-prompt forward**. Such comparisons
are retained separately for every HTTP case. The original failed BF16/FP32 gates
remain failures; they were not relaxed or relabeled. See the
[original numerical/routing results](RESULTS.md).

## Six-model results

Nine HTTP requests/model (including an alias repeat), plus separate/mixed context
controls, for 33 native-reference comparisons/model. All use `baseline` so
non-thinking VL checkpoints can participate. This does not validate every prompt
policy or establish broad vision accuracy.

| Pinned model | Native max logit/probability delta | Color smoke | Unchunked full-forward max probability delta (diagnostic) |
|---|---:|---:|---:|
| Qwen2.5-VL-3B-Instruct | 0 / 0 | 9/9 | 0.0312322 |
| Qwen3-VL-2B-Instruct | 0 / 0 | 9/9 | 0.00584471 |
| Qwen3.5-4B | 0 / 0 | 9/9 | 0.00457257 |
| Gemma4-12B Unified | 0 / 0 | 9/9 | 0.00105286 |
| Gemma4-26B-A4B | 0 / 0 | 9/9 | 0.0123431 |
| Qwen3.6-35B-A3B | 0 / 0 | 9/9 | 0.0274674 |

Qwen2.5-VL's unchunked JPEG comparison exceeds the old 0.03 diagnostic threshold;
that failure is retained. The original broader policy protocol reached about
0.20, so these baseline-only values do not replace its worst-case findings.
`universal_shared` remains experimental; its original wrong color case remains
wrong in both cached and independent inference.

## Evidence and reproducibility

Raw root: `/root/open-jev-experiments/hf-vision-validation-v1/`.

| Attempt | Job UUID | Terminal result |
|---|---|---|
| e | `e4bc5411-431e-4d33-9abd-bed90a3e6c2e` | failed/1: snapshot omitted existing `eval/prompt_search.py`; 283 tests passed, 1 failed; no pretrained inference |
| f | `34e82590-69bf-41ce-a23c-1c23934d9a71` | succeeded/0: 295 tests and six pretrained models |
| g | `9b6f4f32-3b3f-41ba-9b50-2790d5f011f2` | succeeded/0: 296 tests and port-validation repeat |
| h | `11238583-ea83-40b6-b295-b0819dc8b975` | succeeded/0: 297 tests and TCP/TLS deadline repeat |
| **i** | **`0ed09e84-4e60-451f-8fbc-a66ada5f28a6`** | **succeeded/0: 320 tests, all six models and mixed-context groups** |

The final immutable `source-i` manifest covers 45 files. Frozen fixtures/gates,
raw cached/native/full-forward logits, HTTP responses, downloaded image bytes,
JUnit, logs and terminal snapshots are retained. `audit-i.json` independently
verifies source hashes, prompt/token reconstruction, scoring/usage replay, groups,
call counts, image bytes, numeric gates and successful terminal state. No
failed-gate allowance was used.

Earlier f/g/h audits remain intact: their intermediate snapshots completed 72
HTTP requests and 240 native-reference comparisons with zero deltas. These are
historical intermediate checks, **not additional current-source coverage**.
Original v1's 92 requests and failed full-forward/quality gates remain separately
recorded in `RESULTS.md/.json`.

[CONTINUATION_RESULTS.json](CONTINUATION_RESULTS.json) records pinned revisions,
final module hashes, audits and wheel checks. Current production/test Python and
packaging files match `source-i`. The wheel includes `hf_media`, matches production
module bytes, and passed imports/CLI outside the checkout. Nothing was published
or deployed. All owned validation jobs are terminal; other workstreams were untouched.

Reproduce with `run.py --reference native_chunks`, using the pinned local model
snapshots and `source-i/validation_assets/fixtures.json`. Audit with
`audit.py --root ROOT --attempt i --output NEW_AUDIT.json`. See
[runner instructions](README.md).

These checks do not establish broad image accuracy, calibration, sustained
throughput, NVIDIA behavior, or every checkpoint/configuration.
