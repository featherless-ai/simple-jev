# Existing vision classification benchmarks

These suites use established datasets with their **complete original test splits
and class sets**. There are no disease-classification suites, hand-authored visual
questions, selected-class subsets or synthetic labels.

| Benchmark | Task | Test images | Classes | Sources |
| --- | --- | ---: | ---: | --- |
| CIFAR-10 | Everyday objects and animals | 10,000 | 10 | [Original dataset](https://www.cs.toronto.edu/~kriz/cifar.html), [HF distribution](https://huggingface.co/datasets/uoft-cs/cifar10) |
| Oxford-IIIT Pet | Cat and dog breed recognition | 3,669 | 37 | [Original dataset](https://www.robots.ox.ac.uk/~vgg/data/pets/), [timm HF distribution](https://huggingface.co/datasets/timm/oxford-iiit-pet) |

CIFAR-10 is a basic recognition baseline with low-resolution 32×32 images. Oxford
Pets adds finer visual distinctions at larger image resolutions. These are existing
classification evaluations adapted only to the Jev request/response transport.
Our protocol is zero-shot classification using English class names; it should not
be presented as reproducing a trained classifier's published result.

## Preparation on the evaluation machine

The runner remains standard-library only. Data preparation additionally needs
Hugging Face Datasets and Pillow:

```sh
python3 -m pip install datasets Pillow
python3 eval/prepare.py vision vision-cifar10
python3 eval/prepare.py vision vision-oxford-pets
```

Preparation downloads dataset images, not model weights, and makes no inference
calls. Each source is pinned to a full Hugging Face revision under `vendor/vision/`.
Class names and split row counts are checked before conversion. Test labels and
class order are preserved. No images are sampled, augmented, resized, or cropped.
EXIF orientation is applied and pixels are converted to RGB PNG for consistent
transport. The model's own image processor may still resize internally.

Outputs are portable directories under `data/vision-*/`, each containing:

- `rows.jsonl`: original row indices, labels, class mapping and image hashes.
- `images/`: opaque hash-named PNGs with no class names in their filenames.
- `provenance.json`: source revision, split, conversion details, dependency
  versions, class counts and preparer/dataset hashes.

These directories are Git-ignored; copy the complete directory to another node.
Existing output directories are never overwritten. If a preparation is interrupted,
remove only its incomplete output directory before retrying.

The CIFAR-10 HF card lists its license as unknown; consult the original distribution
and retain attribution. The timm Oxford Pets card declares CC BY-SA 4.0; retain the
original authors' attribution and applicable dataset terms. Images are not bundled
in this repository.

## Run against an image-capable Jev endpoint

```sh
python3 eval/run.py --endpoint http://gpu-node:8000/v1/classifier \
  --model YOUR_SERVED_VISION_MODEL_ID \
  --suite eval/suites/english/vision-cifar10.json \
  --suite eval/suites/english/vision-oxford-pets.json \
  --output eval/results/vision-baseline
```

The endpoint and model must actually accept image content. Text-only backends
cannot run these suites even if they accept the classifier JSON schema.

Each request contains one image in a user message as an `image_url` PNG data URL,
and one Choice question over the complete class set. Only neutral image context
and candidate class names are visible: no gold label, source filename, image ID,
annotation, or metadata goes to the model. Sending bytes avoids dependence on a
public image host and prevents source filenames from leaking the answer.

The loader validates every file hash before the first API request; request
construction checks it again. Dataset-relative image paths cannot escape the
prepared directory. Images are processed one per request, preserving the standard
per-image classification task rather than adding a multi-image interference test.

Metrics are top-1 accuracy, per-class accuracy and macro class accuracy. Failed
requests count as incorrect, with the failed count reported. Ties select the first
class in the declared order. The existing runner retains raw responses and usage.
Prompts are English, so manifests remain under `suites/english/` with `modality: image`.

No dataset preparation or model evaluation has been run for this addition; only
small offline transport, hash, label-mapping and scoring tests were executed.
