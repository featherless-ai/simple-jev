"""Check partitions against pinned fixtures, and exercise actual suite filtering."""
import json
from pathlib import Path
import tempfile
import unittest
from catalog import entries, ROOT, render
from preparation.external import jevbench
from preparation.visual_qa import MME_CATEGORIES
from suites import load_suite

class SplitTests(unittest.TestCase):
    def test_partitions_cover_original_families_once(self):
        manifests={d['id']:(p,d) for p,d in entries()}
        for parent_id,(path,parent) in manifests.items():
            if not parent.get('aggregate_children'):
                continue
            seen=[]
            for child_id in parent['aggregate_children']:
                _,child=manifests[child_id]
                self.assertEqual(child['parent_suite'],parent_id)
                self.assertEqual(child['dataset'],parent['dataset'])
                seen.extend(child['row_filter']['values'])
                self.assertEqual(render().count('['+child_id+']'),1)
            expected=(set(json.loads((ROOT/'vendor/knowledge/counts.json').read_text())[parent_id]) if parent_id in ('codemmlu-full','mmlu-pro') else set(json.loads((ROOT/'vendor/mmlu/source.json').read_text())['subject_counts']) if parent_id=='mmlu-full' else {'belebele','pawsx','kormed'} if parent_id.startswith('korean-public-') else set(MME_CATEGORIES) if parent_id=='vision-mme-perception'
                      else {r['family'] for r in jevbench(parent_id.removeprefix('jevbench-'))})
            self.assertEqual(len(seen),len(set(seen)))
            self.assertEqual(set(seen),expected)
            self.assertNotIn('['+parent_id+']',render())

    def test_loader_selects_without_mutating_cases(self):
        rows=jevbench('original')
        manifest=ROOT/'suites/english/jevbench-original-policies.json'
        with tempfile.TemporaryDirectory() as tmp:
            dataset=Path(tmp)/'rows.jsonl'
            dataset.write_text(''.join(json.dumps(r)+'\n' for r in rows))
            _,_,source,selected=load_suite(manifest,dataset)
            self.assertEqual(selected,[r for r in rows if r['family']=='policy'])
            self.assertEqual(source,dataset.read_bytes())
            dataset.write_text(json.dumps(rows[-1])+'\n')
            with self.assertRaises(ValueError):
                load_suite(manifest,dataset)
