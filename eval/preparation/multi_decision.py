"""Group the pinned ContractNLI test hypotheses by their unchanged contract text.

Requires the already-prepared `legal-contractnli.jsonl`; no downloading or
model calls. Never mix hypotheses from distinct documents in a request.
"""
import argparse
from collections import OrderedDict
import hashlib
import json
from pathlib import Path

from adapters import choice, multi_choice

ROOT = Path(__file__).resolve().parents[1]


def contractnli(rows):
    choice.validate(rows)
    groups = OrderedDict()
    for row in rows:
        key = row['group_id']
        if key not in groups:
            groups[key] = {'id': key, 'state': row['state'], 'fields': []}
        group = groups[key]
        if group['state'] != row['state']:
            raise ValueError('Document group contains different context texts')
        group['fields'].append({k: row[k] for k in ('id', 'question', 'options', 'label', 'family', 'group_id')})
    result = list(groups.values())
    if len(result) != 123 or len(rows) != 2091 or any(len(r['fields']) != 17 for r in result):
        raise ValueError('Expected 123 contracts with 17 hypothesis questions each')
    multi_choice.validate(result)
    return result


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input', type=Path, default=ROOT / 'data/legal-contractnli.jsonl')
    p.add_argument('--output', type=Path, default=ROOT / 'data/legal-contractnli-multi.jsonl')
    a = p.parse_args()
    sidecar = a.output.with_suffix('.provenance.json')
    if a.output.exists() or sidecar.exists():
        p.error('Refusing to overwrite prepared data or provenance')
    raw = a.input.read_bytes()
    provenance_path = a.input.with_suffix('.provenance.json')
    source_provenance = json.loads(provenance_path.read_text())
    source_hash = hashlib.sha256(raw).hexdigest()
    if (source_provenance.get('suite') != 'legal-contractnli'
            or source_provenance.get('rows') != 2091
            or source_provenance.get('dataset_sha256') != source_hash
            or source_provenance.get('sources', {}).get('contractnli', {}).get('revision')
            != 'eced6528dd3c1d14d73f9a87df8f7bdbc03126f9'
            or source_provenance.get('input_sha256', {}).get(
                'contractnli/eced6528dd3c1d14d73f9a87df8f7bdbc03126f9/contract-nli.zip')
            != 'e03fc77bbf8b53e2976a250e81d8a294bc3d5e5fb014521e477dee9340d6287b'):
        raise ValueError('Expected pinned ContractNLI test preparation and matching dataset hash')
    rows = [json.loads(line) for line in raw.splitlines() if line.strip()]
    grouped = contractnli(rows)
    text = ''.join(json.dumps(row, ensure_ascii=False, allow_nan=False) + '\n' for row in grouped)
    meta = {'source': str(a.input), 'source_sha256': source_hash,
            'source_provenance': str(provenance_path),
            'source_provenance_sha256': hashlib.sha256(provenance_path.read_bytes()).hexdigest(),
            'rows': len(grouped), 'questions': len(rows),
            'dataset_sha256': hashlib.sha256(text.encode()).hexdigest(),
            'converter_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'protocol': 'one full contract and all 17 hypothesis decisions in one request'}
    a.output.parent.mkdir(parents=True, exist_ok=True)
    a.output.write_text(text)
    sidecar.write_text(json.dumps(meta, indent=2) + '\n')
    print(f'Prepared {len(grouped)} contracts / {len(rows)} decisions; no inference performed')


if __name__ == '__main__':
    main()
