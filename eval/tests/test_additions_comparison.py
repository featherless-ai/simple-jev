"""Completion gates for the matched model comparison (no inference)."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('additions_comparison', Path(__file__).resolve().parents[1] / 'experiments/jev_additions/compare_new.py')
comparison = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(comparison)


class CompletionTests(unittest.TestCase):
    def run_comparison(self, status, require_native=False, native=False):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            hf, extra = root / 'hf', root / 'native'
            hf.mkdir()
            report = root / 'archive.json'
            report.write_text('{}')
            plan = {'models': {'test-model': {'model': 'test/model', 'revision': 'pinned'}}}
            (hf / 'plan.json').write_text(json.dumps(plan))
            if native:
                extra.mkdir()
                (extra / 'plan.json').write_text(json.dumps({'models': {'extra': {'model': 'extra/model'}}}))
            if status is not None:
                out = hf / 'results/test-model'
                out.mkdir(parents=True)
                (out / 'status.json').write_text(json.dumps(status))
            (root / 'results/jev-additions-v1').mkdir(parents=True)
            item = {'dataset_sha256': 'data', 'adapter_sha256': 'adapter', 'score': 0.5}
            def suite_run(_root, names, model):
                return {name: dict(item) for name in names}
            history = {'multi_decision': {'unfair_tos': {'historical_f1': 0.5},
                                         'contractnli': {'historical_accuracy': 0.5}}}
            argv = ['compare_new.py', '--require-models'] + (['--require-native'] if require_native else [])
            with patch.multiple(comparison, ROOT=hf, NATIVE=extra, EVAL=root), \
                 patch.object(comparison, 'coverage', return_value=history), \
                 patch.object(comparison, '_archived', return_value=(None, {'manifest': item}, report)), \
                 patch.object(comparison, 'suite_run', side_effect=suite_run), \
                 patch('sys.argv', argv), contextlib.redirect_stdout(io.StringIO()):
                comparison.main()
            return json.loads((root / 'results/jev-additions-v1/comparison.json').read_text())

    def test_pending_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Pending GPU model'):
            self.run_comparison(None)

    def test_null_exit_code_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Unsuccessful GPU job'):
            self.run_comparison({'evaluation_exit_code': 0, 'audit_exit_code': None})

    def test_failed_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Unsuccessful GPU job'):
            self.run_comparison({'evaluation_exit_code': 1, 'audit_exit_code': 0})

    def test_missing_native_plan_rejected(self):
        with self.assertRaisesRegex(ValueError, 'plan is missing'):
            self.run_comparison({'evaluation_exit_code': 0, 'audit_exit_code': 0}, require_native=True)

    def test_pending_native_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Pending GPU model: extra'):
            self.run_comparison({'evaluation_exit_code': 0, 'audit_exit_code': 0}, require_native=True, native=True)

    def test_success_retains_configuration(self):
        result = self.run_comparison({'evaluation_exit_code': 0, 'audit_exit_code': 0})
        self.assertEqual(result['models'], {'test-model': 'audited'})
        self.assertEqual(result['configurations']['test-model']['revision'], 'pinned')
        self.assertEqual(result['configurations']['test-model']['runtime_family'], 'HF-server')


if __name__ == '__main__':
    unittest.main()
