"""Prepare labelled legal, tool and security benchmarks without inference.

Downloads occur only with --download. HF parquet files come from pinned revisions.
LegalBench-RAG uses the published local release (never regenerate it with an LLM).
All source bytes and the output are hashed. BM25 candidate selection uses only
query and corpus text, never labels; missed gold remains in metric denominators.
Install pyarrow for parquet sources; JSON/ZIP preparation is standard-library only.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import heapq
import io
import json
import math
from pathlib import Path
import re
import urllib.request
import unicodedata
import zipfile

from adapters import choice, binary_battery, domain_ranking
from prepare_external import canonical

ROOT = Path(__file__).resolve().parent
META = ROOT / 'vendor/domain-benchmarks'
CYBER_TASKS = ('attack_retrieval', 'sigma_retrieval', 'cve_similarity',
               'cwe_retrieval', 'threat_report_retrieval', 'soc_playbook')
LEGAL_PARTS = ('cuad', 'maud', 'contractnli', 'privacy_qa')
SUITES = (['legal-contractnli', 'legal-unfair-tos', 'legal-casehold'] +
          ['legal-rag-' + x.replace('_', '-') for x in LEGAL_PARTS] +
          ['toolret-' + x for x in ('web', 'code', 'customized')] +
          ['cybersec-' + x.replace('_', '-') for x in CYBER_TASKS])


def metadata(name):
    return json.loads((META / (name + '.json')).read_text())


class Inputs:
    """Cache explicit downloads and record every consumed source file."""
    def __init__(self, root, download=False):
        self.root = root
        self.download = download
        self.hashes = {}

    def read(self, relative, url=None):
        path = self.root / relative
        if not path.exists():
            if not self.download or not url:
                raise ValueError(f'Missing {path}; obtain the published release or use --download for supported sources')
            path.parent.mkdir(parents=True, exist_ok=True)
            raw = urllib.request.urlopen(url, timeout=120).read()
            path.write_bytes(raw)
        raw = path.read_bytes()
        self.hashes[relative] = hashlib.sha256(raw).hexdigest()
        return raw

    def parquet(self, source):
        import pyarrow.parquet as pq
        m = metadata(source)
        for file in m['files']:
            relative = f"{source}/{m['revision']}/{file}"
            raw = self.read(relative, f"https://huggingface.co/datasets/{m['repository']}/resolve/{m['revision']}/{file}")
            table = pq.read_table(io.BytesIO(raw))
            yield file, table


def contractnli(data):
    options = [{'id': x, 'description': x} for x in ('Entailment', 'Contradiction', 'NotMentioned')]
    rows = []
    for doc in data['documents']:
        annotations = doc['annotation_sets']
        if len(annotations) != 1:
            raise ValueError('Expected original single annotation set')
        for key, target in annotations[0]['annotations'].items():
            gold = target['choice']
            rows.append(canonical(f"{doc['id']}-{key}", doc['text'],
                'Classify this statement against the contract: ' + data['labels'][key]['hypothesis'],
                options, [o['id'] for o in options].index(gold), 'contractnli', str(doc['id'])))
    choice.validate(rows)
    return rows


def lexglue(kind, records, labels):
    if kind not in ('unfair_tos', 'case_hold'):
        raise ValueError('Unsupported LexGLUE task')
    rows = []
    for i, r in enumerate(records):
        if kind == 'unfair_tos':
            if any(type(x) is not int or not 0 <= x < len(labels) for x in r['labels']):
                raise ValueError('Invalid multilabel target')
            rows.append({'id': str(i), 'state': r['text'],
                         'questions': {str(j): {'type': 'noul', 'instructions':
                             f'Does this provision contain a potentially unfair term in the category "{name}"?'}
                             for j, name in enumerate(labels)},
                         'targets': {str(j): {'label': int(j in r['labels'])} for j in range(len(labels))}})
        else:
            names = r['endings']
            rows.append(canonical(str(i), r['context'],
                'Select the holding that best completes the case context.',
                [{'id': str(j), 'description': name} for j, name in enumerate(names)],
                r['label'], kind))
    (binary_battery if kind == 'unfair_tos' else choice).validate(rows)
    return rows


class BM25:
    """Deterministic Okapi BM25 (k1=1.2, b=0.75), stable corpus-ID tie breaking."""
    def __init__(self, corpus):
        if not corpus:
            raise ValueError('Empty corpus')
        self.corpus = corpus
        self.ids = sorted(corpus)
        self.postings = defaultdict(list)
        self.lengths = {}
        for id in self.ids:
            counts = Counter(self.tokens(corpus[id]['text']))
            self.lengths[id] = sum(counts.values())
            for token, freq in counts.items():
                self.postings[token].append((id, freq))
        self.avg = sum(self.lengths.values()) / len(self.ids) or 1

    @staticmethod
    def tokens(text):
        return re.findall(r'\w+', text.casefold())

    def select(self, query, k):
        scores = defaultdict(float)
        for token in sorted(set(self.tokens(query))):
            posting = self.postings.get(token, [])
            idf = math.log(1 + (len(self.ids) - len(posting) + .5) / (len(posting) + .5))
            for id, freq in posting:
                norm = freq + 1.2 * (.25 + .75 * self.lengths[id] / self.avg)
                scores[id] += idf * freq * 2.2 / norm
        ranked = heapq.nsmallest(k, scores, key=lambda id: (-scores[id], id))
        if len(ranked) < k:
            ranked += [id for id in self.ids if id not in scores][:k-len(ranked)]
        return [dict(id=id, **self.corpus[id]) for id in ranked[:k]]


def ranking(corpus, queries, kind, k):
    index = BM25(corpus)
    rows = []
    corpus_ids = set(corpus)
    for q in queries:
        gold = list(q['relevant_ids'])
        if not gold or len(gold) != len(set(gold)) or not set(gold) <= corpus_ids:
            raise ValueError('Missing/duplicate gold or gold outside corpus')
        rows.append(dict(q, candidates=index.select(q['query'], k), ranking_kind=kind))
    domain_ranking.validate(rows)
    return rows


def unique(records, key):
    result = {}
    for r in records:
        id = str(r[key])
        if id in result:
            raise ValueError(f'Duplicate source ID: {id}')
        result[id] = r
    return result


def cybersec(queries, documents, qrels, task, k):
    # The published Sigma corpus has one conflicting duplicate ID. Qrels refer
    # to the shared ID, so keep all its text variants as one candidate group
    # rather than silently dropping a variant or inventing per-variant labels.
    docs = {}
    variants = defaultdict(list)
    for r in documents:
        if r['task'] == task and r['text'] not in variants[str(r['doc_id'])]:
            variants[str(r['doc_id'])].append(r['text'])
    for id, texts in variants.items():
        docs[id] = {'text': '\n\n--- Source variant with the same document ID ---\n\n'.join(texts)}

    qs = unique([r for r in queries if r['task'] == task], 'query_id')
    gold = defaultdict(list)
    for r in qrels:
        if r['task'] != task:
            continue
        if r['query_id'] not in qs or r['doc_id'] not in docs or r['relevance'] not in (0, 1):
            raise ValueError('Invalid binary security qrels')
        if r['relevance'] == 1:
            gold[r['query_id']].append(r['doc_id'])
    return ranking({id: {'text': r['text']} for id, r in docs.items()},
                   [{'id': id, 'query': r['query'], 'relevant_ids': gold[id]} for id, r in qs.items()], 'security', k)


def toolret(queries, tools, category, k):
    docs = unique(tools, 'id')
    qs = []
    for q in queries:
        if q['category'] != category:
            continue
        labels = json.loads(q['labels'])
        if any(l['relevance'] not in (0, 1) for l in labels):
            raise ValueError('Expected binary ToolRet relevance')
        qs.append({'id': q['id'], 'query': q['query'],
                   'relevant_ids': [l['id'] for l in labels if l['relevance'] == 1]})
    # Original user query only: exclude the target-aware synthetic instruction.
    return ranking({id: {'text': r['documentation']} for id, r in docs.items()}, qs, 'tools', k)


def legalrag(benchmark, documents, k, chunk_chars):
    if chunk_chars < 1:
        raise ValueError('Chunk size must be positive')
    # macOS normalizes accented filenames differently from the release JSON.
    # Normalize identifiers only; never normalize document text or its offsets.
    normalized = {unicodedata.normalize('NFC', path): text for path, text in documents.items()}
    if len(normalized) != len(documents):
        raise ValueError('Corpus paths collide after Unicode normalization')
    documents = normalized
    corpus = {}
    for path, text in sorted(documents.items()):
        for start in range(0, len(text), chunk_chars):
            end = min(len(text), start + chunk_chars)
            corpus[f'{path}:{start}:{end}'] = {'text': text[start:end], 'file_path': path, 'start': start, 'end': end}
    queries = []
    for i, test in enumerate(benchmark['tests']):
        spans = [dict(s, file_path=unicodedata.normalize('NFC', s['file_path'])) for s in test['snippets']]
        for s in spans:
            if s['file_path'] not in documents or not 0 <= s['span'][0] < s['span'][1] <= len(documents[s['file_path']]):
                raise ValueError('Evidence outside source document')
        gold = set()
        for span in spans:
            path = span['file_path']
            first = (span['span'][0] // chunk_chars) * chunk_chars
            for start in range(first, span['span'][1], chunk_chars):
                end = min(len(documents[path]), start + chunk_chars)
                gold.add(f'{path}:{start}:{end}')
        gold = sorted(gold)
        queries.append({'id': str(i), 'query': test['query'], 'relevant_ids': gold,
                        'gold_spans': [{'file_path': s['file_path'], 'span': s['span']} for s in spans]})
    return ranking(corpus, queries, 'legal', k)


def prepare(args, inputs):
    suite = args.suite
    if suite == 'legal-contractnli':
        m = metadata('contractnli')
        raw = inputs.read('contractnli/'+m['revision']+'/contract-nli.zip',
            f"https://raw.githubusercontent.com/{m['repository']}/{m['revision']}/resources/contract-nli.zip")
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            names = [n for n in z.namelist() if n.endswith('/test.json') or n == 'test.json']
            if len(names) != 1:
                raise ValueError('Expected one original test.json')
            return contractnli(json.loads(z.read(names[0])))
    if suite in ('legal-casehold', 'legal-unfair-tos'):
        kind = {'legal-casehold': 'case_hold', 'legal-unfair-tos': 'unfair_tos'}[suite]
        for file, table in inputs.parquet('lexglue'):
            if file.startswith(kind+'/'):
                labels = json.loads((META/'lexglue-labels.json').read_text()).get(kind, [])
                # Check the pinned label names against actual parquet feature metadata.
                features = json.loads(table.schema.metadata[b'huggingface'])['info']['features']
                if kind != 'case_hold':
                    feature = features['labels']['feature'] if kind == 'unfair_tos' else features['label']
                    if labels != feature['names']:
                        raise ValueError('Label schema changed')
                return lexglue(kind, table.to_pylist(), labels)
        raise ValueError('Missing LexGLUE test split')
    if suite.startswith('cybersec-'):
        parts = {file.split('/')[0]: table.to_pylist() for file, table in inputs.parquet('cybersec')}
        return cybersec(parts['queries'], parts['corpus'], parts['qrels'], suite[9:].replace('-', '_'), args.top_k)
    if suite.startswith('toolret-'):
        category = suite[8:]
        queries = [r for _, t in inputs.parquet('toolret-queries') for r in t.to_pylist()]
        tools = [r for f, t in inputs.parquet('toolret-tools') if f.startswith(category+'/') for r in t.to_pylist()]
        return toolret(queries, tools, category, args.top_k)
    part = suite.removeprefix('legal-rag-').replace('-', '_')
    benchmark = json.loads(inputs.read('legalbenchrag/benchmarks/'+part+'.json'))
    corpus_root = inputs.root/'legalbenchrag/corpus'
    # Whole published corpus, not only files named by gold labels.
    documents = {p.relative_to(corpus_root).as_posix():
                 inputs.read(p.relative_to(inputs.root).as_posix()).decode('utf-8')
                 for p in sorted(corpus_root.rglob('*.txt'))}
    if not documents:
        raise ValueError('Published LegalBench-RAG corpus is missing')
    return legalrag(benchmark, documents, args.top_k, args.chunk_chars)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('suite', choices=SUITES)
    p.add_argument('--sources', type=Path, required=True)
    p.add_argument('--download', action='store_true', help='Download pinned HF/ContractNLI files; LegalBench-RAG release is supplied locally')
    p.add_argument('--top-k', type=int, default=20)
    p.add_argument('--chunk-chars', type=int, default=1500)
    p.add_argument('--output', type=Path, required=True)
    a = p.parse_args()
    if a.top_k < 1 or a.chunk_chars < 1:
        p.error('Candidate count and chunk size must be positive')
    sidecar = a.output.with_suffix('.provenance.json')
    if a.output.exists() or sidecar.exists():
        p.error('Refusing to overwrite prepared data/provenance')
    inputs = Inputs(a.sources, a.download)
    rows = prepare(a, inputs)
    content = ''.join(json.dumps(r, ensure_ascii=False, allow_nan=False)+'\n' for r in rows)
    provenance = {'suite': a.suite, 'rows': len(rows), 'input_sha256': inputs.hashes,
                  'top_k': a.top_k, 'chunk_chars': a.chunk_chars,
                  'candidate_method': 'BM25 k1=1.2 b=0.75; Unicode word tokens; ID ties; no gold injection',
                  'sources': {p.stem: json.loads(p.read_text()) for p in META.glob('*.json')},
                  'preparer_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                  'dataset_sha256': hashlib.sha256(content.encode()).hexdigest()}
    a.output.parent.mkdir(parents=True, exist_ok=True)
    a.output.write_text(content)
    sidecar.write_text(json.dumps(provenance, indent=2)+'\n')
    print(f'Prepared {len(rows)} rows; no inference performed')


if __name__ == '__main__':
    main()
