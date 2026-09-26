"""Architecture/size selection is independent of checkpoint and served names."""
import copy
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from hf_prompt_policies import AUTO_TUNE_POLICIES, KNOWN_PROFILES, PROFILE_FIELDS, resolve_prompt_policy


def config_for(signature):
    text = dict(zip(PROFILE_FIELDS, signature))
    text['num_experts_per_tok'] = text.pop('active_experts')
    return {'model_type': 'wrapper', 'text_config': text}


@pytest.mark.parametrize('name,policy,signature', KNOWN_PROFILES)
def test_known_architecture_size(name, policy, signature):
    config = config_for(signature)
    original = copy.deepcopy(config)
    selected, metadata = resolve_prompt_policy(config)
    assert selected == (policy if policy in AUTO_TUNE_POLICIES else 'baseline')
    assert metadata['mode'] == ('architecture-size' if policy in AUTO_TUNE_POLICIES else 'performance-fallback')
    assert metadata['profile'] == name
    assert config == original
    # A nearby size is NOT assigned a guessed policy.
    config['text_config']['hidden_size'] += 1
    assert resolve_prompt_policy(config)[1]['mode'] == 'unknown-baseline'


@pytest.mark.parametrize('explicit', ['baseline', 'examples_binary', 'repeat_state', 'strict_mix_repeat2'])
def test_explicit_always_wins_without_warning(explicit, caplog):
    for config in [config_for(KNOWN_PROFILES[0][2]), {'model_type': 'unknown'}]:
        assert resolve_prompt_policy(config, explicit) == (explicit, {'mode': 'explicit'})
    assert not caplog.records


def test_unknown_and_name_spoof_warn(caplog):
    selected, metadata = resolve_prompt_policy(SimpleNamespace(
        model_type='qwen3_5', name_or_path='Qwen/Qwen3.8-27B'))
    assert selected == 'baseline' and metadata['mode'] == 'unknown-baseline'
    assert 'UNRECOGNIZED MODEL ARCHITECTURE/SIZE' in caplog.text
    assert 'eval/prompt_search.py' in caplog.text
    assert 'NOT a tuned recommendation' in caplog.text


def test_heterogeneous_config_serialization():
    class Config:
        @property
        def text_config(self):
            raise AssertionError('Must not read ambiguous live attributes')
        def to_dict(self):
            return config_for(KNOWN_PROFILES[3][2])
    assert resolve_prompt_policy(Config())[0] == 'shared_repeat_state'


def test_loader_auto_selects_without_changing_weights(monkeypatch):
    import transformers
    from hf_server import load_service
    from test_prompt_policies import NativeTokenizer
    text = config_for(KNOWN_PROFILES[0][2])['text_config']
    config = SimpleNamespace(model_type='qwen3_5', text_config=SimpleNamespace(**text))
    monkeypatch.setattr(transformers.AutoConfig, 'from_pretrained', Mock(return_value=config))
    monkeypatch.setattr(transformers.AutoTokenizer, 'from_pretrained', Mock(return_value=NativeTokenizer()))
    loader = Mock(return_value=Mock())
    monkeypatch.setattr(transformers.AutoModelForImageTextToText, 'from_pretrained', loader)
    monkeypatch.setattr(transformers.AutoProcessor, 'from_pretrained', Mock(return_value=SimpleNamespace(image_processor=None)))
    service = load_service('/renamed/checkpoint', served_model_name='anything', max_choice_options=50)
    assert service.compiler.prompt_policy == 'shared_examples_binary'
    assert service.metadata['prompt_policy_selection']['profile'] == 'Qwen dense 4B'
    assert loader.call_args.args == ('/renamed/checkpoint',)
    explicit = load_service('/renamed/checkpoint', prompt_policy='baseline', max_choice_options=50)
    assert explicit.compiler.prompt_policy == 'baseline'


@pytest.mark.parametrize('signature,expected', [
    (('qwen3_5_text', 2560, 32, 16, 4, 256, 9216, None, None, None, 248320), 'shared_examples_binary'),
    (('qwen3_5_text', 5120, 64, 24, 4, 256, 17408, None, None, None, 248320), 'shared_examples_binary'),
    (('qwen3_5_moe_text', 2048, 40, 16, 2, 256, None, 256, 512, 8, 248320), 'shared_repeat_state'),
    (('gemma4_unified_text', 3840, 48, 16, 8, 256, 15360, None, None, None, 262144), 'shared_repeat_state'),
    (('gemma4_text', 2816, 30, 16, 8, 256, 2112, 128, 704, 8, 262144), 'shared_examples_binary'),
    (('qwen3_5_text', 1024, 24, 8, 2, 256, 3584, None, None, None, 248320), 'baseline'),
])
def test_frozen_reference_configurations(signature, expected):
    # Independent fixtures from reference config.json files, not the registry.
    fields = ('model_type', 'hidden_size', 'num_hidden_layers', 'num_attention_heads',
              'num_key_value_heads', 'head_dim', 'intermediate_size', 'num_experts',
              'moe_intermediate_size', 'num_experts_per_tok', 'vocab_size')
    text = dict(zip(fields, signature))
    if text['model_type'].startswith('gemma'):
        text['top_k_experts'] = text.pop('num_experts_per_tok')
    assert resolve_prompt_policy({'text_config': text})[0] == expected


def test_search_candidates_match_server_policies():
    import ast
    from pathlib import Path
    from hf_prompt_policies import AUTO_TUNE_POLICIES
    module = ast.parse((Path(__file__).resolve().parents[2] / 'eval/prompt_search.py').read_text())
    value = next(node.value for node in module.body if isinstance(node, ast.Assign)
                 and any(isinstance(t, ast.Name) and t.id == 'POLICIES' for t in node.targets))
    assert ast.literal_eval(value) == AUTO_TUNE_POLICIES
    assert 'strict_mix_repeat2' not in AUTO_TUNE_POLICIES


def test_cli_omission_is_not_explicit_baseline(monkeypatch):
    import sys
    import uvicorn
    import hf_server
    load = Mock()
    monkeypatch.setattr(hf_server, 'load_service', load)
    monkeypatch.setattr(hf_server, 'create_app', lambda service: service)
    monkeypatch.setattr(uvicorn, 'run', Mock())
    monkeypatch.setattr(sys, 'argv', ['simple-jev', '--model', 'checkpoint'])
    hf_server.main()
    assert load.call_args.kwargs['prompt_policy'] is None
