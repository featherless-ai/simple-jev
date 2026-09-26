"""Native image compilation and request-local multimodal prefix-cache adapters.

Remote images use a bounded public-network-only downloader; local paths are never
opened. Media is decoded on the CPU; model
execution is called only under HFBackend's lock and torch.inference_mode.
"""
import base64
import binascii
import io
import time
import warnings

# Inline-image decoder families with verified causal-prefix cache semantics.
# Cross-attention/encoder-decoder models need their own continuation adapter.
VISION_MODEL_TYPES = {
    'qwen2_vl', 'qwen2_5_vl', 'qwen3_vl', 'qwen3_vl_moe', 'qwen3_5', 'qwen3_5_moe',
    'gemma3', 'gemma4', 'gemma4_unified', 'llava', 'llava_next',
}

MAX_IMAGES = 16
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_TOTAL_BYTES = 20 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
MAX_TOTAL_PIXELS = 40_000_000
MAX_MEDIA_SECONDS = 20


def validate_image_dimensions(max_image_width=None, max_image_height=None):
    """Optional preprocessor input bounds; never relax encoded/source-image limits."""
    for name, value in [('max_image_width', max_image_width), ('max_image_height', max_image_height)]:
        if value is not None and (type(value) is not int or value <= 0):
            raise ValueError(f'{name} must be a positive integer or None')


def validate_image_resize_config(max_image_width=None, max_image_height=None,
                                 default_image_max_width=None, default_image_max_height=None):
    validate_image_dimensions(max_image_width, max_image_height)
    for name, default, cap in [('default_image_max_width', default_image_max_width, max_image_width),
                               ('default_image_max_height', default_image_max_height, max_image_height)]:
        if default is not None and (type(default) is not int or default <= 0):
            raise ValueError(f'{name} must be a positive integer or None')
        if default is not None and cap is not None and default > cap:
            raise ValueError(f'{name} must not exceed the server hard cap')


def image_resize_bounds(media_io_kwargs, *, max_image_width=None, max_image_height=None,
                        default_image_max_width=None, default_image_max_height=None):
    """Resolve request overrides without mutating shared compiler configuration."""
    validate_image_resize_config(max_image_width, max_image_height,
                                 default_image_max_width, default_image_max_height)
    options = {} if media_io_kwargs is None else media_io_kwargs
    if not isinstance(options, dict) or set(options) - {'image'}:
        raise ValueError('media_io_kwargs supports only image max_width/max_height')
    image = options.get('image', {})
    if not isinstance(image, dict) or set(image) - {'max_width', 'max_height'}:
        raise ValueError('media_io_kwargs.image supports only max_width/max_height')
    for name, value in image.items():
        if type(value) is not int or value <= 0:
            raise ValueError(f'media_io_kwargs.image.{name} must be a positive integer')
    bounds = []
    for key, default, cap in [('max_width', default_image_max_width, max_image_width),
                              ('max_height', default_image_max_height, max_image_height)]:
        value = image.get(key, default)
        bounds.append(cap if value is None else value if cap is None else min(value, cap))
    return tuple(bounds)


