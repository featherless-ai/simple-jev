"""Freeze synthetic image HTTP fixtures; no labels are embedded in context text."""
import argparse
import base64
import io
import json
from pathlib import Path

from PIL import Image


def url(color, fmt='PNG', size=(128, 96)):
    stream = io.BytesIO()
    Image.new('RGB', size, color).save(stream, format=fmt)
    mime = {'PNG': 'png', 'JPEG': 'jpeg', 'WEBP': 'webp'}[fmt]
    return f'data:image/{mime};base64,' + base64.b64encode(stream.getvalue()).decode()


def request(images, long=False):
    messages = [{'role': 'system', 'content': 'Use only the supplied pictures as visual evidence.'}]
    if long:
        messages.append({'role': 'user', 'content': 'Background note. ' * 1500})
        messages.append({'role': 'assistant', 'content': 'Noted.'})
    for index, image in enumerate(images):
        if index:
            messages.append({'role': 'assistant', 'content': 'I have received the picture.'})
        messages.append({'role': 'user', 'content': [
            {'type': 'text', 'text': f'Picture {index + 1}:'},
            {'type': 'image_url', 'image_url': {'url': image}},
        ]})
    return {'model': 'validation', 'messages': messages, 'questions': {
        'color': {'type': 'choice', 'instructions': 'What is the predominant color of picture 1?',
                  'criteria': {'red': 'Red', 'blue': 'Blue', 'green': 'Green'}},
        'red': {'type': 'noul', 'instructions': 'Is picture 1 predominantly red?'},
        'coverage': {'type': 'score', 'instructions': 'How much of picture 1 is red?',
                     'criteria': ['None or almost none', 'About half', 'All or almost all']},
    }, 'options': {'raw_logits': True}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    policies = ['baseline', 'shared_examples_binary', 'shared_repeat_state', 'universal_shared']
    fixtures = []
    for policy in policies:
        for colors in [('red', 'blue'), ('blue', 'red')]:
            fixtures.append({'id': policy + '-' + '-'.join(colors), 'policy': policy,
                             'expected_color': colors[0], 'request': request([url(c) for c in colors])})
    for fmt in ['PNG', 'JPEG', 'WEBP']:
        fixtures.append({'id': 'single-' + fmt, 'policy': 'baseline', 'expected_color': 'green',
                         'request': request([url('green', fmt)])})
    fixtures.append({'id': 'long-chat', 'policy': 'baseline', 'expected_color': 'red',
                     'request': request([url('red'), url('blue')], long=True)})
    fixtures.append({'id': 'aspect-ratio', 'policy': 'baseline', 'expected_color': 'blue',
                     'request': request([url('blue', size=(384, 64))])})
    with args.output.open('x') as stream:
        json.dump({'fixtures': fixtures, 'gates': {
            'max_probability_delta': 0.03,
            'require_top_label_agreement': True,
            'require_color_smoke_accuracy': True,
            'shared_image_forwards_per_request': 1,
            'shared_preprocess_calls_per_request': 1,
        }, 'scope': 'Synthetic execution smoke, not a representative image quality benchmark'}, stream, indent=2)


if __name__ == '__main__':
    main()
