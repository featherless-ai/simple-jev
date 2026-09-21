"""Original visual questions via Noul (MME/POPE) or count Choice (TallyQA).

One original question per call. MME's paired-image score is computed after both
calls; answers are never put in the context. Counting selects the most probable
integer, not a rounded expected Score. This is a constrained-answer Jev protocol,
not reproduction of an upstream generative model's decoding procedure.
"""
import base64
import math
from collections import defaultdict
from . import vision, choice
bind_assets=vision.bind_assets


def validate(rows):
    if not rows or len({r['id'] for r in rows})!=len(rows): raise ValueError('Invalid question IDs')
    groups=defaultdict(list)
    for r in rows:
        if not isinstance(r['question'],str) or not r['question']: raise ValueError('Missing question')
        if r['benchmark']=='tallyqa':
            if type(r['answer']) is not int or not 0<=r['answer']<=15: raise ValueError('Count outside original 0–15 answer space')
        elif r['benchmark'] in ('mme','pope'):
            if r['answer'] not in ('yes','no'): raise ValueError('Expected yes/no gold')
        else: raise ValueError('Unknown benchmark')
        if r['benchmark']=='mme': groups[(r['category'],r['image_id'])].append(r)
        vision.image_bytes(r)
    if any(len(rs)!=2 for rs in groups.values()): raise ValueError('MME requires both questions for each image')


def request_for(r,model):
    q={'type':'noul','instructions':r['question']}
    if r['benchmark']=='tallyqa': q={'type':'choice','instructions':r['question'],'criteria':{str(i):str(i) for i in range(16)}}
    return {'model':model,'messages':[{'role':'user','content':[{'type':'image_url','image_url':{'url':'data:image/png;base64,'+base64.b64encode(vision.image_bytes(r)).decode()}}]}], 'questions':{'decision':q}}


def parse_response(r,response):
    a=response['answers']['decision']
    if r['benchmark']=='tallyqa':
        if a.get('type')!='choice': raise ValueError('Expected Choice')
        ps=choice.probabilities({'options':[{'id':str(i)} for i in range(16)]},response)
        return {'prediction':max(range(16),key=ps.__getitem__),'probabilities':ps}
    p=a['noul']
    if a.get('type')!='noul' or type(p) not in (int,float) or not math.isfinite(p) or not 0<=p<=1: raise ValueError('Invalid Noul')
    return {'prediction':'yes' if p>=.5 else 'no','yes_probability':p}


def summarize(rows,records):
    correct=lambda r,p: 'prediction' in p and r['answer']==p['prediction']
    report={'rows':len(rows),'failed_rows':sum('prediction' not in p for p in records),
            'accuracy':sum(correct(r,p) for r,p in zip(rows,records))/len(rows)}
    if rows[0]['benchmark']=='mme':
        categories=defaultdict(list)
        for r,p in zip(rows,records): categories[r['category']].append((r,p))
        scores={}
        for cat,pairs in categories.items():
            images=defaultdict(list)
            for r,p in pairs: images[r['image_id']].append(correct(r,p))
            acc=sum(correct(r,p) for r,p in pairs)/len(pairs)
            plus=sum(all(hits) for hits in images.values())/len(images)
            scores[cat]={'accuracy':acc,'accuracy_plus':plus,'score':100*(acc+plus)}
        report.update(categories=scores,mme_score=sum(s['score'] for s in scores.values()))
    elif rows[0]['benchmark']=='pope':
        tp=fp=fn=yes=0
        for r,p in zip(rows,records):
            pred=p.get('prediction');yes+=pred=='yes'
            tp+=pred=='yes' and r['answer']=='yes';fp+=pred=='yes' and r['answer']=='no'
            fn+=pred!='yes' and r['answer']=='yes'
        report.update(precision=tp/(tp+fp) if tp+fp else 0,recall=tp/(tp+fn) if tp+fn else 0,
                      f1=2*tp/(2*tp+fp+fn) if 2*tp+fp+fn else 0,yes_ratio=yes/len(rows))
    else:
        for cat in ('simple','complex'):
            pairs=[(r,p) for r,p in zip(rows,records) if r['category']==cat]
            report[cat]={'rows':len(pairs),'accuracy':sum(correct(r,p) for r,p in pairs)/len(pairs) if pairs else None}
    return report
