// Browser bridge for DOOM MCP v2.1 structural geometry authoring.
// Geometry mutation, validation and BSP/node rebuilding happen in the local
// Node MCP process. Structural candidate apply/restore is intentionally a cold
// boot: stage the PWAD in sessionStorage, acknowledge the MCP request, then
// reload the page so a fresh WASM instance can include the candidate before its
// first W_InitMultipleFiles()/P_SetupLevel lifecycle.
(function () {
  const COLD_BOOT_STORAGE_KEY = 'doom.mcp.coldBoot.v21';

  function requireGeometryRuntime() {
    if (!window.DoomControl) throw new Error('DOOM control runtime is not ready');
  }

  function safeName(filename) {
    const raw = String(filename || 'geometry.wad');
    const safe = raw.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^\.+/, '');
    return safe.toLowerCase().endsWith('.wad') ? safe : `${safe || 'geometry'}.wad`;
  }

  function combinedChangeset() {
    requireGeometryRuntime();
    const base = window.DoomControl.getChangeSet ? window.DoomControl.getChangeSet() : { ready: false };
    const linedefs = window.DoomControl.getLinedefChanges ? window.DoomControl.getLinedefChanges() : { count: 0, linedefs: [] };
    const visuals = window.DoomControl.getVisualChanges ? window.DoomControl.getVisualChanges() : { sidedefCount: 0, sectorFlatCount: 0, sidedefs: [], sectorFlats: [] };
    return {
      ...base,
      linedefCount: Number(linedefs?.count || 0),
      sidedefCount: Number(visuals?.sidedefCount || 0),
      sectorFlatCount: Number(visuals?.sectorFlatCount || 0),
      linedefs: Array.isArray(linedefs?.linedefs) ? linedefs.linedefs : [],
      sidedefs: Array.isArray(visuals?.sidedefs) ? visuals.sidedefs : [],
      sectorFlats: Array.isArray(visuals?.sectorFlats) ? visuals.sectorFlats : []
    };
  }

  function pendingCount(changes) {
    return Number(changes?.sectorLightCount || 0)
      + Number(changes?.spawnCount || 0)
      + Number(changes?.removalCount || 0)
      + Number(changes?.linedefCount || 0)
      + Number(changes?.sidedefCount || 0)
      + Number(changes?.sectorFlatCount || 0);
  }

  function currentColdBootCandidate() {
    try {
      const params = new URLSearchParams(location.search);
      return params.get('mcpCold') === '1' ? params.get('mcpCandidate') : null;
    } catch {
      return null;
    }
  }

  window.DoomControl.geometrySnapshot = function geometrySnapshot(filename = 'geometry-baseline.wad') {
    requireGeometryRuntime();
    const state = window.DoomControl.getState();
    const changes = combinedChangeset();
    const artifact = window.DoomControl.exportPwad(filename);
    return { state, changes, pendingCount: pendingCount(changes), artifact };
  };

  window.DoomControl.geometryLoad = function geometryLoad(filename, base64) {
    requireGeometryRuntime();
    const name = safeName(filename);
    const payload = String(base64 || '');
    if (!payload) throw new Error('Geometry cold boot requires PWAD bytes');

    // Keep the candidate browser-local across the navigation. sessionStorage is
    // scoped to this tab/session and avoids publishing temporary authoring WADs.
    sessionStorage.setItem(COLD_BOOT_STORAGE_KEY, JSON.stringify({
      filename: name,
      base64: payload,
      stagedAt: new Date().toISOString()
    }));

    const next = new URL(location.href);
    next.pathname = '/';
    next.search = '';
    next.hash = '';
    next.searchParams.set('mcpCold', '1');
    next.searchParams.set('mcpCandidate', name);

    // Reply first so the Node geometry server can checkpoint the candidate and
    // return control to the host AI. Navigation happens immediately afterward;
    // the fresh page requires START CANDIDATE before main() runs.
    setTimeout(() => location.replace(next.href), 150);
    return {
      scheduled: true,
      coldBoot: true,
      filename: name,
      requiresStartClick: true,
      nextUrl: next.href
    };
  };

  let socket = null;
  let reconnectTimer = null;

  function bridgeUrl() {
    const local = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
    if (!local) return null;
    return 'ws://127.0.0.1:3781/geometry';
  }

  function reply(socketRef, id, payload) {
    Promise.resolve(payload).then(result => {
      if (socketRef?.readyState === WebSocket.OPEN) socketRef.send(JSON.stringify({ id, ok: true, result }));
    }).catch(error => {
      if (socketRef?.readyState === WebSocket.OPEN) socketRef.send(JSON.stringify({ id, ok: false, error: String(error?.message || error) }));
    });
  }

  function dispatch(method, params = {}) {
    switch (method) {
      case 'geometry_snapshot': return window.DoomControl.geometrySnapshot(params.filename);
      case 'geometry_load': return window.DoomControl.geometryLoad(params.filename, params.base64);
      case 'geometry_state': return {
        state: window.DoomControl.getState(),
        changes: combinedChangeset(),
        coldBootCandidate: currentColdBootCandidate(),
        coldBootPrepared: Boolean(window.DoomColdBoot?.prepared)
      };
      default: throw new Error(`Unknown geometry bridge method: ${method}`);
    }
  }

  function connect() {
    const url = bridgeUrl();
    if (!url || socket) return;
    try { socket = new WebSocket(url); } catch { socket = null; return; }
    socket.addEventListener('open', () => socket.send(JSON.stringify({
      event: 'geometry_hello',
      coldBootCandidate: currentColdBootCandidate(),
      coldBootPrepared: Boolean(window.DoomColdBoot?.prepared)
    })));
    socket.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (!message?.id || !message?.method) return;
      try { reply(socket, message.id, dispatch(message.method, message.params || {})); }
      catch (error) { reply(socket, message.id, Promise.reject(error)); }
    });
    socket.addEventListener('close', () => {
      socket = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 1200);
    });
  }

  connect();
})();
