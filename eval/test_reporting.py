"""Regression tests for project recomputation, coverage and duplicate protection."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from adapters import choice
from report import collect, markdown


class ReportingTests(unittest.TestCase):
    def write_run(self, root, name, rows, records, partitions):
        out=Path(root)/name;out.mkdir()
        raw=''.join(json.dumps(r)+'\n' for r in rows).encode()
        (out/'scoring_rows.jsonl').write_bytes(raw)
        (out/'predictions.jsonl').write_text(''.join(json.dumps(r)+'\n' for r in records))
        manifest={'model':'test-model','endpoint':'http://example/v1/classifier',
                  'dataset_sha256':'same-original-dataset',
                  'suite':{'adapter':'choice-v1','headline_metric':'accuracy'},
                  'adapter_sha256':hashlib.sha256(Path(choice.__file__).read_bytes()).hexdigest(),
                  'scoring_rows_sha256':hashlib.sha256(raw).hexdigest(),
                  'reporting':{'project':'Example','configuration':'test',
                               'expected_suites':['small','large'],'partitions':partitions}}
        (out/'manifest.json').write_text(json.dumps(manifest))

    def row(self,id,family):
        return {'id':id,'group_id':id,'family':family,'label':0,
                'state':None,'question':'Q','options':[{'id':'A','description':'A'},{'id':'B','description':'B'}]}

    def partition(self,id,category):
        return {'id':id,'category':category,'subcategory':'model-knowledge',
                'modality':'text','language_group':'english',
                'row_filter':{'field':'family','values':[id]}}

    def test_project_score_is_not_mean_of_partition_scores(self):
        with tempfile.TemporaryDirectory() as root:
            rows=[self.row('a','small')]+[self.row(str(i),'large') for i in range(3)]
            records=[{'id':r['id'],'probabilities':[1,0] if i==0 else [0,1]} for i,r in enumerate(rows)]
            self.write_run(root,'parent',rows,records,[self.partition('small','legal'),self.partition('large','coding')])
            report=collect([root])
            self.assertEqual(report['by_project'][0]['score'],.25)
            self.assertEqual(report['by_project'][0]['coverage'],'complete')
            self.assertEqual({r['score'] for r in report['by_category']},{0,1})
            self.assertTrue(all(r['coverage']=='complete' for r in report['by_category']))
            self.assertIn('Example',markdown(report,'project'))

    def test_partial_and_missing_predictions(self):
        with tempfile.TemporaryDirectory() as root:
            self.write_run(root,'small',[self.row('a','small')],[],[self.partition('small','legal')])
            r=collect([root])['by_project'][0]
            self.assertEqual(r['coverage'],'partial')
            self.assertEqual(r['missing_suites'],['large'])
            self.assertEqual(r['metrics']['failed_rows'],1)
            self.assertEqual(r['score'],0)

    def test_reject_overlapping_runs(self):
        with tempfile.TemporaryDirectory() as root:
            for name in ('first','second'):
                self.write_run(root,name,[self.row('a','small')],[],[self.partition('small','legal')])
            with self.assertRaisesRegex(ValueError,'Overlapping'):
                collect([root])

    def test_reject_changed_scoring_inputs(self):
        with tempfile.TemporaryDirectory() as root:
            self.write_run(root,'small',[self.row('a','small')],[],[self.partition('small','legal')])
            (Path(root)/'small/scoring_rows.jsonl').write_text('')
            with self.assertRaisesRegex(ValueError,'changed'):
                collect([root])
