"""Independently audit the diagnostic-only fixed-expert-route intervention."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def probability(values):
    assert all(math.isfinite(v) for v in values)
    exps = [math.exp(v - max(values)) for v in values]
    return [v / sum(exps) for v in exps]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--attempt', default='d')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    source = args.root / ('source-' + args.attempt)
    manifest = read(source.with_name(source.name + '-manifest.json'))
    for name, value in manifest.items():
        assert sha(source / name) == value
    job = read(args.root / 'jobs' / (args.attempt + '.status.json'))
    assert job['state'] == 'succeeded' and job['exitCode'] == 0
    results = args.root / 'results' / args.attempt
    data = read(source / 'validation_assets/fixtures.json')
    assert read(results / 'complete.json')['models'] == len(data['models'])
    sys.path.insert(0, str(source / 'hf-server'))
    sys.path.insert(0, str(source))
    import torch
    from transformers import AutoProcessor
    from hf_server import PromptCompiler, common_prefix
    torch.set_num_threads(4)
    cases, route_hashes = [], {}
    for model in data['models']:
        directory = results / model['key']
        assert read(directory / 'complete.json')['passed'] is True
        runtime = read(directory / 'runtime.json')
        assert runtime['dtype'] == 'torch.float32'
        assert runtime['revision'] == model['revision']
        snapshot = Path('/root/.cache/huggingface/hub') / ('models--' + model['id'].replace('/', '--')) / 'snapshots' / model['revision']
        processor = AutoProcessor.from_pretrained(snapshot, local_files_only=True)
        for index, spec in enumerate(model['cases']):
            row = read(directory / f'case-{index}.json')
            compiler = PromptCompiler(processor.tokenizer, processor=processor, max_choice_options=50,
                                      prompt_policy=spec['fixture']['policy'])
            compiled = compiler.compile(spec['fixture']['request'])
            branch = next(b for b in compiled.branches if b.branch_id == spec['branch'])
            assert row['branch'] == spec['branch'] and row['id'] == spec['fixture']['id']
            assert row['output_ids'] == branch.output_ids
            assert row['token_ids_sha256'] == hashlib.sha256(json.dumps(branch.token_ids).encode()).hexdigest()
            assert row['prefix_tokens'] == len(common_prefix([b.token_ids for b in compiled.branches]))
            vectors = {key: probability(value) for key, value in row['logits'].items()}
            natural = max(abs(a - b) for a, b in zip(vectors['full'], vectors['natural']))
            fixed = max(abs(a - b) for a, b in zip(vectors['full'], vectors['fixed']))
            assert abs(natural - row['natural_probability_delta']) < 5e-7
            assert abs(fixed - row['fixed_probability_delta']) < 5e-7
            assert fixed <= data['gates']['fixed_probability_delta']
            if natural > data['gates']['large_natural_delta']:
                assert fixed <= natural / data['gates']['minimum_reduction_factor']
            path = directory / f'routes-{index}.pt'
            capture = torch.load(path, map_location='cpu', weights_only=True)
            assert set(capture) == {'full', 'natural', 'fixed'}
            changed = 0
            earliest = None
            for layer in row['layers']:
                name = layer['name']
                full_ids = capture['full'][name]['indices']
                split_ids = capture['natural'][name]['indices']
                fixed_ids = capture['fixed'][name]['indices']
                assert full_ids.shape[0] == len(branch.token_ids)
                assert torch.equal(full_ids, fixed_ids)
                delta = (full_ids.sort(-1).values != split_ids.sort(-1).values).any(-1)
                assert int(delta.sum()) == layer['changed_tokens']
                changed += int(delta.sum())
                for example in layer['examples']:
                    i = example['token']
                    assert delta[i]
                    assert example['full_ids'] == full_ids[i].tolist()
                    assert example['natural_ids'] == split_ids[i].tolist()
                    assert example['full_margin'] == capture['full'][name]['margins'][i].item()
                    assert example['natural_margin'] == capture['natural'][name]['margins'][i].item()
                    if earliest is None:
                        earliest = {'layer': name, **example}
            if natural > data['gates']['large_natural_delta']:
                assert changed > 0
            assert row['passed'] is True
            route_hashes[str(path.relative_to(results))] = sha(path)
            cases.append({'model': model['id'], 'id': row['id'], 'branch': row['branch'],
                          'role': spec['role'], 'natural_probability_delta': natural,
                          'fixed_probability_delta': fixed, 'changed_layer_token_pairs': changed,
                          'earliest_change': earliest, 'passed': True})
    report = {'passed': True, 'job_id': job['id'], 'state': job['state'], 'exit_code': job['exitCode'],
              'source_files_verified': len(manifest), 'gates': data['gates'], 'cases': cases,
              'route_capture_hashes': route_hashes, 'auditor_sha256': sha(Path(__file__)),
              'scope': 'Diagnostic route control only; no production routes, logits or scores overridden'}
    with args.output.open('x') as stream:
        json.dump(report, stream, indent=2, allow_nan=False)
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
