"""Shared-context ContractNLI protocol and grouped scoring, with no endpoint needed."""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import tempfile
import threading
import unittest

from adapters import choice, multi_choice
from run import request_record
from preparation.multi_decision import contractnli
from suites import load_suite


class MultiDecisionTests(unittest.TestCase):
    def test_one_request_per_document_all_hypotheses(self):
        rows = []
        for doc in range(123):
            for question in range(17):
                rows.append({'id': f'{doc}-{question}', 'group_id': str(doc),
                             'state': f'contract {doc}', 'family': 'contractnli',
                             'question': f'Hypothesis {question}',
                             'options': [{'id': k, 'description': k} for k in ('Entailment', 'Contradiction', 'NotMentioned')],
                             'label': question % 3})
        cases = contractnli(rows)
        self.assertEqual(len(cases), 123)
        req = multi_choice.request_for(cases[0], 'model')
        self.assertEqual(req['state'], 'contract 0')
        self.assertEqual(len(req['questions']), 17)
        self.assertNotIn('label', str(req))
        self.assertEqual(choice.request_for(rows[0], 'model')['questions']['decision'], req['questions']['0-0'])
        responses = []
        for case in cases:
            answers = {f['id']: {'type': 'choice', 'probabilities': {
                o['id']: int(i == f['label']) for i, o in enumerate(f['options'])}}
                for f in case['fields']}
            responses.append(multi_choice.parse_response(case, {'answers': answers}))
        metrics = multi_choice.summarize(cases, responses)
        self.assertEqual((metrics['rows'], metrics['questions']), (123, 2091))
        self.assertEqual((metrics['question_accuracy'], metrics['exact_case_accuracy'], metrics['macro_f1']), (1, 1, 1))
        self.assertEqual(multi_choice.summarize(cases, [{}] * 123)['exact_case_accuracy'], 0)
        with self.assertRaisesRegex(ValueError, 'answer keys'):
            multi_choice.parse_response(cases[0], {'answers': {}})
        rows[17]['state'] = 'different contract'
        with self.assertRaisesRegex(ValueError, 'different context'):
            contractnli(rows)

    def test_http_one_call_for_all_questions(self):
        observed = []
        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                import json
                body = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                observed.append(body)
                keys = body['questions']
                answers = {k: {'type': 'choice', 'probabilities': {'yes': 1., 'no': 0.}}
                           for k in keys}
                raw = json.dumps({'answers': answers}).encode()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(raw)))
                self.end_headers()
                self.wfile.write(raw)
            def log_message(self, *args):
                pass
        row = {'id': 'contract', 'state': 'shared contract', 'fields': [
            {'id': f'q{i}', 'group_id': 'contract', 'family': 'test', 'question': f'Hypothesis {i}',
             'options': [{'id': 'yes', 'description': 'Yes'}, {'id': 'no', 'description': 'No'}],
             'label': 0} for i in range(17)]}
        multi_choice.validate([row])
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever)
        thread.start()
        try:
            args = argparse.Namespace(endpoint=f'http://127.0.0.1:{server.server_port}/v1/classifier',
                                      model='example', timeout=5, retries=0)
            record = request_record(args, None, multi_choice, row)
            self.assertNotIn('error', record)
            self.assertEqual(len(observed), 1)
            self.assertEqual(observed[0]['state'], 'shared contract')
            self.assertEqual(len(observed[0]['questions']), 17)
            self.assertNotIn('label', str(observed[0]))
            self.assertEqual(multi_choice.summarize([row], [record])['exact_case_accuracy'], 1)
        finally:
            server.shutdown()
            thread.join()
            server.server_close()

    def test_multi_manifest_rejects_question_loss(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'suite.json').write_text(json.dumps({
                'schema_version': 1, 'id': 'test-multi', 'version': '1',
                'adapter': 'binary-battery-v1', 'dataset': 'rows.jsonl',
                'questions_per_request': 8, 'expected_rows': 1}))
            (root / 'rows.jsonl').write_text(json.dumps({
                'id': 'x', 'state': 'context', 'questions': {'only': {'type': 'noul', 'instructions': 'Q'}},
                'targets': {'only': {'label': 1}}}) + '\n')
            with self.assertRaisesRegex(ValueError, 'declared number of questions'):
                load_suite(root / 'suite.json')

    def test_refuse_single_question_group(self):
        fields = [{'id': 'one', 'group_id': 'case', 'family': 'test', 'question': 'Q',
                   'options': [{'id': 'yes', 'description': 'Yes'}, {'id': 'no', 'description': 'No'}], 'label': 0}]
        with self.assertRaisesRegex(ValueError, 'multiple'):
            multi_choice.validate([{'id': 'case', 'state': 'context', 'fields': fields}])


if __name__ == '__main__':
    unittest.main()
