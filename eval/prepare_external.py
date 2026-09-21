"""Prepare local benchmark inputs without model calls.

JevBench and JEVfire use pinned, vendored MIT fixtures. RAG consumes
upstream prepared artifacts, retaining provenance and input-file hashes. Never
invent unavailable private cases or replace frozen retrieval with fresh retrieval.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
from adapters import choice, typed, fields, rag

ROOT=Path(__file__).resolve().parent


def read(path):
    return [json.loads(line) for line in Path(path).read_text().splitlines() if line.strip()]


def canonical(id,state,question,options,label,family,group=None,**extra):
    return dict(id=id, state=state, question=question, options=options,label=label,
                family=family,group_id=group or id,**extra)


def jevbench(tier):
    result=[]
    for r in read(ROOT/f'vendor/jevbench/{tier}.jsonl'):
        q=r['question'];criteria=q.get('criteria');options=[]
        for k in r['labels']:
            description=(criteria or {}).get('true' if k=='yes' else 'false',k) if q['type']=='noul' else criteria[int(k)] if q['type']=='score' else criteria[k]
            options.append({'id':k,'description':description})
        target=r.get('expected_distribution')
        if isinstance(target,dict): target=[target[k] for k in r['labels']]
        result.append(canonical(r['id'],r['state'],q['instructions'],options,
            r['labels'].index(str(r['expected'])),r['family'],r.get('group'),
            native_question=q,provenance=r['provenance'],target_distribution=target))
    typed.validate(result)
    return result


def jevfire():
    # Execute only the pinned, reviewed fixture module shipped with this repository.
    path=ROOT/'vendor/jevfire/cases.py'
    spec=importlib.util.spec_from_file_location('jevfire_cases',path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    result=[]
    for case in module.benchmark_cases():
        fs=[]
        for name,field in case['schema'].items():
            values=[False,True] if field['type']=='boolean' else field['choices']
            ids=[str(v).lower() if type(v) is bool else v for v in values]
            fs.append(canonical(name,case['context'],field['description'],
                [dict(id=k,description=k) for k in ids],values.index(case['expected'][name]),'fields'))
        result.append({'id':case['id'],'state':case['context'],'fields':fs})
    fields.validate(result)
    return result


def rag_rows(documents,queries,candidates,branch):
    docs={r['doc_id']:r for r in read(documents)}
    qs={r['query_id']:r for r in read(queries)}
    frozen={}
    for r in read(candidates):
        if r['branch']!=branch: continue
        id=r['query_id']
        if id in frozen: raise ValueError('Duplicate query in frozen candidate branch')
        frozen[id]=r
    if not frozen: raise ValueError('No rows for requested candidate branch')
    if set(frozen)!=set(qs): raise ValueError('Candidate and query ID sets differ; select matching upstream split')
    result=[]
    for id,r in frozen.items():
        q=qs[id]
        result.append({'id':id,'query':q['text'],'relevant_ids':q['relevant_doc_ids'],
                       'candidates':[{'id':k,'text':docs[k]['text']} for k in r['candidate_ids']]})
    rag.validate(result)
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',choices=['jevbench-original','jevbench-easy','jevbench-hard','jevfire','rag'])
    parser.add_argument('--documents',type=Path)
    parser.add_argument('--queries',type=Path)
    parser.add_argument('--candidates',type=Path,help='Upstream result JSONL containing frozen candidate_ids')
    parser.add_argument('--branch',default='A',help='Baseline branch in frozen retrieval results')
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    if args.output.exists() or args.output.with_suffix('.provenance.json').exists(): parser.error('Output already exists')
    if args.source.startswith('jevbench-'): rows=jevbench(args.source.split('-')[1])
    elif args.source=='jevfire': rows=jevfire()
    else:
        if not all([args.documents,args.queries,args.candidates]): parser.error('--documents, --queries and --candidates are required')
        rows=rag_rows(args.documents,args.queries,args.candidates,args.branch)
    files=[p for p in (args.documents,args.queries,args.candidates) if p]
    meta={'source':args.source,'rows':len(rows),'files':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in files},
          'converter_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
          'upstream':{p.parent.name:json.loads(p.read_text()) for p in (ROOT/'vendor').glob('*/source.json')}}
    args.output.parent.mkdir(parents=True,exist_ok=True)
    content=''.join(json.dumps(row,ensure_ascii=False)+'\n' for row in rows)
    meta['dataset_sha256']=hashlib.sha256(content.encode()).hexdigest()
    args.output.write_text(content)
    args.output.with_suffix('.provenance.json').write_text(json.dumps(meta,indent=2)+'\n')
    print(f'Prepared {len(rows)} rows at {args.output}; no inference performed')


if __name__=='__main__': main()
