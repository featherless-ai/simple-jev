// Pre-JS extension loaded by the generated Emscripten runtime after shell.html
// has defined window.DoomControl and the localhost MCP dispatcher.
//
// The legacy loadPwad/reloadCurrentMap helpers remain for non-geometry callers.
// Structural geometry uses a separate cold-boot path: geometry_bridge.js stores
// the candidate PWAD in sessionStorage, reloads the page, and this pre-JS writes
// that candidate into the fresh Emscripten FS before main() starts.  The C
// startup hook then adds the candidate to wadfiles before W_InitMultipleFiles().

(function () {
  const RELOAD_TIMEOUT_MS = 10000;
  const RELOAD_POLL_MS = 25;
  const COLD_BOOT_STORAGE_KEY = 'doom.mcp.coldBoot.v21';

  function requireAuthoringRuntime() {
    if (!window.DoomControl || typeof Module === 'undefined'
        || typeof Module.ccall !== 'function'
        || !Module.FS || typeof Module.FS.writeFile !== 'function') {
      throw new Error('DOOM authoring runtime is not ready');
    }
  }

  function decodeBase64(base64) {
    const binary = atob(String(base64 || ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; ++i) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function safeImportName(filename) {
    const raw = String(filename || 'import.wad');
    const safe = raw.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^\.+/, '');
    const name = safe.toLowerCase().endsWith('.wad') ? safe : `${safe || 'import'}.wad`;
    return name;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function coldBootRequest() {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('mcpCold') !== '1') return null;
      const requested = safeImportName(params.get('mcpCandidate') || '');
      if (!requested) return null;
      const raw = sessionStorage.getItem(COLD_BOOT_STORAGE_KEY);
      if (!raw) throw new Error(`Cold-boot candidate ${requested} is not staged in this browser session`);
      const staged = JSON.parse(raw);
      if (safeImportName(staged?.filename) !== requested || !staged?.base64) {
        throw new Error(`Cold-boot candidate mismatch: requested=${requested}, staged=${staged?.filename || 'none'}`);
      }
      return { filename: requested, base64: String(staged.base64) };
    } catch (error) {
      return { error: String(error?.message || error) };
    }
  }

  function validateColdBootBytes(bytes) {
    if (bytes.length < 12) throw new Error('Cold-boot PWAD payload is too small');
    if (bytes.length > 16 * 1024 * 1024) throw new Error('Cold-boot PWAD exceeds 16 MiB limit');
    if (bytes[0] !== 0x50 || bytes[1] !== 0x57 || bytes[2] !== 0x41 || bytes[3] !== 0x44) {
      throw new Error('Cold-boot artifact is not a PWAD');
    }
  }

  const pendingColdBoot = coldBootRequest();
  if (pendingColdBoot) {
    const previousRuntimeInitialized = Module.onRuntimeInitialized;
    Module.onRuntimeInitialized = function doomMcpColdBootRuntimeInitialized() {
      if (typeof previousRuntimeInitialized === 'function') previousRuntimeInitialized();

      const startButton = document.getElementById('start');
      const statusEl = document.getElementById('status');
      const audioNote = document.getElementById('audioNote');

      if (startButton) startButton.disabled = true;
      if (statusEl) statusEl.textContent = pendingColdBoot.error
        ? 'Cold-boot candidate staging failed.'
        : `Preparing candidate ${pendingColdBoot.filename}…`;

      if (pendingColdBoot.error) {
        console.error('DOOM MCP cold boot:', pendingColdBoot.error);
        if (audioNote) audioNote.textContent = pendingColdBoot.error;
        return;
      }

      try {
        requireAuthoringRuntime();
        const bytes = decodeBase64(pendingColdBoot.base64);
        validateColdBootBytes(bytes);
        const virtualPath = `/mcp_boot_${Date.now()}_${pendingColdBoot.filename}`;
        Module.FS.writeFile(virtualPath, bytes);
        const staged = Module.ccall('doomctl_set_boot_pwad_path', 'number', ['string'], [virtualPath]);
        if (staged <= 0) throw new Error(`Engine rejected cold-boot PWAD path with code ${staged}`);

        window.DoomColdBoot = {
          candidate: pendingColdBoot.filename,
          virtualPath,
          bytes: bytes.length,
          prepared: true
        };
        if (statusEl) statusEl.textContent = `Candidate ready: ${pendingColdBoot.filename}`;
        if (startButton) {
          startButton.textContent = 'START CANDIDATE';
          startButton.disabled = false;
          startButton.classList.add('ready');
        }
        if (audioNote) {
          audioNote.textContent = 'Fresh WASM boot: IWAD + candidate will be loaded before the first level starts.';
          audioNote.classList.add('ready');
        }
        console.log('DOOM MCP cold boot prepared:', window.DoomColdBoot);
      } catch (error) {
        console.error('DOOM MCP cold boot preparation failed:', error);
        if (statusEl) statusEl.textContent = 'Cold-boot preparation failed — see browser console.';
        if (audioNote) {
          audioNote.textContent = String(error?.message || error);
          audioNote.classList.add('ready');
        }
      }
    };
  }

  // Emscripten SDL2's default assertion UI and its default stdin fallback both
  // use window.prompt(). A modal prompt is unsafe while the localhost MCP bridge
  // is synchronously waiting for a legacy runtime reload call to return. Suppress
  // it only around that compatibility operation and restore it immediately.
  async function withoutInteractivePrompt(operation) {
    const originalPrompt = window.prompt;
    window.prompt = function doomMcpReloadPrompt(message) {
      const text = String(message || '');
      console.warn('DOOM MCP suppressed interactive prompt during PWAD reload:', text);
      if (/Abort\/Retry\/Ignore\/AlwaysIgnore\?/i.test(text)) return 'i';
      return null;
    };

    try {
      return await operation();
    } finally {
      window.prompt = originalPrompt;
    }
  }

  async function waitForReloadCompletion(timeoutMs = RELOAD_TIMEOUT_MS) {
    const deadline = performance.now() + timeoutMs;
    let last = null;
    await delay(RELOAD_POLL_MS);
    while (performance.now() < deadline) {
      const json = Module.ccall('doomctl_reload_status_json', 'string', [], []);
      last = JSON.parse(json);
      if (last.completed && !last.pending) return last;
      await delay(RELOAD_POLL_MS);
    }
    throw new Error(`PWAD reload timed out after ${timeoutMs} ms${last ? `: ${JSON.stringify(last)}` : ''}`);
  }

  window.DoomControl.loadPwad = async function loadPwad(filename, base64) {
    requireAuthoringRuntime();
    const bytes = decodeBase64(base64);
    if (bytes.length < 12) throw new Error('PWAD payload is too small');
    if (bytes.length > 16 * 1024 * 1024) throw new Error('PWAD payload exceeds 16 MiB import limit');

    const safeName = safeImportName(filename);
    const virtualPath = `/mcp_import_${Date.now()}_${safeName}`;
    Module.FS.writeFile(virtualPath, bytes);

    return withoutInteractivePrompt(async () => {
      const json = Module.ccall('doomctl_load_pwad_json', 'string', ['string'], [virtualPath]);
      const scheduled = JSON.parse(json);
      if (!scheduled.loaded) throw new Error(scheduled.error || `PWAD load failed (${scheduled.code || 'unknown'})`);
      const completion = await waitForReloadCompletion();
      return { ...scheduled, ...completion, loaded: true, filename: safeName, virtualPath, bytes: bytes.length };
    });
  };

  window.DoomControl.reloadCurrentMap = async function reloadCurrentMap() {
    requireAuthoringRuntime();
    return withoutInteractivePrompt(async () => {
      const json = Module.ccall('doomctl_reload_current_map_json', 'string', [], []);
      const scheduled = JSON.parse(json);
      if (!scheduled.reloaded) throw new Error(scheduled.error || 'Map reload failed');
      const completion = await waitForReloadCompletion();
      return { ...scheduled, ...completion, reloaded: true };
    });
  };

  if (typeof handleMcpRequest !== 'function' || typeof replyMcp !== 'function') {
    console.error('DOOM MCP reload bridge could not find shell dispatcher');
    return;
  }

  const previousHandleMcpRequest = handleMcpRequest;
  handleMcpRequest = function extendedHandleMcpRequest(message) {
    const { id, method, params = {} } = message || {};
    if (!id || !method) return previousHandleMcpRequest(message);

    if (method !== 'load_pwad' && method !== 'reload_current_map') {
      return previousHandleMcpRequest(message);
    }

    const operation = method === 'load_pwad'
      ? window.DoomControl.loadPwad(params.filename, params.base64)
      : window.DoomControl.reloadCurrentMap();
    Promise.resolve(operation)
      .then(result => replyMcp(id, true, result))
      .catch(error => replyMcp(id, false, error));
  };
})();
