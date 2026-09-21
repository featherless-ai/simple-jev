"""Offline regression checks for authenticated, concurrent, resumable runs."""
import argparse
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import run
from suites import load_suite

ROOT=Path(__file__).resolve().parents[1]


class ExecutionTests(unittest.TestCase):
    def test_overlap_validation_does_not_replace_auth_key(self):
        with tempfile.TemporaryDirectory() as tmp:
            output=Path(tmp)/'run'
            argv=['run.py','--endpoint','https://example.test/v1/systemone','--model','model',
                  '--key-env','TEST_EVAL_KEY','--suite',str(ROOT/'suites/english/semif-authored.json'),
                  '--output',str(output)]
            with patch('sys.argv',argv),patch.dict('os.environ',{'TEST_EVAL_KEY':'fake-key'}), \
                 patch('run.run_suite',return_value={'failed_rows':0}) as execute, \
                 patch('report.write_reports'):
                run.main()
            self.assertEqual(execute.call_args.args[1],'fake-key')

    def test_concurrent_resume_preserves_rows_and_rejects_changed_settings(self):
        suite,adapter,source,rows=load_suite(ROOT/'suites/english/semif-authored.json')
        rows=rows[:4]
        with tempfile.TemporaryDirectory() as tmp:
            args=argparse.Namespace(output=Path(tmp),endpoint='https://example.test',model='model',
                retries=0,delay=0,timeout=1,workers=2,resume=False)
            def predict(args,key,adapter,row):
                return {'id':row['id'],'probabilities':[1/len(row['options'])]*len(row['options'])}
            with patch('run.request_record',side_effect=predict) as request, patch('builtins.print'):
                first=run.run_suite(args,'fake-key',suite,adapter,source,rows)
                self.assertEqual(request.call_count,4)
                # Simulate interruption after two durably saved predictions.
                path=Path(tmp)/suite['id']/'predictions.jsonl'
                lines=path.read_text().splitlines()
                path.write_text('\n'.join(lines[:2])+'\n')
                args.resume=True
                second=run.run_suite(args,'fake-key',suite,adapter,source,rows)
                self.assertEqual(request.call_count,6)
                self.assertEqual(first,second)
                run.run_suite(args,'fake-key',suite,adapter,source,rows)
                self.assertEqual(request.call_count,6)
                args.model='different'
                with self.assertRaises(ValueError):run.run_suite(args,'fake-key',suite,adapter,source,rows)

    def test_context_free_request_uses_empty_string_and_bearer_header(self):
        args=argparse.Namespace(endpoint='https://example.test',model='model',retries=0,timeout=1)
        row={'id':'q'}
        from unittest.mock import Mock, MagicMock
        adapter=Mock()
        adapter.request_for.return_value={'model':'model','state':None,'questions':{}}
        adapter.parse_response.return_value={'probabilities':[1,0]}
        response=MagicMock()
        response.read.return_value=b'{"answers":{}}'
        opener=Mock()
        opener.open.return_value.__enter__ = Mock(return_value=response)
        opener.open.return_value.__exit__ = Mock(return_value=False)
        with patch('run.urllib.request.build_opener',return_value=opener):
            record=run.request_record(args,'fake-key',adapter,row)
        request=opener.open.call_args.args[0]
        self.assertEqual(json.loads(request.data)['state'],'')
        self.assertEqual(request.get_header('Authorization'),'Bearer fake-key')
        self.assertNotIn('error',record)

    def test_server_repair_preserves_successes_and_original_failure(self):
        from retry import retry_run
        suite,adapter,source,rows=load_suite(ROOT/'suites/english/semif-authored.json')
        rows=rows[:2]
        with tempfile.TemporaryDirectory() as tmp:
            args=argparse.Namespace(output=Path(tmp),endpoint='https://example.test',model='model',
                retries=0,delay=0,timeout=1,workers=1,resume=False)
            def initial(args,key,adapter,row):
                if row['id']==rows[0]['id']:
                    return {'id':row['id'],'error':'HTTP 520','http_status':520}
                return {'id':row['id'],'probabilities':[1/len(row['options'])]*len(row['options'])}
            with patch('run.request_record',side_effect=initial),patch('builtins.print'):
                run.run_suite(args,'fake-key',suite,adapter,source,rows)
            repaired={'id':rows[0]['id'],'probabilities':[1/len(rows[0]['options'])]*len(rows[0]['options'])}
            with patch('retry.request_record',return_value=repaired) as request,patch('builtins.print'):
                result=retry_run(Path(tmp),'fake-key')
                self.assertEqual(request.call_count,1)
                self.assertEqual(result[suite['id']]['failed_rows'],0)
                retry_run(Path(tmp),'fake-key')
                self.assertEqual(request.call_count,1)
            records=[json.loads(l) for l in (Path(tmp)/suite['id']/'predictions.jsonl').read_text().splitlines()]
            self.assertEqual(records[0]['prior_results'][0]['http_status'],520)
            self.assertNotIn('prior_results',records[1])
