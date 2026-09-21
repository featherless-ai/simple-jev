# Object presence, counting and identification

Existing **MME**, **POPE** and **TallyQA** benchmarks, adapted to the image-capable
Jev endpoint. Original questions and gold labels are retained. No new questions,
class subsets, or disease datasets are created. These are presence/recognition
and counting tasks, not bounding-box detection.

| Suite | Original task | Metric |
| --- | --- | --- |
| `vision-mme-perception` | Ten perception categories: existence, count, position, color, posters, celebrity, scene, landmark, artwork, OCR | Per-category `100 × (accuracy + accuracy_plus)`; sum up to 2,000 |
| `vision-pope-random` | COCO object presence with random negatives | Accuracy, precision, recall, F1, yes ratio |
| `vision-pope-popular` | Same protocol with popular-object negatives | Same, separate result |
| `vision-pope-adversarial` | Same protocol with adversarial negatives | Same, separate result |
| `vision-tallyqa` | Original test set: 38,589 counting questions | Exact-count accuracy, separately simple and complex |

Sources and revisions are recorded in `vendor/visual-qa/`. Manifests are under
`suites/english/`, referring to question language; image text, particularly OCR,
may include other languages. The earlier CIFAR-10 and Oxford Pets suites remain
available separately.

## Obtain the original data

**MME:** use the [official evaluation repository](https://github.com/BradyFU/Awesome-Multimodal-Large-Language-Models/tree/Evaluation)
and its linked [benchmark release](https://huggingface.co/datasets/darkyarding/MME/blob/main/MME_Benchmark_release_version.zip).
Extract the release and point `--images` at the directory containing `existence/`,
`count/`, etc. Both flat category directories and the original nested
`images/` + `questions_answers/` layout are supported. Every category must be
present and each image must have exactly two labelled question lines. This suite
includes perception only; it does not report the 14-task perception+cognition total.
MME input files are hashed at preparation time; the local release is not claimed
to be cryptographically identical to a historic download. Follow the release's
access and usage terms; this integration does not relicense its images or questions.

**POPE:** the three original COCO question JSONL files are bundled from the pinned
[official repository](https://github.com/RUCAIBox/POPE). Obtain the **COCO 2014
validation images** from [COCO](https://cocodataset.org/#download). Point `--images`
at `val2014/`, which contains the `COCO_val2014_*.jpg` files. No negative questions
are regenerated. The three conditions share images; do not pool them as independent
populations. POPE's MIT notice is retained; COCO image terms remain applicable.

**TallyQA:** obtain `tallyqa.zip` at the pinned revision of the
[official repository](https://github.com/manoja328/TallyQA_dataset). Its hash is
checked before reading only `test.json`. Download the referenced COCO and Visual
Genome images as directed by the source, preserving paths such as `VG_100K/`,
`VG_100K_2/`, and `train2014/` beneath the supplied image root. Source questions
cover counts 0–15 and carry the original `issimple` flag. The upstream Apache-2.0
notice is retained; underlying COCO/Visual Genome image terms still apply.

## Prepare on the evaluation node

Only Pillow is needed in addition to Python's standard library. Preparation reads
local files, performs no network calls, and never invokes a model.

```sh
python3 -m pip install Pillow
python3 eval/prepare_visual_qa.py vision-mme-perception --images /datasets/MME_Benchmark_release_version
python3 eval/prepare_visual_qa.py vision-pope-random --images /datasets/coco/val2014
python3 eval/prepare_visual_qa.py vision-pope-popular --images /datasets/coco/val2014
python3 eval/prepare_visual_qa.py vision-pope-adversarial --images /datasets/coco/val2014
python3 eval/prepare_visual_qa.py vision-tallyqa \
  --annotations /datasets/TallyQA/tallyqa.zip --images /datasets/tallyqa-images
```

Each creates `eval/data/SUITE/` with `rows.jsonl`, PNG images and provenance.
Images are EXIF-oriented, converted to RGB and encoded losslessly without resizing
or cropping. Source bytes, output image bytes, questions and preparer are hashed.
Repeated images are stored once per suite. These directories are ignored by Git;
copy the whole directory when moving nodes. Existing outputs are never overwritten.
If preparation fails, remove its incomplete output directory before retrying.

## Endpoint execution

```sh
python3 eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model YOUR_SERVED_VISION_MODEL_ID \
  --suite eval/suites/english/vision-mme-perception.json \
  --suite eval/suites/english/vision-pope-random.json \
  --suite eval/suites/english/vision-pope-popular.json \
  --suite eval/suites/english/vision-pope-adversarial.json \
  --suite eval/suites/english/vision-tallyqa.json \
  --output eval/results/vision-perception
```

An image-capable model **and backend** are required. Each original question gets
one request, containing only its image bytes and unchanged question. Original
filenames, labels and metadata never appear in model context. The runner verifies
image hashes before requests. Text-only endpoints cannot perform these tasks.

MME and POPE use Noul with a fixed `p >= 0.5` yes threshold. MME accuracy_plus
requires both questions for an image to be correct; a failed request makes that
pair incorrect. POPE failures count as incorrect and missing positive answers
as false negatives; inspect failed counts before comparing with a complete run.

TallyQA uses one Choice over the fixed original integer range **0–15**. Prediction
is the most probable integer, not rounded expected value. This exposes a bounded
answer space to the model: original questions/labels and exact-match scoring are
preserved, but this is explicitly a constrained-answer Jev adaptation of an
open-ended counting benchmark. It is not identical to generative decoding.
Failures count as incorrect; simple and complex accuracies remain separate.

No image corpora have been downloaded and no inference has been run for this
integration. Offline tests cover thresholding, failed-request denominators,
MME pairing and count-mode selection, along with shared image transport tests.
