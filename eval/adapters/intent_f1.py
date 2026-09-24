"""77-intent Choice classification: full-denominator accuracy and macro-F1."""
from adapters import choice


def request_for(row, model):
    return choice.request_for(row, model)


def parse_response(row, response):
    return choice.parse_response(row, response)


def validate(rows):
    choice.validate(rows)
    expected = [o['id'] for o in rows[0]['options']]
    if len(expected) != 77 or any([o['id'] for o in r['options']] != expected for r in rows):
        raise ValueError('Every intent row must use the same 77 labels')
    if len({r['label'] for r in rows}) != 77:
        raise ValueError('Expected all 77 gold classes')


def summarize(rows, records):
    counts = [[0, 0, 0] for _ in range(77)]  # true positive, false positive, false negative
    correct = 0
    for row, record in zip(rows, records):
        gold = row['label']
        p = record.get('probabilities')
        predicted = max(range(77), key=p.__getitem__) if p is not None else None
        if predicted == gold:
            correct += 1
            counts[gold][0] += 1
        else:
            counts[gold][2] += 1
            if predicted is not None:
                counts[predicted][1] += 1
    f1 = [2 * tp / (2 * tp + fp + fn) if tp + fp + fn else 0
          for tp, fp, fn in counts]
    return {'rows': len(rows), 'successful_rows': sum('probabilities' in r for r in records),
            'failed_rows': sum('probabilities' not in r for r in records),
            'accuracy': correct / len(rows), 'macro_f1': sum(f1) / 77}
