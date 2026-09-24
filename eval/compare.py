"""Compare portable report.json files without mixing native metrics.

This checks report coverage and counts, not raw evidence. First use audit.py on
fresh runs. Historical reference scores are not fresh endpoint measurements.
"""
import argparse
import json
import math
from pathlib import Path
from statistics import mean

ROOT = Path(__file__).resolve().parent
REFERENCE = ROOT / 'benchmarks/jev-1.13/2026-09-20/SUMMARY.json'
VISION = {('CIFAR-10', 'test'): 10000, ('Oxford-IIIT Pets', 'test'): 3669,
          ('MME', 'perception'): 2114, ('POPE', 'adversarial'): 3000,
          ('POPE', 'popular'): 3000, ('POPE', 'random'): 3000,
          ('TallyQA', 'test'): 38589}
QUICK = {('JevBench public accuracy', 'public-231'): 231,
         ('SemIf', 'authored'): 144, ('SemIf', 'typesafe'): 102}


def usable(row, count, metric, *, selected_task=None):
    metrics = row['metrics']
    partial_other_tasks = False
    if selected_task and row['coverage'] == 'partial' and row.get('missing_suites'):
        from catalog import entries
        catalog = {suite['id']: suite for _, suite in entries()}
        # A task-only run may omit the other task's children from a mixed
        # project, but never a child of the selected task. Exact reference
        # row counts are still checked; project-wide coverage stays partial.
        partial_other_tasks = all(catalog[id]['subcategory'] != selected_task
                                  for id in row['missing_suites'])
    if ((row['coverage'] != 'complete' and not partial_other_tasks)
            or metrics.get('failed_rows', 0) or metrics['rows'] != count):
        raise ValueError('Incomplete/failed report or mismatched question count')
    value = metrics[metric]
    if type(value) not in (int, float) or not math.isfinite(value) or not 0 <= value <= 1:
        raise ValueError('Expected a finite unit-interval score')
    return value


def unique_index(rows, key):
    index = {}
    for row in rows:
        identifier = key(row)
        if identifier in index:
            raise ValueError('Duplicate comparison item')
        index[identifier] = row
    return index


def compare(reports, mode, reference=None):
    if mode not in ('quick', 'decision', 'knowledge', 'text', 'vision'):
        raise ValueError('Unknown comparison mode')
    result = {'mode': mode, 'models': {},
              'validation': 'Report metadata/counts only; audit.py verifies raw responses separately.'}
    if mode in ('decision', 'knowledge', 'text'):
        reference = reference or json.loads(REFERENCE.read_text())
        task = {'decision': 'classification-decision', 'knowledge': 'model-knowledge'}.get(mode)
        wanted = [r for r in reference['items'] if task is None or r['task'] == task]
        if len(wanted) != {'decision': 26, 'knowledge': 13, 'text': 54}[mode]:
            raise ValueError('Reference item set changed')
        result['weighting'] = reference['weighting']
        result['historical_reference'] = {'model': reference['model'], 'items': wanted}
        for name, report in reports.items():
            index = unique_index(
                [r for r in report['by_category'] if r['placement'][:2] == ['text', 'english']],
                lambda r: (r['project'], r['configuration'], *r['placement'][2:]))
            items = []
            for item in wanted:
                key = (item['project'], item['configuration'], item['category'], item['task'])
                row = index[key]
                score = usable(row, item['rows'], item['metric'], selected_task=task)
                metrics = row['metrics']
                items.append({**item, 'score': score, 'reference_score': item['score'],
                              'scored_units': metrics.get('targets', metrics.get('fields', metrics.get('questions', metrics['rows'])))})
            scores = {task: mean(i['score'] for i in items if i['task'] == task)
                      for task in sorted({i['task'] for i in items})}
            if mode == 'text':
                scores['combined_accuracy'] = mean(i['score'] for i in items if i['task'] != 'ranking')
            result['models'][name] = {'model': report['model'], 'scores': scores, 'items': items}
    else:
        wanted = QUICK if mode == 'quick' else VISION
        result['weighting'] = ('Pooled accuracy over 477 development/selection decisions; not held-out.'
                               if mode == 'quick' else
                               'Equal mean of seven per-question accuracies; native MME/F1 remain separate.')
        for name, report in reports.items():
            index = unique_index(report['by_project'], lambda r: (r['project'], r['configuration']))
            items = []
            for (project, configuration), count in wanted.items():
                row = index[(project, configuration)]
                score = usable(row, count, 'accuracy')
                items.append({'project': project, 'configuration': configuration,
                              'rows': count, 'accuracy': score,
                              'native_metric': row['metric'], 'native_score': row['score']})
            score = (sum(i['accuracy'] * i['rows'] for i in items) / 477
                     if mode == 'quick' else mean(i['accuracy'] for i in items))
            result['models'][name] = {'model': report['model'], 'accuracy': score, 'items': items}
            if mode == 'quick':
                result['models'][name]['correct'] = round(score * 477)
                result['models'][name]['rows'] = 477
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', action='append', required=True, metavar='NAME=REPORT_JSON')
    parser.add_argument('--mode', choices=['quick', 'decision', 'knowledge', 'text', 'vision'], default='decision')
    parser.add_argument('--output', type=Path, help='New JSON file; default stdout')
    args = parser.parse_args()
    reports = {}
    for value in args.report:
        name, separator, path = value.partition('=')
        if not separator or not name or name in reports:
            parser.error('--report requires a unique nonempty NAME=REPORT_JSON')
        reports[name] = json.loads(Path(path).read_text())
    result = json.dumps(compare(reports, args.mode), indent=2, allow_nan=False) + '\n'
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with args.output.open('x') as stream:
            stream.write(result)
    else:
        print(result, end='')


if __name__ == '__main__':
    main()
