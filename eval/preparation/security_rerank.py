"""Import pinned community fixtures locally, without inference or source execution.

Reads a local upstream checkout at the revision in vendor/<repo>/source.json.
Phishing uses its prepared emails.jsonl; passage reranking requires its exported
*.docs.jsonl. Published security results supply only original inputs and labels,
never the previous model's predictions. Every consumed file is hashed.
"""
import argparse
import ast
import hashlib
import json
from pathlib import Path
import subprocess
from adapters import binary_battery, passage_rerank

ROOT=Path(__file__).resolve().parents[1]


def security(samples,battery,mode,context=True):
    rows=[]
    key='injection' if mode=='injection' else 'vulnerable'
    for i,s in enumerate(samples):
        state=({'assistant':battery['assistant'],'user_message':s['text']} if context else s['text']) if mode=='injection' else {'language':s['language'],'code':s['code']}
        r={'id':str(i),'state':state,'questions':battery[mode],'targets':{key:{'label':s['label']}}}
        if mode=='code': r['pair_id']=str(s.get('pair_id',0))
        rows.append(r)
    if mode=='code':
        pairs={}
        for r in rows: pairs.setdefault(r['pair_id'],[]).append(r['targets'][key]['label'])
        if any(sorted(y)!=[0,1] for y in pairs.values()): raise ValueError('Expected one secure/vulnerable sample per pair')
    binary_battery.validate(rows)
    return rows


def phishing(emails,source):
    # The QUESTIONS assignment is a literal dictionary. ast.literal_eval cannot
    # import modules, call functions, follow links in messages, or access keys.
    tree=ast.parse(source)
    values=[ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='QUESTIONS' for t in n.targets)]
    if len(values)!=1: raise ValueError('Expected one literal QUESTIONS assignment')
    rows=[{'id':str(e['id']),'state':e['email'],'questions':values[0],
           'targets':{'verdict':{'positive':'phishing','label':e['y']}}} for e in emails]
    binary_battery.validate(rows)
    return rows


def passages(candidates,documents):
    docs={r['did']:r['text'] for r in documents}
    if len(docs)!=len(documents): raise ValueError('Duplicate document IDs')
    rows=[]
    for c in candidates:
        ids=[d['did'] for d in c['present']]
        if not ids: raise ValueError('Empty frozen candidate list')
        rows.append({'id':c['qid'],'query':c['query'],'candidate_ids':ids,
                     'passages':[docs[k][:2000] for k in ids],'labels':c['relevant']})
    passage_rerank.validate(rows)
    return rows


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('source',choices=['security-injection','security-injection-no-context','security-code','phishing-verdict','passage-rerank'])
    p.add_argument('--checkout',type=Path,required=True)
    p.add_argument('--dataset',help='Upstream passage dataset, e.g. scifact or miracl-fr')
    p.add_argument('--output',type=Path,required=True)
    a=p.parse_args()
    repo='jev-sec-bench' if a.source.startswith('security') else 'jev-phishing-bench' if a.source=='phishing-verdict' else 'jev-rerank-bench'
    source=json.loads((ROOT/'vendor'/repo/'source.json').read_text())
    if subprocess.check_output(['git','-C',str(a.checkout),'rev-parse','HEAD'],text=True).strip()!=source['revision']: p.error('Checkout differs from pinned revision')
    if a.output.exists() or a.output.with_suffix('.provenance.json').exists(): p.error('Output exists')
    files={}
    def read(path,text=False):
        raw=path.read_bytes();files[str(path)]=hashlib.sha256(raw).hexdigest()
        if text: return raw.decode()
        return [json.loads(l) for l in raw.splitlines() if l.strip()] if path.suffix=='.jsonl' else json.loads(raw)
    if a.source.startswith('security'):
        mode='code' if a.source=='security-code' else 'injection'
        samples=read(a.checkout/f'results/{mode}.json')['samples']
        if len(samples)!=(400 if mode=='code' else 662): p.error('Unexpected security corpus size')
        rows=security(samples,read(ROOT/'vendor/jev-sec-bench/batteries.json'),mode,a.source!='security-injection-no-context')
    elif a.source=='phishing-verdict':
        emails=read(a.checkout/'data/emails.jsonl')
        if len(emails)!=2000: p.error('Expected 2000 prepared emails')
        rows=phishing(emails,read(a.checkout/'run_jev.py',text=True))
    else:
        available={p.stem.removeprefix('passage-rerank-') for p in (ROOT/'suites').glob('*/passage-rerank-*.json')}
        if a.dataset not in available: p.error('Unsupported passage dataset')
        rows=passages(read(a.checkout/f'candidates/{a.dataset}.jsonl'),read(a.checkout/f'candidates/{a.dataset}.docs.jsonl'))
    content=''.join(json.dumps(r,ensure_ascii=False,allow_nan=False)+'\n' for r in rows)
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(content)
    a.output.with_suffix('.provenance.json').write_text(json.dumps({'source':source,'variant':a.source,'dataset':a.dataset,
        'files':files,'rows':len(rows),'dataset_sha256':hashlib.sha256(content.encode()).hexdigest(),
        'converter_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},indent=2)+'\n')
    print(f'Prepared {len(rows)} rows; no inference performed')


if __name__=='__main__': main()
