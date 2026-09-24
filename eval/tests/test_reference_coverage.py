"""Stored Jev 1.13 reference coverage is explicit across the new modes."""
import tempfile
from pathlib import Path
import unittest

from reference_coverage import coverage, combined_reference
from compare import compare


class ReferenceCoverageTests(unittest.TestCase):
    def test_existing_reference_and_missing_grouped_case(self):
        report = coverage()
        self.assertEqual(report['reference']['knowledge_english']['requests'], 47965)
        self.assertEqual(report['reference']['decision_english']['requests'], 21364)
        self.assertEqual(sum(x['requests'] for x in report['reference']['knowledge_korean']), 200)
        multi = report['multi_decision']
        self.assertTrue(multi['unfair_tos']['same_request_adapter_and_data'])
        self.assertFalse(multi['contractnli']['directly_comparable_grouped_reference'])
        self.assertEqual(multi['historical_exact_request_overlap'],
                         {'requests': 1607, 'questions': 12856})
        self.assertEqual(multi['missing_matched_grouped_reference'],
                         {'requests': 123, 'questions': 2091})
        self.assertEqual(report['other_grouped_reference_not_in_multi_preset']['multi_question_cases'], 8)
        self.assertEqual(sum(x['requests'] for x in report['new_public_source_tasks_without_jev_reference']), 6732)
        merged = combined_reference()
        for mode, key, score in [('knowledge', 'model-knowledge', .8858688231085619),
                                 ('decision', 'classification-decision', .8714721142744242),
                                 ('text', 'combined_accuracy', .8762710172191367)]:
            self.assertAlmostEqual(compare({'Jev': merged}, mode)['models']['Jev']['scores'][key], score)
        self.assertEqual(len(merged['reference_provenance']['files_sha256']), 23)

    def test_rejects_nonmatching_prepared_source(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'legal-contractnli.jsonl').write_text('not pinned')
            with self.assertRaisesRegex(ValueError, 'do not match archived Jev run'):
                coverage(root)


if __name__ == '__main__':
    unittest.main()
