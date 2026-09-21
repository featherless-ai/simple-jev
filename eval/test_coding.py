"""Offline coding imports: gold mapping, blinding and original pair IDs."""
import unittest
from prepare_coding import complexity,clones
from adapters import choice,binary_battery

class CodingTests(unittest.TestCase):
    def test_complexity_normalization_and_blinding(self):
        rows=complexity([{'messages':[{'role':'system','content':'Classify complexity'},{'role':'user','content':'program'},{'role':'assistant','content':'complexity: np'}]}])
        self.assertEqual(rows[0]['options'][rows[0]['label']]['id'],'exponential')
        self.assertNotIn('complexity: np',str(choice.request_for(rows[0],'m')))

    def test_clones_original_pair_ids(self):
        rows=clones([{'idx':'a','func':'one'},{'idx':'b','func':'two'}],'a b 1\n')
        body=binary_battery.request_for(rows[0],'m')
        self.assertEqual(body['state'],{'code_a':'one','code_b':'two'})
        self.assertNotIn('targets',body)
        self.assertEqual(rows[0]['targets']['equivalent']['label'],1)
