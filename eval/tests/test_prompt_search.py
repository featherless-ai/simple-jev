"""Search orchestration checks without model downloads, GPUs, or synthetic benchmarks."""
import contextlib
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import Mock, patch

import prompt_search as search


def summaries():
    return {name: {'rows': count, 'successful_rows': count, 'failed_rows': 0,
                   'accuracy': 1.0} for name, count in search.COUNTS.items()}


class SearchTests(unittest.TestCase):
    def test_native_total_and_incomplete_rejection(self):
        self.assertEqual(search.native_total(summaries()), 477)
        for change in [{'failed_rows': 1}, {'successful_rows': 230},
                       {'accuracy': float('nan')}, {'accuracy': .123456}]:
            data = summaries(); data['jevbench-public'].update(change)
            with self.assertRaises(ValueError): search.native_total(data)
        with self.assertRaises(ValueError): search.native_total({})

    def test_no_winner_from_partial_search_and_ties(self):
        results = [{'policy': 'baseline', 'status': 'complete', 'correct': 400}]
        self.assertIsNone(search.comparison(results, search.POLICIES)['recommended_policy'])
        results += [{'policy': p, 'status': 'complete', 'correct': 400} for p in search.POLICIES[1:]]
        self.assertEqual(search.comparison(results, search.POLICIES)['recommended_policy'], 'baseline')
        results[1]['status'] = 'failed'
        self.assertIsNone(search.comparison(results, search.POLICIES)['recommended_policy'])

    def test_offline_list_and_existing_output(self):
        with patch.object(search, 'preflight', side_effect=AssertionError('must not load data')), \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(search.main(['--model', 'unloaded/model', '--list']), 0)
        plan = json.loads(output.getvalue())
        self.assertEqual(len(plan['commands']), 4)
        for policy, command in zip(search.POLICIES, plan['commands']):
            self.assertEqual(command[command.index('--classifier-prompt-policy') + 1], policy)
            self.assertIn('--enforce-model-id', command)
        with tempfile.TemporaryDirectory() as directory, contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit):
                search.main(['--model', 'unused', '--output', directory])

    def test_missing_data_prevents_launch(self):
        with tempfile.TemporaryDirectory() as root, \
             patch.object(search, 'preflight', side_effect=FileNotFoundError('prepare datasets')), \
             patch.object(search.subprocess, 'Popen') as launch:
            target = Path(root) / 'new'
            with self.assertRaises(FileNotFoundError):
                search.main(['--model', 'unused', '--output', str(target)])
            launch.assert_not_called(); self.assertFalse(target.exists())

    def test_existing_listener_is_not_adopted(self):
        import socket
        with socket.socket() as listener:
            listener.bind(('127.0.0.1', 0)); listener.listen()
            port = listener.getsockname()[1]
            with self.assertRaises(OSError): search.port_available(port)
        search.port_available(port)

    def test_readiness_rejects_wrong_identity_and_exited_process(self):
        process = Mock(); process.poll.return_value = None
        response = io.BytesIO(json.dumps({'status': 'ready', 'model': 'someone-else'}).encode())
        opener = Mock(); opener.open.return_value = response
        with patch.object(search.urllib.request, 'build_opener', return_value=opener), \
             patch.object(search.time, 'monotonic', side_effect=[0, 0, 2]), \
             patch.object(search.time, 'sleep'):
            with self.assertRaises(TimeoutError): search.wait_ready(process, 'http://local', 'ours', 1)
        process.poll.return_value = 1
        with self.assertRaises(RuntimeError): search.wait_ready(process, 'http://local', 'ours', 1)

    def test_revision_pinning_online_offline_and_local(self):
        import sys
        from types import SimpleNamespace
        commit = 'a' * 40
        info = Mock(return_value=SimpleNamespace(sha=commit))
        hub = SimpleNamespace(HfApi=Mock(return_value=SimpleNamespace(model_info=info)),
                              constants=SimpleNamespace(HF_HUB_OFFLINE=False),
                              try_to_load_from_cache=Mock(return_value=f'/cache/snapshots/{commit}/config.json'))
        with patch.dict(sys.modules, {'huggingface_hub': hub}):
            self.assertEqual(search.pin_revision('org/model', 'branch'), commit)
            info.assert_called_once_with('org/model', revision='branch', timeout=30)
            hub.constants.HF_HUB_OFFLINE = True
            self.assertEqual(search.pin_revision('org/model', None), commit)
            info.assert_called_once()
            hub.try_to_load_from_cache.return_value = None
            with self.assertRaises(ValueError): search.pin_revision('org/model', None)
            with tempfile.TemporaryDirectory() as directory:
                self.assertIsNone(search.pin_revision(directory, None))

    def test_owned_cleanup_escalates_only_for_own_process(self):
        process = Mock(); process.poll.return_value = None
        process.wait.side_effect = [subprocess.TimeoutExpired('ours', 30), 0]
        search.stop_owned(process)
        process.terminate.assert_called_once(); process.kill.assert_called_once()
        process = Mock(); process.poll.return_value = 0
        search.stop_owned(process); process.terminate.assert_not_called()

    def run_mock_policy(self, mode):
        with tempfile.TemporaryDirectory() as root:
            directory = Path(root) / 'baseline'
            args = search.parser().parse_args(['--model', 'physical', '--revision', 'pinned'])
            process = Mock(); process.pid = 12345; process.poll.return_value = None
            provenance = {'source_sha256': {}, 'dataset_sha256': {}}
            def evaluate(command, **kwargs):
                if mode == 'interrupt': raise KeyboardInterrupt()
                if mode == 'timeout': raise subprocess.TimeoutExpired(command, 1)
                if command[1].endswith('/run.py'):
                    target = Path(command[command.index('--output') + 1]); target.mkdir()
                    (target / 'summary.json').write_text(json.dumps(summaries()))
                return subprocess.CompletedProcess(command, 1 if mode == 'failure' else 0)
            with patch.object(search, 'preflight', return_value={}), \
                 patch.object(search, 'source_hashes', return_value={}), \
                 patch.object(search, 'port_available'), \
                 patch.object(search, 'wait_ready', return_value={'status': 'ready'}), \
                 patch.object(search.subprocess, 'Popen', return_value=process) as launch, \
                 patch.object(search.subprocess, 'run', side_effect=evaluate):
                if mode == 'interrupt':
                    with self.assertRaises(KeyboardInterrupt):
                        search.run_policy(args, 'baseline', directory, provenance)
                else:
                    search.run_policy(args, 'baseline', directory, provenance)
            process.terminate.assert_called_once()
            result = json.loads((directory / 'result.json').read_text())
            self.assertEqual(launch.call_args.args[0][3], 'physical')
            return result

    def test_external_termination_uses_normal_cleanup(self):
        with self.assertRaises(KeyboardInterrupt): search.interrupt_search(None, None)

    def test_complete_pipeline(self):
        result = self.run_mock_policy('success')
        self.assertEqual(result['status'], 'complete'); self.assertEqual(result['correct'], 477)

    def test_failures_and_interrupt_are_retained(self):
        for mode in ['failure', 'timeout', 'interrupt']:
            result = self.run_mock_policy(mode)
            self.assertEqual(result['status'], 'interrupted' if mode == 'interrupt' else 'failed')
            self.assertIn('error', result)
