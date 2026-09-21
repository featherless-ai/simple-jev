"""Native Choice/Noul/Score interpretation for JevBench public tasks.

Preserves upstream question criteria and maps native probabilities into declared
label order. Summary metrics are our common quality metrics, not JevBench's
four-axis leaderboard composite.
"""
from . import choice
import math


def request_for(row, model):
    return {'model':model,'state':row['state'],'questions':{'decision':row['native_question']}}


def validate(rows):
    choice.validate(rows)
    for row in rows:
        q = row['native_question']
        ids = [o['id'] for o in row['options']]
        if q['type'] == 'noul':
            if set(ids) != {'yes','no'}: raise ValueError('Noul labels must be yes/no')
        elif q['type'] == 'choice':
            if set(q['criteria']) != set(ids): raise ValueError('Choice criteria mismatch')
        elif q['type'] == 'score':
            if ids != [str(i) for i in range(len(q['criteria']))]: raise ValueError('Score labels mismatch')
        else: raise ValueError('Unsupported primitive')


def parse_response(row, response):
    answer = response['answers']['decision']
    if answer['type'] != row['native_question']['type']: raise ValueError('Answer type mismatch')
    if answer['type'] == 'noul':
        p = answer['noul']
        if type(p) not in (int,float) or not math.isfinite(p) or not 0 <= p <= 1: raise ValueError('Invalid Noul')
        response = {'answers':{'decision':{'probabilities':{'yes':p,'no':1-p}}}}
    return choice.parse_response(row,response)


summarize = choice.summarize
