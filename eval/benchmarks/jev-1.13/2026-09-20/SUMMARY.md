# English-only overall results

**TypeSafe Jev 1.13** (`typesafe/jev-1.13-20260917`), through OpenRouter System One.

The full retained run completed 65 text suites and 86,747 examples with zero unresolved request failures after server-error retries. The table below selects English-only results.

| Category | Knowledge accuracy (%) | Classification / decision accuracy (%) | Ranking nDCG@10 (0–100) |
| --- | ---: | ---: | ---: |
| Corporate Policies & Documents | 86.41 (2) | 84.94 (3) | 61.60 (1) |
| Coding | 86.13 (3) | 68.55 (2) | 68.45 (2) |
| Security | 95.57 (4) | 77.95 (3) | 84.59 (1) |
| Agentic | — | 95.18 (7) | — |
| Legal | 81.30 (2) | 83.50 (3) | 29.15 (1) |
| General language & Others | 87.78 (2) | 90.41 (8) | 60.07 (10) |
| **Overall** | 88.59 (13) | 87.15 (26) | 60.86 (15) |

Combined English accuracy: **87.63%** across **39** knowledge and decision items. Ranking is excluded from this figure.

## Weighting and interpretation

- Parentheses show the number of eval items, not examples.
- An item is one named project/configuration/category/task slice. Each item has equal weight, regardless of dataset size. Overall scores average items directly, not category averages.
- Accuracy is taken from the saved accuracy metric, even when a benchmark’s primary metric is F1 or AUROC. Multi-label tasks use per-label accuracy; frequent negative labels can inflate it.
- Ranking averages nDCG@10 separately. It is not accuracy.
- Conditions such as clean/STT, difficulty, and language framing remain separate items; some reuse examples. These averages are descriptive, not statistically independent evidence.
- Scores use our endpoint adaptations, not necessarily upstream leaderboard protocols.
- BigCloneBench is opt-in due to size. ToolRet Web is excluded for context-limit rejections. Vision is unsupported by this text-only endpoint.
- The earlier conversational English total of 87.85% was an arithmetic error; the verified total is 87.63%.

[Exact values and contributing items](SUMMARY.json) · [Detailed project reports](README.md) · [Run settings and exclusions](RUN.md)
