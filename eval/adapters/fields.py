"""JEVfire fixtures as one batched classifier request per original case.

Boolean fields use two-option Choice, preserving a finite-value decision contract.
This does not recreate JEVfire's vLLM cache-salt or generation timing experiment.
"""
from . import choice


def validate(rows):
    if not rows or len({r['id'] for r in rows}) != len(rows): raise ValueError('Invalid cases')
    for row in rows:
        if not row['fields']: raise ValueError('Empty case')
        if len({f['id'] for f in row['fields']}) != len(row['fields']): raise ValueError('Duplicate field')
        choice.validate(row['fields'])


def request_for(row,model):
    return {'model':model,'state':row['state'],'questions':{
        f['id']:choice.request_for(f,model)['questions']['decision'] for f in row['fields']}}


def parse_response(row,response):
    return {'fields':{f['id']:choice.probabilities(f,{'answers':{'decision':response['answers'][f['id']]}}) for f in row['fields']}}


def summarize(rows,records):
    total=correct=exact=0
    for row,record in zip(rows,records):
        hits=0
        for f in row['fields']:
            p=record.get('fields',{}).get(f['id'])
            hits += int(p is not None and max(range(len(p)),key=p.__getitem__)==f['label'])
        total += len(row['fields']);correct += hits;exact += hits==len(row['fields'])
    return {'rows':len(rows),'failed_rows':sum('fields' not in r for r in records),
            'fields':total,'field_accuracy':correct/total,'exact_case_accuracy':exact/len(rows)}
