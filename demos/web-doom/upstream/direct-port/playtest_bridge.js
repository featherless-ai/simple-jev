// Browser-side AI playtest bridge for MCP v0.7+.
//
// Frame capture uses the final SDL/Emscripten canvas, so the image returned to
// the MCP client is the same composed frame a human sees. Pause/tic control
// lives in C. A dedicated localhost WebSocket keeps image/step traffic separate
// from the authoring control socket.

(function () {
  function requirePlaytestRuntime() {
    if (!window.DoomControl || typeof Module === 'undefined'
        || typeof Module.ccall !== 'function') {
      throw new Error('DOOM playtest runtime is not ready');
    }
  }

  function parseEngineJson(name) {
    const json = Module.ccall(name, 'string', [], []);
    return JSON.parse(json);
  }

  window.DoomControl.setPlaytestPaused = function setPlaytestPaused(paused) {
    requirePlaytestRuntime();
    const state = Module.ccall('doomctl_set_playtest_paused', 'number', ['number'], [paused ? 1 : 0]);
    if (state < 0) throw new Error(`Playtest pause failed with engine code ${state}`);
    return { paused: Boolean(state) };
  };

  window.DoomControl.stepPlaytestTics = function stepPlaytestTics(count) {
    requirePlaytestRuntime();
    const budget = Module.ccall('doomctl_step_playtest_tics', 'number', ['number'], [Math.trunc(count)]);
    if (budget < 0) throw new Error(`Playtest step failed with engine code ${budget}`);
    return { queued: Math.trunc(count), stepBudget: budget };
  };

  window.DoomControl.getPlaytestTelemetry = function getPlaytestTelemetry() {
    requirePlaytestRuntime();
    return parseEngineJson('doomctl_get_playtest_telemetry_json');
  };

  window.DoomControl.resetPlaytestMetrics = function resetPlaytestMetrics() {
    requirePlaytestRuntime();
    const reset = Module.ccall('doomctl_reset_playtest_metrics', 'number', [], []);
    if (reset < 0) throw new Error(`Playtest metric reset failed with engine code ${reset}`);
    return window.DoomControl.getPlaytestTelemetry();
  };

  window.DoomControl.captureFrame = function captureFrame() {
    requirePlaytestRuntime();
    const canvas = Module.canvas || document.getElementById('canvas');
    if (!canvas || typeof canvas.toDataURL !== 'function') {
      throw new Error('DOOM render canvas is unavailable');
    }

    const url = canvas.toDataURL('image/png');
    const marker = 'data:image/png;base64,';
    if (!url.startsWith(marker)) throw new Error('Canvas PNG capture failed');
    return {
      mimeType: 'image/png',
      width: canvas.width,
      height: canvas.height,
      base64: url.slice(marker.length),
      telemetry: window.DoomControl.getPlaytestTelemetry()
    };
  };

  function basePlaytestDispatch(method, params) {
    switch (method) {
      case 'set_playtest_paused':
        return window.DoomControl.setPlaytestPaused(Boolean(params.paused));
      case 'step_playtest_tics':
        return window.DoomControl.stepPlaytestTics(params.count);
      case 'get_playtest_telemetry':
        return window.DoomControl.getPlaytestTelemetry();
      case 'reset_playtest_metrics':
        return window.DoomControl.resetPlaytestMetrics();
      case 'capture_frame':
        return window.DoomControl.captureFrame();
      default:
        throw new Error(`Unknown playtest method: ${method}`);
    }
  }

  // Explicit extension seam for later playtest capabilities such as v0.8
  // autonomous ticcmd input. The socket remains owned by this module.
  window.DoomPlaytestDispatch = basePlaytestDispatch;

  // Extend the original authoring dispatcher too, for compatibility/debugging.
  if (typeof handleMcpRequest === 'function' && typeof replyMcp === 'function') {
    const previousHandleMcpRequest = handleMcpRequest;
    handleMcpRequest = function playtestHandleMcpRequest(message) {
      const { id, method, params = {} } = message || {};
      if (!id || !method) return previousHandleMcpRequest(message);
      if (!['set_playtest_paused', 'step_playtest_tics', 'get_playtest_telemetry',
            'reset_playtest_metrics', 'capture_frame'].includes(method)) {
        return previousHandleMcpRequest(message);
      }
      try { replyMcp(id, true, window.DoomPlaytestDispatch(method, params)); }
      catch (error) { replyMcp(id, false, error); }
    };
  }

  let socket = null;
  let reconnectTimer = null;

  function playtestUrl() {
    const local = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
    if (!local) return null;
    return 'ws://127.0.0.1:3778/playtest';
  }

  function reply(socketRef, id, ok, payload) {
    if (!socketRef || socketRef.readyState !== WebSocket.OPEN) return;
    socketRef.send(JSON.stringify(ok
      ? { id, ok: true, result: payload }
      : { id, ok: false, error: String(payload && payload.message ? payload.message : payload) }));
  }

  function connect() {
    const url = playtestUrl();
    if (!url || socket) return;
    try { socket = new WebSocket(url); }
    catch { socket = null; return; }

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ event: 'playtest_hello' }));
    });

    socket.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); }
      catch { return; }
      if (!message?.id || !message?.method) return;
      try { reply(socket, message.id, true, window.DoomPlaytestDispatch(message.method, message.params || {})); }
      catch (error) { reply(socket, message.id, false, error); }
    });

    socket.addEventListener('close', () => {
      socket = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 1200);
    });
  }

  connect();
})();