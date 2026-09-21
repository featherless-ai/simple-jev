"""Offline importers for additional community evaluations.

No inference, source execution, or network access. Read a local pinned checkout
or an already prepared artifact. Hash every consumed file into a provenance
sidecar. See ADDITIONAL_SUITES.md for acquisition, licensing, and scope limits.
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
from adapters import typed, graded_rag
from prepare_external import canonical, read

ROOT = Path(__file__).resolve().parent


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def korean(manifest, condition):
    """Only public-gold main conditions; development/clinical/robustness excluded."""
    body = dict(manifest)
    expected = body.pop('sha256')
    if digest(body) != expected:
        raise ValueError('Upstream manifest checksum mismatch')
    result=[]
    for e in body['evaluations']:
        if digest(e['request']) != e['request_hash']:
            raise ValueError('Upstream request checksum mismatch')
        if e['condition'] != condition or e.get('review_status','public_gold') != 'public_gold' or e.get('stage') not in (1,2):
            continue
        q=e['request']['questions']['answer']
        if q['type']=='noul':
            ids=['no','yes'];descriptions=['Not equivalent','Equivalent'];gold={'0':'no','1':'yes'}[str(e['gold'])]
        else:
            ids=list(q['criteria']);descriptions=list(q['criteria'].values());gold=str(e['gold'])
        result.append(canonical(e['eval_id'],e['request']['state'],q['instructions'],
            [dict(id=k,description=d) for k,d in zip(ids,descriptions)],ids.index(gold),e['task'],
            e['case_id'],native_question=q,condition=condition))
    typed.validate(result)
    return result


def search(load, form, label_set):
    """Rerank the original frozen bge-m3 top 30; do not regenerate retrieval."""
    queries=load('data/queries.json');runs=load('results/runs.json')['bge-m3']
    catalog={r['f']:r for r in load('data/search-index.json.gz')['skills']}
    labels={}
    for r in load(f'data/labels_{label_set}.jsonl'):
        labels.setdefault(r['query_id'],{})[r['repo']]=r['label']
    def clean(x): return str(x or '').encode('utf-8','ignore').decode('utf-8')
    result=[]
    for n,q in enumerate(queries):
        if q['form'] != form: continue
        key=f'q{n:03d}';ids=runs[key][:30];lines=[]
        for i,k in enumerate(ids,1):
            s=catalog[k];stars=int(s.get('s') or 0);stars=f'{stars/1000:.1f}k' if stars>=1000 else str(stars)
            tags=' '.join(clean(t) for t in (s.get('t') or [])[:6]);kw=' '.join(clean(t) for t in (s.get('wk') or [])[:8])
            lines.append(f"c{i}: {k} | stars={stars} | category={clean(s.get('c'))} | {clean(s.get('d'))[:160]}"+
                         (f' | tags: {tags}' if tags else '')+(f' | 场景: {kw}' if kw else ''))
        state=(f"Search query: {q['q']}\nA user typed this query into a catalog of AI agent skills, MCP servers and coding-agent tools. "
               "Judge how well each candidate satisfies the query's intent (language of the query does not matter).\n"+'\n'.join(lines))
        result.append({'id':key,'state':state,'candidate_ids':ids,'labels':labels[key],
                       'query_form':form,'split':q['split'],'label_set':label_set})
    graded_rag.validate(result)
    return result


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('source',choices=['korean','search'])
    p.add_argument('--input',type=Path,help='Prepared Korean manifest JSON')
    p.add_argument('--checkout',type=Path,help='Pinned local search benchmark checkout')
    p.add_argument('--condition',choices=['en_en','ko_en','ko_ko'])
    p.add_argument('--form',choices=['en','syn','mix','sim'])
    p.add_argument('--label-set',choices=['final','llm'],default='llm')
    p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();files={}
    def load(path):
        path=Path(path);raw=path.read_bytes();files[str(path)]=hashlib.sha256(raw).hexdigest()
        if path.suffix=='.gz': raw=gzip.decompress(raw)
        if path.suffix=='.jsonl': return [json.loads(line) for line in raw.splitlines() if line.strip()]
        return json.loads(raw)
    sidecar=a.output.with_suffix('.provenance.json')
    if a.output.exists() or sidecar.exists(): p.error('Output already exists')
    if a.source=='search':
        if not a.checkout or not a.form: p.error('--checkout and --form required')
        # Require exact source revision, while file hashes also expose dirty artifacts.
        import subprocess
        pinned=json.loads((ROOT/'vendor/jev-search-rerank-eval/source.json').read_text())['revision']
        if subprocess.check_output(['git','-C',str(a.checkout),'rev-parse','HEAD'],text=True).strip()!=pinned:
            p.error('Search checkout differs from pinned revision')
        rows=search(lambda path:load(a.checkout/path),a.form,a.label_set)
    elif a.source=='korean':
        if not a.input or not a.condition: p.error('--input and --condition required')
        rows=korean(load(a.input),a.condition)
    content=''.join(json.dumps(r,ensure_ascii=False,allow_nan=False)+'\n' for r in rows)
    meta={'source':a.source,'rows':len(rows),'condition':a.condition,'form':a.form,'label_set':a.label_set,
          'files':files,'converter_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
          'dataset_sha256':hashlib.sha256(content.encode()).hexdigest(),
          'upstream':{p.parent.name:json.loads(p.read_text()) for p in (ROOT/'vendor').glob('*/source.json')}}
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(content);sidecar.write_text(json.dumps(meta,indent=2)+'\n')
    print(f'Prepared {len(rows)} rows; no inference performed')


if __name__=='__main__': main()
