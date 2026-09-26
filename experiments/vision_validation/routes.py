"""Diagnostic only: hold native full-forward expert choices fixed in cached scoring.

No production monkey-patch is installed. Gates are recomputed from current
activations; only expert IDs/order are controlled to test routing discontinuity.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import threading

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'hf-server'))
from hf_server import load_service, PromptCompiler, common_prefix


def dump(path, value):
    path.write_text(json.dumps(value, indent=2, allow_nan=False) + '\n')


def main(args):
    import torch
    import transformers
    torch.set_num_threads(4)
    torch.set_float32_matmul_precision('highest')
    torch.backends.cuda.matmul.allow_tf32 = False
    torch.backends.cudnn.allow_tf32 = False
    assert torch.cuda.is_available() and torch.ones(16, device='cuda').sum().item() == 16
    args.output.mkdir(parents=True, exist_ok=False)
    data = json.loads(args.fixtures.read_text())
    selection = next(m for m in data['models'] if m['revision'] == args.model.name)
    service = load_service(str(args.model), device='cuda', dtype='float32', max_choice_options=50,
                           prompt_policy='baseline')
    model = service.backend.model
    routers = {name: module for name, module in model.named_modules()
               if type(module).__name__ in {'Gemma4TextRouter', 'Qwen3_5MoeTopKRouter'}}
    assert routers
    dump(args.output / 'runtime.json', {'model': str(args.model), 'revision': args.model.name,
         'dtype': str(model.dtype), 'torch': torch.__version__, 'transformers': transformers.__version__,
         'hip': torch.version.hip, 'routers': list(routers), 'gates': data['gates'],
         'selection_sha256': hashlib.sha256(args.fixtures.read_bytes()).hexdigest()})
    state, handles = {}, []
    def model_hook(*unused):
        state['forward'] += 1
    handles.append(model.register_forward_pre_hook(model_hook))
    def router_hook(name, module, inputs, output):
        if state['forward'] > (1 if state['mode'] == 'full' else 2):
            return output  # remaining unrelated question suffixes are not this control
        raw, weights, indices = output
        probs = raw if type(module).__name__ == 'Gemma4TextRouter' else raw.softmax(-1)
        cut = probs.topk(indices.shape[-1] + 1, dim=-1).values
        margins = cut[:, -2] - cut[:, -1]
        if state['mode'] == 'fixed':
            start = state['offsets'].get(name, 0)
            end = start + indices.shape[0]
            state['offsets'][name] = end
            indices = state['full_routes'][name]['indices'][start:end].to(device=raw.device, dtype=torch.long)
            assert indices.shape == output[2].shape
            weights = probs.gather(-1, indices)
            weights = weights / weights.sum(-1, keepdim=True)
            if type(module).__name__ == 'Gemma4TextRouter':
                weights = weights * module.per_expert_scale[indices]
            else:
                weights = weights.to(raw.dtype)
        state['captures'].setdefault(name, []).append({
            'indices': indices.detach().to(device='cpu', dtype=torch.int16),
            'weights': weights.detach().float().cpu(), 'margins': margins.detach().cpu()})
        return raw, weights, indices
    for name, module in routers.items():
        handles.append(module.register_forward_hook(lambda m, i, o, name=name: router_hook(name, m, i, o)))
    records = []
    try:
        for index, item in enumerate(selection['cases']):
            fixture = item['fixture']
            compiler = PromptCompiler(service.compiler.tokenizer, processor=service.compiler.processor,
                                      max_choice_options=50, prompt_policy=fixture['policy'])
            compiled = compiler.compile(fixture['request'])
            focal = next(b for b in compiled.branches if b.branch_id == item['branch'])
            prefix_length = len(common_prefix([b.token_ids for b in compiled.branches]))
            compiled.branches = [focal] + [b for b in compiled.branches if b is not focal]
            assert prefix_length == len(common_prefix([b.token_ids for b in compiled.branches]))
            outputs, captures = {}, {}
            for mode in ['full', 'natural', 'fixed']:
                state.update(mode=mode, forward=0, offsets={}, captures={})
                with torch.inference_mode():
                    if mode == 'full':
                        inputs = {k: v.to(device='cuda', dtype=torch.float32 if v.is_floating_point() else v.dtype)
                                  for k, v in focal.model_inputs.items()}
                        out = model(**inputs, use_cache=False, logits_to_keep=1)
                        logits = out.logits[0, -1, focal.output_ids].float().cpu()
                        del out, inputs
                    else:
                        result = service.backend._score(compiled, threading.Event())
                        assert result.metrics['vision_forwards'] == 1
                        assert result.metrics['prefix_tokens'] == prefix_length
                        logits = result.logits[focal.branch_id]
                assert torch.isfinite(logits).all()
                outputs[mode] = logits
                captures[mode] = {name: {field: torch.cat([part[field] for part in parts])
                                         for field in parts[0]}
                                  for name, parts in state['captures'].items()}
                assert all(v['indices'].shape[0] == len(focal.token_ids) for v in captures[mode].values())
                if mode == 'full':
                    state['full_routes'] = captures[mode]
            layers = []
            for name in routers:
                full, natural, fixed = (captures[mode][name] for mode in ['full', 'natural', 'fixed'])
                assert torch.equal(full['indices'], fixed['indices'])
                changed = (full['indices'].sort(-1).values != natural['indices'].sort(-1).values).any(-1)
                indices = changed.nonzero().flatten()
                layers.append({'name': name, 'changed_tokens': indices.numel(),
                    'examples': [{'token': i, 'full_ids': full['indices'][i].tolist(),
                                  'natural_ids': natural['indices'][i].tolist(),
                                  'full_margin': full['margins'][i].item(),
                                  'natural_margin': natural['margins'][i].item()} for i in indices[:3].tolist()]})
            natural_delta = (outputs['full'].softmax(-1) - outputs['natural'].softmax(-1)).abs().max().item()
            fixed_delta = (outputs['full'].softmax(-1) - outputs['fixed'].softmax(-1)).abs().max().item()
            passed = fixed_delta <= data['gates']['fixed_probability_delta']
            if natural_delta > data['gates']['large_natural_delta']:
                passed &= fixed_delta <= natural_delta / data['gates']['minimum_reduction_factor']
                passed &= any(layer['changed_tokens'] for layer in layers)
            record = {'id': fixture['id'], 'branch': focal.branch_id, 'selection_role': item['role'],
                      'tokens': len(focal.token_ids), 'prefix_tokens': prefix_length,
                      'token_ids_sha256': hashlib.sha256(json.dumps(focal.token_ids).encode()).hexdigest(),
                      'output_ids': focal.output_ids, 'logits': {k: v.tolist() for k, v in outputs.items()},
                      'natural_probability_delta': natural_delta, 'fixed_probability_delta': fixed_delta,
                      'layers': layers, 'passed': passed}
            torch.save(captures, args.output / f'routes-{index}.pt')
            dump(args.output / f'case-{index}.json', record)
            records.append(record)
            print(fixture['id'], focal.branch_id, 'natural', natural_delta, 'fixed', fixed_delta, 'passed', passed, flush=True)
    finally:
        for handle in handles:
            handle.remove()
    summary = {'passed': all(r['passed'] for r in records), 'cases': len(records),
               'max_fixed_probability_delta': max(r['fixed_probability_delta'] for r in records),
               'scope': 'Controlled expert-route diagnostic only, not production scoring or accuracy'}
    dump(args.output / 'summary.json', summary)
    assert summary['passed'], summary
    dump(args.output / 'complete.json', summary)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--fixtures', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--dtype', default='float32')
    main(parser.parse_args())
