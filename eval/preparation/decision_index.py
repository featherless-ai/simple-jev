"""Prepare public-source decision tasks, without importing index result rows.

Independent adaptations of the When2Call and BANKING77 published test sets,
NOT reconstructions of the Decision Index 0.2 frozen requests or scores.
Only pinned test splits are used; no gold labels enter endpoint requests.
"""
import argparse
import hashlib
import json
from pathlib import Path
import urllib.request

import csv
import io

from adapters import choice, intent_f1
from preparation.external import canonical

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    'when2call': ROOT / 'vendor/decision-index/when2call.json',
    'banking77': ROOT / 'vendor/decision-index/banking77.json',
}
KEYS = ('direct', 'tool_call', 'request_for_info', 'cannot_answer')
LABELS = 'ABCD'
QUESTION = 'Which response should the assistant give to the user\'s question, given the available tools?'


def when2call(records):
    rows = []
    for record in records:
        if not isinstance(record, dict) or not isinstance(record.get('uuid'), str) or not record['uuid']:
            raise ValueError('Missing source UUID')
        if not isinstance(record.get('question'), str) or not record['question']:
            raise ValueError('Missing user question')
        answers = record.get('answers')
        if not isinstance(answers, dict) or set(answers) != set(KEYS) or any(
            not isinstance(answers[k], str) or not answers[k] for k in KEYS
        ):
            raise ValueError('Expected four nonempty published answers')
        gold = record.get('correct_answer')
        if gold not in KEYS:
            raise ValueError('Unknown published gold answer')
        raw_tools = record.get('tools')
        if not isinstance(raw_tools, list):
            raise ValueError('Expected published tools list')
        tools = []
        for tool in raw_tools:
            if not isinstance(tool, str):
                raise ValueError('Expected JSON tool string')
            parsed = json.loads(tool)
            if not isinstance(parsed, dict):
                raise ValueError('Expected tool object')
            tools.append(parsed)
        # Keep the user question in state, as described by the index framing;
        # the instructions are fixed across the dataset. Never include source
        # metadata, target_tool, orig_tools or correct_answer in the request.
        state = json.dumps({'tools': tools, 'question': record['question']}, ensure_ascii=False)
        options = [{'id': k, 'description': answers[v]} for k, v in zip(LABELS, KEYS)]
        rows.append(canonical(record['uuid'], state, QUESTION, options, KEYS.index(gold),
                              'when2call-mcq', source=record.get('source')))
    if len(rows) != 3652:
        raise ValueError(f'Expected 3652 test cases; got {len(rows)}')
    choice.validate(rows)
    return rows


def banking77(records):
    if len(records) != 3080 or any(set(record) != {'text', 'category'} for record in records):
        raise ValueError('Expected complete BANKING77 published test CSV')
    labels = sorted({record['category'] for record in records})
    if len(labels) != 77 or any(not label for label in labels):
        raise ValueError('Expected 77 published intent labels')
    options = [{'id': f'c{i:02d}', 'description': label} for i, label in enumerate(labels)]
    rows = [canonical(f'banking77-test-{i}', record['text'],
                      'Which banking support intent best describes this customer message?',
                      options, labels.index(record['category']), 'banking77')
            for i, record in enumerate(records)]
    intent_f1.validate(rows)
    return rows


def prepare(kind, source_path, download=False):
    source = json.loads(SOURCES[kind].read_text())
    if not source_path.exists():
        if not download:
            raise ValueError(f'Missing {source_path}; use --download')
        source_path.parent.mkdir(parents=True, exist_ok=True)
        # Verify downloaded bytes before retaining anything in the source cache.
        raw = urllib.request.urlopen(source['url'], timeout=120).read()
        if hashlib.sha256(raw).hexdigest() != source['sha256']:
            raise ValueError('Pinned source checksum mismatch')
        source_path.write_bytes(raw)
    raw = source_path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != source['sha256']:
        raise ValueError('Pinned source checksum mismatch')
    if kind == 'when2call':
        records = [json.loads(line) for line in raw.splitlines() if line.strip()]
        rows = when2call(records)
    else:
        rows = banking77(list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig')))))
    return rows, source


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('task', choices=sorted(SOURCES))
    p.add_argument('--input', type=Path, help='Local pinned upstream file; defaults to eval/sources/decision-index/<file>')
    p.add_argument('--download', action='store_true')
    p.add_argument('--output', type=Path, required=True)
    a = p.parse_args()
    sidecar = a.output.with_suffix('.provenance.json')
    if a.output.exists() or sidecar.exists():
        p.error('Refusing to overwrite prepared data or provenance')
    a.input = a.input or ROOT / 'sources/decision-index' / json.loads(SOURCES[a.task].read_text())['file'].rsplit('/', 1)[-1]
    rows, source = prepare(a.task, a.input, a.download)
    content = ''.join(json.dumps(row, ensure_ascii=False, allow_nan=False) + '\n' for row in rows)
    metadata = {'source': source, 'rows': len(rows),
                'dataset_sha256': hashlib.sha256(content.encode()).hexdigest(),
                'converter_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                'protocol': 'independent public-source decision adaptation; not Decision Index 0.2 parity'}
    a.output.parent.mkdir(parents=True, exist_ok=True)
    a.output.write_text(content)
    sidecar.write_text(json.dumps(metadata, indent=2) + '\n')
    print(f'Prepared {len(rows)} {a.task} cases; no inference performed')


if __name__ == '__main__':
    main()
