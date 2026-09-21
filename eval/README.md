# Endpoint evaluations

Run benchmarks against any Jev-compatible endpoint accepting `model`, `state`,
and `questions`. Python 3.10+; the runner uses only the standard library.
Models run on the endpoint, so the evaluator needs no GPU.

## Run

From the repository root:

```sh
python3 eval/run.py \
  --endpoint http://localhost:8000/v1/classifier \
  --model YOUR_MODEL \
  --suite eval/suites/english/semif-authored.json \
  --output eval/results/first-run
```

Repeat `--suite` to run multiple benchmarks. For authentication, set a bearer key
in your environment and pass `--key-env JEV_API_KEY`. Use a new output directory
for each run. The included SemIf fixture needs no preparation; other datasets may.

## Prepare and browse

```sh
python3 eval/prepare.py --help
python3 eval/prepare.py knowledge --help
python3 eval/catalog.py                    # Our category splits
python3 eval/catalog.py --view project     # Named benchmark projects
python3 eval/catalog.py --write-doc        # Generate both catalogs in notes/
```

Converters download only when explicitly requested and never call models.
See the [benchmark notes](notes/README.md) for sources and preparation commands.

## Results

Runs save predictions, scoring inputs, provenance, and per-suite summaries.
`by-category.md` and `by-project.md` provide the two reporting views. Full project
scores are recomputed from examples, not averages of category scores.

```sh
python3 eval/report.py --run eval/results/first-run --view project
```

See [reporting](notes/REPORTING.md) for coverage, partial runs, and combining runs.

## Layout

| Path | Purpose |
| --- | --- |
| `run.py`, `report.py` | Execute HTTP requests and report scores |
| `prepare.py`, `preparation/` | Dataset preparation CLI and converters |
| `catalog.py`, `taxonomy.json`, `suites/` | Benchmark definitions and grouping |
| `suites.py`, `adapters/` | Dataset loading, request mapping, and metrics |
| `tests/` | Offline checks |
| `notes/` | Detailed documentation and generated catalogs |
| `vendor/` | Pinned source metadata, fixtures, and upstream licenses |
| `data/` | Small committed fixtures; prepared datasets are ignored |
| `sources/`, `results/` | Ignored downloads and run artifacts |

```sh
python3 -m unittest discover -s eval -p 'test_*.py'
```

For the request contract, custom adapters, and baseline details, see the
[framework reference](notes/FRAMEWORK.md).

For long runs, `--workers 16 --delay 0.02` allows up to 16 concurrent requests,
with at least 20 ms between dispatches. Choose settings appropriate to your
endpoint. `--resume` continues an interrupted output directory with identical
settings/data, preserving every saved prediction (including failures). A malformed
partial JSONL record requires review rather than automatic deletion.

The runner pauses on authentication/billing rejection or 20 consecutive errors.
Retries apply to HTTP 429 and all HTTP 5xx server errors. Context-free questions send an
empty string for `state`, compatible with System One's non-null input contract.

Export small, tracked reports per project with `report.py --export`; see
[report storage](notes/REPORTING.md#store-benchmark-reports-in-git).

BigCloneBench is opt-in because it contains 415,416 examples. Full-run selectors
should skip manifests with `default_enabled: false`; explicit `--suite` selection
still works. Other coding benchmarks remain in the default set.

To repair saved server failures after a run finishes:

```sh
python3 eval/retry.py --run eval/results/first-run --key-env JEV_API_KEY
```

Only HTTP 5xx failures are retried. Successful predictions are preserved, original
failures are retained in `prior_results` and a retry journal, and scores are rebuilt.
Do not retry a run while another process is writing to it.

ToolRet Web is also disabled by default: its full candidate descriptions can exceed
32K context. ToolRet Code and Customized remain enabled; no silent truncation is applied.
