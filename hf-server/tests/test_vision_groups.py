"""Compatible subsets share even when another context diverges."""
from dataclasses import replace
import threading

import pytest

from test_vision import compiled_images, tiny_model

FAMILIES = ['qwen2_vl', 'qwen2_5_vl', 'qwen3_vl', 'qwen3_vl_moe', 'qwen3_5',
            'qwen3_5_moe', 'gemma3', 'gemma4', 'gemma4_unified', 'llava', 'llava_next']


def mixed_contexts(family, kind):
    import torch
    a = compiled_images(family)
    b = compiled_images(family, color_seed=99 if kind == 'pixels' else 1)
    branches = []
    for branch in b.branches[:2]:
        if kind == 'leading_text':
            ids = [18, 19] + branch.token_ids
            inputs = dict(branch.model_inputs)
            inputs['input_ids'] = torch.tensor([ids])
            inputs['attention_mask'] = torch.ones(1, len(ids), dtype=torch.long)
            for name in ['mm_token_type_ids', 'token_type_ids']:
                if name in inputs:
                    inputs[name] = torch.cat([torch.zeros(1, 2, dtype=inputs[name].dtype), inputs[name]], dim=-1)
            branch = replace(branch, token_ids=ids, model_inputs=inputs,
                             image_mask=torch.cat([torch.zeros(1, 2, dtype=torch.bool), branch.image_mask], dim=-1))
        branches.append(replace(branch, branch_id='b' + branch.branch_id))
    return replace(a, branches=[a.branches[0], branches[0], a.branches[1], branches[1]])


@pytest.mark.parametrize('family', FAMILIES)
@pytest.mark.parametrize('kind', ['pixels', 'leading_text'])
async def test_compatible_subsets_prefill_once_and_match_native(family, kind):
    import importlib.util
    from pathlib import Path
    import torch
    from hf_server import HFBackend
    model = tiny_model(family)
    compiled = mixed_contexts(family, kind)
    tower = (model.model.visual if family.startswith('qwen') else
             model.model.embed_vision if family == 'gemma4_unified' else model.model.vision_tower)
    calls = []
    hook = tower.register_forward_pre_hook(lambda *args: calls.append(1))
    result = await HFBackend(model).score(compiled)
    hook.remove()
    assert len(calls) == result.metrics['vision_forwards'] == 2
    assert result.metrics['prefill_strategy'] == 'multimodal_grouped_prefix'
    assert result.metrics['context_groups'] == 2
    assert result.metrics['engine_forwards'] == 6
    assert result.metrics['prefix_tokens'] == 0  # no single globally reusable prefix
    assert result.metrics['group_prefix_tokens'] == [len(compiled.branches[i].token_ids) - 2 for i in [0, 1]]
    assert list(result.logits) == [b.branch_id for b in compiled.branches]
    assert result.metrics['computed_prompt_tokens'] == (sum(len(b.token_ids) for b in compiled.branches)
                                                       - sum(result.metrics['group_prefix_tokens']))
    with torch.inference_mode():
        for branch in compiled.branches:
            expected = model(**branch.model_inputs, use_cache=False).logits[0, -1, branch.output_ids]
            torch.testing.assert_close(result.logits[branch.branch_id], expected, atol=3e-6, rtol=3e-5)
    path = Path(__file__).resolve().parents[2] / 'experiments/vision_validation/native_chunks.py'
    spec = importlib.util.spec_from_file_location('native_groups_reference', path)
    reference = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(reference)
    # Fresh native image prefix per question, separately for the known contexts.
    for indexes in [[0, 2], [1, 3]]:
        group = replace(compiled, branches=[compiled.branches[i] for i in indexes])
        for key, expected in reference.reference(model, group).items():
            torch.testing.assert_close(result.logits[key], expected, atol=1e-6, rtol=0)


async def test_cancel_between_context_groups_and_reuse_backend():
    import asyncio
    import torch
    from hf_server import HFBackend
    model = tiny_model('qwen3_5')
    backend = HFBackend(model)
    compiled = mixed_contexts('qwen3_5', 'leading_text')
    stop, calls = threading.Event(), []
    def cancel_after_first_group(*args):
        calls.append(1)
        if len(calls) == 3:  # first context prefill plus its two question suffixes
            stop.set()
    hook = model.register_forward_hook(cancel_after_first_group)
    with pytest.raises(asyncio.CancelledError):
        backend._score(compiled, stop)
    hook.remove()
    assert len(calls) == 3
    result = await backend.score(compiled)
    assert result.metrics['vision_forwards'] == 2
    assert all(torch.isfinite(row).all() for row in result.logits.values())
