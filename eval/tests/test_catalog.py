"""Ensure every shipped eval is classified and the catalog stays current."""
import json
import unittest
from catalog import ROOT, entries, render

class CatalogTests(unittest.TestCase):
    def test_all_manifests_classified(self):
        taxonomy=json.loads((ROOT/'taxonomy.json').read_text())['categories']
        ids=[]
        for path,d in entries():
            with self.subTest(path=path):
                self.assertIn(d['category'],taxonomy)
                if not d.get('aggregate_children'):
                    self.assertIn(d['subcategory'],taxonomy[d['category']]['subcategories'])
                self.assertIn(d['modality'],['text','image','browser'])
                ids.append(d['id'])
        self.assertEqual(len(ids),len(set(ids)))

    def test_catalog_and_filters(self):
        self.assertIn('# Evaluation catalog', render())
        filtered=render('vision','english')
        self.assertIn('[vision-tallyqa]',filtered)
        self.assertNotIn('[security-code]',filtered)

    def test_every_suite_has_endpoint_harness(self):
        from suites import ADAPTERS
        removed = {'legal-ledgar', 'btzsc-pilot', 'legalforecast-export',
                   'clozetest-maxmin', 'jev-research-eval'}
        for path, suite in entries():
            with self.subTest(path=path):
                self.assertNotIn(suite['id'], removed)
                adapter = ADAPTERS[suite['adapter']]
                for method in ('validate', 'request_for', 'parse_response', 'summarize'):
                    self.assertTrue(callable(getattr(adapter, method)))
