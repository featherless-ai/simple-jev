// Browser-side MCP v0.8 autonomous input bridge.
//
// Uses the existing dedicated playtest WebSocket from playtest_bridge.js.
// The C controller owns input lifetime in actual world tics.

(function () {
  function requireAgentRuntime() {
    if (!window.DoomControl || typeof Module === 'undefined'
        || typeof Module.ccall !== 'function') {
      throw new Error('DOOM agent-input runtime is not ready');
    }
  }

  window.DoomControl.queueAgentInput = function queueAgentInput(params = {}) {
    requireAgentRuntime();
    const forward = Math.round(Number(params.forward || 0) * 100);
    const strafe = Math.round(Number(params.strafe || 0) * 100);
    const turn = Math.round(Number(params.turn || 0) * 100);
    const tics = Math.trunc(params.tics || 0);
    const remaining = Module.ccall(
      'doomctl_queue_agent_input', 'number',
      ['number', 'number', 'number', 'number', 'number', 'number'],
      [forward, strafe, turn, params.attack ? 1 : 0, params.use ? 1 : 0, tics]
    );
    if (remaining < 0) throw new Error(`Agent input rejected with engine code ${remaining}`);
    // Optional weapon selection (weapontype_t 0..8) for this input, when the
    // engine build carries doomctl_queue_agent_weapon. Rejections are not
    // fatal: an unowned weapon is simply not selected.
    if (params.weapon != null && Number.isFinite(Number(params.weapon))) {
      try {
        const code = Module.ccall('doomctl_queue_agent_weapon', 'number', ['number'], [Math.trunc(Number(params.weapon))]);
        if (code < 0) console.warn(`Agent weapon change rejected with engine code ${code}`);
      } catch (error) {
        console.warn('Agent weapon change unavailable in this engine build', error);
      }
    }
    return window.DoomControl.getAgentInputStatus();
  };

  window.DoomControl.cancelAgentInput = function cancelAgentInput() {
    requireAgentRuntime();
    const cancelled = Module.ccall('doomctl_cancel_agent_input', 'number', [], []);
    return { cancelled: Boolean(cancelled), status: window.DoomControl.getAgentInputStatus() };
  };

  window.DoomControl.getAgentInputStatus = function getAgentInputStatus() {
    requireAgentRuntime();
    const json = Module.ccall('doomctl_get_agent_input_status_json', 'string', [], []);
    return JSON.parse(json);
  };

  if (typeof window.DoomPlaytestDispatch !== 'function') {
    console.error('DOOM MCP agent bridge could not find playtest dispatcher');
    return;
  }

  const previousDispatch = window.DoomPlaytestDispatch;
  window.DoomPlaytestDispatch = function agentPlaytestDispatch(method, params = {}) {
    switch (method) {
      case 'queue_agent_input':
        return window.DoomControl.queueAgentInput(params);
      case 'cancel_agent_input':
        return window.DoomControl.cancelAgentInput();
      case 'get_agent_input_status':
        return window.DoomControl.getAgentInputStatus();
      default:
        return previousDispatch(method, params);
    }
  };
})();