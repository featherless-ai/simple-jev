"""Offline image transport and label-integrity tests, using a tiny PNG fixture."""
import base64
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from adapters import vision
from preparation.vision import make_row
from suites import load_suite

PNG=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=')


class VisionTests(unittest.TestCase):
    def test_portable_suite_and_no_label_leak(self):
        cfg={'id':'tiny','source_labels':['cat','dog'],'question':'What animal?'}
        row=make_row(cfg,3,1,PNG)
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);(root/'images').mkdir()
            (root/row['image_path']).write_bytes(PNG)
            (root/'rows.jsonl').write_text(json.dumps(row)+'\n')
            (root/'suite.json').write_text(json.dumps({'schema_version':1,'id':'tiny','version':'1','adapter':'vision-choice-v1','dataset':'rows.jsonl'}))
            _,adapter,_,rows=load_suite(root/'suite.json')
            body=adapter.request_for(rows[0],'vision-model')
            self.assertEqual(set(body),{'model','messages','questions'})
            content=body['messages'][0]['content']
            self.assertEqual(base64.b64decode(content[1]['image_url']['url'].split(',')[1]),PNG)
            self.assertNotIn(row['image_path'],json.dumps(body))
            self.assertEqual(body['questions']['decision']['criteria'],{'class_0':'cat','class_1':'dog'})
            self.assertEqual(row['label'],1)
            (root/row['image_path']).write_bytes(PNG+b'tamper')
            with self.assertRaises(ValueError): adapter.request_for(rows[0],'m')
            with self.assertRaises(ValueError): load_suite(root/'suite.json')

    def test_path_escape_rejected(self):
        with tempfile.TemporaryDirectory() as root:
            with self.assertRaises(ValueError): vision.bind_assets([{'image_path':'../private.png'}],Path(root))

    def test_original_class_sets_and_failure_scoring(self):
        root=Path(__file__).resolve().parents[1]
        for name,count,size in [('vision-cifar10',10,10000),('vision-oxford-pets',37,3669)]:
            cfg=json.loads((root/'vendor/vision'/f'{name}.json').read_text())
            self.assertEqual(len(cfg['source_labels']),count)
            self.assertEqual(cfg['source_rows'],size)
            self.assertNotIn('selected_labels',cfg)
        rows=[make_row({'id':'t','source_labels':['cat','dog'],'question':'?'},i,i,PNG) for i in [0,1]]
        report=vision.summarize(rows,[{'probabilities':[1,0]},{}])
        self.assertEqual(report['accuracy'],.5)
        self.assertEqual(report['per_class']['dog']['accuracy'],0)
