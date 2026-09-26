"""Native Gemma3/LLaVA processors without checkpoint downloads or mock pixels."""
import pytest


@pytest.mark.parametrize('family', ['gemma3', 'llava', 'llava_next'])
async def test_native_processor_expansion_and_cache(family, monkeypatch):
    import torch
    from PIL import Image
    from tokenizers import Tokenizer, models, pre_tokenizers
    from transformers import (PreTrainedTokenizerFast, CLIPImageProcessor, LlavaProcessor,
        LlavaNextImageProcessor, LlavaNextProcessor, Gemma3ImageProcessor, Gemma3Processor)
    from hf_vision import cached_processor, processor_inputs, image_token_mask
    from hf_server import Branch, CompiledRequest, HFBackend
    from test_vision import tiny_model
    vocab = {f't{i}': i for i in range(128)}
    for text, idx in {'[UNK]': 0, '[PAD]': 1, 'inspect': 10, 'now': 20, 'A': 40,
                      'B': 41, 'C': 42, '<image>': 120, '<start>': 122, '<end>': 123}.items():
        del vocab[f't{idx}']; vocab[text] = idx
    raw = Tokenizer(models.WordLevel(vocab, unk_token='[UNK]'))
    raw.pre_tokenizer = pre_tokenizers.Whitespace()
    tokenizer = PreTrainedTokenizerFast(tokenizer_object=raw, unk_token='[UNK]', pad_token='[PAD]')
    tokenizer.add_special_tokens({'additional_special_tokens': ['<image>', '<start>', '<end>']})
    tokenizer.model_input_names = ['input_ids', 'attention_mask']
    for name, value in [('image', '<image>'), ('boi', '<start>'), ('eoi', '<end>')]:
        setattr(tokenizer, name + '_token', value)
        setattr(tokenizer, name + '_token_id', vocab[value])
    if family == 'gemma3':
        image_processor = Gemma3ImageProcessor(size={'height': 4, 'width': 4}, do_pan_and_scan=False)
        p = Gemma3Processor(image_processor=image_processor, tokenizer=tokenizer, image_seq_length=4)
    else:
        cls = CLIPImageProcessor if family == 'llava' else LlavaNextImageProcessor
        image_processor = cls(size={'shortest_edge': 4}, crop_size={'height': 4, 'width': 4},
                              image_grid_pinpoints=[[4, 4]])
        cls = LlavaProcessor if family == 'llava' else LlavaNextProcessor
        p = cls(image_processor=image_processor, tokenizer=tokenizer, patch_size=2,
                num_additional_image_tokens=1, vision_feature_select_strategy='default')
    calls = []
    original = image_processor.preprocess
    def preprocess(*args, **kwargs):
        calls.append(1)
        return original(*args, **kwargs)
    monkeypatch.setattr(image_processor, 'preprocess', preprocess)
    processor = cached_processor(p)
    images = [Image.new('RGB', (4, 4), color) for color in ['red', 'blue']]
    branches = []
    for i, suffix in enumerate(['A', 'B', 'C']):
        text = f'{p.image_token} inspect {p.image_token} now {suffix}'
        inputs = processor_inputs(processor, text, images, 128)
        mask = image_token_mask(processor, inputs)
        assert mask.sum().item() == (20 if family == 'llava_next' else 8)
        assert 'mm_token_type_ids' not in inputs
        branches.append(Branch(str(i), inputs['input_ids'][0].tolist(), [40, 41, 42], [], '',
                               model_inputs=inputs, image_mask=mask))
    assert len(calls) == 1
    model = tiny_model(family)
    vision_calls = []
    handle = model.model.vision_tower.register_forward_pre_hook(lambda *a: vision_calls.append(1))
    result = await HFBackend(model).score(CompiledRequest(None, branches))
    handle.remove()
    assert len(vision_calls) == 1 and result.metrics['vision_forwards'] == 1
    with torch.inference_mode():
        for b in branches:
            full = model(**b.model_inputs, use_cache=False).logits[0, -1, b.output_ids]
            torch.testing.assert_close(result.logits[b.branch_id], full, atol=3e-6, rtol=3e-5)