def image_messages(messages, *, max_image_width=None, max_image_height=None):
    """Copy OpenAI text/image_url blocks to HF image blocks and decoded PIL images.

    Images are RGB, in conversation order. Public HTTP(S) and inline data URLs
    are supported. Private networks, paths, video/audio, animation, unknown block
    options, and oversized payloads fail closed.
    """
    from PIL import Image, ImageOps

    validate_image_dimensions(max_image_width, max_image_height)
    result, images, total, total_pixels = [], [], 0, 0
    deadline = time.monotonic() + MAX_MEDIA_SECONDS
    for message in messages:
        item = dict(message)
        content = item['content']
        if isinstance(content, str):
            result.append(item)
            continue
        if not isinstance(content, list) or not content:
            raise ValueError('Vision chat content must be text or nonempty text/image_url blocks')
        blocks = []
        for block in content:
            if not isinstance(block, dict):
                raise ValueError('Content blocks must be objects')
            if block.get('type') == 'text' and set(block) == {'type', 'text'} and isinstance(block['text'], str):
                blocks.append(dict(block))
                continue
            if block.get('type') != 'image_url' or set(block) != {'type', 'image_url'}:
                raise ValueError('Only text and image_url content blocks are supported')
            if item['role'] != 'user':
                raise ValueError('Images are supported only in user messages')
            spec = block['image_url']
            if not isinstance(spec, dict) or set(spec) - {'url', 'detail'} or spec.get('detail', 'auto') != 'auto':
                raise ValueError('image_url requires url and optional detail=auto')
            url = spec.get('url')
            if not isinstance(url, str):
                raise ValueError('image_url.url must be a string')
            if len(images) >= MAX_IMAGES:
                raise ValueError('Image count limit exceeded')
            if url[:8].lower().startswith(('https://', 'http://')):
                from hf_media import fetch_image
                data = fetch_image(url, max_bytes=min(MAX_IMAGE_BYTES, MAX_TOTAL_BYTES - total),
                                   timeout=min(10, deadline - time.monotonic()))
            else:
                if ',' not in url:
                    raise ValueError('Images require HTTP(S) or base64 data URLs')
                header, payload = url.split(',', 1)
                if header.lower() not in {'data:image/png;base64', 'data:image/jpeg;base64', 'data:image/webp;base64'}:
                    raise ValueError('Images require PNG, JPEG, or WebP data URLs')
                if len(payload) > 4 * ((MAX_IMAGE_BYTES + 2) // 3):
                    raise ValueError('Image byte limit exceeded')
                try:
                    data = base64.b64decode(payload, validate=True)
                except (ValueError, binascii.Error) as exc:
                    raise ValueError('Invalid image base64') from exc
            total += len(data)
            if len(data) > MAX_IMAGE_BYTES or total > MAX_TOTAL_BYTES:
                raise ValueError('Image byte limit exceeded')
            try:
                with warnings.catch_warnings():
                    warnings.simplefilter('error', Image.DecompressionBombWarning)
                    with Image.open(io.BytesIO(data)) as image:
                        if image.format not in {'PNG', 'JPEG', 'WEBP'}:
                            raise ValueError('Unsupported image encoding')
                        total_pixels += image.width * image.height
                        if (image.width * image.height > MAX_IMAGE_PIXELS or total_pixels > MAX_TOTAL_PIXELS
                                or getattr(image, 'n_frames', 1) != 1):
                            raise ValueError('Image pixel limit exceeded or animated image')
                        # Match native HF image loading for camera JPEGs: honor
                        # EXIF orientation before handing pixels to the processor.
                        decoded = ImageOps.exif_transpose(image).convert('RGB')
                        # Aspect-preserving, downscale-only cap in displayed (EXIF-
                        # corrected) coordinates. Native model processing still follows.
                        if max_image_width is not None or max_image_height is not None:
                            decoded.thumbnail((min(max_image_width or decoded.width, decoded.width),
                                               min(max_image_height or decoded.height, decoded.height)),
                                              resample=Image.Resampling.LANCZOS)
                        images.append(decoded)
            except (OSError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
                raise ValueError('Invalid or oversized image') from exc
            blocks.append({'type': 'image'})
        item['content'] = blocks
        result.append(item)
    return result, images


def processor_inputs(processor, text, images, max_tokens):
    """Keep all model-specific tensors (grids, masks, positions), not just pixels."""
    if text.count(processor.image_token) != len(images):
        raise ValueError('Image placeholders must match supplied images; do not insert native media markers in text')
    inputs = dict(processor(text=[text], images=images, return_tensors='pt',
                            padding=False, truncation=False, add_special_tokens=False))
    ids = inputs.get('input_ids')
    if ids is None or ids.ndim != 2 or ids.shape[0] != 1 or not 1 <= ids.shape[1] <= max_tokens:
        raise ValueError(f'Expanded vision prompt must contain 1–{max_tokens} tokens')
    if not any('pixel' in key or 'image' in key for key in inputs if key != 'input_ids'):
        raise ValueError('Processor did not produce image inputs')
    image_token_mask(processor, inputs)  # validate native image spans before inference
    return inputs


def image_token_mask(processor, inputs):
    """Identify expanded image spans without injecting foreign model kwargs."""
    import torch
    ids = inputs['input_ids']
    types = inputs.get('mm_token_type_ids')
    if types is not None:
        if types.shape != ids.shape or ((types != 0) & (types != 1)).any():
            raise ValueError('Unsupported media token types in image request')
        mask = types == 1
    else:
        image_ids = getattr(processor, 'image_token_ids', None)
        if not image_ids:
            token_id = getattr(processor, 'image_token_id', None)
            if token_id is None:
                token_id = processor.tokenizer.convert_tokens_to_ids(processor.image_token)
            image_ids = [token_id]
        image_ids = [i for i in image_ids if i is not None]
        mask = torch.isin(ids, torch.tensor(image_ids, dtype=ids.dtype, device=ids.device))
    if mask.shape != ids.shape or not mask.any():
        raise ValueError('Processor did not identify expanded image spans')
    return mask


def cached_processor(processor):
    """Request-local processor copy; preprocess identical images only once.

    Native processors expand placeholders differently by family. Let them handle
    every text boundary, but reuse their image preprocessing output. Never patch
    a shared processor or cache images across requests.
    """
    import copy

    def key(value):
        if isinstance(value, dict):
            return tuple(sorted((k, key(v)) for k, v in value.items()))
        if isinstance(value, (list, tuple)):
            return tuple(key(v) for v in value)
        if isinstance(value, (str, int, float, bool, type(None))):
            return value
        return (type(value).__name__, id(value))

    class CachedImages:
        def __init__(self, original):
            self.original, self.cache = original, {}

        def __getattr__(self, name):
            return getattr(self.original, name)

        def __call__(self, *args, **kwargs):
            signature = key((args, kwargs))
            if signature not in self.cache:
                self.cache[signature] = self.original(*args, **kwargs)
            # Native processors may pop fields from their output dictionary.
            return dict(self.cache[signature])

    result = copy.copy(processor)
    if getattr(processor, 'image_processor', None) is None:
        raise ValueError('Loaded processor does not support images')
    result.image_processor = CachedImages(processor.image_processor)
    return result


def score_vision(backend, compiled, stop, *, _grouping=True, _force_independent=False):
    """Score under HFBackend's model lock/inference_mode, with immutable KV seeds.

    Every shared-prefix token and all media metadata must agree. Only reuse a
    prefix containing ALL image spans; otherwise execute independent contexts.
    Explicit native positions avoid model-global RoPE-delta state leaking between
    branches or requests. Suffixes are unpadded single rows in this first adapter.
    """
    import asyncio
    import copy
    import time
    import torch
    from hf_server import BackendResult, common_prefix

    start = time.perf_counter()
    model = backend.model
    family = model.config.model_type
    if family not in VISION_MODEL_TYPES:
        raise ValueError(f'No validated image cache adapter for model type {family!r}')
    branches = compiled.branches
    if any(b.model_inputs is None for b in branches):
        raise ValueError('Mixed text-only/image compiled branches are not supported')
    sequences = [b.token_ids for b in branches]
    prefix = common_prefix(sequences)[:min(map(len, sequences)) - 1]
    # Fully bidirectional text depends on the future question; never cache it
    # as a causal prefix. Image-only bidirectionality is safe for complete spans.
    bidirectional_text = getattr(model.config.get_text_config(), 'use_bidirectional_attention', None) == 'all'
    if bidirectional_text or _force_independent:
        prefix = []
    sequence_keys = {'input_ids', 'attention_mask', 'mm_token_type_ids', 'token_type_ids', 'position_ids'}
    first = branches[0].model_inputs
    for branch in branches:
        inputs = branch.model_inputs
        types = branch.image_mask
        if types is None:  # compatibility for directly constructed native branches
            types = inputs.get('mm_token_type_ids', inputs.get('token_type_ids'))
        if types is None or types.shape != inputs['input_ids'].shape:
            raise ValueError('Compiled image branch lacks validated image spans')
        # Prefix sharing cannot split or omit an image, including bidirectional
        # image attention blocks. Different templates may diverge BEFORE images.
        if (types[..., len(prefix):] != 0).any():
            prefix = []
            break
        if inputs.keys() != first.keys():
            prefix = []
            break
        for name, value in inputs.items():
            other = first[name]
            if value is other:
                continue
            if name in sequence_keys:
                value, other = value[..., :len(prefix)], other[..., :len(prefix)]
            if not torch.equal(value, other):
                prefix = []
                break
        if not prefix:
            break
    # A divergent template must not defeat reuse for other compatible branches.
    # Normal all-shared requests take the fast path above. On a mixed request,
    # bucket by the complete image-bearing token prefix AND native media/masks.
    if not prefix and _grouping and not bidirectional_text and len(branches) > 2:
        from dataclasses import replace
        buckets, groups = {}, []
        for branch in branches:
            inputs = branch.model_inputs
            mask = branch.image_mask
            if mask is None:
                mask = inputs.get('mm_token_type_ids', inputs.get('token_type_ids'))
            if mask is None or mask.shape != inputs['input_ids'].shape or not mask.any():
                raise ValueError('Compiled image branch lacks validated image spans')
            end = int(mask.nonzero()[-1, -1]) + 1
            # Leave a text scoring position after every complete image span.
            if end >= len(branch.token_ids):
                groups.append([branch])
                continue
            key = tuple(branch.token_ids[:end])
            candidates = buckets.setdefault(key, [])
            for group in candidates:
                other = group[0].model_inputs
                if inputs.keys() != other.keys():
                    continue
                equal = True
                for name, value in inputs.items():
                    reference = other[name]
                    if value is reference:
                        continue
                    if name in sequence_keys:
                        value, reference = value[..., :end], reference[..., :end]
                    if not torch.equal(value, reference):
                        equal = False
                        break
                if equal:
                    group.append(branch)
                    break
            else:
                group = [branch]
                candidates.append(group)
                groups.append(group)
        if len(groups) > 1 and any(len(group) > 1 for group in groups):
            parts = [score_vision(backend, replace(compiled, branches=group), stop,
                                 _grouping=False, _force_independent=len(group) == 1)
                     for group in groups]
            logits = {key: value for part in parts for key, value in part.logits.items()}
            totals = {key: sum(part.metrics[key] for part in parts) for key in (
                'vision_forwards', 'engine_forwards', 'branch_prompt_tokens',
                'computed_prompt_tokens', 'logical_prefill_tokens', 'padded_suffix_tokens',
                'branch_output_tokens', 'scored_positions')}
            return BackendResult({b.branch_id: logits[b.branch_id] for b in branches}, {
                **totals, 'backend': 'transformers', 'prefill_strategy': 'multimodal_grouped_prefix',
                'prefix_tokens': 0, 'context_groups': len(groups),
                'group_prefix_tokens': [part.metrics['prefix_tokens'] for part in parts],
                'suffix_batch_sizes': [size for part in parts for size in part.metrics['suffix_batch_sizes']],
                'backend_seconds': time.perf_counter() - start,
            })
    if prefix and max(len(s) - len(prefix) for s in sequences) > backend.max_batch_tokens:
        raise ValueError('A question suffix exceeds max_batch_tokens')
    device = model.get_input_embeddings().weight.device
    dtype = model.dtype
    extra = {'logits_to_keep': 1} if backend._last_logits else {}

    def on_device(inputs):
        return {k: v.to(device=device, dtype=dtype if v.is_floating_point() else v.dtype)
                for k, v in inputs.items()}

    def positions(inputs):
        if 'position_ids' in inputs:
            return inputs['position_ids']
        rope_index = getattr(model.base_model, 'get_rope_index', None)
        if callable(rope_index):
            # Native M-RoPE, without changing model-global rope_deltas.
            return rope_index(**inputs)[0]
        return model._prepare_position_ids_for_generation(inputs['input_ids'], inputs)

    cache, results, forwards, computed = None, {}, 0, 0
    if prefix:
        seed_inputs = on_device(first)
        seed_inputs['position_ids'] = positions(seed_inputs)
        seed_inputs = {k: v[..., :len(prefix)] if k in sequence_keys else v
                       for k, v in seed_inputs.items()}
        if stop.is_set():
            raise asyncio.CancelledError()
        out = model(**seed_inputs, use_cache=True, **extra)
        cache = out.past_key_values
        if cache is None:
            raise ValueError('Vision model did not return a reusable cache')
        del out, seed_inputs
        forwards, computed = 1, len(prefix)
    for branch in branches:
        if stop.is_set():
            raise asyncio.CancelledError()
        # Keep image tensors on CPU after seed prefill. Only token/grid metadata
        # is needed to calculate positions for each suffix.
        if prefix:
            inputs = on_device({k: v for k, v in branch.model_inputs.items()
                                if k in sequence_keys or k == 'image_grid_thw'})
            pos = positions(inputs)
            suffix = {k: v[..., len(prefix):] for k, v in inputs.items()
                      if k in sequence_keys and k not in {'attention_mask', 'position_ids'}}
            suffix['attention_mask'] = inputs['attention_mask']
            suffix['position_ids'] = pos[..., len(prefix):]
            # Native continuation handles architecture-specific mask fields
            # (e.g. Gemma3 token_type_ids vs Gemma4 mm_token_type_ids). Each
            # branch mutates its own copy, never the seed or a sibling.
            suffix = model.prepare_inputs_for_generation(
                **suffix, past_key_values=copy.deepcopy(cache), use_cache=True,
                next_sequence_length=len(branch.token_ids) - len(prefix), is_first_iteration=False,
            )
            out = model(**suffix, **extra)
            computed += len(branch.token_ids) - len(prefix)
        else:
            inputs = on_device(branch.model_inputs)
            inputs['position_ids'] = positions(inputs)
            out = model(**inputs, use_cache=False, **extra)
            computed += len(branch.token_ids)
        selected = out.logits[0, -1, branch.output_ids].float().cpu()
        if not torch.isfinite(selected).all():
            raise ValueError('Vision model returned non-finite scoring logits')
        results[branch.branch_id] = selected
        del out, inputs
        forwards += 1
    return BackendResult(results, {
        'backend': 'transformers',
        'prefill_strategy': 'multimodal_shared_prefix' if prefix else 'multimodal_independent',
        'prefix_tokens': len(prefix),
        'vision_forwards': 1 if prefix else len(branches),
        'engine_forwards': forwards,
        'suffix_batch_sizes': [1] * len(branches),
        'branch_prompt_tokens': sum(map(len, sequences)),
        'computed_prompt_tokens': computed,
        'logical_prefill_tokens': computed,
        'padded_suffix_tokens': 0,
        'branch_output_tokens': 0,
        'scored_positions': len(branches),
        'backend_seconds': time.perf_counter() - start,
    })
