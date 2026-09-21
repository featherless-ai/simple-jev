"""Offline contracts for source labels, candidate selection and ranking metrics."""
import unittest
from adapters import choice, binary_battery, domain_ranking
from preparation.domains import contractnli, lexglue, BM25, ranking, cybersec, toolret, legalrag


class DomainTests(unittest.TestCase):
    def test_contract_labels_and_blinding(self):
        data = {'labels': {'h': {'hypothesis': 'Disclosure is allowed.'}},
                'documents': [{'id': 7, 'text': 'Disclosure is prohibited.',
                 'annotation_sets': [{'annotations': {'h': {'choice': 'Contradiction'}}}]}]}
        row = contractnli(data)[0]
        self.assertEqual(row['options'][row['label']]['id'], 'Contradiction')
        self.assertNotIn('label', choice.request_for(row, 'm'))
        data['documents'][0]['annotation_sets'].append({})
        with self.assertRaises(ValueError):
            contractnli(data)

    def test_lexglue_class_and_multilabel(self):
        row = lexglue('case_hold', [{'context': 'case', 'endings': ['a', 'b'], 'label': 0}], [])[0]
        self.assertEqual(row['state'], 'case')
        rows = lexglue('unfair_tos', [{'text': 'term', 'labels': []},
                                    {'text': 'term', 'labels': [0, 1]}], ['A', 'B'])
        self.assertEqual([t['label'] for t in rows[0]['targets'].values()], [0, 0])
        self.assertEqual([t['label'] for t in rows[1]['targets'].values()], [1, 1])
        self.assertNotIn('targets', binary_battery.request_for(rows[0], 'm'))

    def test_no_gold_injection_and_missing_gold_penalty(self):
        corpus = {'a': {'text': 'needle'}, 'b': {'text': 'other'}}
        rows = ranking(corpus, [{'id': 'q', 'query': 'needle', 'relevant_ids': ['b']}], 'security', 1)
        self.assertEqual(rows[0]['candidates'][0]['id'], 'a')
        result = domain_ranking.summarize(rows, [{'ranking': ['a']}])
        self.assertEqual(result['ndcg_at_10'], 0)
        self.assertEqual(result['candidate_recall'], 0)
        self.assertEqual(result['rows'], 1)
        body = domain_ranking.request_for(rows[0], 'm')
        self.assertNotIn('relevant_ids', body)
        self.assertEqual(body['state']['candidates'][0]['id'], 'candidate_0')
        self.assertEqual(BM25(corpus).select('absent', 2)[0]['id'], 'a')

    def test_tool_query_only_and_gold_validation(self):
        import json
        rows = toolret([{'id': 'q', 'query': 'add', 'instruction': 'SECRET gold hint',
                         'category': 'code', 'labels': json.dumps([{'id': 't', 'relevance': 1}])}],
                       [{'id': 't', 'documentation': 'add numbers'}], 'code', 1)
        self.assertNotIn('SECRET', str(domain_ranking.request_for(rows[0], 'm')))
        with self.assertRaises(ValueError):
            ranking({'a': {'text': 'x'}}, [{'id': 'q', 'query': 'x', 'relevant_ids': ['missing']}], 'tools', 1)

    def test_security_task_isolation(self):
        queries = [{'task': 'a', 'query_id': 'q', 'query': 'alpha'}]
        docs = [{'task': 'a', 'doc_id': 'd', 'text': 'alpha'},
                {'task': 'b', 'doc_id': 'd', 'text': 'beta'}]
        qrels = [{'task': 'a', 'query_id': 'q', 'doc_id': 'd', 'relevance': 1}]
        rows = cybersec(queries, docs, qrels, 'a', 2)
        self.assertEqual(rows[0]['candidates'], [{'id': 'd', 'text': 'alpha'}])

    def test_legal_spans_across_chunks_and_failures(self):
        rows = legalrag({'tests': [{'query': 'abcdef', 'snippets': [
            {'file_path': 'a.txt', 'span': [2, 8]}]}]},
            {'a.txt': 'abcdefghij'}, 3, 5)
        self.assertEqual(len(rows[0]['relevant_ids']), 2)
        rank = [c['id'] for c in rows[0]['candidates']]
        report = domain_ranking.summarize(rows, [{'ranking': rank}])
        self.assertEqual(report['mean_character_recall_at_5'], 1)
        self.assertEqual(report['mean_character_precision_at_5'], .6)
        report = domain_ranking.summarize(rows, [{}])
        self.assertEqual(report['mean_character_recall_at_5'], 0)
        self.assertEqual(report['failed_rows'], 1)

    def test_response_validation(self):
        row = {'candidates': [{'id': 'x', 'text': 'x'}]}
        with self.assertRaises(ValueError):
            domain_ranking.parse_response(row, {'answers': {'candidate_0': {'noul': float('nan')}}})

    def test_security_duplicate_id_retains_both_variants(self):
        rows = cybersec([{'task': 'a', 'query_id': 'q', 'query': 'rule'}],
                        [{'task': 'a', 'doc_id': 'd', 'text': 'rule variant one'},
                         {'task': 'a', 'doc_id': 'd', 'text': 'rule variant two'}],
                        [{'task': 'a', 'query_id': 'q', 'doc_id': 'd', 'relevance': 1}], 'a', 2)
        self.assertEqual(len(rows[0]['candidates']), 1)
        self.assertIn('variant one', rows[0]['candidates'][0]['text'])
        self.assertIn('variant two', rows[0]['candidates'][0]['text'])

    def test_legal_unicode_paths_preserve_character_offsets(self):
        rows = legalrag({'tests': [{'query': 'text', 'snippets': [
            {'file_path': 'café.txt', 'span': [2, 4]}]}]},
            {'café.txt': 'abcdef'}, 1, 6)
        self.assertEqual(rows[0]['candidates'][0]['text'], 'abcdef')
        self.assertEqual(rows[0]['gold_spans'][0]['span'], [2, 4])
