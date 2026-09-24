"""Audit the stored Jev 1.13 benchmark reference against the new eval modes.

Consumes committed compact reports. Optional --data-root verifies that the
source bytes for overlapping multi-decision suites match the archived run.
No network, model call, or invented grouped inference is involved.
"""
import argparse
import hashlib
import json
from pathlib import Path

from presets import ROOT

ARCHIVE = ROOT / 'benchmarks/jev-1.13/2026-09-20'


def _archived(project, configuration):
    for path in ARCHIVE.glob('*/results.json'):
        report = json.loads(path.read_text())
        for row in report['by_project']:
            if (row['project'], row['configuration']) == (project, configuration):
                artifact = [a for a in report['provenance']['artifacts']
                            if a['suite'] in row['suites']]
                if len(artifact) != 1:
                    raise ValueError(f'Expected exactly one frozen artifact for {project}/{configuration}')
                return row, artifact[0], path
    raise ValueError(f'Missing historical reference for {project}/{configuration}')


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def combined_reference():
    """Report-level Jev input for compare.py, not a raw-response replay."""
    paths = sorted(ARCHIVE.glob('*/results.json'))
    reports = [json.loads(path.read_text()) for path in paths]
    models = {report['model'] for report in reports}
    endpoints = {report['endpoint'] for report in reports}
    if len(paths) != 23 or len(models) != 1 or len(endpoints) != 1:
        raise ValueError('Historical project reports have inconsistent identity')
    return {'model': models.pop(), 'endpoint': endpoints.pop(),
            'by_project': [r for report in reports for r in report['by_project']],
            'by_category': [r for report in reports for r in report['by_category']],
            'reference_provenance': {'scope': 'merged compact reports, not replayed raw responses',
                                     'files_sha256': {str(path.relative_to(ROOT)): sha256(path)
                                                      for path in paths}}}


