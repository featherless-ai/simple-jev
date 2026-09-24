// Browser bridge for v0.6 visual authoring.
// Adds bounded texture/flat inspection and mutation methods to window.DoomControl
// and extends the localhost MCP dispatcher without exposing raw WASM memory.

(function () {
  function requireVisualRuntime() {
    if (!window.DoomControl || typeof Module === 'undefined' || typeof Module.ccall !== 'function') {
      throw new Error('DOOM visual authoring runtime is not ready');
    }
  }

  window.DoomControl.getVisuals = function getVisuals(limit = 128, maxDistance = 1024) {
    requireVisualRuntime();
    const json = Module.ccall('doomctl_get_visuals_json', 'string', ['number', 'number'],
      [Math.trunc(limit), Math.trunc(maxDistance)]);
    return JSON.parse(json);
  };

  window.DoomControl.listVisualAssets = function listVisualAssets(limit = 512) {
    requireVisualRuntime();
    const json = Module.ccall('doomctl_list_visual_assets_json', 'string', ['number'], [Math.trunc(limit)]);
    return JSON.parse(json);
  };

  window.DoomControl.setWallTexture = function setWallTexture(line, side, slot, texture) {
    requireVisualRuntime();
    const sideNo = String(side) === 'back' ? 1 : 0;
    const json = Module.ccall('doomctl_set_wall_texture_json', 'string',
      ['number', 'number', 'string', 'string'],
      [Math.trunc(line), sideNo, String(slot), String(texture)]);
    return JSON.parse(json);
  };

  window.DoomControl.setSectorFlat = function setSectorFlat(sector, surface, flat) {
    requireVisualRuntime();
    const json = Module.ccall('doomctl_set_sector_flat_json', 'string',
      ['number', 'string', 'string'], [Math.trunc(sector), String(surface), String(flat)]);
    return JSON.parse(json);
  };

  window.DoomControl.getVisualChanges = function getVisualChanges() {
    requireVisualRuntime();
    const json = Module.ccall('doomctl_get_visual_changes_json', 'string', [], []);
    return JSON.parse(json);
  };

  if (typeof handleMcpRequest !== 'function' || typeof replyMcp !== 'function') {
    console.error('DOOM MCP visual bridge could not find shell dispatcher');
    return;
  }

  const previousHandleMcpRequest = handleMcpRequest;
  handleMcpRequest = function visualHandleMcpRequest(message) {
    const { id, method, params = {} } = message || {};
    if (!id || !method) return previousHandleMcpRequest(message);

    try {
      let result;
      switch (method) {
        case 'get_visuals':
          result = window.DoomControl.getVisuals(params.limit, params.maxDistance);
          break;
        case 'list_visual_assets':
          result = window.DoomControl.listVisualAssets(params.limit);
          break;
        case 'set_wall_texture':
          result = window.DoomControl.setWallTexture(params.line, params.side, params.slot, params.texture);
          break;
        case 'set_sector_flat':
          result = window.DoomControl.setSectorFlat(params.sector, params.surface, params.flat);
          break;
        case 'get_visual_changes':
          result = window.DoomControl.getVisualChanges();
          break;
        default:
          return previousHandleMcpRequest(message);
      }
      replyMcp(id, true, result);
    } catch (error) {
      replyMcp(id, false, error);
    }
  };
})();
