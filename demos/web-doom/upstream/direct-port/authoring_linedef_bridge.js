// Pre-JS extension for bounded LINEDEFS / door authoring controls.
(function () {
  function requireLinedefRuntime() {
    if (!window.DoomControl || typeof Module === 'undefined'
        || typeof Module.ccall !== 'function') {
      throw new Error('DOOM linedef authoring runtime is not ready');
    }
  }

  window.DoomControl.getLinedefs = function getLinedefs(limit = 256, maxDistance = 0) {
    requireLinedefRuntime();
    const json = Module.ccall('doomctl_get_linedefs_json', 'string',
      ['number', 'number'], [Math.trunc(limit), Math.trunc(maxDistance)]);
    return JSON.parse(json);
  };

  window.DoomControl.setLinedefAction = function setLinedefAction(index, preset, tag = -1) {
    requireLinedefRuntime();
    const json = Module.ccall('doomctl_set_linedef_action_json', 'string',
      ['number', 'string', 'number'], [Math.trunc(index), String(preset), Math.trunc(tag)]);
    return JSON.parse(json);
  };

  window.DoomControl.activateLinedef = function activateLinedef(index) {
    requireLinedefRuntime();
    const json = Module.ccall('doomctl_activate_linedef_json', 'string',
      ['number'], [Math.trunc(index)]);
    return JSON.parse(json);
  };

  window.DoomControl.getLinedefChanges = function getLinedefChanges() {
    requireLinedefRuntime();
    const json = Module.ccall('doomctl_get_linedef_changes_json', 'string', [], []);
    return JSON.parse(json);
  };

  if (typeof handleMcpRequest !== 'function' || typeof replyMcp !== 'function') {
    console.error('DOOM MCP linedef bridge could not find shell dispatcher');
    return;
  }

  const previousHandleMcpRequest = handleMcpRequest;
  handleMcpRequest = function linedefHandleMcpRequest(message) {
    const { id, method, params = {} } = message || {};
    if (!id || !method) return previousHandleMcpRequest(message);

    try {
      let result;
      switch (method) {
        case 'get_linedefs':
          result = window.DoomControl.getLinedefs(params.limit, params.maxDistance);
          break;
        case 'set_linedef_action':
          result = window.DoomControl.setLinedefAction(params.index, params.preset, params.tag ?? -1);
          break;
        case 'activate_linedef':
          result = window.DoomControl.activateLinedef(params.index);
          break;
        case 'get_linedef_changes':
          result = window.DoomControl.getLinedefChanges();
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