def coverage(data_root=None, original_root=None):
    summary_path = ARCHIVE / 'SUMMARY.json'
    summary = json.loads(summary_path.read_text())
    reports = [json.loads(path.read_text()) for path in ARCHIVE.glob('*/results.json')]
    artifacts = [a for report in reports for a in report['provenance']['artifacts']]
    if (len(reports), len(artifacts), len({a['suite'] for a in artifacts}),
            sum(a['manifest']['rows'] for a in artifacts)) != (23, 65, 65, 86747):
        raise ValueError('Historical 65-suite Jev run is not complete')
    from compare import compare
    merged = combined_reference()
    for mode, expected_scores in (
        ('knowledge', {'model-knowledge': summary['totals']['model-knowledge']['score']}),
        ('decision', {'classification-decision': summary['totals']['classification-decision']['score']}),
        ('text', {'combined_accuracy': summary['combined_accuracy']['score'],
                  'ranking': summary['totals']['ranking']['score']}),
    ):
        measured = compare({'Jev': merged}, mode)['models']['Jev']
        if any(abs(measured['scores'][k] - value) > 1e-12
               for k, value in expected_scores.items()):
            raise ValueError(f'Historical {mode} reference does not reproduce stored totals')
    mirror_files = None
    if original_root is not None:
        left = {p.relative_to(ARCHIVE): sha256(p) for p in ARCHIVE.rglob('*') if p.is_file()}
        right = {p.relative_to(original_root): sha256(p)
                 for p in original_root.rglob('*') if p.is_file()}
        if left != right:
            raise ValueError('Original eval checkout and main-based Jev reports differ')
        mirror_files = len(left)
    items = summary['items']
    expected = {'model-knowledge': (13, 47965), 'classification-decision': (26, 21364)}
    for task, (n, rows) in expected.items():
        selected = [i for i in items if i['task'] == task]
        if (len(selected), sum(i['rows'] for i in selected)) != (n, rows):
            raise ValueError(f'{task}: frozen matched-item coverage changed')
    korean = json.loads((ARCHIVE / 'jev-korean-benchmark/results.json').read_text())
    kr = [r for r in korean['by_category'] if r['placement'][3] == 'model-knowledge']
    if len(kr) != 2 or sorted(r['metrics']['rows'] for r in kr) != [100, 100]:
        raise ValueError('Expected two 100-row Korean knowledge reference partitions')

    contract, contract_art, contract_path = _archived('ContractNLI', 'contractnli')
    unfair, unfair_art, unfair_path = _archived('LexGLUE', 'unfair-tos')
    contract_hash = contract_art['manifest']['dataset_sha256']
    unfair_hash = unfair_art['manifest']['dataset_sha256']
    if (contract['metrics']['rows'], unfair['metrics']['rows'], unfair['metrics']['targets']) != (2091, 1607, 12856):
        raise ValueError('Archived multi-decision source coverage changed')
    if (contract_art['manifest']['suite']['adapter'], unfair_art['manifest']['suite']['adapter']) != ('choice-v1', 'binary-battery-v1'):
        raise ValueError('Archived request adapters changed')
    if sha256(ROOT / 'adapters/choice.py') != contract_art['manifest']['adapter_sha256']:
        raise ValueError('Original ContractNLI request adapter changed')
    if sha256(ROOT / 'adapters/binary_battery.py') != unfair_art['manifest']['adapter_sha256']:
        raise ValueError('Original Unfair ToS request adapter changed')
    grouped_path = ROOT / 'suites/english/legal-contractnli-multi.json'
    unfair_multi = ROOT / 'suites/english/legal-unfair-tos-multi.json'
    grouped = json.loads(grouped_path.read_text())
    unchanged = json.loads(unfair_multi.read_text())
    if (grouped['questions_per_request'], grouped['expected_rows'],
            unchanged['questions_per_request'], unchanged['expected_rows'],
            unchanged['adapter']) != (17, 123, 8, 1607, 'binary-battery-v1'):
        raise ValueError('New multi-decision protocol changed')
    if data_root is not None:
        for name, frozen_hash in (('legal-contractnli.jsonl', contract_hash),
                                  ('legal-unfair-tos.jsonl', unfair_hash)):
            if sha256(data_root / name) != frozen_hash:
                raise ValueError(f'{name}: source rows do not match archived Jev run')
        from suites import load_suite
        c = load_suite(grouped_path, data_root / 'legal-contractnli-multi.jsonl')[3]
        u = load_suite(unfair_multi, data_root / 'legal-unfair-tos.jsonl')[3]
        if (len(c), sum(len(x['fields']) for x in c), len(u), sum(len(x['questions']) for x in u)) != (123, 2091, 1607, 12856):
            raise ValueError('New grouped dataset is incomplete')
        source_rows = {row['id']: row for line in (data_root / 'legal-contractnli.jsonl').read_bytes().splitlines()
                       if line.strip() for row in [json.loads(line)]}
        grouped_rows = {f['id']: (row['state'], f) for row in c for f in row['fields']}
        if len(source_rows) != 2091 or source_rows.keys() != grouped_rows.keys():
            raise ValueError('Grouped ContractNLI IDs differ from the original run')
        for id, original in source_rows.items():
            state, field = grouped_rows[id]
            if original['state'] != state or any(original[k] != field[k]
                                                 for k in ('question', 'options', 'label', 'family', 'group_id')):
                raise ValueError('Grouped ContractNLI judgment differs from the original run')
    from preparation.external import jevfire
    shapes = [len(row['fields']) for row in jevfire()]
    jevfire_row, _, _ = _archived('JEVfire', 'jevfire-fields')
    if len(shapes) != 13 or sum(shapes) != 85 or jevfire_row['metrics']['fields'] != 85:
        raise ValueError('JEVfire historical request shapes changed')
    suite_ids = {artifact['suite'] for path in ARCHIVE.glob('*/results.json')
                 for artifact in json.loads(path.read_text())['provenance']['artifacts']}
    added_ids = {'decision-index-when2call', 'decision-index-banking77'}
    if suite_ids & added_ids:
        raise ValueError('New public-source decision tasks now have Jev reference artifacts')
    if any(id.startswith('vision-') for id in suite_ids) or suite_ids & {'toolret-web', 'bigclonebench-test'}:
        raise ValueError('Historical scope/exclusions changed')
    return {
        'reference': {'model': summary['model'], 'summary': str(summary_path.relative_to(ROOT)),
                      'knowledge_english': {'items': 13, 'requests': 47965,
                                            'equal_item_accuracy': summary['totals']['model-knowledge']['score']},
                      'knowledge_korean': [{'configuration': r['configuration'], 'requests': r['metrics']['rows'],
                                            'accuracy': r['score']} for r in sorted(kr, key=lambda r: r['configuration'])],
                      'decision_english': {'items': 26, 'requests': 21364,
                                           'equal_item_accuracy': summary['totals']['classification-decision']['score']}},
        'multi_decision': {
            'contractnli': {'historical_request_shape': '2091 separate one-question requests',
                            'new_request_shape': '123 shared-contract requests x 17 questions',
                            'source_sha256': contract_hash, 'historical_accuracy': contract['metrics']['accuracy'],
                            'directly_comparable_grouped_reference': False,
                            'historical_report': str(contract_path.relative_to(ROOT))},
            'unfair_tos': {'historical_request_shape': '1607 requests x 8 questions',
                           'new_request_shape': '1607 requests x 8 questions',
                           'source_sha256': unfair_hash, 'historical_f1': unfair['metrics']['f1'],
                           'historical_question_accuracy': unfair['metrics']['accuracy'],
                           'historical_exact_case_accuracy': unfair['metrics']['exact_set_accuracy'],
                           'same_request_adapter_and_data': True,
                           'historical_report': str(unfair_path.relative_to(ROOT))},
            'historical_exact_request_overlap': {'requests': 1607, 'questions': 12856},
            'missing_matched_grouped_reference': {'requests': 123, 'questions': 2091}},
        'other_grouped_reference_not_in_multi_preset': {
            'suite': 'jevfire-fields', 'requests': 13, 'questions': 85,
            'multi_question_cases': sum(n > 1 for n in shapes),
            'single_question_cases': sum(n == 1 for n in shapes)},
        'new_public_source_tasks_without_jev_reference': [
            {'suite': 'decision-index-when2call', 'requests': 3652},
            {'suite': 'decision-index-banking77', 'requests': 3080}],
        'prior_text_run': {'completed_suites': len(artifacts),
                           'requests': sum(a['manifest']['rows'] for a in artifacts),
                           'original_checkout_files_byte_identical': mirror_files,
                           'vision_reference': False, 'toolret_web_reference': False,
                           'bigclonebench_reference': False}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-root', type=Path, help='Optional local pinned prepared datasets for SHA/shape verification')
    parser.add_argument('--original-root', type=Path,
                        help='Optional original simple-jev-eval/eval/benchmarks/jev-1.13/2026-09-20 directory to byte-compare')
    parser.add_argument('--write-combined-report', type=Path,
                        help='New report JSON for compare.py (historical compact metrics only; never overwrite)')
    args = parser.parse_args()
    result = coverage(args.data_root, args.original_root)
    if args.write_combined_report is not None:
        args.write_combined_report.parent.mkdir(parents=True, exist_ok=True)
        with args.write_combined_report.open('x') as stream:
            stream.write(json.dumps(combined_reference(), indent=2) + '\n')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
