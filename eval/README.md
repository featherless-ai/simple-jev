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
