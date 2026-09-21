"""Offline contract checks; no network or model execution."""
import unittest
from adapters.choice import probabilities, request_for, summarize


class RunnerTests(unittest.TestCase):
    def setUp(self):
        self.row = {'id':'one','group_id':'case','family':'routing','state':'hello',
                    'question':'route?', 'label':1, 'target_distribution':[.2,.8],
                    'options':[{'id':'a','description':'A'},{'id':'b','description':'B'}]}

    def test_gold_not_sent(self):
        body = request_for(self.row,'model')
        self.assertEqual(set(body), {'model','state','questions'})
        self.assertEqual(body['questions']['decision']['criteria'], {'a':'A','b':'B'})

    def test_alignment_and_invalid_responses(self):
        self.assertEqual(probabilities(self.row,{'answers':{'decision':{'probabilities':{'b':.8,'a':.2}}}}),[.2,.8])
        for p in ({'a':1}, {'a':float('nan'),'b':1}, {'a':.1,'b':.1}):
            with self.assertRaises(ValueError):
                probabilities(self.row,{'answers':{'decision':{'probabilities':p}}})

    def test_failure_denominator(self):
        other = dict(self.row,id='two',group_id='case2')
        report = summarize([self.row,other],[{'probabilities':[.2,.8]},{'error':'HTTP 500'}])
        self.assertEqual(report['accuracy'],.5)
        self.assertEqual(report['failed_rows'],1)
        self.assertEqual(report['equal_case_modal_agreement'],.5)
        self.assertEqual(report['total_variation_rows'],1)
        self.assertEqual(report['equal_case_total_variation_successful_only'],0)


class SuiteTests(unittest.TestCase):
    def test_manifest_paths_are_relative_to_manifest(self):
        import json
        import tempfile
        from pathlib import Path
        from suites import load_suite
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            row = {'id':'one','group_id':'one','family':'f','state':'x','question':'?',
                   'label':0,'options':[{'id':'a','description':'a'},{'id':'b','description':'b'}]}
            (root/'data.jsonl').write_text(json.dumps(row)+'\n')
            manifest = {'schema_version':1,'id':'custom','version':'1','adapter':'choice-v1','dataset':'data.jsonl'}
            path = root/'suite.json'
            path.write_text(json.dumps(manifest))
            self.assertEqual(load_suite(path)[3], [row])
            manifest['id'] = '../escape'
            path.write_text(json.dumps(manifest))
            with self.assertRaises(ValueError):
                load_suite(path)
