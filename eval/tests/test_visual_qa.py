"""Offline scoring checks against the original metric definitions."""
import unittest
from adapters import visual_qa

class VisualQATests(unittest.TestCase):
    def test_mme_pair_accuracy(self):
        rows=[{'benchmark':'mme','category':'count','image_id':str(i//2),'answer':'yes'} for i in range(4)]
        result=visual_qa.summarize(rows,[{'prediction':'yes'}]*3+[{}])
        self.assertEqual(result['mme_score'],125)  # 75 accuracy + 50 paired accuracy
        self.assertEqual(result['failed_rows'],1)

    def test_count_uses_mode_not_expected_value(self):
        r={'benchmark':'tallyqa'}
        ps={str(i):0 for i in range(16)};ps['0']=.51;ps['15']=.49
        result=visual_qa.parse_response(r,{'answers':{'decision':{'type':'choice','probabilities':ps}}})
        self.assertEqual(result['prediction'],0)
        rows=[dict(r,answer=0,category='simple'),dict(r,answer=3,category='complex')]
        report=visual_qa.summarize(rows,[result,{}])
        self.assertEqual(report['simple']['accuracy'],1)
        self.assertEqual(report['complex']['accuracy'],0)

    def test_pope_failures_and_threshold(self):
        row={'benchmark':'pope','answer':'yes'}
        result=visual_qa.parse_response(row,{'answers':{'decision':{'type':'noul','noul':.5}}})
        self.assertEqual(result['prediction'],'yes')
        report=visual_qa.summarize([row,row],[result,{}])
        self.assertEqual(report['recall'],.5)
        self.assertEqual(report['yes_ratio'],.5)
        with self.assertRaises(ValueError):
            visual_qa.parse_response(row,{'answers':{'decision':{'type':'noul','noul':float('nan')}}})
