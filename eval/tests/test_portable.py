"""Fresh-checkout contracts, localhost HTTP, native replay and report comparisons."""
import argparse
import base64
import contextlib
import copy
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch

from audit import audit_run
from catalog import entries
from compare import compare, usable, REFERENCE, QUICK, VISION
from presets import ROOT, suite_paths
from report import snapshot, write_reports
from retry import retry_run
import run
from suites import load_suite


class PresetTests(unittest.TestCase):
    def test_frozen_nonoverlapping_selections(self):
        catalog = {s['id']: s for _, s in entries()}
        for name, count in [('quick', 3), ('decision', 23), ('knowledge', 12), ('multi-decision', 2),
                            ('full-text', 65), ('vision', 7), ('full', 72)]:
            paths = suite_paths(name)
            self.assertEqual(len(paths), count)
            ids = [json.loads(p.read_text())['id'] for p in paths]
            self.assertEqual(len(ids), len(set(ids)))
            for identifier in ids:
                suite = catalog[identifier]
                self.assertTrue(suite.get('default_enabled', True))
                self.assertFalse(set(suite.get('aggregate_children', [])) & set(ids))
        with self.assertRaises(ValueError):
            suite_paths('invented')

    def test_decision_preset_covers_all_26_reference_items_without_knowledge(self):
        actual = set()
        for path in suite_paths('decision'):
            suite = json.loads(path.read_text())
            for part in snapshot(suite)['partitions']:
                if part['subcategory'] == 'classification-decision':
                    actual.add((suite['project'], suite['project_configuration'],
                                part['category'], part['subcategory']))
        reference = json.loads(REFERENCE.read_text())
        expected = {(r['project'], r['configuration'], r['category'], r['task'])
                    for r in reference['items'] if r['task'] == 'classification-decision'}
        self.assertEqual(len(expected), 26)
        self.assertEqual(actual, expected)
        decision = [json.loads(p.read_text()) for p in suite_paths('decision')]
        knowledge = [json.loads(p.read_text()) for p in suite_paths('knowledge')]
        self.assertNotIn('codemmlu-full', [s['id'] for s in decision + knowledge])
        self.assertTrue(all(s['subcategory'] == 'classification-decision' for s in decision))
        self.assertTrue(all(s['subcategory'] == 'model-knowledge' for s in knowledge))
        self.assertEqual({s['id'] for s in decision} & {s['id'] for s in knowledge}, set())
        self.assertIn('codemmlu-execution-prediction', [s['id'] for s in decision])
        self.assertIn('codemmlu-api-frameworks', [s['id'] for s in knowledge])
        for s in decision + knowledge:
            self.assertTrue(all(p['subcategory'] == s['subcategory'] for p in snapshot(s)['partitions']))
        self.assertEqual([json.loads(p.read_text())['id'] for p in suite_paths('multi-decision')],
                         ['legal-contractnli-multi', 'legal-unfair-tos-multi'])

    def test_knowledge_preset_covers_13_reference_items(self):
        actual = set()
        for path in suite_paths('knowledge'):
            suite = json.loads(path.read_text())
            if suite['language_group'] != 'english':
                continue  # Historical 13-item comparison covers English only.
            for part in snapshot(suite)['partitions']:
                actual.add((suite['project'], suite['project_configuration'],
                            part['category'], part['subcategory']))
        reference = json.loads(REFERENCE.read_text())
        expected = {(r['project'], r['configuration'], r['category'], r['task'])
                    for r in reference['items'] if r['task'] == 'model-knowledge'}
        self.assertEqual(len(expected), 13)
        self.assertEqual(actual, expected)

    def test_decision_comparison_allows_only_missing_knowledge_children(self):
        row = {'coverage': 'partial', 'missing_suites': ['codemmlu-api-frameworks'],
               'metrics': {'rows': 76, 'accuracy': 0.5, 'failed_rows': 0}}
        self.assertEqual(usable(row, 76, 'accuracy', selected_task='classification-decision'), .5)
        with self.assertRaises(ValueError):
            usable(row, 76, 'accuracy')
        row['missing_suites'] = ['codemmlu-code-repair']
        with self.assertRaises(ValueError):
            usable(row, 76, 'accuracy', selected_task='classification-decision')
        self.assertEqual(usable(row, 76, 'accuracy', selected_task='model-knowledge'), .5)

    def test_quick_native_fixture_and_source_commitments(self):
        expected = []
        meta = json.loads((ROOT / 'vendor/jevbench/source-manifest.json').read_text())
        for tier in ('easy', 'original', 'hard'):
            raw = (ROOT / f'vendor/jevbench/{tier}.jsonl').read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(), meta['files'][f'datasets/public/{tier}.jsonl']['sha256'])
            expected.extend(dict(json.loads(line), tier=tier) for line in raw.splitlines() if line.strip())
        rows = load_suite(suite_paths('quick')[0])[3]
        self.assertEqual({r['id']: r for r in rows}, {r['id']: r for r in expected})
        self.assertEqual(len(rows), 231)
        scoring = ROOT / 'vendor/jevbench/scoring.py'
        self.assertEqual(hashlib.sha256(scoring.read_bytes()).hexdigest(), meta['files']['jevbench/scoring.py']['sha256'])

    def test_legacy_authored_path_still_runs_and_reports_same_coverage(self):
        old = load_suite(ROOT / 'suites/semif-authored.json')
        new = load_suite(ROOT / 'suites/english/semif-authored.json')
        self.assertEqual(old[2:], new[2:])
        self.assertEqual(snapshot(old[0]), snapshot(new[0]))

    def test_multi_and_flattened_views_cannot_run_together(self):
        with tempfile.TemporaryDirectory() as tmp:
            for base in ('legal-contractnli', 'legal-unfair-tos'):
                command = [sys.executable, str(ROOT / 'run.py'),
                           '--suite', str(ROOT / 'suites/english' / (base + '.json')),
                           '--suite', str(ROOT / 'suites/english' / (base + '-multi.json')),
                           '--endpoint', 'http://127.0.0.1:9999/v1/classifier',
                           '--model', 'test', '--output', str(Path(tmp) / base)]
                result = subprocess.run(command, text=True, capture_output=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('overlaps an explicitly selected suite', result.stderr)
                self.assertFalse((Path(tmp) / base).exists())

    def test_list_from_an_unrelated_working_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = subprocess.check_output([sys.executable, str(ROOT / 'run.py'),
                                               '--preset', 'quick', '--list'], cwd=tmp, text=True)
            rows = json.loads(output)
            self.assertEqual(len(rows), 3)
            self.assertTrue(rows[0]['dataset_present'])
            self.assertEqual(list(Path(tmp).iterdir()), [])

    def test_every_preparer_help_is_offline(self):
        from prepare import GROUPS
        for group in GROUPS:
            with self.subTest(group=group):
                subprocess.run([sys.executable, str(ROOT / 'prepare.py'), group, '--help'],
                               check=True, stdout=subprocess.DEVNULL)


class PortableExecutionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        rows = load_suite(ROOT / 'suites/english/semif-authored.json')[3][:2]
        self.data = self.root / 'rows.jsonl'
        self.data.write_text(''.join(json.dumps(r) + '\n' for r in rows))
        self.path = self.root / 'suite.json'
        # Minimal pre-migration custom manifests remain supported.
        self.path.write_text(json.dumps({'schema_version': 1, 'id': 'tiny', 'version': '1',
                                         'adapter': 'choice-v1', 'dataset': 'rows.jsonl'}))
        self.output = self.root / 'results'

    def args(self):
        return argparse.Namespace(output=self.output, endpoint='http://example.test/v1/classifier',
                                  model='test', retries=0, delay=0, timeout=2, workers=2, resume=False)

    @staticmethod
    def predict(args, key, adapter, row):
        body = adapter.request_for(row, args.model)
        labels = list(body['questions']['decision']['criteria'])
        response = {'answers': {'decision': {'type': 'choice',
                    'probabilities': {k: float(i == 0) for i, k in enumerate(labels)}}}}
        return {'id': row['id'], 'response': response, **adapter.parse_response(row, response)}

    def make_run(self):
        self.output.mkdir()
        with patch('run.request_record', side_effect=self.predict), contextlib.redirect_stdout(io.StringIO()):
            summary = run.run_suite(self.args(), None, *load_suite(self.path))
        (self.output / 'summary.json').write_text(json.dumps({'tiny': summary}))
        write_reports(self.output)

    def test_real_localhost_transport_and_offline_replay(self):
        received = []
        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                body = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                received.append(body)
                labels = list(body['questions']['decision']['criteria'])
                raw = json.dumps({'answers': {'decision': {'type': 'choice', 'probabilities':
                    {k: float(i == 0) for i, k in enumerate(labels)}}}}).encode()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(raw)
            def log_message(self, *args):
                pass
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            argv = ['run.py', '--suite', str(self.path), '--model', 'test', '--delay', '0',
                    '--endpoint', f'http://127.0.0.1:{server.server_port}/v1/classifier',
                    '--output', str(self.output), '--workers', '2']
            with patch('sys.argv', argv), contextlib.redirect_stdout(io.StringIO()):
                run.main()
            self.assertEqual(len(received), 2)
            self.assertTrue(all(set(body) == {'model', 'state', 'questions'} for body in received))
            self.assertEqual(audit_run(self.output, [self.path])['verified_examples'], 2)
            with patch('sys.argv', argv + ['--resume']), contextlib.redirect_stdout(io.StringIO()):
                run.main()
            self.assertEqual(len(received), 2)
        finally:
            server.shutdown()
            server.server_close()
            thread.join()

    def test_audit_rejects_failed_missing_duplicate_and_forged_predictions(self):
        self.make_run()
        path = self.output / 'tiny/predictions.jsonl'
        original = path.read_text()
        records = [json.loads(line) for line in original.splitlines()]
        variants = [records[:1], records + [records[0]],
                    [dict(records[0], error='HTTP 500'), records[1]],
                    [dict(records[0], probabilities=[0, 0]), records[1]]]
        for variant in variants:
            with self.subTest(variant=variant):
                path.write_text(''.join(json.dumps(r) + '\n' for r in variant))
                with self.assertRaises(ValueError):
                    audit_run(self.output, [self.path])
        path.write_text(original)
        self.assertTrue(audit_run(self.output, [self.path])['complete'])

    def test_audit_rejects_changed_source_or_summary(self):
        self.make_run()
        original = self.data.read_text()
        self.data.write_text(original + '\n')
        with self.assertRaises(ValueError):
            audit_run(self.output, [self.path])
        self.data.write_text(original)
        (self.output / 'summary.json').write_text('{}')
        with self.assertRaises(ValueError):
            audit_run(self.output, [self.path])

    def test_dependency_commitment_guards_report_retry_and_resume(self):
        self.make_run()
        path = self.output / 'tiny/manifest.json'
        manifest = json.loads(path.read_text())
        manifest['evaluator_sha256']['vendor/jevbench/scoring.py'] = 'changed'
        path.write_text(json.dumps(manifest))
        with self.assertRaisesRegex(ValueError, 'dependencies changed'):
            write_reports(self.output)
        with self.assertRaisesRegex(ValueError, 'dependencies changed'):
            retry_run(self.output, None)
        args = self.args(); args.resume = True
        with self.assertRaisesRegex(ValueError, 'Resume requires identical'):
            run.run_suite(args, None, *load_suite(self.path))

    def test_image_retry_restores_assets_and_rechecks_bytes(self):
        from preparation.vision import make_row
        png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=')
        row = make_row({'id': 'tiny', 'source_labels': ['cat', 'dog'], 'question': '?'}, 0, 0, png)
        image = self.root / row['image_path']; image.parent.mkdir()
        image.write_bytes(png)
        self.data.write_text(json.dumps(row) + '\n')
        suite = json.loads(self.path.read_text()); suite['adapter'] = 'vision-choice-v1'
        self.path.write_text(json.dumps(suite))
        self.output.mkdir()
        with patch('run.request_record', return_value={'id': row['id'], 'error': 'HTTP 503', 'http_status': 503}), contextlib.redirect_stdout(io.StringIO()):
            run.run_suite(self.args(), None, *load_suite(self.path))
        with patch('retry.request_record', side_effect=self.predict), contextlib.redirect_stdout(io.StringIO()):
            result = retry_run(self.output, None)
        self.assertEqual(result['tiny']['failed_rows'], 0)
        self.assertTrue(audit_run(self.output, [self.path])['complete'])
        # A second failed run must not send changed image bytes to the endpoint.
        self.output = self.root / 'other-results'; self.output.mkdir()
        with patch('run.request_record', return_value={'id': row['id'], 'error': 'HTTP 503', 'http_status': 503}), contextlib.redirect_stdout(io.StringIO()):
            run.run_suite(self.args(), None, *load_suite(self.path))
        image.write_bytes(png + b'tampered')
        with patch('retry.request_record') as request, self.assertRaises(ValueError):
            retry_run(self.output, None)
        request.assert_not_called()


class ComparisonTests(unittest.TestCase):
    def reference_report(self):
        reference = json.loads(REFERENCE.read_text())
        return {'model': 'test', 'by_category': [
            {'project': r['project'], 'configuration': r['configuration'], 'coverage': 'complete',
             'placement': ['text', 'english', r['category'], r['task']],
             'metrics': {'rows': r['rows'], r['metric']: r['score'], 'failed_rows': 0}}
            for r in reference['items']]}

    def test_native_reference_macro_aggregation(self):
        report = self.reference_report()
        result = compare({'test': report}, 'decision')['models']['test']
        reference = json.loads(REFERENCE.read_text())
        self.assertEqual(len(result['items']), 26)
        self.assertEqual(sum(r['rows'] for r in result['items']), 21364)
        self.assertAlmostEqual(result['scores']['classification-decision'], reference['totals']['classification-decision']['score'])
        text = compare({'test': report}, 'text')['models']['test']
        self.assertEqual(len(text['items']), 54)
        self.assertAlmostEqual(text['scores']['combined_accuracy'], reference['combined_accuracy']['score'])

    def test_archived_decision_question_count_includes_binary_targets(self):
        reference = json.loads(REFERENCE.read_text())
        rows = []
        for source in sorted({r['source'] for r in reference['items']}):
            rows.extend(json.loads((REFERENCE.parent / source).read_text())['by_category'])
        report = {'model': reference['model'], 'by_category': rows}
        result = compare({'reference': report}, 'decision')['models']['reference']
        self.assertEqual(sum(r['scored_units'] for r in result['items']), 33099)
        self.assertAlmostEqual(result['scores']['classification-decision'], .8714721142744242)

    def test_incomplete_failed_mismatched_and_duplicate_reports_rejected(self):
        for change in ('coverage', 'failed', 'rows', 'duplicate'):
            report = self.reference_report()
            row = report['by_category'][0]
            if change == 'coverage': row['coverage'] = 'partial'
            elif change == 'failed': row['metrics']['failed_rows'] = 1
            elif change == 'rows': row['metrics']['rows'] += 1
            else: report['by_category'].append(copy.deepcopy(row))
            with self.subTest(change=change), self.assertRaises(ValueError):
                compare({'test': report}, 'decision')

    def test_quick_is_pooled_accuracy_not_native_headline_average(self):
        report = {'model': 'test', 'by_project': []}
        for ((project, config), count), correct in zip(QUICK.items(), [214, 141, 94]):
            report['by_project'].append({'project': project, 'configuration': config,
                'coverage': 'complete', 'metric': 'native', 'score': .1,
                'metrics': {'rows': count, 'accuracy': correct / count, 'failed_rows': 0}})
        result = compare({'test': report}, 'quick')['models']['test']
        self.assertEqual(result['correct'], 449)
        self.assertAlmostEqual(result['accuracy'], 449 / 477)

    def test_vision_averages_accuracy_not_mme_points_or_f1(self):
        report = {'model': 'test', 'by_project': [
            {'project': project, 'configuration': config, 'coverage': 'complete',
             'metric': 'mme_score' if project == 'MME' else 'f1', 'score': 1500 if project == 'MME' else .4,
             'metrics': {'rows': count, 'accuracy': .75, 'failed_rows': 0}}
            for (project, config), count in VISION.items()]}
        result = compare({'test': report}, 'vision')['models']['test']
        self.assertEqual(result['accuracy'], .75)
        self.assertEqual(sum(r['rows'] for r in result['items']), 63372)
        self.assertEqual(next(r['native_score'] for r in result['items'] if r['project'] == 'MME'), 1500)
