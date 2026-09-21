"""MMLU accuracy over all questions, plus equal-subject and category breakdowns.

This uses the shared Choice request/response contract. Failed calls count as wrong
in every accuracy denominator. Subject macro accuracy is distinct from the
class-balanced family metric used by other choice suites.
"""
from collections import defaultdict
import json
from pathlib import Path
from .choice import validate, request_for, parse_response

MAPPING = Path(__file__).resolve().parents[1]/'vendor/mmlu/subject_categories.json'


def summarize(rows, records):
    mapping = json.loads(MAPPING.read_text())
    subjects, categories = defaultdict(list), defaultdict(list)
    for row, result in zip(rows, records):
        ps = result.get('probabilities')
        hit = int(ps is not None and max(range(len(ps)), key=ps.__getitem__) == row['label'])
        subjects[row['family']].append(hit)
        categories[mapping[row['family']]].append(hit)
    def summary(groups):
        return {key: {'rows': len(hits), 'accuracy': sum(hits)/len(hits)}
                for key, hits in sorted(groups.items())}
    per_subject = summary(subjects)
    return {'rows': len(rows), 'failed_rows': sum('probabilities' not in r for r in records),
            'accuracy': sum(sum(hits) for hits in subjects.values())/len(rows),
            'subject_macro_accuracy': sum(s['accuracy'] for s in per_subject.values())/len(per_subject),
            'per_subject': per_subject, 'per_category': summary(categories)}
