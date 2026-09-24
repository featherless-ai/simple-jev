// Robust browser audio unlock for desktop/mobile Emscripten SDL2 builds.
//
// The original launcher already calls main() from a click. Some desktop
// browsers can still leave the SDL-created AudioContext suspended if it is
// materialized slightly after that first gesture. This helper keeps retrying
// against known Emscripten/SDL context locations and provides an explicit
// AUDIO button that is guaranteed to run from a fresh user gesture.

(function () {
  let button = null;
  let lastResult = null;

  function uniqueContexts() {
    const values = [];
    const candidates = [
      globalThis.SDL2 && globalThis.SDL2.audioContext,
      globalThis.SDL && globalThis.SDL.audioContext,
      globalThis.Module && globalThis.Module.SDL2 && globalThis.Module.SDL2.audioContext,
      globalThis.Module && globalThis.Module.audioContext
    ];
    for (const context of candidates) {
      if (context && typeof context.resume === 'function' && !values.includes(context)) values.push(context);
    }
    return values;
  }

  function browserStatus() {
    const contexts = uniqueContexts();
    let engine = null;
    try {
      if (globalThis.Module && typeof Module.ccall === 'function') {
        const raw = Module.ccall('doomctl_audio_status_json', 'string', [], []);
        if (raw) engine = JSON.parse(raw);
      }
    } catch {}
    return {
      contexts: contexts.map((context, index) => ({
        index,
        state: context.state,
        sampleRate: context.sampleRate || null
      })),
      engine,
      visibility: document.visibilityState,
      hasUserActivation: Boolean(navigator.userActivation && navigator.userActivation.hasBeenActive),
      lastResult
    };
  }

  function refreshButton() {
    if (!button) return;
    const status = browserStatus();
    const running = status.contexts.some(context => context.state === 'running');
    const mixer = Boolean(status.engine && status.engine.mixerOpen);
    button.textContent = running && mixer ? 'AUDIO ON' : 'AUDIO';
    button.title = running && mixer
      ? 'Browser audio context and SDL mixer are active.'
      : 'Click to unlock/resume browser audio.';
  }

  async function resumeNow(reason = 'manual') {
    const attempts = [];
    const contexts = uniqueContexts();
    for (const context of contexts) {
      try {
        if (context.state !== 'running') await context.resume();
        attempts.push({ state: context.state, ok: context.state === 'running' });
      } catch (error) {
        attempts.push({ state: context.state, ok: false, error: String(error && error.message ? error.message : error) });
      }
    }

    let engineResumed = false;
    try {
      if (globalThis.Module && typeof Module.ccall === 'function') {
        engineResumed = Boolean(Module.ccall('doomctl_audio_resume', 'number', [], []));
      }
    } catch {}

    lastResult = { reason, at: Date.now(), contexts: attempts, engineResumed };
    refreshButton();
    return browserStatus();
  }

  function scheduleRetries(reason) {
    for (const delay of [0, 25, 100, 250, 500, 1000, 2000, 4000]) {
      setTimeout(() => { void resumeNow(`${reason}:${delay}`); }, delay);
    }
  }

  window.DoomAudioUnlock = {
    resumeNow,
    status: browserStatus,
    scheduleRetries
  };

  const controls = document.getElementById('controls');
  if (controls) {
    button = document.createElement('button');
    button.id = 'audioUnlock';
    button.type = 'button';
    button.textContent = 'AUDIO';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      void resumeNow('audio-button');
      const canvas = document.getElementById('canvas');
      if (canvas) canvas.focus();
    });
    controls.prepend(button);
  }

  const start = document.getElementById('start');
  if (start) {
    start.addEventListener('click', () => scheduleRetries('start-click'), true);
  }

  for (const eventName of ['pointerdown', 'pointerup', 'keydown', 'touchstart', 'touchend']) {
    window.addEventListener(eventName, () => { void resumeNow(eventName); }, { passive: true, capture: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') scheduleRetries('visibility');
  });

  setInterval(refreshButton, 1500);
  refreshButton();
})();
