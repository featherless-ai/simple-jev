"""Prepare the entire original MMLU test split without model calls.

Use the pinned 'all/test' parquet once, rather than concatenating all plus subject
configs (which would duplicate examples). Questions, four choices, and gold order
are preserved. This endpoint adaptation is zero-shot, without retrieval or CoT.
"""
import argparse
from collections import Counter
import hashlib
import io
import json
from pathlib import Path
import urllib.request
from adapters import choice

ROOT = Path(__file__).resolve().parent


def convert(records, expected_counts):
    counts = Counter()
    rows = []
    for r in records:
        subject = r['subject']
        if subject not in expected_counts or len(r['choices']) != 4:
            raise ValueError('Unknown subject or invalid choice count')
        if type(r['answer']) is not int or r['answer'] not in range(4):
            raise ValueError('Invalid answer')
        id = f'{subject}-{counts[subject]:04d}'
        counts[subject] += 1
        rows.append({'id': id, 'group_id': id, 'family': subject,
                     'state': None, 'question': r['question'],
                     'options': [{'id': letter, 'description': text}
                                 for letter, text in zip('ABCD', r['choices'])],
                     'label': r['answer']})
    if dict(counts) != expected_counts:
        raise ValueError('Incomplete MMLU test split or unexpected subject counts')
    choice.validate(rows)
    return rows


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source', type=Path, default=ROOT/'sources/mmlu/test.parquet')
    p.add_argument('--download', action='store_true')
    p.add_argument('--output', type=Path, default=ROOT/'data/mmlu-test.jsonl')
    a = p.parse_args()
    sidecar = a.output.with_suffix('.provenance.json')
    if a.output.exists() or sidecar.exists():
        p.error('Refusing to overwrite data/provenance')
    meta = json.loads((ROOT/'vendor/mmlu/source.json').read_text())
    if not a.source.exists():
        if not a.download:
            p.error('Source missing; supply the pinned parquet or use --download')
        a.source.parent.mkdir(parents=True, exist_ok=True)
        url = f"https://huggingface.co/datasets/cais/mmlu/resolve/{meta['revision']}/{meta['file']}"
        a.source.write_bytes(urllib.request.urlopen(url, timeout=120).read())
    raw = a.source.read_bytes()
    if hashlib.sha256(raw).hexdigest() != meta['sha256']:
        raise ValueError('Source differs from pinned MMLU test parquet')
    import pyarrow.parquet as pq
    rows = convert(pq.read_table(io.BytesIO(raw)).to_pylist(), meta['subject_counts'])
    content = ''.join(json.dumps(r, ensure_ascii=False)+'\n' for r in rows)
    a.output.parent.mkdir(parents=True, exist_ok=True)
    a.output.write_text(content)
    sidecar.write_text(json.dumps({'source': meta, 'rows': len(rows),
        'protocol': 'zero-shot classifier Choice; no dev demonstrations, retrieval or generated rationale',
        'dataset_sha256': hashlib.sha256(content.encode()).hexdigest(),
        'preparer_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}, indent=2)+'\n')
    print(f'Prepared {len(rows)} questions across {len(meta["subject_counts"])} subjects; no inference performed')


if __name__ == '__main__':
    main()
