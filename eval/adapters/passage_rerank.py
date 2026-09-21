"""Frozen BM25 candidates with the jev-rerank-bench four-level rubric.

Separate adapter from catalog search: relevance is >0, and MRR is truncated at
10. Only queries with relevant candidates enter ranking metrics, as upstream.
Failures remain zeros in that denominator. No-answer cases stay in raw results.
"""
import math
from . import graded_rag

RUBRIC=['The passage is off-topic for the query.',
        'The passage is on a related topic but does not supply what the query asks for.',
        'The passage partly supplies the information needed to answer or verify the query.',
        'The passage fully supplies the information needed to answer or verify the query.']


def validate(rows):
    if not rows or len({r['id'] for r in rows})!=len(rows): raise ValueError('Invalid IDs')
    for r in rows:
        if not r['passages'] or len(set(r['candidate_ids']))!=len(r['candidate_ids']): raise ValueError('Invalid candidates')
        if len(r['passages'])!=len(r['candidate_ids']): raise ValueError('Passage alignment mismatch')
        if any(not isinstance(t,str) for t in r['passages']): raise ValueError('Invalid passage')
        if any(type(g) not in (int,float) or not math.isfinite(g) or g<0 for g in r['labels'].values()): raise ValueError('Invalid qrels')


def request_for(row,model):
    ids=[f'p{i+1:02d}' for i in range(len(row['passages']))]
    return {'model':model,'state':{'query':row['query'],'passages':dict(zip(ids,row['passages']))},
            'questions':{k:{'type':'score','instructions':f'How well does passage {k} supply the information needed to answer or verify the query?', 'criteria':RUBRIC} for k in ids}}


def parse_response(row,response):
    # Reuse validated expected-score parsing with an explicit question-ID mapping.
    mapped={'answers':{f'c{i+1}':response['answers'][f'p{i+1:02d}'] for i in range(len(row['candidate_ids']))}}
    return graded_rag.parse_response(row,mapped)


def summarize(rows,records):
    n=0;ndcg=mrr=recall=top=0
    for row,record in zip(rows,records):
        gold={k:g for k,g in row['labels'].items() if g>0}
        if not set(gold).intersection(row['candidate_ids']): continue
        n+=1;rank=record.get('ranking',[])
        ideal=sum(g/math.log2(i+2) for i,g in enumerate(sorted(gold.values(),reverse=True)[:10]))
        ndcg+=sum(gold.get(k,0)/math.log2(i+2) for i,k in enumerate(rank[:10]))/ideal
        mrr+=next((1/(i+1) for i,k in enumerate(rank[:10]) if k in gold),0)
        recall+=len(set(rank[:5])&set(gold))/len(gold)
        top+=bool(rank and rank[0] in gold)
    return {'rows':len(rows),'failed_rows':sum('ranking' not in r for r in records),'ranking_rows':n,
            'no_relevant_candidate_rows':len(rows)-n,'ndcg_at_10':ndcg/n if n else None,
            'mrr_at_10':mrr/n if n else None,'recall_at_5':recall/n if n else None,'top_pick_accuracy':top/n if n else None}
