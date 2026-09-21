"""Build the frozen output-blind stability variants from the owned fixture."""
import argparse
import hashlib
import json
from pathlib import Path

VARIANTS = ("option_reversal", "criterion_wrapper", "irrelevant_context")
IRRELEVANT = (
    "\n\nUNRELATED NOTE: A blue ceramic mug is stored on a shelf in a different building. "
    "This note has no relationship to the primary record or criterion."
)


def variant_id(base: str, kind: str) -> str:
    return hashlib.sha256(f"{base}/{kind}".encode()).hexdigest()[:20]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists() or args.manifest.exists():
        parser.error("--output and --manifest must be new paths")
    source = [json.loads(line) for line in args.source.read_text().splitlines() if line.strip()]
    originals = [row for row in source if row.get("provenance", {}).get("variant") == "original"]
    missing = [row for row in source if row.get("provenance", {}).get("variant") == "missing"]
    if len(originals) != 36 or len(missing) != 36:
        raise ValueError("Expected 36 original and 36 missing-evidence rows")
    rows = []
    for base in originals:
        gold_id = base["options"][base["label"]]["id"]
        for kind in VARIANTS:
            row = json.loads(json.dumps(base))
            row["id"] = variant_id(base["id"], kind)
            row["provenance"] = {
                "kind": "project_owned_output_blind_perturbation",
                "variant": kind,
                "base_id": base["id"],
                "source_group_id": base["group_id"],
                "rights": "Project authored",
            }
            row["group_id"] = base["group_id"] + "/stability"
            row["split"] = "rebase_stability"
            if kind == "option_reversal":
                row["options"].reverse()
            elif kind == "criterion_wrapper":
                row["question"] = "Using only the supplied evidence, decide the following criterion: " + base["question"]
            else:
                row["state"] += IRRELEVANT
            row["label"] = [option["id"] for option in row["options"]].index(gold_id)
            rows.append(row)
    if len(rows) != 108 or len({row["id"] for row in rows}) != 108:
        raise ValueError("Expected 108 unique perturbations")
    payload = "".join(json.dumps(row, sort_keys=True) + "\n" for row in rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(payload)
    args.manifest.write_text(json.dumps({
        "version": "rebase-perturbations-v1",
        "source_sha256": hashlib.sha256(args.source.read_bytes()).hexdigest(),
        "fixture_sha256": hashlib.sha256(payload.encode()).hexdigest(),
        "source_originals": 36,
        "rows": 108,
        "variants": list(VARIANTS),
        "frozen_before_outputs": True,
        "missing_evidence": "Use the 36 existing missing variants in the source fixture.",
    }, indent=2) + "\n")


if __name__ == "__main__":
    main()
