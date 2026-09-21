"""Browse the evaluation taxonomy without loading datasets or making API calls.

Run `python3 eval/catalog.py` for all suites, or filter by --category and/or
--language-group. --write-doc regenerates EVAL_CATALOG.md from the manifests.
Listing an entry does not mean its dataset has been prepared locally or that
its original full study is reproduced.
"""
import argparse
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent


def entries():
    for path in sorted(ROOT.glob('suites/*/*.json')):
        yield path,json.loads(path.read_text())


def render(category=None,language_group=None):
    taxonomy=json.loads((ROOT/'taxonomy.json').read_text())['categories']
    lines=['# Evaluation catalog','',
           'Each eval has one placement: modality → language → task category → task type.',
           'Text categories separate **Model knowledge**, **Classification / decision**, and **Ranking — supplied context**.',
           'Multilingual includes non-English suites; exact language metadata is retained.',
           'This is a catalog, not a combined leaderboard. See [grouping rules](#grouping-rules).','']
    all_entries=[(p,d) for p,d in entries() if not d.get('aggregate_children')]
    for vision,heading in ((False,'Text-based'),(True,'Vision')):
        if category and (category=='vision')!=vision: continue
        lines+=['## '+heading,'']
        for multilingual,label in ((False,'English'),(True,'Multilingual')):
            if language_group and (language_group!='english')!=multilingual: continue
            selected=[(p,d) for p,d in all_entries
                      if (d['modality']=='image')==vision
                      and (d['language_group']!='english')==multilingual
                      and (not category or d['category']==category)
                      and (not language_group or d['language_group']==language_group)]
            lines+=['### '+label,'']
            if not selected:
                lines+=['No suites added yet.','']
                continue
            for key,group in taxonomy.items():
                if (key=='vision')!=vision or (category and key!=category): continue
                if not vision: lines+=['#### '+group['title'],'']
                for sub,title in group['subcategories'].items():
                    rows=[(p,d) for p,d in selected if d['category']==key and d['subcategory']==sub]
                    lines+=[('#### ' if vision else '##### ')+title,'']
                    if not rows:
                        lines+=['No dedicated suite added yet.','']
                        continue
                    lines+=['| Suite | Task detail | Language group | Main metric / execution |',
                            '| --- | --- | --- | --- |']
                    for p,d in rows:
                        metric=d['headline_metric']
                        detail=d.get('task_detail',sub).replace('-',' ')
                        lines.append(f"| [{d['id']}](../{p.relative_to(ROOT).as_posix()}) | {detail} | {d['language_group']} | {metric} |")
                    lines+=['']
    lines+=['## Grouping rules','',
      '- **One placement per eval.** Text uses a domain category followed by model knowledge, classification/decision, or ranking. Original task detail remains metadata.',
      '- **Language group, languages and modality** remain separate manifest fields. English describes question/framing language; image text may differ.',
      '- **Conditions are separate suites**, not new capabilities: clean/STT, question language, negative sampling, independent/final labels, and context ablations.',
      '- **Knowledge is not the same as classification.** Model knowledge tests ask for facts/domain answers without a supporting reference passage. Classification/decision tests may use supplied evidence and learned reasoning. Ranking tests supply candidate information but can still require learned concepts; these are task placements, not proof of zero knowledge dependence.',
      '- **Mixed benchmarks are split using upstream labels.** MME, JevBench and Korean knowledge/context conditions have disjoint child suites; original aggregate manifests remain available but are omitted from the category tables to avoid duplication. See [split definitions](SPLIT_SUITES.md). Object presence tests do not imply bounding-box detection.',
      '- **Domain placement:** code retrieval is Coding / Ranking; tool catalog retrieval is Agentic / Ranking; financial retrieval and RAG evidence are Corporate Policies & Documents. General language & Others is the final catch-all, including broad scientific and general retrieval.',
      '- **Difficulty and domain are not quality rankings.** JevBench tiers are separate conditions; medical/security labels do not imply a specialist model is required.',
      '- **Do not average unlike metrics.** MME score, Brier, accuracy, F1 and NDCG have different meanings. Related variants also share data.',
      '- **Availability is independent of classification.** Suites may need local data preparation before execution.',
      '', '## Scope and preparation','',
      '- [Availability audit and removed entries](AVAILABILITY_AUDIT.md)',
      '- [Core eval framework and SemIf](../README.md)',
      '- [Knowledge benchmarks](KNOWLEDGE_SUITES.md)',
      '- [Category and project reporting](REPORTING.md)',
      '- [Code classification](CODING_SUITES.md)',
      '- [Legal, tool and security benchmarks](DOMAIN_BENCHMARKS.md)',
      '- [JevBench, JEVfire and RAG](EXTERNAL_SUITES.md)',
      '- [Korean study, catalog search and jevtest](ADDITIONAL_SUITES.md)',
      '- [NPC, security, phishing and passage retrieval](SECURITY_AND_WORKFLOW_SUITES.md)',
      '- [Image classification](VISION_SUITES.md)',
      '- [MME, POPE and TallyQA](VISUAL_QA_SUITES.md)','',
      'Regenerate with `python3 eval/catalog.py --write-doc`.','']
    return '\n'.join(lines)



def render_projects():
    """A named-project index, keeping incompatible conditions separate."""
    from collections import defaultdict
    groups=defaultdict(list)
    for path,d in entries():
        groups[(d['project'],d['project_configuration'])].append((path,d))
    lines=['# Named evaluation projects','',
           'The result reporter recomputes full project/configuration scores from predictions.',
           'Category partitions are views of the same examples, not separate benchmarks.','',
           '| Project | Configuration | Run manifest(s) | Metric |',
           '| --- | --- | --- | --- |']
    for (name,config),members in sorted(groups.items()):
        parents=[(p,d) for p,d in members if d.get('aggregate_children')]
        selected=parents or members
        links=', '.join(f"[{d['id']}](../{p.relative_to(ROOT).as_posix()})" for p,d in selected)
        metrics=', '.join(sorted({d['headline_metric'] for _,d in selected}))
        lines.append(f'| {name} | {config} | {links} | {metrics} |')
    return '\n'.join(lines)+'\n'


def main():
    taxonomy=json.loads((ROOT/'taxonomy.json').read_text())
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--category',choices=list(taxonomy['categories']))
    p.add_argument('--language-group',choices=['english','non-english','multilingual'])
    p.add_argument('--view',choices=['category','project'],default='category')
    p.add_argument('--write-doc',action='store_true')
    a=p.parse_args()
    if a.write_doc and (a.category or a.language_group): p.error('Generate the full document without filters')
    if a.view=='project' and (a.category or a.language_group): p.error('Project view does not accept category filters')
    text=render_projects() if a.view=='project' else render(a.category,a.language_group)
    if a.write_doc:
        (ROOT/'notes/EVAL_CATALOG.md').write_text(render())
        (ROOT/'notes/PROJECT_CATALOG.md').write_text(render_projects())
    else: print(text)


if __name__=='__main__': main()
