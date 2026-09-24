"""One shared state, multiple labelled Choice questions, one HTTP request per case."""
from collections import defaultdict
from . import choice


def validate(rows):
    if not rows or len({r['id'] for r in rows}) != len(rows):
        raise ValueError('Expected distinct nonempty case IDs')
    option_ids = None
    for row in rows:
        if not isinstance(row.get('state'), str) or not row['state']:
            raise ValueError('Missing shared state')
        fields = row.get('fields')
        if not isinstance(fields, list) or len(fields) < 2 or len({f['id'] for f in fields}) != len(fields):
            raise ValueError('Every case needs multiple distinct questions')
        choice.validate([dict(f, state=row['state']) for f in fields])
        for field in fields:
            ids = [o['id'] for o in field['options']]
            if option_ids is None:
                option_ids = ids
            if ids != option_ids:
                raise ValueError('All questions must share the same class vocabulary')


def request_for(row, model):
    return {'model': model, 'state': row['state'], 'questions': {
        f['id']: {'type': 'choice', 'instructions': f['question'],
                  'criteria': {o['id']: o['description'] for o in f['options']}}
        for f in row['fields']}}


def parse_response(row, response):
    if set(response['answers']) != {f['id'] for f in row['fields']}:
        raise ValueError('Missing or unexpected answer keys')
    result = {}
    for field in row['fields']:
        answer = response['answers'][field['id']]
        if answer.get('type') != 'choice':
            raise ValueError('Expected Choice answer')
        result[field['id']] = choice.probabilities(field, {'answers': {'decision': answer}})
    return {'fields': result}


def summarize(rows, records):
    total = correct = exact = 0
    labels = defaultdict(lambda: [0, 0, 0])  # tp, fp, fn
    for row, record in zip(rows, records):
        hits = 0
        for field in row['fields']:
            ids = [o['id'] for o in field['options']]
            gold = field['label']
            p = record.get('fields', {}).get(field['id'])
            predicted = max(range(len(p)), key=p.__getitem__) if p is not None else None
            if predicted == gold:
                hits += 1
                labels[ids[gold]][0] += 1
            else:
                labels[ids[gold]][2] += 1
                if predicted is not None:
                    labels[ids[predicted]][1] += 1
        total += len(row['fields'])
        correct += hits
        exact += hits == len(row['fields'])
    vocabulary = [o['id'] for o in rows[0]['fields'][0]['options']]
    scores = [2 * labels[k][0] / (2 * labels[k][0] + labels[k][1] + labels[k][2])
              if sum(labels[k]) else 0 for k in vocabulary]
    return {'rows': len(rows), 'failed_rows': sum('fields' not in r for r in records),
            'questions': total, 'question_accuracy': correct / total,
            'exact_case_accuracy': exact / len(rows),
            'macro_f1': sum(scores) / len(scores)}
