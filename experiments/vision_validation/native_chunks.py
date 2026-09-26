"""Independent native HF continuation oracle; not imported by serving code.

Recomputes the image prefix separately for every question. Only the arithmetic
partition matches serving; no cache, position helper, or logits are reused from
it. This checks cache forking while holding forward shapes fixed. It does NOT
replace or make passing the separate non-chunked full-forward diagnostics.
"""
import torch


def reference(model, compiled):
    sequences = [b.token_ids for b in compiled.branches]
    prefix = 0
    for column in zip(*sequences):
        if len(set(column)) != 1:
            break
        prefix += 1
    prefix = min(prefix, min(map(len, sequences)) - 1)
    if any(b.image_mask[..., prefix:].any() for b in compiled.branches):
        prefix = 0
    sequence_keys = {'input_ids', 'attention_mask', 'mm_token_type_ids', 'token_type_ids', 'position_ids'}
    rows = {}
    device = model.get_input_embeddings().weight.device
    with torch.inference_mode():
        for branch in compiled.branches:
            inputs = {k: v.to(device=device, dtype=model.dtype if v.is_floating_point() else v.dtype)
                      for k, v in branch.model_inputs.items()}
            if prefix:
                seed = {k: v[..., :prefix] if k in sequence_keys else v for k, v in inputs.items()}
                seed['position_ids'] = model._prepare_position_ids_for_generation(seed['input_ids'], seed)
                native = model.prepare_inputs_for_generation(**seed, use_cache=True, is_first_iteration=True)
                out = model(**native, logits_to_keep=1)
                cache = out.past_key_values
                del out, native, seed
                kwargs = {**inputs, 'past_key_values': cache, 'use_cache': True}
                kwargs['position_ids'] = model._prepare_position_ids_for_generation(inputs['input_ids'], kwargs)
                native = model.prepare_inputs_for_generation(**kwargs, is_first_iteration=False,
                                    next_sequence_length=len(branch.token_ids) - prefix)
                out = model(**native, logits_to_keep=1)
                del native, cache, kwargs
            else:
                out = model(**inputs, use_cache=False, logits_to_keep=1)
            rows[branch.branch_id] = out.logits[0, -1, branch.output_ids].float().cpu()
            del out, inputs
    return rows
