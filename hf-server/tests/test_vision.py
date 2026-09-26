"""Image validation, native compilation, and real tiny-model cache equivalence."""
import base64
import copy
import io
import threading

import pytest

from hf_vision import image_messages


def data_url(color='red'):
    from PIL import Image
    buffer = io.BytesIO()
    Image.new('RGB', (32, 32), color).save(buffer, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode()


def payload():
    return {'model': 'test', 'messages': [
        {'role': 'system', 'content': 'Inspect the supplied pictures.'},
        {'role': 'user', 'content': [
            {'type': 'text', 'text': 'First picture:'},
            {'type': 'image_url', 'image_url': {'url': data_url()}},
        ]},
        {'role': 'assistant', 'content': 'I will inspect it.'},
        {'role': 'user', 'content': [
            {'type': 'image_url', 'image_url': {'url': data_url('blue')}},
            {'type': 'text', 'text': 'Compare with this picture.'},
        ]},
    ], 'questions': {
        'color': {'type': 'choice', 'instructions': 'First color?', 'criteria': {'red': None, 'blue': None}},
        'red': {'type': 'noul', 'instructions': 'Is the first picture red?'},
        'level': {'type': 'score', 'instructions': 'How red is the first?', 'criteria': ['not red', 'red']},
    }}


def test_decode_preserves_order_and_request():
    request = payload()
    original = copy.deepcopy(request)
    messages, images = image_messages(request['messages'])
    assert request == original
    assert images[0].getpixel((0, 0)) == (255, 0, 0)
    assert images[1].getpixel((0, 0)) == (0, 0, 255)
    assert messages[1]['content'][1] == {'type': 'image'}


@pytest.mark.parametrize('url', ['https://example.org/image.png', 'file:///etc/passwd',
                                 'data:image/png;base64,@@@', 'data:image/png;base64,YQ==',
                                 'data:video/mp4;base64,YQ=='])
def test_reject_invalid_images(url):
    with pytest.raises(ValueError):
        image_messages([{'role': 'user', 'content': [{'type': 'image_url', 'image_url': {'url': url}}]}])


def test_camera_exif_orientation():
    from PIL import Image
    image = Image.new('RGB', (24, 16), 'red')
    exif = Image.Exif()
    exif[274] = 6  # camera orientation: rotate 90 degrees clockwise
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG', exif=exif)
    url = 'data:image/jpeg;base64,' + base64.b64encode(buffer.getvalue()).decode()
    _, images = image_messages([{'role': 'user', 'content': [
        {'type': 'image_url', 'image_url': {'url': url}},
    ]}])
    assert images[0].size == (16, 24)
    assert images[0].getexif().get(274) is None


def test_image_limits(monkeypatch):
    import hf_vision
    request = payload()
    monkeypatch.setattr(hf_vision, 'MAX_IMAGES', 1)
    with pytest.raises(ValueError, match='count'):
        image_messages(request['messages'])
    monkeypatch.setattr(hf_vision, 'MAX_IMAGES', 16)
    monkeypatch.setattr(hf_vision, 'MAX_IMAGE_PIXELS', 10)
    with pytest.raises(ValueError, match='pixel'):
        image_messages(request['messages'])


def tiny_model(family):
    import torch
    from transformers import Qwen3_5Config, Qwen3_5ForConditionalGeneration, Gemma4Config, Gemma4ForConditionalGeneration
    torch.set_num_threads(2)
    torch.manual_seed(17)
    text = dict(vocab_size=128, hidden_size=32, intermediate_size=64, num_hidden_layers=2,
                num_attention_heads=4, num_key_value_heads=2, head_dim=8, max_position_embeddings=4096,
                pad_token_id=0, eos_token_id=2)
    if family in {'qwen2_vl', 'qwen2_5_vl', 'qwen3_vl', 'qwen3_vl_moe'}:
        from transformers import AutoConfig, AutoModelForImageTextToText
        text.update(rope_parameters={'rope_type': 'default', 'rope_theta': 10000.,
                                     'mrope_section': [1, 1, 2]},
                    num_experts=4, num_experts_per_tok=2, moe_intermediate_size=16)
        vision = dict(depth=1, hidden_size=32, embed_dim=32, intermediate_size=64,
                      num_heads=4, patch_size=2, spatial_merge_size=2, temporal_patch_size=1,
                      out_hidden_size=32, num_position_embeddings=16,
                      deepstack_visual_indexes=[0], fullatt_block_indexes=[0], window_size=8)
        config = AutoConfig.for_model(family, text_config=text, vision_config=vision,
            image_token_id=120, video_token_id=121, vision_start_token_id=122, vision_end_token_id=123)
        return AutoModelForImageTextToText.from_config(config).eval()
    if family in {'llava', 'llava_next', 'gemma3'}:
        from transformers import AutoConfig, AutoModelForImageTextToText
        vision = dict(hidden_size=32, intermediate_size=64, num_hidden_layers=2,
                      num_attention_heads=4, image_size=4, patch_size=2)
        if family == 'gemma3':
            text.update(sliding_window=4, layer_types=['sliding_attention', 'full_attention'])
        config = AutoConfig.for_model(family, text_config=text, vision_config=vision,
            image_token_id=120, boi_token_id=122, eoi_token_id=123,
            image_grid_pinpoints=[[4, 4]], mm_tokens_per_image=4, image_seq_length=4)
        model = AutoModelForImageTextToText.from_config(config).eval()
        if family == 'gemma3':
            # HF initializes this projector to zero; make the random fixture
            # actually image-sensitive rather than vacuously testing text only.
            with torch.no_grad():
                model.model.multi_modal_projector.mm_input_projection_weight.normal_(std=.02)
        return model
    if family.startswith('qwen'):
        text.update(linear_key_head_dim=8, linear_value_head_dim=8, linear_num_key_heads=2,
                    linear_num_value_heads=2, layer_types=['linear_attention', 'full_attention'],
                    rope_parameters={'rope_type': 'default', 'rope_theta': 10000.,
                                     'partial_rotary_factor': 1., 'mrope_section': [1, 1, 2]})
        config_class, model_class = Qwen3_5Config, Qwen3_5ForConditionalGeneration
        if family == 'qwen3_5_moe':
            from transformers import Qwen3_5MoeConfig, Qwen3_5MoeForConditionalGeneration
            config_class, model_class = Qwen3_5MoeConfig, Qwen3_5MoeForConditionalGeneration
            text.update(num_experts=4, num_experts_per_tok=2, moe_intermediate_size=16, shared_expert_intermediate_size=32)
        config = config_class(text_config=text, vision_config=dict(depth=1, hidden_size=32,
            intermediate_size=64, num_heads=4, patch_size=2, spatial_merge_size=2,
            temporal_patch_size=1, out_hidden_size=32, num_position_embeddings=16),
            image_token_id=120, video_token_id=121, vision_start_token_id=122, vision_end_token_id=123)
        return model_class(config).eval()
    text.update(sliding_window=4, hidden_size_per_layer_input=0, use_bidirectional_attention='vision',
                layer_types=['sliding_attention', 'full_attention'])
    if family == 'gemma4_unified':
        from transformers import Gemma4UnifiedConfig, Gemma4UnifiedForConditionalGeneration
        text.pop('hidden_size_per_layer_input')
        text['global_head_dim'] = 8
        config = Gemma4UnifiedConfig(text_config=text, vision_config=dict(patch_size=2,
            pooling_kernel_size=1, mm_embed_dim=32, mm_posemb_size=16, output_proj_dims=32),
            image_token_id=120, boi_token_id=122, eoi_token_id=123)
        return Gemma4UnifiedForConditionalGeneration(config).eval()
    config = Gemma4Config(text_config=text, vision_config=dict(hidden_size=32, intermediate_size=64,
        num_hidden_layers=1, num_attention_heads=4, num_key_value_heads=4, head_dim=8, patch_size=2, pooling_kernel_size=2,
        position_embedding_size=16), image_token_id=120, boi_token_id=122, eoi_token_id=123)
    return Gemma4ForConditionalGeneration(config).eval()


def compiled_images(family, *, shared=True, color_seed=1):
    import torch
    from hf_server import Branch, CompiledRequest
    torch.manual_seed(color_seed)
    # Four tokens/image exercise nontrivial 2D M-RoPE and bidirectional blocks.
    side = 2 if family == 'gemma4_unified' else 4
    media = ({'pixel_values': torch.randn(32, 12), 'image_grid_thw': torch.tensor([[1, 4, 4], [1, 4, 4]])}
             if family.startswith('qwen') else
             {'pixel_values': torch.randn(2, side * side, 12),
              'image_position_ids': torch.tensor([[[i, j] for i in range(side) for j in range(side)]] * 2)})
    image_tokens = 4
    if family in {'llava', 'gemma3'}:
        media = {'pixel_values': torch.randn(2, 3, 4, 4)}
    if family == 'llava_next':
        media = {'pixel_values': torch.randn(2, 2, 3, 4, 4), 'image_sizes': torch.tensor([[4, 4], [4, 4]])}
        image_tokens = 10  # base features + tiled features with native image newlines
    branches = []
    for i, suffix in enumerate([[30, 31], [32, 33, 34], [35]]):
        ids = [10 if shared else 10 + i, 122] + [120] * image_tokens + [123, 15, 122] + [120] * image_tokens + [123, 20, 21] + suffix
        inputs = {**media, 'input_ids': torch.tensor([ids]), 'attention_mask': torch.ones(1, len(ids), dtype=torch.long),
                  'mm_token_type_ids': torch.tensor([[int(t == 120) for t in ids]])}
        mask = inputs['mm_token_type_ids'] == 1
        if family in {'llava', 'llava_next', 'gemma3'}:
            types = inputs.pop('mm_token_type_ids')
            if family == 'gemma3':
                inputs['token_type_ids'] = types
        branches.append(Branch(str(i), ids, [40, 41, 42], [], '', model_inputs=inputs, image_mask=mask))
    return CompiledRequest(None, branches)


@pytest.mark.parametrize('family', ['qwen2_vl', 'qwen2_5_vl', 'qwen3_vl', 'qwen3_vl_moe',
    'qwen3_5', 'qwen3_5_moe', 'gemma3', 'gemma4', 'gemma4_unified', 'llava', 'llava_next'])
@pytest.mark.parametrize('shared', [True, False])
async def test_real_multimodal_cache_matches_full_forwards(family, shared):
    import torch
    from hf_server import HFBackend
    model = tiny_model(family)
    backend = HFBackend(model)
    compiled = compiled_images(family, shared=shared)
    tower = (model.model.visual if family.startswith('qwen') else
             model.model.embed_vision if family == 'gemma4_unified' else model.model.vision_tower)
    calls = []
    handle = tower.register_forward_pre_hook(lambda *args: calls.append(1))
    result = await backend.score(compiled)
    handle.remove()
    assert len(calls) == (1 if shared else 3)
    assert result.metrics['vision_forwards'] == len(calls)
    assert result.metrics['prefix_tokens'] == (len(compiled.branches[0].token_ids) - 2 if shared else 0)
    with torch.inference_mode():
        for branch in compiled.branches:
            # Independent native full forward computes its own positions/masks.
            expected = model(**branch.model_inputs, use_cache=False).logits[0, -1, branch.output_ids]
            torch.testing.assert_close(result.logits[branch.branch_id], expected, atol=3e-6, rtol=3e-5)
    # Independent native generation preparation, fresh image prefix per question,
    # holds arithmetic shapes fixed and isolates cache-fork correctness.
    if shared:
        import importlib.util
        from pathlib import Path
        path = Path(__file__).resolve().parents[2] / 'experiments/vision_validation/native_chunks.py'
        spec = importlib.util.spec_from_file_location('native_chunks_reference', path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        for key, expected in module.reference(model, compiled).items():
            torch.testing.assert_close(result.logits[key], expected, atol=1e-6, rtol=0)
    # Different image payload and then the original request: no cache/image leaks.
    other = await backend.score(compiled_images(family, shared=shared, color_seed=99))
    assert any(not torch.equal(result.logits[k], other.logits[k]) for k in result.logits)
    again = await backend.score(compiled)
    for key in result.logits:
        torch.testing.assert_close(result.logits[key], again.logits[key], atol=3e-6, rtol=3e-5)
    assert result.metrics['branch_output_tokens'] == 0
    stop = threading.Event()
    stop.set()
    import asyncio
    with pytest.raises(asyncio.CancelledError):
        backend._score(compiled, stop)


def test_loader_selects_native_processor_and_revision(monkeypatch):
    from types import SimpleNamespace
    from unittest.mock import Mock
    import transformers
    from hf_server import load_service
    from test_prompt_policies import NativeTokenizer
    config = SimpleNamespace(model_type='gemma4_unified', vision_config=object())
    monkeypatch.setattr(transformers.AutoConfig, 'from_pretrained', Mock(return_value=config))
    monkeypatch.setattr(transformers.AutoTokenizer, 'from_pretrained', Mock(return_value=NativeTokenizer()))
    processor = Mock()
    load_processor = Mock(return_value=processor)
    load_model = Mock(return_value=Mock())
    monkeypatch.setattr(transformers.AutoProcessor, 'from_pretrained', load_processor)
    monkeypatch.setattr(transformers.AutoModelForImageTextToText, 'from_pretrained', load_model)
    service = load_service('checkpoint', revision='frozen', prompt_policy='baseline', max_choice_options=50,
                           max_image_width=1920, max_image_height=1080,
                           default_image_max_width=1024, default_image_max_height=768)
    assert service.compiler.max_image_width == service.metadata['max_image_width'] == 1920
    assert service.compiler.max_image_height == service.metadata['max_image_height'] == 1080
    assert service.compiler.default_image_max_width == service.metadata['default_image_max_width'] == 1024
    assert service.compiler.default_image_max_height == service.metadata['default_image_max_height'] == 768
    assert service.compiler.processor is processor
    assert service.metadata['image_input'] is True
    load_processor.assert_called_once_with('checkpoint', revision='frozen')
    assert load_model.call_args.kwargs['revision'] == 'frozen'


def test_text_blocks_match_plain_text():
    from hf_server import PromptCompiler
    from test_prompts import Tokenizer
    request = payload()
    request['messages'] = [{'role': 'user', 'content': 'Inspect the picture.'}]
    compiler = PromptCompiler(Tokenizer(), max_choice_options=50)
    plain = compiler.compile(request)
    request['messages'][0]['content'] = [{'type': 'text', 'text': 'Inspect the picture.'}]
    blocks = compiler.compile(request)
    assert [b.token_ids for b in plain.branches] == [b.token_ids for b in blocks.branches]
    assert all(b.model_inputs is None for b in blocks.branches)


async def test_cancellation_after_vision_prefill():
    import asyncio
    import torch
    from hf_server import HFBackend
    model = tiny_model('qwen3_5')
    backend = HFBackend(model)
    compiled = compiled_images('qwen3_5')
    stop = threading.Event()
    calls = []
    def cancel_after_forward(*args):
        calls.append(1)
        stop.set()
    handle = model.register_forward_hook(cancel_after_forward)
    with pytest.raises(asyncio.CancelledError):
        backend._score(compiled, stop)
    handle.remove()
    assert len(calls) == 1
    result = await backend.score(compiled)
    assert all(torch.isfinite(row).all() for row in result.logits.values())


@pytest.mark.parametrize('change', ['media', 'between_images'])
async def test_cache_guard_rejects_incompatible_prefix(change):
    from hf_server import HFBackend
    from dataclasses import replace
    compiled = compiled_images('qwen3_5')
    # The sharing guard checks media values and spans, not just identical IDs.
    if change == 'media':
        inputs = dict(compiled.branches[1].model_inputs)
        inputs['pixel_values'] = inputs['pixel_values'] + 0.2
        compiled.branches[1] = replace(compiled.branches[1], model_inputs=inputs)
    else:
        # Move a normal text token between images; common prefix then omits image2.
        branch = compiled.branches[1]
        ids = list(branch.token_ids)
        ids[7] = 19
        inputs = dict(branch.model_inputs)
        inputs['input_ids'] = inputs['input_ids'].clone()
        inputs['input_ids'][0, 7] = 19
        compiled.branches[1] = replace(branch, token_ids=ids, model_inputs=inputs)
    result = await HFBackend(tiny_model('qwen3_5')).score(compiled)
    assert result.metrics['prefix_tokens'] == 0
    # The incompatible branch is independent; the other two still share once.
    assert result.metrics['vision_forwards'] == 2
    assert result.metrics['context_groups'] == 2
