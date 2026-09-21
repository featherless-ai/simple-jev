"""Search reranking with native Score questions and fractional relevance labels.

Match the source's linear-gain NDCG@10, full-list MRR and P@3 (label >= 2).
The ideal ranking includes the entire judged pool, including unretrieved items.
Unjudged candidates receive zero relevance, matching the source convention.
Scores use the API's expected Score value, not the most likely rating. Ties
retain candidate order. Failed requests contribute zero to ranking metrics.
"""
import math

LEGEND = ['Irrelevant', 'Marginally related', 'Relevant', 'Exactly what was asked for']


def validate(rows):
    if not rows or len({r['id'] for r in rows}) != len(rows):
        raise ValueError('Invalid query IDs')
    for r in rows:
        if not r['candidate_ids'] or len(set(r['candidate_ids'])) != len(r['candidate_ids']):
            raise ValueError('Invalid candidates')
        if not isinstance(r['state'], str) or not r['labels']:
            raise ValueError('Missing state/labels')
        if any(type(g) not in (int,float) or not math.isfinite(g) or not 0 <= g <= 3 for g in r['labels'].values()):
            raise ValueError('Invalid graded relevance')


def request_for(row, model):
    return {'model': model, 'state': row['state'], 'questions': {
        f'c{i}': {'type': 'score', 'instructions': f'How relevant is candidate c{i} to the query?',
                  'criteria': LEGEND} for i in range(1,len(row['candidate_ids'])+1)}}


def parse_response(row, response):
    scores=[]
    for i in range(1,len(row['candidate_ids'])+1):
        a=response['answers'][f'c{i}'];p=a['score']
        if a.get('type') != 'score' or type(p) not in (int,float) or not math.isfinite(p) or not 0 <= p <= 3:
            raise ValueError('Invalid score')
        scores.append(p)
    return {'ranking': [row['candidate_ids'][i] for i in sorted(range(len(scores)),key=lambda i:-scores[i])], 'scores': scores}


def summarize(rows, records):
    ndcg=mrr=precision=0
    for row, record in zip(rows,records):
        rank=record.get('ranking',[]);gold=row['labels']
        ideal=sum(g/math.log2(i+2) for i,g in enumerate(sorted(gold.values(),reverse=True)[:10]))
        if ideal: ndcg+=sum(gold.get(d,0)/math.log2(i+2) for i,d in enumerate(rank[:10]))/ideal
        mrr+=next((1/(i+1) for i,d in enumerate(rank) if gold.get(d,0)>=2),0)
        precision+=sum(gold.get(d,0)>=2 for d in rank[:3])/3
    n=len(rows)
    return {'rows':n,'failed_rows':sum('ranking' not in r for r in records),
            'ndcg_at_10':ndcg/n,'mrr':mrr/n,'precision_at_3':precision/n}
