"""Offline public-source decision import and scoring tests."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from adapters import choice, intent_f1
from preparation import decision_index


class DecisionIndexTests(unittest.TestCase):
    @staticmethod
    def record(i):
        return {
            'uuid': f'case-{i}', 'question': 'Should I call a tool?',
            'tools': ['{"name":"search","description":"Find things"}'],
            'orig_tools': ['SECRET_ORIGINAL_TOOL'],
            'target_tool': 'SECRET_TARGET', 'source': 'public-source',
            'answers': {'direct': 'Reply directly', 'tool_call': 'Call search',
                        'request_for_info': 'Ask first', 'cannot_answer': 'Cannot help'},
            'correct_answer': 'tool_call',
        }

    def test_complete_source_and_no_gold_leak(self):
        rows = decision_index.when2call([self.record(i) for i in range(3652)])
        self.assertEqual(rows[0]['label'], 1)
        req = choice.request_for(rows[0], 'model')
        self.assertEqual(list(req['questions']['decision']['criteria']), list('ABCD'))
        self.assertEqual(json.loads(req['state'])['tools'],
                         [{'name': 'search', 'description': 'Find things'}])
        self.assertNotIn('SECRET_', str(req))
        self.assertNotIn('correct_answer', str(req))
        self.assertEqual(choice.summarize(rows, [{'probabilities': [0, 1, 0, 0]}] * 3652)['accuracy'], 1)

    def test_no_silent_subset_or_corruption(self):
        with self.assertRaisesRegex(ValueError, '3652'):
            decision_index.when2call([self.record(0)])
        records = [self.record(i) for i in range(3652)]
        records[1]['uuid'] = records[0]['uuid']
        with self.assertRaisesRegex(ValueError, 'unique'):
            decision_index.when2call(records)
        for patch_value in ({'correct_answer': 'invented'}, {'tools': ['not json']},
                            {'answers': {'direct': 'only one'}}):
            records[1] = self.record(1) | patch_value
            with self.assertRaises((ValueError, json.JSONDecodeError)):
                decision_index.when2call(records)

    def test_banking77_all_classes_and_macro_f1(self):
        records = [{'text': f'Customer request {i}', 'category': f'intent_{i % 77:02d}'}
                   for i in range(3080)]
        rows = decision_index.banking77(records)
        self.assertEqual(len(rows[0]['options']), 77)
        request = intent_f1.request_for(rows[0], 'model')
        self.assertEqual(len(request['questions']['decision']['criteria']), 77)
        self.assertNotIn('label', str(request))
        self.assertEqual(intent_f1.summarize(rows, [{}] * len(rows))['macro_f1'], 0)
        perfect = [{'probabilities': [int(i == row['label']) for i in range(77)]}
                   for row in rows]
        self.assertEqual(intent_f1.summarize(rows, perfect)['macro_f1'], 1)
        with self.assertRaisesRegex(ValueError, 'BANKING77'):
            decision_index.banking77(records[:-1])

    def test_pin_verified_before_parsing(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'test.jsonl'
            path.write_text('invalid source')
            manifest = Path(folder) / 'source.json'
            manifest.write_text(json.dumps({'sha256': hashlib.sha256(b'different').hexdigest()}))
            with patch.dict(decision_index.SOURCES, {'when2call': manifest}):
                with self.assertRaisesRegex(ValueError, 'checksum'):
                    decision_index.prepare('when2call', path)


if __name__ == '__main__':
    unittest.main()
