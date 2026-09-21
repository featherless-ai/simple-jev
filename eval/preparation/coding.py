"""Prepare original coding benchmark artifacts without inference.

Reads a pinned local checkout, hashes every input, and never executes benchmark
code. CodeComplex uses the authors' 980-row LLM test split. BCB uses original
test pairs.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from adapters import choice, binary_battery
from preparation.external import canonical

ROOT=Path(__file__).resolve().parents[1]
LABELS=['constant','logn','linear','nlogn','quadratic','cubic','exponential']


def complexity(records):
    result=[]
    for i,r in enumerate(records):
        messages=r['messages']
        if [m['role'] for m in messages]!=['system','user','assistant']: raise ValueError('Unexpected CodeComplex message layout')
        gold=messages[-1]['content'].removeprefix('complexity: ').strip()
        gold={'np':'exponential','factorial':'exponential'}.get(gold,gold)
        # Preserve the authors' full task context, but never include their answer.
        result.append(canonical(str(i),{'system_instructions':messages[0]['content'],'task':messages[1]['content']},
            'Select the worst-case time complexity of the whole supplied program.',
            [dict(id=x,description=x) for x in LABELS],LABELS.index(gold),'complexity'))
    choice.validate(result)
    return result


def clones(functions,pairs):
    funcs={str(r['idx']):r['func'] for r in functions}
    if len(funcs)!=len(functions): raise ValueError('Duplicate function IDs')
    result=[]
    for line in pairs.splitlines():
        if not line.strip(): continue
        a,b,y=line.split()
        result.append({'id':f'{a}-{b}','state':{'code_a':funcs[a],'code_b':funcs[b]},
            'questions':{'equivalent':{'type':'noul','instructions':'Are these two functions semantically equivalent code clones?'}},
            'targets':{'equivalent':{'label':int(y)}}})
    binary_battery.validate(result)
    return result


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('suite',choices=['codecomplex-test','bigclonebench-test'])
    p.add_argument('--checkout',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();meta=json.loads((ROOT/'vendor/coding'/f'{a.suite}.json').read_text())
    if subprocess.check_output(['git','-C',str(a.checkout),'rev-parse','HEAD'],text=True).strip()!=meta['revision']: p.error('Wrong checkout revision')
    if a.output.exists() or a.output.with_suffix('.provenance.json').exists(): p.error('Output already exists')
    hashes={}
    def read(path,kind='jsonl'):
        raw=path.read_bytes();sha=hashlib.sha256(raw).hexdigest();hashes[str(path)]=sha
        relative=str(path.relative_to(a.checkout)) if path.is_relative_to(a.checkout) else None
        expected=meta['files'].get(relative)
        if expected and sha!=expected: raise ValueError('Pinned input hash mismatch')
        if kind=='text': return raw.decode()
        return [json.loads(l) for l in raw.splitlines() if l.strip()]
    if a.suite=='codecomplex-test': rows=complexity(read(a.checkout/'LLM-qlora/codecomplex-simple/test_dataset.json'))
    elif a.suite=='bigclonebench-test':
        base=a.checkout/'Code-Code/Clone-detection-BigCloneBench/dataset'
        rows=clones(read(base/'data.jsonl'),read(base/'test.txt','text'))
    if len(rows)!=meta['rows']: raise ValueError('Unexpected benchmark row count')
    content=''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows)
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(content)
    a.output.with_suffix('.provenance.json').write_text(json.dumps({'source':meta,'files':hashes,'rows':len(rows),
        'dataset_sha256':hashlib.sha256(content.encode()).hexdigest(),
        'preparer_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},indent=2)+'\n')
    print(f'Prepared {len(rows)} cases; no inference performed')


if __name__=='__main__': main()
