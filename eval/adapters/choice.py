"""Reusable option-choice adapter; accepts SemIf rows and other datasets in this format."""
import collections
import math
import statistics

def request_for(row, model):
    """Send only state, question, and candidates; never gold or provenance."""
    return {'model': model, 'state': row['state'], 'questions': {'decision': {
        'type': 'choice', 'instructions': row['question'],
        'criteria': {o['id']: o['description'] for o in row['options']}}}}


def probabilities(row, response):
    """Require a full, finite distribution; tolerate 2% rounding then normalize."""
    answer = response['answers']['decision']
    ids = [o['id'] for o in row['options']]
    p = answer['probabilities']
    if set(p) != set(ids):
        raise ValueError('Response labels differ from requested labels')
    values = [p[k] for k in ids]
    if any(type(x) not in (int, float) or not math.isfinite(x) or not 0 <= x <= 1 for x in values):
        raise ValueError('Invalid probabilities')
    total = sum(values)
    if not total or abs(total - 1) > .02:
        raise ValueError('Probabilities do not sum to one')
    return [x / total for x in values]


def summarize(rows, records):
    """Failures count as wrong; distribution metrics explicitly exclude failures."""
    groups, families = collections.defaultdict(list), collections.defaultdict(lambda: collections.defaultdict(list))
    tv = collections.defaultdict(list)
    for row, record in zip(rows, records):
        p = record.get('probabilities')
        correct = int(p is not None and max(range(len(p)), key=p.__getitem__) == row['label'])
        groups[row['group_id']].append(correct)
        families[row['family']][row['label']].append(correct)
        if p is not None and row.get('target_distribution') is not None:
            tv[row['group_id']].append(sum(abs(a-b) for a,b in zip(p,row['target_distribution'])) / 2)
    return {'rows': len(rows), 'successful_rows': sum('probabilities' in r for r in records),
        'failed_rows': sum('probabilities' not in r for r in records),
        'accuracy': sum(sum(v) for v in groups.values()) / len(rows),
        'equal_case_modal_agreement': statistics.mean(statistics.mean(v) for v in groups.values()),
        'mean_family_balanced_accuracy': statistics.mean(statistics.mean(statistics.mean(v) for v in labels.values()) for labels in families.values()),
        'equal_case_total_variation_successful_only': statistics.mean(statistics.mean(v) for v in tv.values()) if tv else None,
        'total_variation_rows': sum(map(len, tv.values()))}



def validate(rows):
    if not rows or len({r['id'] for r in rows}) != len(rows):
        raise ValueError('Dataset must have unique row IDs and at least one row')
    for row in rows:
        ids = [o['id'] for o in row['options']]
        if any(not isinstance(k,str) or not k for k in ids) or len(ids) < 2 or len(set(ids)) != len(ids):
            raise ValueError('Invalid candidate IDs')
        if type(row['label']) is not int or not 0 <= row['label'] < len(ids):
            raise ValueError('Invalid gold label')
        for key in ('id','group_id','family'):
            if not isinstance(row[key],str) or not row[key]:
                raise ValueError('Missing row identity, group, or family')
        target = row.get('target_distribution')
        if target is not None and (len(target) != len(ids) or any(type(x) not in (int,float) or not math.isfinite(x) or not 0 <= x <= 1 for x in target) or abs(sum(target)-1)>1e-6):
            raise ValueError('Invalid reference distribution')
        request_for(row,'validation')


def parse_response(row, response):
    return {'probabilities': probabilities(row,response)}
