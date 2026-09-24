#!/bin/bash
set -euo pipefail
root=/root/open-jev-experiments/jev-additions-v1
slug="$1"
mkdir -p "$root/results/$slug"
exec >"$root/results/$slug/job.log" 2>&1
python3 -m pip install --no-deps --target /tmp/jev-additions-deps transformers==5.16.1 accelerate==1.15.0
export PYTHONPATH="/tmp/jev-additions-deps:$root/source"
export USE_TF=0 TOKENIZERS_PARALLELISM=false HF_HUB_OFFLINE=1
python3 /workspace/open-jev/simple-jev-evals/eval/experiments/jev_additions/run_gpu.py "$slug"
