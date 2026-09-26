"""Native image processor -> tiny real model -> classifier HTTP response.

Like test_vision_processors, this is offline/optional when snapshots are absent.
No pretrained model weights are loaded; this is execution parity, not accuracy.
"""
import pytest

from test_vision import payload, tiny_model
from test_vision_processors import native_processor, preserves_reasoning  # noqa: F401 (pytest fixture)


async def test_native_images_through_real_model_and_http(native_processor):
    import httpx
    import torch
    from transformers import AutoConfig, AutoModelForImageTextToText
    from hf_server import DecisionService, HFBackend, PromptCompiler, create_app

    p = native_processor
    native = AutoConfig.from_pretrained(p.tokenizer.name_or_path, local_files_only=True)
    config = tiny_model(native.model_type).config.to_dict()
    real = native.to_dict()
    # Native vocabulary, image-token markers and patch layout; tiny hidden layers.
    config['text_config']['vocab_size'] = real['text_config']['vocab_size']
    for key, value in real.items():
        if key.endswith(('_token_id', '_token_index')) or key == 'mm_tokens_per_image':
            config[key] = value
    for key in ['patch_size', 'temporal_patch_size', 'spatial_merge_size',
                'pooling_kernel_size', 'position_embedding_size', 'mm_posemb_size', 'window_size', 'image_size']:
        if key in real['vision_config']:
            config['vision_config'][key] = real['vision_config'][key]
    config = type(native).from_dict(config)
    model = AutoModelForImageTextToText.from_config(config).eval()
    if native.model_type == 'gemma3':
        with torch.no_grad():
            model.model.multi_modal_projector.mm_input_projection_weight.normal_(std=.02)
    policy = 'shared_examples_binary' if preserves_reasoning(p) else 'baseline'
    compiler = PromptCompiler(p.tokenizer, processor=p, prompt_policy=policy, max_choice_options=50)
    compiled = compiler.compile(payload())
    backend = HFBackend(model)
    actual = await backend.score(compiled)
    assert actual.metrics['vision_forwards'] == 1
    with torch.inference_mode():
        for branch in compiled.branches:
            full = model(**branch.model_inputs, use_cache=False, logits_to_keep=1)
            expected = full.logits[0, -1, branch.output_ids]
            torch.testing.assert_close(actual.logits[branch.branch_id], expected, atol=3e-6, rtol=3e-5)
    service = DecisionService('test', compiler, backend, advanced_metrics=True)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(service)), base_url='http://test') as client:
        response = await client.post('/v1/classifier', json=payload())
        assert response.status_code == 200, response.text
        body = response.json()
        assert body['metrics']['vision_forwards'] == 1
        assert body['metrics']['prefill_strategy'] == 'multimodal_shared_prefix'
        assert set(body['answers']) == {'color', 'red', 'level'}
