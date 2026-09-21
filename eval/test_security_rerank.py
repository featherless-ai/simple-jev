"""Offline contract tests for the additional endpoint adapters."""
import json
from pathlib import Path
import unittest
from adapters import binary_battery as battery, passage_rerank
from prepare_security_rerank import phishing, passages, security
from suites import load_suite


class CommunityTests(unittest.TestCase):
    def test_npc_complete_variants_and_no_truth_in_payload(self):
        root=Path(__file__).parent
        variants=[]
        for name in ['clean','stt','stt-misheard']:
            rows=load_suite(root/f'suites/english/npc-{name}.json')[3]
            self.assertEqual(len(rows),75)
            self.assertTrue(all(r['targets'] and len(r['questions'])>len(r['targets']) for r in rows))
            self.assertEqual(set(battery.request_for(rows[0],'m')),{'model','state','questions'})
            variants.append(rows)
        self.assertEqual([r['targets'] for r in variants[0]],[r['targets'] for r in variants[2]])
        self.assertNotEqual(variants[0][0]['state']['transcript'],variants[2][0]['state']['transcript'])

    def test_binary_metrics_and_failure_denominator(self):
        r={'id':'a','state':'text','questions':{'q':{'type':'noul','instructions':'positive?'}},'targets':{'q':{'label':1}}}
        record=battery.parse_response(r,{'answers':{'q':{'type':'noul','noul':.8}}})
        report=battery.summarize([r,dict(r,id='b')],[record,{}])
        self.assertEqual(report['accuracy'],.5)
        self.assertEqual(report['coverage'],.5)
        self.assertAlmostEqual(report['brier_successful_only'],.04)
        self.assertEqual(battery.metrics([(.5,1),(.5,0)])['auroc_successful_only'],.5)
        with self.assertRaises(ValueError): battery.parse_response(r,{'answers':{'q':{'type':'noul','noul':float('nan')}}})

    def test_phishing_uses_label_and_literal_questions(self):
        source="QUESTIONS = {'verdict': {'type':'choice', 'instructions':'phishing?', 'criteria': {'phishing':'bad','legitimate':'good'}}}"
        rows=phishing([{'id':'mail','email':{'body':'message'},'y':1}],source)
        body=battery.request_for(rows[0],'m')
        self.assertEqual(body['state'],{'body':'message'})
        self.assertNotIn('y',body)
        result=battery.parse_response(rows[0],{'answers':{'verdict':{'type':'choice','probabilities':{'legitimate':.1,'phishing':.9}}}})
        self.assertEqual(result['binary_probabilities']['verdict'],.9)
        with self.assertRaises(ValueError): phishing([], 'QUESTIONS = dict()')

    def test_security_blinding_and_pairs(self):
        b=json.loads((Path(__file__).parent/'vendor/jev-sec-bench/batteries.json').read_text())
        samples=[{'label':y,'probability':.99,'code':'example','language':'python','class':'secret gold','pair_id':7} for y in [0,1]]
        rows=security(samples,b,'code')
        self.assertEqual(set(battery.request_for(rows[0],'m')['state']),{'language','code'})
        report=battery.summarize(rows,[{'binary_probabilities':{'vulnerable':p}} for p in [.1,.9]])
        self.assertEqual(report['pair_order_accuracy_successful_only'],1)
        with self.assertRaises(ValueError): security(samples[:1],b,'code')

    def test_rerank_truncation_and_retrieval_denominator(self):
        docs=[{'did':'a','text':'x'*2001},{'did':'b','text':'b'}]
        cs=[{'qid':'q','query':'find','present':[{'did':'a'},{'did':'b'}],'relevant':{'a':1}},
            {'qid':'missing','query':'none','present':[{'did':'b'}],'relevant':{'outside':1}}]
        rows=passages(cs,docs)
        self.assertEqual(len(rows[0]['passages'][0]),2000)
        body=passage_rerank.request_for(rows[0],'m')
        self.assertNotIn('relevant',body['state'])
        rec=passage_rerank.parse_response(rows[0],{'answers':{'p01':{'type':'score','score':3},'p02':{'type':'score','score':0}}})
        report=passage_rerank.summarize(rows,[rec,{}])
        self.assertEqual(report['ranking_rows'],1)
        self.assertEqual(report['no_relevant_candidate_rows'],1)
        self.assertEqual(report['ndcg_at_10'],1)
        self.assertEqual(passage_rerank.summarize(rows,[{},{}])['ndcg_at_10'],0)
