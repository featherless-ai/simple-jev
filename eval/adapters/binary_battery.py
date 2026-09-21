"""Score labelled binary decisions while retaining the whole upstream battery.

A row contains model-visible state/questions and local targets. Each target has
an integer 0/1 label and, for Choice, the positive option ID. Auxiliary questions
are sent unchanged and retained in raw responses, but have no invented gold.
All metrics use a fixed >= 0.5 threshold. Failures lower coverage and all-target
accuracy; probability metrics explicitly use successful targets only.
"""
import math
from .choice import probabilities


def validate(rows):
    if not rows or len({r['id'] for r in rows}) != len(rows):
        raise ValueError('Expected unique nonempty rows')
    for r in rows:
        if not r['targets'] or not set(r['targets']) <= set(r['questions']):
            raise ValueError('Missing labelled questions')
        for key,t in r['targets'].items():
            if type(t['label']) is not int or t['label'] not in (0,1):
                raise ValueError('Expected binary label')
            q=r['questions'][key]
            if q['type']=='choice':
                if len(q['criteria'])!=2 or t['positive'] not in q['criteria']:
                    raise ValueError('Expected binary choice and positive ID')
            elif q['type']!='noul': raise ValueError('Expected Noul or binary Choice')
        if 'state' not in r: raise ValueError('Missing state')


def request_for(row,model):
    return {'model':model,'state':row['state'],'questions':row['questions']}


def parse_response(row,response):
    result={}
    for key,t in row['targets'].items():
        q=row['questions'][key];a=response['answers'][key]
        if a.get('type')!=q['type']: raise ValueError('Answer type mismatch')
        if q['type']=='noul': p=a['noul']
        else:
            ids=list(q['criteria'])
            ps=probabilities({'options':[{'id':k} for k in ids]}, {'answers':{'decision':a}})
            p=ps[ids.index(t['positive'])]
        if type(p) not in (int,float) or not math.isfinite(p) or not 0<=p<=1:
            raise ValueError('Invalid probability')
        result[key]=p
    return {'binary_probabilities':result}


def metrics(pairs):
    """Finite calibration metrics; AUC gives half credit to ties."""
    n=len(pairs)
    if not n: return {'successful_targets':0}
    tp=sum(p>=.5 and y==1 for p,y in pairs);fp=sum(p>=.5 and y==0 for p,y in pairs)
    fn=sum(p<.5 and y==1 for p,y in pairs);tn=n-tp-fp-fn
    pos=[p for p,y in pairs if y];neg=[p for p,y in pairs if not y]
    ece=0
    for b in range(10):
        cell=[(p,y) for p,y in pairs if min(int(p*10),9)==b]
        if cell: ece+=abs(sum(p-y for p,y in cell))/n
    return {'successful_targets':n,'precision':tp/(tp+fp) if tp+fp else 0,
            'recall':tp/(tp+fn) if tp+fn else 0,'false_positive_rate':fp/(fp+tn) if fp+tn else None,
            'f1':2*tp/(2*tp+fp+fn) if 2*tp+fp+fn else 0,
            'brier_successful_only':sum((p-y)**2 for p,y in pairs)/n,'ece_successful_only':ece,
            'auroc_successful_only':sum((p>q)+.5*(p==q) for p in pos for q in neg)/(len(pos)*len(neg)) if pos and neg else None}


def summarize(rows,records):
    pairs=[];correct=exact=0;groups={}
    for row,record in zip(rows,records):
        ps=record.get('binary_probabilities')
        if ps is None: continue
        hits=[]
        for key,t in row['targets'].items():
            p=ps[key];y=t['label'];pairs.append((p,y));hits.append((p>=.5)==bool(y))
        correct+=sum(hits);exact+=all(hits)
        if 'pair_id' in row and len(row['targets'])==1:
            key=next(iter(row['targets']));groups.setdefault(row['pair_id'],{})[row['targets'][key]['label']]=ps[key]
    total=sum(len(r['targets']) for r in rows)
    complete=[g for g in groups.values() if set(g)=={0,1}]
    result={'rows':len(rows),'failed_rows':sum('binary_probabilities' not in r for r in records),
            'targets':total,'coverage':len(pairs)/total,'accuracy':correct/total,'exact_set_accuracy':exact/len(rows),**metrics(pairs)}
    if any('pair_id' in r for r in rows):
        result.update(complete_pairs=len(complete),pair_order_accuracy_successful_only=sum(g[1]>g[0] for g in complete)/len(complete) if complete else None)
    return result
