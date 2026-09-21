"""Offline checks for language filtering, native mappings and scoring semantics."""
import json
from pathlib import Path
import unittest
from adapters import graded_rag, typed
from preparation.additional import korean, digest, search
from suites import load_suite


class AdditionalTests(unittest.TestCase):
    def test_korean_condition_and_hash(self):
        req={'state':{'sentence1':'가','sentence2':'나'},'questions':{'answer':{'type':'noul','instructions':'같습니까?'}}}
        es=[dict(eval_id=c,case_id='pair',stage=1,condition=c,task='pawsx',gold='1',request=req,request_hash=digest(req)) for c in ['en_en','ko_en','ko_ko']]
        body={'evaluations':es};body['sha256']=digest(body)
        rows=korean(body,'ko_ko')
        self.assertEqual(len(rows),1)
        self.assertEqual(rows[0]['options'][rows[0]['label']]['id'],'yes')
        self.assertNotIn('gold',typed.request_for(rows[0],'model'))
        body['evaluations'][0]['gold']='0'
        with self.assertRaises(ValueError): korean(body,'ko_ko')

    def test_fractional_gain_and_missing_candidate(self):
        row={'id':'q','state':'search','candidate_ids':['b','a'],'labels':{'a':1.5,'b':2,'missing':3}}
        graded_rag.validate([row])
        rec=graded_rag.parse_response(row,{'answers':{'c1':{'type':'score','score':2},'c2':{'type':'score','score':2}}})
        self.assertEqual(rec['ranking'],['b','a'])
        report=graded_rag.summarize([row],[rec])
        self.assertLess(report['ndcg_at_10'],1)
        self.assertEqual(report['precision_at_3'],1/3)
        self.assertNotIn('labels',graded_rag.request_for(row,'m'))
        self.assertEqual(graded_rag.summarize([row],[{}])['ndcg_at_10'],0)

    def test_bundled_and_manifest_languages(self):
        root=Path(__file__).resolve().parents[1]
        _,_,_,rows=load_suite(root/'suites/english/jevtest-support-subset.json')
        self.assertEqual(len(rows),6)
        self.assertTrue(all(r['state']['output'] for r in rows))
        for p in (root/'suites').glob('*/*.json'):
            m=json.loads(p.read_text())
            self.assertEqual(m['language_group'],p.parent.name)
            self.assertTrue(m['languages'])
            if m['language_group']=='english': self.assertEqual(m['languages'],['en'])
