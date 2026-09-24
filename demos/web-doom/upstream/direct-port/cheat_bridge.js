// Browser-side live cheat bridge for DOOM MCP v1.1.
// Cheats are intentionally runtime-only and never enter the authoring ChangeSet.

(function () {
  function requireCheatRuntime() {
    if (!window.DoomControl || typeof Module === 'undefined' || typeof Module.ccall !== 'function') {
      throw new Error('DOOM cheat runtime is not ready');
    }
  }

  function parseJson(name) {
    requireCheatRuntime();
    const raw = Module.ccall(name, 'string', [], []);
    return JSON.parse(raw);
  }

  window.DoomControl.cheatStatus = function cheatStatus() {
    return parseJson('doomctl_cheat_status_json');
  };

  window.DoomControl.setGodMode = function setGodMode(enabled) {
    requireCheatRuntime();
    const value = Module.ccall('doomctl_set_god_mode', 'number', ['number'], [enabled ? 1 : 0]);
    if (value < 0) throw new Error(`God mode failed with engine code ${value}`);
    return { godMode: Boolean(value), status: window.DoomControl.cheatStatus() };
  };

  window.DoomControl.setNoclip = function setNoclip(enabled) {
    requireCheatRuntime();
    const value = Module.ccall('doomctl_set_noclip', 'number', ['number'], [enabled ? 1 : 0]);
    if (value < 0) throw new Error(`Noclip failed with engine code ${value}`);
    return { noclip: Boolean(value), status: window.DoomControl.cheatStatus() };
  };

  window.DoomControl.giveArsenal = function giveArsenal(includeKeys) {
    requireCheatRuntime();
    const value = Module.ccall('doomctl_give_arsenal', 'number', ['number'], [includeKeys ? 1 : 0]);
    if (value < 0) throw new Error(`Arsenal cheat failed with engine code ${value}`);
    return window.DoomControl.cheatStatus();
  };

  window.DoomControl.giveKeys = function giveKeys() {
    requireCheatRuntime();
    const value = Module.ccall('doomctl_give_keys', 'number', [], []);
    if (value < 0) throw new Error(`Key cheat failed with engine code ${value}`);
    return window.DoomControl.cheatStatus();
  };

  window.DoomControl.setHealthArmor = function setHealthArmor(health, armor, armorType) {
    requireCheatRuntime();
    const value = Module.ccall('doomctl_set_health_armor', 'number',
      ['number', 'number', 'number'], [Math.trunc(health), Math.trunc(armor), Math.trunc(armorType)]);
    if (value < 0) throw new Error(`Health/armor cheat failed with engine code ${value}`);
    return window.DoomControl.cheatStatus();
  };

  window.DoomControl.givePowerup = function givePowerup(name) {
    requireCheatRuntime();
    const value = Module.ccall('doomctl_give_powerup', 'number', ['string'], [String(name)]);
    if (value < 0) throw new Error(`Power-up cheat failed with engine code ${value}`);
    return { power: String(name), value, status: window.DoomControl.cheatStatus() };
  };

  window.DoomControl.warp = function warp(episode, map) {
    requireCheatRuntime();
    const value = Module.ccall('doomctl_warp', 'number', ['number', 'number'],
      [Math.trunc(episode), Math.trunc(map)]);
    if (!value) throw new Error(`Invalid or unavailable map E${episode}M${map}`);
    return window.DoomControl.cheatStatus();
  };

  window.DoomControl.audioStatus = function audioStatus() {
    const browser = window.DoomAudioUnlock && typeof window.DoomAudioUnlock.status === 'function'
      ? window.DoomAudioUnlock.status()
      : null;
    const engine = parseJson('doomctl_audio_status_json');
    return { browser, engine };
  };

  window.DoomControl.resumeAudio = async function resumeAudio() {
    requireCheatRuntime();
    if (window.DoomAudioUnlock && typeof window.DoomAudioUnlock.resumeNow === 'function') {
      return window.DoomAudioUnlock.resumeNow('mcp-request');
    }
    const resumed = Module.ccall('doomctl_audio_resume', 'number', [], []);
    return { resumed: Boolean(resumed), status: window.DoomControl.audioStatus() };
  };

  let socket = null;
  let reconnectTimer = null;

  function bridgeUrl() {
    const local = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
    if (!local) return null;
    return 'ws://127.0.0.1:3780/cheats';
  }

  function reply(socketRef, id, ok, payload) {
    if (!socketRef || socketRef.readyState !== WebSocket.OPEN) return;
    Promise.resolve(payload).then(result => {
      if (!socketRef || socketRef.readyState !== WebSocket.OPEN) return;
      socketRef.send(JSON.stringify({ id, ok: true, result }));
    }).catch(error => {
      if (!socketRef || socketRef.readyState !== WebSocket.OPEN) return;
      socketRef.send(JSON.stringify({ id, ok: false, error: String(error && error.message ? error.message : error) }));
    });
  }

  function dispatch(method, params = {}) {
    switch (method) {
      case 'cheat_status': return window.DoomControl.cheatStatus();
      case 'set_god_mode': return window.DoomControl.setGodMode(Boolean(params.enabled));
      case 'set_noclip': return window.DoomControl.setNoclip(Boolean(params.enabled));
      case 'give_arsenal': return window.DoomControl.giveArsenal(Boolean(params.includeKeys));
      case 'give_keys': return window.DoomControl.giveKeys();
      case 'set_health_armor': return window.DoomControl.setHealthArmor(params.health, params.armor, params.armorType);
      case 'give_powerup': return window.DoomControl.givePowerup(params.name);
      case 'warp': return window.DoomControl.warp(params.episode, params.map);
      case 'audio_status': return window.DoomControl.audioStatus();
      case 'audio_resume': return window.DoomControl.resumeAudio();
      default: throw new Error(`Unknown cheat/audio method: ${method}`);
    }
  }

  function connect() {
    const url = bridgeUrl();
    if (!url || socket) return;
    try { socket = new WebSocket(url); }
    catch { socket = null; return; }

    socket.addEventListener('open', () => socket.send(JSON.stringify({ event: 'cheat_hello' })));
    socket.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (!message?.id || !message?.method) return;
      try { reply(socket, message.id, true, dispatch(message.method, message.params || {})); }
      catch (error) { reply(socket, message.id, false, Promise.reject(error)); }
    });
    socket.addEventListener('close', () => {
      socket = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 1200);
    });
  }

  connect();
})();
