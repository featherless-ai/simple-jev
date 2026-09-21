"""Declarative suite loading. Dataset paths are relative to the suite file.

Adapters are registered explicitly, never imported from a dataset-controlled path.
Add native Noul, Score or workflow adapters here without changing HTTP execution.
"""
import json
import re
from pathlib import Path
from adapters import choice, typed, fields, rag, graded_rag, binary_battery, passage_rerank, vision, visual_qa, domain_ranking, mmlu

ADAPTERS = {'choice-v1': choice, 'typed-v1': typed, 'fields-v1': fields, 'rag-v1': rag, 'graded-rag-v1': graded_rag, 'binary-battery-v1': binary_battery, 'passage-rerank-v1': passage_rerank, 'vision-choice-v1': vision, 'visual-qa-v1': visual_qa, 'domain-ranking-v1': domain_ranking, 'mmlu-v1': mmlu}


def load_suite(path, override=None):
    path = Path(path)
    suite = json.loads(path.read_text())
    if suite.get('schema_version') != 1:
        raise ValueError('Unsupported suite schema version')
    if not re.fullmatch(r'[a-z0-9][a-z0-9_-]*', suite['id']):
        raise ValueError('Suite ID must be a safe directory name')
    if not isinstance(suite.get('version'), str) or not suite['version']:
        raise ValueError('Suite version is required')
    if suite.get('language_group', 'unspecified') not in ('english', 'non-english', 'multilingual', 'unspecified'):
        raise ValueError('Invalid language group')
    adapter = ADAPTERS[suite['adapter']]
    dataset = Path(override) if override else path.parent/suite['dataset']
    source = dataset.read_bytes()
    rows = [json.loads(line) for line in source.splitlines() if line.strip()]
    # Select whole upstream task families before binding images or validating pairs.
    # Filters never rewrite questions, labels, group IDs, or the source hash.
    selection = suite.get('row_filter')
    if selection is not None:
        if (set(selection) != {'field', 'values'}
                or selection['field'] not in ('family', 'category')
                or not isinstance(selection['values'], list)
                or not selection['values']
                or any(not isinstance(v, str) for v in selection['values'])
                or len(set(selection['values'])) != len(selection['values'])):
            raise ValueError('Invalid suite row filter')
        field, values = selection['field'], set(selection['values'])
        if any(field not in row for row in rows):
            raise ValueError('Dataset lacks the declared filter field')
        if not values <= {row[field] for row in rows}:
            raise ValueError('Dataset lacks requested task families')
        rows = [row for row in rows if row[field] in values]
    if 'expected_rows' in suite and len(rows) != suite['expected_rows']:
        raise ValueError('Dataset row count does not match the declared suite')
    if hasattr(adapter, 'bind_assets'):
        adapter.bind_assets(rows, dataset.parent)
    adapter.validate(rows)
    return suite, adapter, source, rows
