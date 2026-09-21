"""Offline labelled-data conversion and MMLU reporting checks."""
import unittest
from preparation.mmlu import convert as mmlu_convert
from preparation.knowledge import convert
from adapters import choice,mmlu


class KnowledgeTests(unittest.TestCase):
    def test_mmlu_complete_subject_counts(self):
        records=[{'subject':'computer_security','question':'Q','choices':['a','b','c','d'],'answer':1}]
        rows=mmlu_convert(records,{'computer_security':1})
        self.assertEqual(list(choice.request_for(rows[0],'m')['questions']['decision']['criteria']),list('ABCD'))
        self.assertNotIn('label',choice.request_for(rows[0],'m'))
        with self.assertRaises(ValueError):mmlu_convert(records,{'computer_security':2})
        report=mmlu.summarize(rows,[{}])
        self.assertEqual(report['accuracy'],0)
        self.assertEqual(report['per_subject']['computer_security']['rows'],1)

    def test_gold_explanation_and_tool_name_not_sent(self):
        rows=convert('secqa-v1',[{'Question':'Q','A':'a','B':'b','C':'c','D':'d','Answer':'B','Explanation':'SECRET'}])
        self.assertNotIn('SECRET',str(choice.request_for(rows[0],'m')))
        rows=convert('metatool-awareness',[{'query':'current weather','label':'positive','tool':'SECRET'}])
        self.assertNotIn('SECRET',str(choice.request_for(rows[0],'m')))
        self.assertEqual(rows[0]['options'][rows[0]['label']]['id'],'yes')

    def test_code_context_and_known_exclusions(self):
        records=[{'task_id':'k05719','question':'testing','choices':['test'],'answer':'A'},
                 {'task_id':'good','question':'fill the gap','problem_description':'required context','choices':['a','b'],'answer':'B'}]
        rows=convert('codemmlu',records,'fill_in_the_middle')
        self.assertEqual(len(rows),1)
        self.assertEqual(rows[0]['state'],'required context')
        with self.assertRaises(ValueError):
            convert('codemmlu',[{'task_id':'unknown','question':'Q','choices':['a'],'answer':'A'}],'others')
