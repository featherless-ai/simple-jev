#!/bin/bash
set -euo pipefail
root=/root/open-jev-experiments/jev-additions-native-v1
slug="$1"
mkdir -p "$root/results/$slug"
exec >"$root/results/$slug/job.log" 2>&1
python3 /workspace/open-jev/simple-jev-evals/eval/experiments/jev_additions/run_native_gpu.py "$slug"
