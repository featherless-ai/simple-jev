"""Two views of the SAME predictions: our categories and named eval projects.

Recompute metrics with adapters; never average suite percentages. Parent and child
overlaps are rejected rather than double-counted. Project conditions with different
protocols remain separate. Reports show full/partial suite coverage; completeness
does not imply zero failures. Input runs must share a model and endpoint.
"""
import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
from catalog import entries
from suites import ADAPTERS


def snapshot(suite):
    """Freeze routing and expected coverage at run time, not report time."""
    catalog = {d['id']: d for _, d in entries()}
    def leaves(d):
        return [leaf for id in d.get('aggregate_children', []) for leaf in leaves(catalog[id])] if d.get('aggregate_children') else [d]
    routing = leaves(suite)
    project, config = suite['project'], suite['project_configuration']
    expected = sorted(d['id'] for d in catalog.values() if not d.get('aggregate_children')
                      and (d['project'], d['project_configuration']) == (project, config))
    return {'project': project, 'configuration': config, 'expected_suites': expected,
            'partitions': [{k:d[k] for k in ('id','category','subcategory','modality','language_group','row_filter') if k in d} for d in routing]}


def route(row, meta):
    matches = []
    for part in meta['partitions']:
        f = part.get('row_filter')
        if f is None or row[f['field']] in f['values']:
            matches.append(part)
    if len(matches) != 1:
        raise ValueError('Every example must have exactly one reporting placement')
    return matches[0]


def collect(runs):
    projects, categories = {}, {}
    identity = None
    for root in runs:
        for manifest_path in sorted(Path(root).glob('*/manifest.json')):
            manifest = json.loads(manifest_path.read_text())
            current = (manifest['model'], manifest['endpoint'])
            if identity is None: identity = current
            if identity != current: raise ValueError('Do not combine different models/endpoints')
            meta = manifest.get('reporting')
            if meta is None:
                raise ValueError('Legacy run has no reporting snapshot; re-export it with audited rows rather than guessing')
            directory = manifest_path.parent
            raw = (directory/'scoring_rows.jsonl').read_bytes()
            if hashlib.sha256(raw).hexdigest() != manifest['scoring_rows_sha256']:
                raise ValueError('Scoring rows changed after the run')
            rows = [json.loads(l) for l in raw.splitlines() if l.strip()]
            records = [json.loads(l) for l in (directory/'predictions.jsonl').read_text().splitlines() if l.strip()]
            predictions = {r['id']:r for r in records}
            if len(predictions)!=len(records) or not set(predictions)<= {r['id'] for r in rows}:
                raise ValueError('Duplicate or unknown prediction IDs')
            key = (meta['project'],meta['configuration'])
            def bucket(target, key):
                if key not in target:
                    target[key] = {'rows':[], 'records':[], 'seen':set(), 'observed':set(),
                                   'expected':set(meta['expected_suites']), 'adapter':manifest['suite']['adapter'],
                                   'adapter_sha256':manifest['adapter_sha256'],
                                   'metric':manifest['suite'].get('headline_metric','accuracy'),
                                   'project':meta['project'],'configuration':meta['configuration']}
                b=target[key]
                if (b['adapter'],b['metric'],b['adapter_sha256']) != (manifest['suite']['adapter'],manifest['suite'].get('headline_metric','accuracy'),manifest['adapter_sha256']):
                    raise ValueError('Incompatible protocols within project configuration')
                if b['expected']!=set(meta['expected_suites']):raise ValueError('Project coverage definitions changed')
                return b
            project = bucket(projects,key)
            # Register partitions even if a process stopped before its first response.
            project['observed'].update(p['id'] for p in meta['partitions'])
            for row in rows:
                part = route(row,meta)
                category_key = (part['modality'],part['language_group'],part['category'],part['subcategory'],*key)
                category = bucket(categories,category_key)
                category['placement'] = list(category_key[:4])
                # Dataset namespace prevents unrelated query "0" IDs from colliding.
                item = (manifest['dataset_sha256'],row['id'])
                record = predictions.get(row['id'],{'id':row['id'],'error':'Missing prediction'})
                for b in (project,category):
                    if item in b['seen']:raise ValueError('Overlapping runs/parent and child results would double-count examples')
                    b['seen'].add(item);b['observed'].add(part['id'])
                    b['rows'].append(row);b['records'].append(record)
    if identity is None:raise ValueError('No run manifests found')
    def score(b):
        adapter = ADAPTERS[b['adapter']]
        if hashlib.sha256(Path(adapter.__file__).read_bytes()).hexdigest()!=b['adapter_sha256']:
            raise ValueError('Adapter changed; use the run revision to reproduce scores')
        metrics = adapter.summarize(b['rows'],b['records'])
        result={k:b[k] for k in ('project','configuration','metric')}
        result.update(score=metrics.get(b['metric']),metrics=metrics,
                      suites=sorted(b['observed']),missing_suites=sorted(b['expected']-b.get('project_observed', b['observed'])),
                      coverage='complete' if b['expected']<=b.get('project_observed', b['observed']) else 'partial')
        if 'placement' in b:result['placement']=b['placement']
        return result
    for b in categories.values():
        b['project_observed'] = projects[(b['project'], b['configuration'])]['observed']
    return {'model':identity[0],'endpoint':identity[1],
            'by_project':[score(b) for _,b in sorted(projects.items())],
            'by_category':[score(b) for _,b in sorted(categories.items())]}


def markdown(report, view):
    rows=report['by_'+view]
    lines=[f'# Evaluation results — {view}', '', f'Model: {report["model"]}', '',
           '| '+('Category | ' if view=='category' else '')+'Project | Configuration | Score | Metric | Questions | Failed | Project coverage |',
           '| '+('--- | ' if view=='category' else '')+'--- | --- | --- | --- | --- | --- | --- |']
    for r in rows:
        score='—' if r['score'] is None else f'{r["score"]:.6f}'
        prefix=' → '.join(r['placement'])+' | ' if view=='category' else ''
        lines.append(f'| {prefix}{r["project"]} | {r["configuration"]} | {score} | {r["metric"]} | {r["metrics"]["rows"]} | {r["metrics"].get("failed_rows",0)} | {r["coverage"]} |')
    lines+=['','Scores are recomputed from examples. Different metrics/configurations are not averaged.',
            'Complete means all declared suites are represented; failures and missing predictions remain in the metrics.','']
    return '\n'.join(lines)


def write_reports(root):
    report=collect([root])
    root=Path(root)
    (root/'report.json').write_text(json.dumps(report,indent=2)+'\n')
    for view in ('category','project'):
        (root/f'by-{view}.md').write_text(markdown(report,view))
    return report


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--run',type=Path,action='append',required=True)
    p.add_argument('--view',choices=['category','project'],default='project')
    p.add_argument('--json',action='store_true')
    a=p.parse_args();report=collect(a.run)
    print(json.dumps(report,indent=2) if a.json else markdown(report,a.view))


if __name__=='__main__':main()
