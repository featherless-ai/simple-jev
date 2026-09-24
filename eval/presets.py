"""Portable suite selections; no downloads, inference, or model-name policy selection."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NAMES = ('quick', 'decision', 'knowledge', 'multi-decision', 'full-text', 'vision', 'full')


def suite_paths(name):
    if name not in NAMES:
        raise ValueError(f'Unknown preset: {name}')
    if name == 'quick':
        return [ROOT / 'suites' / p for p in (
            'jevbench-public.json', 'english/semif-authored.json',
            'english/semif-typesafe.json')]
    if name == 'multi-decision':
        return [ROOT / 'suites' / p for p in (
            'english/legal-contractnli-multi.json',
            'english/legal-unfair-tos-multi.json')]
    selected = json.loads((ROOT / 'full-suites.json').read_text())
    paths = selected['text'] if name in ('decision', 'knowledge', 'full-text') else selected['image']
    if name == 'full':
        paths = selected['text'] + selected['image']
    paths = [ROOT.parent / p for p in paths]
    if name in ('decision', 'knowledge'):
        from catalog import entries
        catalog = {suite['id']: (path, suite) for path, suite in entries()}
        target = 'classification-decision' if name == 'decision' else 'model-knowledge'
        result = []
        for path in paths:
            suite = json.loads(path.read_text())
            leaves = ([catalog[child] for child in suite['aggregate_children']]
                      if suite.get('aggregate_children') else [(path, suite)])
            eligible = [(p, s) for p, s in leaves
                        if s['subcategory'] == target
                        and (name == 'knowledge' or s['language_group'] == 'english')]
            # Pure parents keep their original frozen dataset identity. Only
            # mixed parents expand into disjoint filtered children, so knowledge
            # examples never leak into the decision preset or vice versa.
            if eligible and len(eligible) == len(leaves):
                result.append(path)
            else:
                result.extend(p for p, _ in eligible)
        paths = result
    return paths


def describe(paths):
    result = []
    for path in paths:
        suite = json.loads(path.read_text())
        dataset = (path.parent / suite['dataset']).resolve()
        result.append({'suite': suite['id'], 'manifest': str(path),
                       'dataset': str(dataset), 'dataset_present': dataset.is_file()})
    return result
