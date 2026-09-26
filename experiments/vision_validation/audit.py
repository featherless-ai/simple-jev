"""Independently replay frozen image plans, scoring and numeric gates (CPU only)."""
import argparse
import copy
import hashlib
import json
import math
from pathlib import Path
import sys


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    return json.loads(path.read_text())


def softmax(values):
    assert values and all(math.isfinite(x) for x in values)
    exps = [math.exp(x - max(values)) for x in values]
    return [x / sum(exps) for x in exps]


def check_rows(compiled, rows, threshold, reference_key='full', logit_threshold=float('inf')):
    numerical_passed = True
    assert len(compiled.branches) == len(rows)
    for branch, row in zip(compiled.branches, rows):
        assert branch.branch_id == row['branch']
        assert branch.output_ids == row['output_ids']
        assert len(branch.token_ids) == row['tokens']
        assert hashlib.sha256(json.dumps(branch.token_ids).encode()).hexdigest() == row['tokens_sha256']
        a, b = row['cached_logits'], row[reference_key + '_logits']
        assert len(a) == len(b) == len(branch.output_ids)
        pa, pb = softmax(a), softmax(b)
        for native, stored in [(pa, row['cached_probabilities']), (pb, row[reference_key + '_probabilities'])]:
            assert max(abs(x - y) for x, y in zip(native, stored)) < 5e-7
        delta = max(abs(x - y) for x, y in zip(pa, pb))
        assert abs(delta - row['max_probability_delta']) < 5e-7
        assert abs(max(abs(x - y) for x, y in zip(a, b)) - row['max_logit_delta']) < 1e-6
        agree = max(range(len(a)), key=a.__getitem__) == max(range(len(b)), key=b.__getitem__)
        assert row['top_label_agreement'] == agree
        numerical_passed &= (delta <= threshold and agree
                             and max(abs(x - y) for x, y in zip(a, b)) <= logit_threshold)
    return numerical_passed


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--attempt', default='a')
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--allow-failed-gates', '--allow-numerical-failures', action='store_true',
                        dest='allow_failed_gates',
                        help='Audit terminal failed numeric/quality gates transparently; never mark them passed')
    args = parser.parse_args()
    source = args.root / ('source-' + args.attempt)
    manifest = read(source.with_name(source.name + '-manifest.json'))
    for name, digest in manifest.items():
        assert sha(source / name) == digest, name
    job = read(args.root / 'jobs' / (args.attempt + '.status.json'))
    assert job['state'] in {'succeeded', 'failed'}, 'GPU job not terminal'
    if not args.allow_failed_gates:
        assert job['state'] == 'succeeded' and job['exitCode'] == 0, 'GPU job not successful'
    sys.path.insert(0, str(source / 'hf-server'))
    sys.path.insert(0, str(source))
    import torch
    from transformers import AutoProcessor
    from hf_server import PromptCompiler, unique_prompt_tokens
    from common import build_response
    from hf_prompt_policies import restore_binary_noul
    from dataclasses import replace
    torch.set_num_threads(4)
    plan = read(source / 'validation_assets/plan.json')
    fixture_path = source / 'validation_assets/fixtures.json'
    data = read(fixture_path)
    threshold = data['gates']['max_probability_delta']
    reference_mode = plan.get('reference', 'full')
    reference_key = 'native_chunked' if reference_mode == 'native_chunks' else 'full'
    logit_threshold = data['gates'].get('max_logit_delta', float('inf'))
    root = args.root / 'results' / args.attempt
    if not args.allow_failed_gates:
        assert read(root / 'complete.json')['models'] == len(plan['models'])
    statuses = read(root / 'status.json')
    assert len(statuses) == len(plan['models'])
    tests = None
    if plan.get('run_tests'):
        import xml.etree.ElementTree as ET
        assert read(root / 'tests-exit.json')['exit_code'] == 0
        suites = list(ET.parse(root / 'tests.xml').getroot().iter('testsuite'))
        tests = {key: sum(int(s.attrib.get(key, 0)) for s in suites)
                 for key in ['tests', 'failures', 'errors', 'skipped']}
        assert tests['tests'] > 0 and tests['failures'] == tests['errors'] == tests['skipped'] == 0
        tests['junit_sha256'] = sha(root / 'tests.xml')
    reports = []
    for model in plan['models']:
        directory = root / model['key']
        runtime = read(directory / 'runtime.json')
        assert runtime.get('reference_mode', 'full') == reference_mode
        assert runtime['model_type'] == model['family']
        assert runtime['revision'] == model['revision']
        assert runtime['gpu_preflight_sum'] == 32
        assert runtime['loaded_dtype'] == 'torch.' + plan['dtype']
        assert runtime['fixtures_sha256'] == sha(fixture_path)
        snapshot = Path('/root/.cache/huggingface/hub') / ('models--' + model['id'].replace('/', '--')) / 'snapshots' / model['revision']
        assert runtime['config_sha256'] == sha(snapshot / 'config.json')
        processor = AutoProcessor.from_pretrained(snapshot, local_files_only=True)
        repeated = copy.deepcopy(data['fixtures'][0])
        repeated['id'] = 'repeat-via-alias'
        fixtures = data['fixtures'] + [repeated]
        deltas, token_lengths, failed_gates, top_agreements = [], [], [], []
        numerical_failures, quality_failures = [], []
        full_deltas, full_failed_cases = [], []
        for fixture in fixtures:
            compiler = PromptCompiler(processor.tokenizer, processor=processor, max_tokens=16384,
                                      max_choice_options=50, prompt_policy=fixture['policy'])
            record = read(directory / (fixture['id'] + '.json'))
            if record.get('remote_downloads'):
                import hf_media
                original_fetch = hf_media.fetch_image
                downloads = iter(record['remote_downloads'])
                def frozen_image(url, **kwargs):
                    item = next(downloads)
                    assert item['url'] == url
                    path = directory / item['file']
                    assert path.parent == directory and sha(path) == item['sha256']
                    raw = path.read_bytes()
                    assert len(raw) == item['bytes'] <= kwargs['max_bytes']
                    return raw
                hf_media.fetch_image = frozen_image
                try:
                    compiled = compiler.compile(fixture['request'])
                    assert next(downloads, None) is None
                finally:
                    hf_media.fetch_image = original_fetch
            else:
                compiled = compiler.compile(fixture['request'])
            assert record['id'] == fixture['id'] and record['policy'] == fixture['policy']
            assert record['observed_calls'] == {'vision': 1, 'preprocess': 1}
            numeric_pass = check_rows(compiled, record['comparisons'], threshold, reference_key, logit_threshold)
            if reference_mode == 'native_chunks':
                diagnostic = record['nonchunked_full_diagnostic']
                diagnostic_pass = check_rows(compiled, diagnostic,
                    plan['nonchunked_diagnostic_max_probability_delta'])
                assert [r['cached_logits'] for r in diagnostic] == [r['cached_logits'] for r in record['comparisons']]
                full_deltas.extend(r['max_probability_delta'] for r in diagnostic)
                if not diagnostic_pass:
                    full_failed_cases.append(fixture['id'])
            logits = {r['branch']: torch.tensor(r['cached_logits']) for r in record['comparisons']}
            response = build_response(compiled.plan, logits, input_tokens=unique_prompt_tokens([b.token_ids for b in compiled.branches]),
                                      output_tokens=0, advanced=True)
            restore_binary_noul(response, compiled.binary_noul_keys)
            assert response['answers'] == record['response']['answers']
            assert response['usage'] == record['response']['usage']
            color_pass = response['answers']['color']['choice'] == fixture['expected_color']
            metrics = record['response']['metrics']
            assert metrics['vision_forwards'] == 1 and metrics['prefill_strategy'] == 'multimodal_shared_prefix'
            assert metrics['engine_forwards'] == 1 + len(compiled.branches)
            assert metrics['prefix_tokens'] > 0
            for branch in compiled.branches:
                assert not (branch.model_inputs['mm_token_type_ids'][..., metrics['prefix_tokens']:] != 0).any()
            assert record['passed'] == (numeric_pass and color_pass)
            if not numeric_pass:
                numerical_failures.append(fixture['id'])
            if not color_pass:
                quality_failures.append(fixture['id'])
            if not numeric_pass or not color_pass:
                failed_gates.append(fixture['id'])
            top_agreements.extend(r['top_label_agreement'] for r in record['comparisons'])
            deltas.extend(r['max_probability_delta'] for r in record['comparisons'])
            token_lengths.extend(r['tokens'] for r in record['comparisons'])
        original = data['fixtures'][0]['request']
        compiler = PromptCompiler(processor.tokenizer, processor=processor, max_choice_options=50)
        whole = compiler.compile(original)
        branches = []
        for i, key in enumerate(original['questions']):
            request = copy.deepcopy(original)
            request['messages'][0]['content'] = f'Branch identifier {i}. ' + request['messages'][0]['content']
            request['questions'] = {key: original['questions'][key]}
            branch = compiler.compile(request).branches[0]
            branches.append(replace(branch, branch_id=whole.branches[i].branch_id))
        independent = read(directory / 'separate-contexts.json')
        numeric_pass = check_rows(replace(whole, branches=branches), independent['comparisons'], threshold, reference_key, logit_threshold)
        assert independent['observed_vision_calls'] == 3 and independent['metrics']['prefix_tokens'] == 0
        assert independent['passed'] == numeric_pass
        if not numeric_pass:
            failed_gates.append('separate-contexts')
            numerical_failures.append('separate-contexts')
        top_agreements.extend(r['top_label_agreement'] for r in independent['comparisons'])
        mixed = None
        if data.get('mixed_context_groups'):
            grouped = replace(whole, branches=whole.branches[:2] + [branches[2]])
            mixed = read(directory / 'mixed-contexts.json')
            numeric_pass = check_rows(grouped, mixed['comparisons'], threshold, reference_key, logit_threshold)
            metrics = mixed['metrics']
            assert mixed['observed_vision_calls'] == metrics['vision_forwards'] == 2
            assert mixed['reference_vision_calls'] == 3
            assert metrics['prefill_strategy'] == 'multimodal_grouped_prefix'
            assert metrics['context_groups'] == 2 and metrics['prefix_tokens'] == 0
            lengths = metrics['group_prefix_tokens']
            assert len(lengths) == 2 and lengths[0] > 0 and lengths[1] == 0
            assert whole.branches[0].token_ids[:lengths[0]] == whole.branches[1].token_ids[:lengths[0]]
            for branch in whole.branches[:2]:
                assert not branch.image_mask[..., lengths[0]:].any()
            assert metrics['engine_forwards'] == 4 and metrics['branch_output_tokens'] == 0
            assert metrics['computed_prompt_tokens'] == sum(len(b.token_ids) for b in grouped.branches) - lengths[0]
            assert mixed['passed'] == numeric_pass
            if not numeric_pass:
                failed_gates.append('mixed-contexts')
                numerical_failures.append('mixed-contexts')
            top_agreements.extend(r['top_label_agreement'] for r in mixed['comparisons'])
        rejections = read(directory / 'rejections.json')
        assert {r['kind'] for r in rejections} == {'remote_url', 'invalid_base64', 'audio', 'tools', 'overlong'}
        assert all(r['status'] == 422 for r in rejections)
        assert read(directory / 'text-after-images.json')['answers']['color']['choice'] == 'green'
        first = read(directory / (data['fixtures'][0]['id'] + '.json'))
        repeat = read(directory / 'repeat-via-alias.json')
        assert first['response']['answers'] == repeat['response']['answers']
        complete = read(directory / 'summary.json')
        assert complete['passed'] == (not failed_gates)
        assert complete['failed_cases'] == failed_gates
        if not failed_gates:
            assert read(directory / 'complete.json') == complete
        assert next(s for s in statuses if s['model']['key'] == model['key'])['exit_code'] == (1 if failed_gates else 0)
        if not args.allow_failed_gates:
            assert not failed_gates
        assert complete['image_http_requests'] == len(fixtures)
        assert complete['http_selected_logit_comparisons'] == len(fixtures) * 3
        assert complete['color_correct'] == len(fixtures) - len(quality_failures)
        assert complete['max_probability_delta'] == max(deltas)
        if reference_mode == 'native_chunks':
            assert complete['nonchunked_full_max_probability_delta'] == max(full_deltas)
        reports.append({'model': model['id'], 'revision': model['revision'],
                        'image_http_requests': len(fixtures), 'native_logit_comparisons': len(fixtures) * 3 + 3 + (3 if mixed else 0),
                        'color_smoke_correct': len(fixtures) - len(quality_failures), 'max_probability_delta': max(deltas),
                        'max_expanded_branch_tokens': max(token_lengths),
                        'max_logit_delta': max(r['max_logit_delta'] for fixture in fixtures
                            for r in read(directory / (fixture['id'] + '.json'))['comparisons']),
                        'nonchunked_full_max_probability_delta': max(full_deltas, default=None),
                        'nonchunked_full_failed_numeric_cases': full_failed_cases,
                        'shared_image_calls': 1, 'independent_image_calls': 3,
                        'mixed_context_image_calls': 2 if mixed else None,
                        'mixed_context_max_logit_delta': max(r['max_logit_delta'] for r in mixed['comparisons']) if mixed else None,
                        'mixed_context_max_probability_delta': max(r['max_probability_delta'] for r in mixed['comparisons']) if mixed else None,
                        'http422_checks': len(rejections), 'functional_passed': True,
                        'top_label_agreements': sum(top_agreements),
                        'failed_numerical_gates': numerical_failures, 'numerical_gate_passed': not numerical_failures,
                        'failed_color_gates': quality_failures, 'color_smoke_gate_passed': not quality_failures})
    report = {'functional_passed': True, 'numerical_gate_passed': all(r['numerical_gate_passed'] for r in reports),
              'color_smoke_gate_passed': all(r['color_smoke_gate_passed'] for r in reports),
              'auditor_sha256': sha(Path(__file__)),
              'reference_mode': reference_mode,
              'dtype': plan['dtype'], 'job_id': job['id'], 'job_state': job['state'], 'exit_code': job['exitCode'],
              'source_files_verified': len(manifest), 'fixtures_sha256': sha(fixture_path),
              'regression_tests': tests,
              'frozen_gates': data['gates'], 'models': reports,
              'total_image_http_requests': sum(r['image_http_requests'] for r in reports),
              'total_native_logit_comparisons': sum(r['native_logit_comparisons'] for r in reports),
              'scope': data['scope']}
    with args.output.open('x') as stream:
        json.dump(report, stream, indent=2, allow_nan=False)
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
