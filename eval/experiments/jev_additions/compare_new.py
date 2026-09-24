"""Audit exact suite/data/protocol matches and compare the new Jev decision baselines.

Never substitute the archived single-question ContractNLI score for the new
shared-context run. Unfair ToS alone reuses its audited historical grouped run.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys

EVAL = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(EVAL))
from audit import audit_run
from reference_coverage import coverage, _archived

ROOT = Path('/root/open-jev-experiments/jev-additions-v1')
NATIVE = Path('/root/open-jev-experiments/jev-additions-native-v1')
JEV = EVAL / 'results/jev-additions-v1/runs'
SUITES = ('legal-contractnli-multi', 'legal-unfair-tos-multi',
          'decision-index-when2call', 'decision-index-banking77')
METRIC = dict(zip(SUITES, ('question_accuracy', 'f1', 'accuracy', 'macro_f1')))


def suite_run(root, names, expected_model):
    paths = [EVAL / 'suites/english' / (name + '.json') for name in names]
    audit = audit_run(root, paths)
    if not audit['complete']:
        raise ValueError(f'Incomplete {root}: {audit}')
    results = {}
    for name in names:
        manifest = json.loads((root / name / 'manifest.json').read_text())
        summary = json.loads((root / name / 'summary.json').read_text())
        if manifest['model'] != expected_model or summary['failed_rows']:
            raise ValueError(f'Incorrect model or failed examples: {root}/{name}')
        results[name] = {'metric': METRIC[name], 'score': summary[METRIC[name]],
                         'requests': summary['rows'], 'metrics': summary,
                         'dataset_sha256': manifest['dataset_sha256'],
                         'adapter_sha256': manifest['adapter_sha256'],
                         'scoring_rows_sha256': manifest['scoring_rows_sha256'],
                         'source_manifest_sha256': hashlib.sha256((root / name / 'manifest.json').read_bytes()).hexdigest()}
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--require-models', action='store_true', help='Require all five HF-server GPU runs')
    parser.add_argument('--require-native', action='store_true', help='Require all four native-prompt GPU runs')
    args = parser.parse_args()
    history = coverage(data_root=EVAL / 'data')
    _, archived, historical_path = _archived('LexGLUE', 'unfair-tos')
    baseline = {}
    for name in SUITES:
        if name == 'legal-unfair-tos-multi':
            baseline[name] = {
                'metric': METRIC[name], 'score': history['multi_decision']['unfair_tos']['historical_f1'],
                'requests': 1607, 'dataset_sha256': archived['manifest']['dataset_sha256'],
                'adapter_sha256': archived['manifest']['adapter_sha256'],
                'reference_provenance': 'historical same-request-shape archived LexGLUE result',
                'historical_report': str(historical_path),
                'historical_report_sha256': hashlib.sha256(historical_path.read_bytes()).hexdigest()}
        else:
            x = suite_run(JEV / name, (name,), 'typesafe/jev-1.13')[name]
            x['reference_provenance'] = 'new audited OpenRouter Jev 1.13 run'
            baseline[name] = x
    plans = [(ROOT, json.loads((ROOT / 'plan.json').read_text()), args.require_models)]
    if (NATIVE / 'plan.json').exists():
        plans.append((NATIVE, json.loads((NATIVE / 'plan.json').read_text()), args.require_native))
    elif args.require_native:
        raise ValueError('Native-prompt model plan is missing')
    scores = {'Jev 1.13': baseline}
    models = {}
    configurations = {}
    for root, plan, required in plans:
        for slug, cfg in plan['models'].items():
            if slug in models:
                raise ValueError(f'Duplicate model slug: {slug}')
            configurations[slug] = {**cfg, 'runtime_family': 'native-prompt' if root == NATIVE else 'HF-server',
                                    'plan_sha256': hashlib.sha256((root / 'plan.json').read_bytes()).hexdigest()}
            result_path = root / 'results' / slug
            status_path = result_path / 'status.json'
            if not status_path.exists():
                if required:
                    raise ValueError(f'Pending GPU model: {slug}')
                models[slug] = 'pending'
                continue
            status = json.loads(status_path.read_text())
            if status.get('evaluation_exit_code') != 0 or status.get('audit_exit_code') != 0:
                if required:
                    raise ValueError(f'Unsuccessful GPU job: {slug}, {status}')
                models[slug] = 'failed; not scored'
                continue
            results = suite_run(result_path / 'eval', SUITES, cfg['model'])
            for name in SUITES:
                for field in ('dataset_sha256', 'adapter_sha256'):
                    if results[name][field] != baseline[name][field]:
                        raise ValueError(f'Nonmatching {field}: {slug}/{name}')
                if 'scoring_rows_sha256' in baseline[name] and results[name]['scoring_rows_sha256'] != baseline[name]['scoring_rows_sha256']:
                    raise ValueError(f'Nonmatching scoring rows: {slug}/{name}')
            scores[slug] = results
            models[slug] = 'audited'
    output = {'protocol': 'distinct 4-suite outcomes; no overall pooled score',
              'historical_flat_contractnli_accuracy_NOT_grouped_reference': history['multi_decision']['contractnli']['historical_accuracy'],
              'suites': list(SUITES), 'models': models, 'configurations': configurations, 'scores': scores}
    print(json.dumps(output, indent=2))
    (EVAL / 'results/jev-additions-v1/comparison.json').write_text(json.dumps(output, indent=2) + '\n')


if __name__ == '__main__':
    main()
