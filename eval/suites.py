"""Declarative suite loading. Dataset paths are relative to the suite file.

Adapters are registered explicitly, never imported from a dataset-controlled path.
Add native Noul, Score or workflow adapters here without changing HTTP execution.
"""
import hashlib
import json
import re
from pathlib import Path
from adapters import jevbench, choice, typed, fields, rag, graded_rag, binary_battery, passage_rerank, vision, visual_qa, domain_ranking, mmlu, intent_f1, multi_choice

ADAPTERS = {'jevbench-accuracy-v1': jevbench, 'choice-v1': choice, 'typed-v1': typed, 'fields-v1': fields, 'rag-v1': rag, 'graded-rag-v1': graded_rag, 'binary-battery-v1': binary_battery, 'passage-rerank-v1': passage_rerank, 'vision-choice-v1': vision, 'visual-qa-v1': visual_qa, 'domain-ranking-v1': domain_ranking, 'mmlu-v1': mmlu, 'intent-f1-v1': intent_f1, 'multi-choice-v1': multi_choice}


def evaluator_hashes():
    """Freeze native scorer dependencies as well as the selected adapter."""
    root = Path(__file__).resolve().parent
    paths = [root / name for name in ('run.py', 'suites.py', 'report.py',
                                      'vendor/jevbench/scoring.py')]
    paths += sorted((root / 'adapters').glob('*.py'))
    return {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in paths}


def verify_evaluator(manifest):
    # Legacy reference archives only committed the selected adapter's hash.
    if ('evaluator_sha256' in manifest
            and manifest['evaluator_sha256'] != evaluator_hashes()):
        raise ValueError('Evaluator dependencies changed; use the original run revision')


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
    if 'questions_per_request' in suite:
        n = suite['questions_per_request']
        if type(n) is not int or n < 2 or any(
            len(row.get('fields', row.get('questions', {}))) != n for row in rows
        ):
            raise ValueError('Shared-context suite requires the declared number of questions per request')
    if hasattr(adapter, 'bind_assets'):
        adapter.bind_assets(rows, dataset.parent)
    adapter.validate(rows)
    # Preserve the original minimal custom-manifest contract. Missing taxonomy
    # is explicitly unspecified, never guessed from dataset or model names.
    defaults = {'project': suite['id'], 'project_configuration': suite['version'],
                'category': 'unspecified', 'subcategory': 'unspecified',
                'modality': 'unspecified', 'language_group': 'unspecified'}
    for key, value in defaults.items():
        suite.setdefault(key, value)
    return suite, adapter, source, rows
