"""Rebuild the frozen 256-row WANLI evaluation from pinned upstream rows."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


DESCRIPTIONS = {
    "supported": "The evidence establishes the claim",
    "insufficient": "The evidence does not establish either",
    "contradicted": "The evidence establishes the opposite",
}
LABELS = {"entailment": "supported", "neutral": "insufficient", "contradiction": "contradicted"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Pinned WANLI test.jsonl")
    parser.add_argument("--selection", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Output must be new")
    source = {str(row["id"]): row for row in map(json.loads, args.source.read_text().splitlines())}
    manifest = [json.loads(line) for line in args.selection.read_text().splitlines() if line.strip()]
    selected = [row for row in manifest if row["source"] == "wanli"]
    rows = []
    for item in selected:
        upstream = source[str(item["upstream"]["source_id"])]
        option_ids = item["option_ids"]
        gold_id = LABELS[upstream["gold"]]
        rows.append(
            {
                "id": item["id"],
                "group_id": item["group_id"],
                "family": item["family"],
                "split": "external_test",
                "state": upstream["premise"],
                "question": "Assess the claim using only the supplied evidence: " + upstream["hypothesis"],
                "options": [{"id": key, "description": DESCRIPTIONS[key]} for key in option_ids],
                "label": option_ids.index(gold_id),
                "target_distribution": None,
                "provenance": {
                    "source": "WANLI",
                    "source_id": upstream["id"],
                    "source_seed_id": upstream["pairID"],
                    "source_revision": item["upstream"]["revision"],
                    "source_official_split": "test",
                    "original_label": upstream["gold"],
                    "rights": "CC-BY-4.0",
                },
            }
        )
    if len(rows) != 256 or len({row["id"] for row in rows}) != 256:
        raise ValueError("Selection must rebuild exactly 256 unique WANLI rows")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows))
    print(f"wrote {len(rows)} rows")


if __name__ == "__main__":
    main()
