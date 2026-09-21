"""Offline integration checks; never contacts an endpoint or downloads data."""
import unittest
from adapters import typed,fields,rag
from preparation.external import jevbench,jevfire


class ExternalTests(unittest.TestCase):
    def test_public_tiers_preserve_native_types(self):
        for tier,count in [('original',72),('easy',48),('hard',111)]:
            rows=jevbench(tier)
            self.assertEqual(len(rows),count)
            for row in rows:
                payload=typed.request_for(row,'test')
                self.assertEqual(set(payload),{'model','state','questions'})
                self.assertEqual(payload['questions']['decision'],row['native_question'])
        row=next(r for r in jevbench('original') if r['native_question']['type']=='noul')
        p=typed.parse_response(row,{'answers':{'decision':{'type':'noul','noul':.8}}})['probabilities']
        self.assertAlmostEqual(p[[o['id'] for o in row['options']].index('yes')],.8)

    def test_fire_batches_all_fields_without_gold(self):
        rows=jevfire()
        self.assertGreater(len(rows),0)
        for row in rows:
            req=fields.request_for(row,'test')
            self.assertEqual(len(req['questions']),len(row['fields']))
            self.assertNotIn('expected',req)
        self.assertEqual(fields.summarize(rows,[{} for r in rows])['field_accuracy'],0)

    def test_rag_ties_failures_and_ceiling(self):
        row={'id':'q','query':'question','candidates':[{'id':'a','text':'one'},{'id':'b','text':'two'}],'relevant_ids':['b']}
        rag.validate([row]);req=rag.request_for(row,'test')
        self.assertNotIn('relevant_ids',req['state'])
        record=rag.parse_response(row,{'answers':{'candidate_0':{'noul':.5},'candidate_1':{'noul':.5}}})
        self.assertEqual(record['ranking'],['a','b'])
        report=rag.summarize([row],[record]);self.assertEqual(report['mrr_at_10'],.5)
        self.assertEqual(report['recall_at_5'],1)
        self.assertEqual(rag.summarize([row],[{}])['recall_at_5'],0)
