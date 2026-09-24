# Separated evaluation presets — validation

Validated locally against pinned prepared source records; no model accuracy
measurements or GPU jobs were performed. `full-text` and `full` are unchanged
historical selections, **not** aliases for the two task-specific modes.

| Mode | Selection | Scope |
| --- | ---: | --- |
| `decision` | 23 manifests | 26 matched English decision reporting items; no `model-knowledge` partitions |
| `knowledge` | 12 manifests | 10 English + 2 Korean-source knowledge manifests; 13 matched English knowledge comparison items; no `classification-decision` partitions |
| `multi-decision` | 2 manifests | 123 ContractNLI requests × 17 questions; 1,607 Unfair ToS requests × 8 questions |
| `full-text` | 65 manifests | Historical mixed text selection, unchanged |

**Mixed-parent partition check.** Loaded the actual prepared CodeMMLU test file,
SHA256 `ce45aa661476258bf30a0640daeac0aebb22d4029ab0dfaf003625d803969d55`.
The five knowledge children contain 11,501 IDs; the four decision children
contain 8,374 IDs. Their intersection is empty and their union is exactly the
original 19,875-row parent. All 26 decision and 13 English knowledge reference
reporting placements match the corresponding presets. No source labels changed.
All **12 knowledge manifests** were loaded and schema-validated against the
existing ignored prompt-lab prepared data: **48,165 requests / 48,165
questions**. All **23 decision manifests** similarly validated: **21,364
requests / 50,849 questions** (native binary battery tasks can have several
questions per request). The multi-decision selection has **1,730 requests /
14,947 questions**. Reproduce these counts without model calls:

```sh
python3 eval/verify_presets.py --fallback-data-root \
  /workspace/open-jev/simple-jev-prompt-lab/eval/data
```

The fallback is an explicit read-only prepared-data directory; omit it after
preparing all selected inputs in this checkout. Machine-readable audit output
was saved at `/tmp/jev-verify-presets.json`.
Each loaded source is available under the existing prompt-lab prepared-data
directory; preparation is still needed inside a clean new worktree before a
real endpoint run. The source files are *not* redistributed in Git or silently
linked to another worktree. The large-data port remains reproducible using the
pinned converters.

**Native multi-question preparation.** `legal-contractnli-multi` is derived
from the pinned ContractNLI source via the existing converter: 123 distinct
contracts, exactly 17 hypotheses each, 2,091 judgements. Prepared SHA256:
`a90a161c886bc7b8238a1915b08f4cb86899d921528c0aba41e75e59f75e8a7b`.
The original ungrouped prepared rows hash to
`b727008bada0bfb98aa75fbc5de48ca40b024b1d38cbe284fa060541de2aebd4`.
The original LexGLUE converter yields 1,607 Unfair ToS contexts, each with
exactly eight questions (12,856 judgements), prepared SHA256
`bee8fb35e968ab47bad7eda6e62f13aa5fc6e76067a018481b145d1494098f42`.
Sources and large prepared data are ignored; only converters, fixtures,
checksums/metadata, and manifests are tracked. The existing historical
`legal-unfair-tos` suite manifest remains untouched.

**Full local HTTP/audit control (synthetic, not model inference).** An independent
loopback responder accepted **1,730 HTTP requests**, with 123 containing
17 Choice questions each and 1,607 containing eight Noul questions each:
**14,947 answer slots**, zero transport errors. The real `eval/run.py --preset
multi-decision` completed, and `eval/audit.py` replayed every raw response:
`complete=true`, `verified_suites=2`, `verified_examples=1730`,
`scored_units=14947`. Raw evidence is in
`/tmp/jev-multidecision-fake-results-v3/` and
`/tmp/jev-multidecision-fake-run-v3.log`; the fake responder is
`/tmp/jev-multidecision-fake-run.py`. These records are **protocol-only**;
its fabricated answer scores are meaningless and MUST NOT be cited as model
quality. Portable unit tests independently cover 17-question HTTP dispatch,
exactly-one-context grouping, no gold in requests, tamper rejection, adapter
scoring, partial task coverage, overlap rejection and multi-suite admission
counts.

Recheck: `python3 -m unittest discover -s eval -p 'test_*.py' -q`
from the worktree root; `python3 eval/run.py --preset {knowledge,decision,multi-decision} --list`
shows the selections without requiring data preparation or any model service.
