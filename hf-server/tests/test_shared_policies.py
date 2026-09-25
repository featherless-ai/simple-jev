"""Automatic candidates must share state/chat across mixed question types."""
import pytest
from hf_prompt_policies import AUTO_TUNE_POLICIES, STATE_REPEAT
from hf_server import PromptCompiler,common_prefix
from test_prompt_policies import NativeTokenizer,request


@pytest.mark.parametrize('policy',(*AUTO_TUNE_POLICIES,'universal_shared'))
@pytest.mark.parametrize('chat',[False,True])
def test_all_context_precedes_branch_divergence(policy,chat):
    state='SHARED_CONTEXT_SENTINEL '*100
    req=request(state).model_dump()
    if chat:
        req.pop('state');req['messages']=[{'role':'user','content':state},{'role':'assistant','content':'Acknowledged prior context.'},{'role':'user','content':'FINAL_CHAT_SENTINEL'}]
    compiler=PromptCompiler(NativeTokenizer(),prompt_policy=policy,max_tokens=32768)
    c=compiler.compile(req);prefix=common_prefix([b.token_ids for b in c.branches]);text=''.join(map(chr,prefix))
    assert state in text
    assert all(len(b.token_ids)-len(prefix)<2000 for b in c.branches)
    if chat:assert 'FINAL_CHAT_SENTINEL' in text and 'Acknowledged prior context.' in text
    if policy=='shared_repeat_state' and not chat:assert text.count(state)==2 and STATE_REPEAT in text
    assert all(b.messages[0]==c.branches[0].messages[0] for b in c.branches)


def test_legacy_strict_is_explicit_only_and_breaks_sharing():
    assert 'strict_mix_repeat2' not in AUTO_TUNE_POLICIES
    c=PromptCompiler(NativeTokenizer(),prompt_policy='strict_mix_repeat2').compile(request('SENTINEL '*100))
    assert 'SENTINEL' not in ''.join(map(chr,common_prefix([b.token_ids for b in c.branches])))


@pytest.mark.parametrize('policy',['shared_examples_binary','shared_repeat_state'])
def test_native_system_thinking_flag_is_request_wide(policy):
    class SystemThinkingTokenizer(NativeTokenizer):
        def apply_chat_template(self,messages,**kwargs):
            return f"SYSTEM_THINKING={kwargs['enable_thinking']}\\n"+super().apply_chat_template(messages,**kwargs)
    c=PromptCompiler(SystemThinkingTokenizer(),prompt_policy=policy).compile(request('SHARED_SENTINEL '*100))
    text=''.join(map(chr,common_prefix([b.token_ids for b in c.branches])))
    assert 'SHARED_SENTINEL '*100 in text
    assert text.startswith('SYSTEM_THINKING=True')


def test_universal_has_catalogue_before_state_and_only_selector_after():
    req=request('CONTEXT_SENTINEL')
    c=PromptCompiler(NativeTokenizer(),prompt_policy='universal_shared').compile(req)
    systems=[b.messages[0]['content'] for b in c.branches]
    assert len(set(systems))==1
    assert 'Question catalogue:' in systems[0]
    for q in req.questions.values():assert q.instructions in systems[0]
    for i,b in enumerate(c.branches):
        assert b.messages[-1]['content']==f'State:\nCONTEXT_SENTINEL\n\nAnswer question {i}.\n'
        assert b.reasoning_content is None
    assert c.binary_noul_keys==('noul',)
    assert c.plan.template_version=='hf-universal_shared-v1'
