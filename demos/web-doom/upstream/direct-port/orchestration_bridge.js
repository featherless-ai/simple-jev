// Browser-side orchestration bridge for DOOM MCP v1.0.
//
// The v1 server gets a dedicated localhost WebSocket so one high-level
// authoring iteration can compose the already-bounded authoring, playtest,
// vision and ticcmd surfaces without replacing either legacy bridge.
// No raw WASM memory is exposed here: every operation goes through the same
// explicit DoomControl methods used by earlier MCP versions.

(function () {
  function requireOrchestrationRuntime() {
    if (!window.DoomControl || typeof window.DoomPlaytestDispatch !== 'function') {
      throw new Error('DOOM orchestration runtime is not ready');
    }
  }

  function combinedChangeSet() {
    requireOrchestrationRuntime();
    const base = window.DoomControl.getChangeSet();
    const linedefs = typeof window.DoomControl.getLinedefChanges === 'function'
      ? window.DoomControl.getLinedefChanges()
      : { count: 0, linedefs: [] };
    const visuals = typeof window.DoomControl.getVisualChanges === 'function'
      ? window.DoomControl.getVisualChanges()
      : { sidedefCount: 0, sectorFlatCount: 0, sidedefs: [], sectorFlats: [] };
    return {
      ...base,
      linedefCount: Number(linedefs?.count || 0),
      linedefs: Array.isArray(linedefs?.linedefs) ? linedefs.linedefs : [],
      sidedefCount: Number(visuals?.sidedefCount || 0),
      sectorFlatCount: Number(visuals?.sectorFlatCount || 0),
      sidedefs: Array.isArray(visuals?.sidedefs) ? visuals.sidedefs : [],
      sectorFlats: Array.isArray(visuals?.sectorFlats) ? visuals.sectorFlats : []
    };
  }

  const previousDispatch = window.DoomPlaytestDispatch;
  window.DoomOrchestrationDispatch = function doomOrchestrationDispatch(method, params = {}) {
    requireOrchestrationRuntime();
    switch (method) {
      case 'author_get_state':
        return window.DoomControl.getState();
      case 'author_get_changeset':
        return combinedChangeSet();
      case 'author_set_sector_light': {
        const light = window.DoomControl.setSectorLight(params.sector, params.light);
        if (light < 0) throw new Error(`Sector light edit rejected with code ${light}`);
        return { updated: true, sector: Math.trunc(params.sector), light };
      }
      case 'author_spawn_enemy': {
        const spawned = window.DoomControl.spawnEnemy(params.name, params.count, params.distance);
        if (spawned < 0) throw new Error(`Enemy spawn rejected with code ${spawned}`);
        return {
          updated: spawned > 0,
          type: String(params.name),
          requested: Math.trunc(params.count),
          spawned,
          rejectedByCollision: Math.max(0, Math.trunc(params.count) - spawned),
          distance: Math.trunc(params.distance)
        };
      }
      case 'author_remove_nearest_enemy':
        return window.DoomControl.removeNearestEnemy(Boolean(params.visibleOnly), Math.trunc(params.maxDistance));
      case 'author_set_linedef_action': {
        if (typeof window.DoomControl.setLinedefAction !== 'function') throw new Error('Linedef authoring is unavailable');
        return window.DoomControl.setLinedefAction(params.index, params.preset, params.tag ?? -1);
      }
      case 'author_set_wall_texture': {
        if (typeof window.DoomControl.setWallTexture !== 'function') throw new Error('Wall texture authoring is unavailable');
        return window.DoomControl.setWallTexture(params.line, params.side, params.slot, params.texture);
      }
      case 'author_set_sector_flat': {
        if (typeof window.DoomControl.setSectorFlat !== 'function') throw new Error('Sector flat authoring is unavailable');
        return window.DoomControl.setSectorFlat(params.sector, params.surface, params.flat);
      }
      case 'author_export_pwad':
        return window.DoomControl.exportPwad(params.filename);
      case 'author_load_pwad': {
        if (typeof window.DoomControl.loadPwad !== 'function') throw new Error('PWAD reload authoring is unavailable');
        return window.DoomControl.loadPwad(params.filename, params.base64);
      }
      case 'author_reload_current_map': {
        if (typeof window.DoomControl.reloadCurrentMap !== 'function') throw new Error('Map reload authoring is unavailable');
        return window.DoomControl.reloadCurrentMap();
      }
      default:
        return previousDispatch(method, params);
    }
  };

  let socket = null;
  let reconnectTimer = null;

  function orchestrationUrl() {
    const local = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
    if (!local) return null;
    return 'ws://127.0.0.1:3779/orchestrate';
  }

  function reply(socketRef, id, ok, payload) {
    if (!socketRef || socketRef.readyState !== WebSocket.OPEN) return;
    socketRef.send(JSON.stringify(ok
      ? { id, ok: true, result: payload }
      : { id, ok: false, error: String(payload && payload.message ? payload.message : payload) }));
  }

  function connect() {
    const url = orchestrationUrl();
    if (!url || socket) return;
    try { socket = new WebSocket(url); }
    catch { socket = null; return; }

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ event: 'orchestration_hello' }));
    });

    socket.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); }
      catch { return; }
      if (!message?.id || !message?.method) return;
      try {
        reply(socket, message.id, true,
          window.DoomOrchestrationDispatch(message.method, message.params || {}));
      } catch (error) {
        reply(socket, message.id, false, error);
      }
    });

    socket.addEventListener('close', () => {
      socket = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 1200);
    });
  }

  connect();
})();
