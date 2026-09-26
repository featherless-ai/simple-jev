"""Image dimensions are resize bounds, not admission/rejection thresholds."""
import base64
import copy
import io

import pytest
from PIL import Image

from hf_vision import image_messages


def encoded(size, fmt='PNG', orientation=None):
    buffer = io.BytesIO()
    image = Image.new('RGB', size, 'red')
    kwargs = {}
    if orientation is not None:
        exif = Image.Exif()
        exif[274] = orientation
        kwargs['exif'] = exif
    image.save(buffer, format=fmt, **kwargs)
    return buffer.getvalue()


def messages(data, fmt='PNG'):
    url = f'data:image/{fmt.lower()};base64,' + base64.b64encode(data).decode()
    return [{'role': 'user', 'content': [{'type': 'image_url', 'image_url': {'url': url}}]}]


@pytest.mark.parametrize('fmt', ['PNG', 'JPEG', 'WEBP'])
@pytest.mark.parametrize('size,width,height,expected', [
    ((400, 300), 100, 100, (100, 75)),
    ((300, 400), 100, 100, (75, 100)),
    ((400, 300), 100, None, (100, 75)),
    ((400, 300), None, 60, (80, 60)),
    ((40, 30), 100, 100, (40, 30)),
    ((40, 30), None, None, (40, 30)),
    ((400, 1), 10, 10, (10, 1)),
    ((400, 300), 10**1000, 75, (100, 75)),
])
def test_resize_down_only(size, width, height, expected, fmt):
    request = messages(encoded(size, fmt), fmt)
    original = copy.deepcopy(request)
    _, images = image_messages(request, max_image_width=width, max_image_height=height)
    assert images[0].size == expected
    assert images[0].mode == 'RGB'
    assert request == original


def test_exif_orientation_precedes_resize():
    # Displayed size is 300x400, not the encoded 400x300.
    _, images = image_messages(messages(encoded((400, 300), 'JPEG', 6), 'JPEG'),
                               max_image_width=100)
    assert images[0].size == (100, 133)
    assert images[0].getexif().get(274) is None


def test_remote_and_inline_use_same_resize(monkeypatch):
    import hf_media
    data = encoded((400, 300))
    calls = []
    def fetch(url, **kwargs):
        calls.append(url)
        return data
    monkeypatch.setattr(hf_media, 'fetch_image', fetch)
    request = messages(data)
    request[0]['content'].append({'type': 'image_url', 'image_url': {'url': 'https://example.org/image.png'}})
    _, images = image_messages(request, max_image_width=100, max_image_height=100)
    assert [image.size for image in images] == [(100, 75), (100, 75)]
    assert images[0].tobytes() == images[1].tobytes()
    assert calls == ['https://example.org/image.png']


def test_resize_does_not_bypass_source_pixel_limits(monkeypatch):
    import hf_vision
    monkeypatch.setattr(hf_vision, 'MAX_IMAGE_PIXELS', 100)
    with pytest.raises(ValueError, match='pixel limit'):
        image_messages(messages(encoded((40, 30))), max_image_width=5, max_image_height=5)


@pytest.mark.parametrize('value', [0, -1, True, 1.5, '100'])
@pytest.mark.parametrize('name', ['max_image_width', 'max_image_height'])
def test_invalid_resize_options(value, name):
    from hf_server import PromptCompiler, load_service
    for call in [lambda: image_messages([], **{name: value}),
                 lambda: PromptCompiler(None, **{name: value}),
                 lambda: load_service('not-loaded', **{name: value})]:
        with pytest.raises(ValueError, match=name):
            call()


def test_laya_resize_options_rejected_before_loading():
    from hf_server import load_service
    with pytest.raises(ValueError, match='transformers'):
        load_service('not-loaded', backend='laya', max_image_width=100)


def test_cli_passes_resize_options(monkeypatch):
    import sys
    import uvicorn
    import hf_server
    captured = {}
    def load(model, **kwargs):
        captured.update(model=model, **kwargs)
        return object()
    monkeypatch.setattr(hf_server, 'load_service', load)
    monkeypatch.setattr(hf_server, 'create_app', lambda service: service)
    monkeypatch.setattr(uvicorn, 'run', lambda *a, **kw: None)
    monkeypatch.setattr(sys, 'argv', ['simple-jev', '--model', 'test', '--max-image-width', '1024', '--max-image-height', '768',
                                      '--default-image-max-width', '512', '--default-image-max-height', '384'])
    hf_server.main()
    assert captured['max_image_width'] == 1024
    assert captured['max_image_height'] == 768
    assert captured['default_image_max_width'] == 512
    assert captured['default_image_max_height'] == 384


@pytest.mark.parametrize('override,expected', [
    (None, (1024, 768)),
    ({}, (1024, 768)),
    ({'image': {}}, (1024, 768)),
    ({'image': {'max_width': 800}}, (800, 768)),
    ({'image': {'max_height': 600}}, (1024, 600)),
    ({'image': {'max_width': 1600, 'max_height': 900}}, (1600, 900)),
    ({'image': {'max_width': 4096, 'max_height': 2160}}, (1920, 1080)),
])
def test_request_overrides_default_but_not_hard_cap(override, expected):
    from hf_vision import image_resize_bounds
    original = copy.deepcopy(override)
    assert image_resize_bounds(override, max_image_width=1920, max_image_height=1080,
                               default_image_max_width=1024, default_image_max_height=768) == expected
    assert override == original


def test_unset_defaults_and_caps():
    from hf_vision import image_resize_bounds
    assert image_resize_bounds(None) == (None, None)
    assert image_resize_bounds(None, max_image_width=100) == (100, None)
    assert image_resize_bounds(None, default_image_max_height=50) == (None, 50)
    assert image_resize_bounds({'image': {'max_width': 200}}, default_image_max_width=100) == (200, None)


@pytest.mark.parametrize('options', [
    {'video': {}}, {'image': {'width': 100}}, {'image': {'max_width': None}},
    {'image': {'max_height': 0}}, {'image': {'max_width': -1}},
    {'image': {'max_width': True}}, {'image': {'max_width': 1.5}},
    {'image': {'max_width': '100'}}, {'image': []}, [],
])
def test_invalid_request_resize_options(options):
    from hf_vision import image_resize_bounds
    with pytest.raises(ValueError, match='media_io_kwargs'):
        image_resize_bounds(options)


@pytest.mark.parametrize('options', [
    {'max_image_width': 100, 'default_image_max_width': 101},
    {'max_image_height': 100, 'default_image_max_height': 101},
    {'default_image_max_width': 0}, {'default_image_max_height': True},
    {'default_image_max_width': '100'},
])
def test_invalid_server_defaults(options):
    from hf_server import PromptCompiler, load_service
    for call in [lambda: PromptCompiler(None, **options), lambda: load_service('not-loaded', **options)]:
        with pytest.raises(ValueError, match='default_image_max'):
            call()
