import { runStageAttempt } from './vendor/runner.js';
import { API, DEFAULT_MODEL, buildRequest, readAction, combatCommand, targets, actions } from './policy.js';
const $ = id => document.getElementById(id);
let runtimeReady = false;
let controller, running = false, lastCall = 0, calls = 0, stage;
let pending = false, latest = null, apiError = '', retryAt = 0;
const records = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function check() { controller?.signal.throwIfAborted(); }
const page = {
  async evaluate(fn, arg) { check(); return fn(arg); },
  async waitForFunction(fn, arg, { timeout = 8000 } = {}) {
    const deadline = performance.now() + timeout;
    while (true) {
      check();
      if (fn(arg)) return;
      if (performance.now() > deadline) throw Error('DOOM did not advance. Start a new run to retry.');
      await delay(16);
    }
  },
};
function update(state) {
  if (!state?.player) return;
  for (const key of ['health','armor','kills']) $(key).textContent = state.player[key] ?? '—';
}
function renderDecision(action, body, ms) {
  $('latency').textContent = `· ${ms} ms`;
  const probabilities = body.answers.action.probabilities || {};
  $('probabilities').replaceChildren(...Object.keys(actions).map(key => {
    const row = document.createElement('div');
    row.className = `probability${key === action ? ' selected' : ''}`;
    const name = document.createElement('span'); name.textContent = key.replaceAll('_', ' ');
    const meter = document.createElement('meter'); meter.min = 0; meter.max = 1;
    const value = Number(probabilities[key]);
    meter.value = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
    meter.setAttribute('aria-label', `${name.textContent} probability`);
    const label = document.createElement('span'); label.textContent = Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—';
    row.append(name, meter, label); return row;
  }));
  records.unshift(`${new Date().toLocaleTimeString()} · ${action.replaceAll('_', ' ')} · ${ms} ms`);
  records.splice(30);
  $('history').replaceChildren(...records.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
}
async function requestDecision(context) {
  pending = true;
  const request = buildRequest(context.state, context, $('model').value);
  const started = performance.now();
  lastCall = started;
  calls++;
  $('calls').textContent = calls;
  $('inspector').textContent = JSON.stringify({ request }, null, 2);
  try {
    const response = await fetch(`${API}/classifier`, {
      method: 'POST', credentials: 'omit', redirect: 'error',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request),
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(45000)]),
    });
    const body = await response.json();
    check();
    $('inspector').textContent = JSON.stringify({ request, response: body }, null, 2);
    if (!response.ok) {
      const retry = Number(response.headers.get('Retry-After'));
      retryAt = performance.now() + (response.status === 429 ? Math.max(5000, Number.isFinite(retry) ? retry * 1000 : 5000) : 5000);
      throw Error(response.status === 429 ? 'The API is busy; retrying shortly.' : `The API could not return a decision (HTTP ${response.status}).`);
    }
    const action = readAction(body);
    const elapsed = Math.round(performance.now() - started);
    // A slow response describes an old world. Show it in history but do not
    // apply it to a now-different encounter.
    latest = elapsed <= 3000 ? { action, observedAt: started } : null;
    apiError = elapsed > 3000 ? 'Response too old to apply; requesting a fresh decision.' : '';
    renderDecision(action, body, elapsed);
  } catch (error) {
    if (!controller.signal.aborted) {
      apiError = error.message;
      retryAt = Math.max(retryAt, performance.now() + 5000);
      latest = null;
    }
  } finally { pending = false; }
}
function decide(context) {
  check();
  update(context.state);
  const enemies = targets(context.state);
  const nearby = enemies.some(e => e.distance < 700);
  $('observation').textContent = `Health ${context.state.player.health}, armor ${context.state.player.armor}. ` +
    (enemies.length ? enemies.map(e => `${e.name}: ${Math.round(e.distance)} units away, bearing ${Math.round(e.relativeAngle)}°`).join('; ') : 'No enemies in sight.') +
    ` Route waypoint: ${Math.round(context.targetDistance || 0)} units away.`;
  if (nearby && !pending && performance.now() >= Math.max(lastCall + 550, retryAt)) {
    void requestDecision(context);
  }
  const fresh = latest && performance.now() - latest.observedAt < 3000;
  const action = nearby && fresh ? latest.action : null;
  $('activity').textContent = pending ? 'Request in flight · game running' : apiError || 'Game running';
  $('decision').textContent = action ? action.replaceAll('_', ' ') : nearby ? 'Local combat control' : 'Following route';
  $('decision-detail').textContent = action ? actions[action] : nearby
    ? 'The local controller aims and fires while waiting for a fresh classifier decision.'
    : 'The route follower is moving toward the next waypoint. The classifier is consulted when enemies are nearby.';
  $('status').textContent = apiError ? `Autoplay · ${apiError} Local control continues.` : 'Autoplay · live game, asynchronous decisions';
  // Re-aim from the current state, never the snapshot sent to the API.
  return action ? combatCommand(action, context.state, context.proposal)
    : nearby ? { ...combatCommand('fight', context.state, context.proposal), source: 'local-combat' }
    : context.proposal;
}
async function start() {
  if (running || !runtimeReady) return;
  running = true;
  controller = new AbortController();
  $('start').disabled = true;
  $('screen-start-button').disabled = true;
  $('screen-start').hidden = true;
  $('model').disabled = true;
  $('stop').disabled = false;
  $('restart').disabled = false;
  try {
    // Audio initialization is tied to the user's Start click.
    Module.callMain(['-warp', '1', '1', '-skill', '2']);
    await page.waitForFunction(() => {
      const state = DoomControl.getState();
      if (!state.ready || state.map !== 1) return false;
      return true;
    }, null, { timeout: 30000 });
    const result = await runStageAttempt(page, stage, {
      godMode: false, overlay: false, decide,
      maxTicsPerEdge: 560, maxCombatTicsPerEdge: 1800,
      onStep: event => update(event.result.state),
    });
    $('status').textContent = result.passed ? 'Level cleared! Start a new run to play again.'
      : `Run ended: ${(result.failure || 'route incomplete').replaceAll('_', ' ')}. Start a new run to retry.`;
  } catch (error) {
    $('status').textContent = controller.signal.aborted ? 'Agent stopped. The game keeps running. Start a new run when ready.' : error.message;
  } finally {
    controller.abort();
    running = false;
    $('activity').textContent = 'Agent stopped · game running';
    $('stop').disabled = true;
    try { DoomControl.cancelAgentInput(); DoomControl.setPlaytestPaused(false); } catch { /* Runtime may not have started. */ }
  }
}
$('start').addEventListener('click', start);
$('screen-start-button').addEventListener('click', start);
$('stop').addEventListener('click', () => {
  controller?.abort();
  DoomControl.cancelAgentInput();
  DoomControl.setPlaytestPaused(false);
  $('stop').disabled = true;
  $('status').textContent = 'Agent stopped. The game keeps running. Start a new run when ready.';
});
$('restart').addEventListener('click', () => { controller?.abort(); location.reload(); });
const metricsTimer = setInterval(() => { if (runtimeReady) { try { update(DoomControl.getState()); } catch {} } }, 250);
window.addEventListener('pagehide', () => { controller?.abort(); clearInterval(metricsTimer); });
try {
  const stageResponse = await fetch('vendor/e1m1.json');
  if (!stageResponse.ok) throw Error('Could not load the level route.');
  stage = await stageResponse.json();
  await window.doomReady;
  runtimeReady = true;
  $('status').textContent = 'Ready · E1M1 · Hey, Not Too Rough difficulty';
  $('start').disabled = false;
  $('screen-start-button').disabled = false;
  $('screen-start-status').textContent = 'Watch Jev observe, decide, and play.';
} catch (error) {
  $('status').textContent = `Loading failed: ${error.message}`;
  $('screen-start-status').textContent = $('status').textContent;
}
// Discover models without preventing the default from being used if discovery fails.
fetch(`${API}/models`, { credentials: 'omit', signal: AbortSignal.timeout(15000) })
  .then(r => { if (!r.ok) throw Error('Model discovery failed'); return r.json(); })
  .then(body => {
    if (running || $('start').disabled) return;
    const ids = [...new Set((body.data || []).map(m => m.id).filter(id => typeof id === 'string' && id))];
    if (!ids.length) return;
    $('model').replaceChildren(...ids.map(id => new Option(id, id)));
    $('model').value = ids.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : ids[0];
  }).catch(() => {});
