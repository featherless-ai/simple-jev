// Adapted from pavy23/web-doom; browser-only stage runner. See ../README.md.
import { findSectorPath, lineOfWalk, locatePointSector, planLocalPath, solidLines } from './navigation_graph.js';
import { BLOCKER_STEPS, blockerCommand, blockingEnemy, exactInput, interruptedFailure, isCombatCommand, liveSectorFloor, liveSectorOpening, mergeTelemetry, navigateEdge, remainingPathDistance, safeRecovery } from './navigation.js';
const AUTOPLAY_VERSION = 'simple-jev-browser-1';
const GS_LEVEL = 0;
const GS_INTERMISSION = 1;
function headingDegrees(from, to) {
  let angle = Math.atan2(Number(to.y) - Number(from.y), Number(to.x) - Number(from.x)) * 180 / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}
function angleDelta(current, desired) {
  let delta = Number(desired) - Number(current);
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}
function distance(a, b) { return Math.hypot(Number(b.x) - Number(a.x), Number(b.y) - Number(a.y)); }

async function engineState(page) { return page.evaluate(() => window.DoomControl.getState()); }
async function telemetry(page) { return page.evaluate(() => window.DoomControl.getPlaytestTelemetry()); }

// Level completion is observable without a dedicated engine flag: once the
// exit special fires, G_Ticker moves gamestate out of GS_LEVEL and the state
// JSON reports ready=false with the raw gamestate value.
export async function waitForLevelExit(page, timeout = 6000) {
  await page.waitForFunction(level => {
    try {
      const state = window.DoomControl.getState();
      return state && state.ready === false && Number(state.gameState) !== level;
    } catch { return false; }
  }, GS_LEVEL, { timeout });
  return engineState(page);
}

// Walk from the final route sector to the exit line and press it. The exit
// switch (special 11 / 51) needs USE while facing the line; walk-over exits
// (52 / 124) only need the crossing.
export async function approachAndUseExit(page, exit, options = {}) {
  const maxTics = Number(options.maxTics || 350);
  const maxCombatTics = Number(options.maxCombatTicsPerEdge ?? 600);
  let routeTics = 0;
  let combatTics = 0;
  let bestDistance = Infinity;   // progress-based budget, as in navigateEdge
  let ticsSinceProgress = 0;
  const finalTarget = exit.midpoint;
  let waypoints = null;
  const trace = [];
  let usedTics = 0;
  let lastDistance = Infinity;
  let stalled = 0;
  let recoverySide = 1;
  let recoveries = 0;
  let clearing = 0;        // steps left on a blocking monster (see blockerCommand)
  let lastUse = false;

  while (ticsSinceProgress < maxTics && combatTics < maxCombatTics) {
    const state = await engineState(page);
    if (state?.ready === false && Number(state.gameState) !== GS_LEVEL) {
      return { passed: true, usedTics, trace, finalState: state };
    }
    if (!state?.ready || !state.player) throw new Error('Exit approach lost player state');
    if (Number(state.player.health || 0) <= 0) return { passed: false, usedTics, trace, failure: 'player_dead', finalState: state };

    const position = { x: Number(state.player.x), y: Number(state.player.y) };
    // Local routing around walls, as in navigateEdge, when a graph is given.
    if (options.graph && (waypoints == null || stalled >= 7)) {
      waypoints = planLocalPath(options.graph, Number(state.currentSector), position, exit.midpoint, { ignoreLines: exit.line != null ? [exit.line] : [] });
    }
    while (waypoints && waypoints.length && distance(position, waypoints[0]) < 24) waypoints.shift();
    // Re-check the straight walk to the next point every step (see navigateEdge).
    if (options.graph?.geometry) {
      const ignoreLines = exit.line != null ? [exit.line] : [];
      const nextPoint = waypoints && waypoints.length ? waypoints[0] : finalTarget;
      if (!lineOfWalk(options.graph.geometry, position, nextPoint, solidLines(options.graph.geometry).filter(line => !ignoreLines.includes(line.index)))) {
        waypoints = planLocalPath(options.graph, Number(state.currentSector), position, exit.midpoint, { ignoreLines });
        while (waypoints.length && distance(position, waypoints[0]) < 24) waypoints.shift();
      }
    }
    const target = waypoints && waypoints.length ? waypoints[0] : finalTarget;
    const targetDistance = distance(position, target);
    const desired = headingDegrees(position, target);
    const delta = angleDelta(Number(state.player.angle), desired);
    let command;

    if (targetDistance >= lastDistance - 0.75) stalled++;
    else stalled = Math.max(0, stalled - 1);
    lastDistance = targetDistance;

    // Same hold as navigateEdge: a monster between the player and the exit
    // switch needs a run of steps to clear, not one recovery in seven.
    const blocker = clearing > 0 ? blockingEnemy(state) : null;
    if (blocker) clearing--; else clearing = 0;

    if (blocker) {
      command = blockerCommand(blocker, { use: exit.trigger === 'use' });
    } else if (stalled >= 7) {
      command = safeRecovery(options.graph, state, recoverySide, { use: exit.trigger === 'use' }, recoveries++);
      if (command.recovery === 'blocker') clearing = BLOCKER_STEPS;
      recoverySide *= -1;
      stalled = 0;
    } else if (Math.abs(delta) > 8) {
      const magnitude = Math.min(0.7, Math.max(0.16, Math.abs(delta) / 90 * 0.55));
      command = { turn: delta > 0 ? -magnitude : magnitude, use: false, tics: Math.abs(delta) > 50 ? 3 : 2 };
    } else if (targetDistance < 40) {
      // Vanilla USE reach is 64 units; keep pushing gently into the line while
      // holding USE so switch and walk-over exits both trigger.
      command = { forward: 0.35, turn: 0, use: exit.trigger === 'use', tics: 3 };
    } else {
      command = { forward: 0.62, turn: delta > 3 ? -0.08 : delta < -3 ? 0.08 : 0, use: false, tics: 4 };
    }

    if (typeof options.decide === 'function') {
      const override = await options.decide({ state, edge: null, exit, proposal: command, targetDistance, delta, usedTics });
      if (override) command = override;
    }

    // USE is edge-triggered in the engine: pulse it (see navigateEdge).
    if (command.use && lastUse) command = { ...command, use: false };
    lastUse = Boolean(command.use);
    let result;
    try {
      result = await exactInput(page, command);
    } catch (error) {
      // queueAgentInput rejects with -1 once gamestate leaves GS_LEVEL. That is
      // the success path when USE fired on the previous step.
      const state = await engineState(page).catch(() => null);
      if (state?.ready === false && Number(state.gameState) !== GS_LEVEL) {
        return { passed: true, usedTics, trace, finalState: state };
      }
      throw error;
    }
    usedTics += result.tics;
    if (result.interrupted) {
      return { passed: false, usedTics, routeTics, combatTics, trace, failure: interruptedFailure(result), finalState: result.state };
    }
    if (isCombatCommand(command)) combatTics += result.tics; else routeTics += result.tics;
    const remaining = remainingPathDistance(position, waypoints, finalTarget);
    if (remaining < bestDistance - 4) { bestDistance = remaining; ticsSinceProgress = 0; }
    else if (!isCombatCommand(command)) ticsSinceProgress += result.tics;
    if (typeof options.onStep === 'function') {
      await options.onStep({ edge: null, exit, state, command, result, usedTics, routeTics, combatTics, ticsSinceProgress, targetDistance, delta });
    }
    if (trace.length < 80) trace.push({ tics: usedTics, x: position.x, y: position.y, targetDistance, delta, command });

    if (command.use || exit.trigger === 'walk') {
      if (typeof options.success === 'function') {
        // Generic line activation (a tagged switch): the caller decides
        // what "it worked" means, for example the door sector opening.
        if (await options.success()) return { passed: true, usedTics, routeTics, combatTics, trace, finalState: await engineState(page) };
      } else {
        try {
          const after = await waitForLevelExit(page, 1500);
          return { passed: true, usedTics, trace, finalState: after };
        } catch { /* not yet; keep approaching */ }
      }
    }
  }
  const finalState = await engineState(page);
  const label = options.failureLabel || 'exit';
  return { passed: false, usedTics, routeTics, combatTics, trace, failure: combatTics >= maxCombatTics ? `${label}_combat_budget_exhausted` : `${label}_no_progress`, finalState };
}

// Fire a tagged trigger edge of the progression: walk to the switch (or the
// walk-over line), use it, and wait for the door sector it opens to have
// room for the player. Vanilla doors rise 2 units per tic, so a 128-unit
// door needs ~64 tics after the switch; idle exact-tic steps cover that.
export async function activateTrigger(page, edge, options = {}) {
  const doorSector = edge.doorSectors?.[0];
  // Floor movers: wait until every affected sector's floor reached the
  // height the graph predicted (stairs at 0.25 units/tic can take ~9 s for
  // the top step, hence the long idle budget). The gate is the first
  // sector that moved at all, so an unfired trigger keeps the approach going.
  const floors = edge.floors ? Object.entries(edge.floors).map(([sector, floor]) => [Number(sector), Number(floor)]) : [];
  const startFloors = new Map();
  if (floors.length) for (const [sector] of floors) startFloors.set(sector, await liveSectorFloor(page, sector));
  const floorsDone = async () => {
    for (const [sector, target] of floors) {
      const floor = await liveSectorFloor(page, sector);
      if (floor == null || Math.abs(floor - target) > 2) return false;
    }
    return true;
  };
  const success = async () => {
    if (floors.length) {
      let moved = false;
      for (const [sector] of floors) {
        const floor = await liveSectorFloor(page, sector);
        if (floor != null && startFloors.get(sector) != null && Math.abs(floor - startFloors.get(sector)) >= 1) { moved = true; break; }
      }
      if (!moved) return false;
      for (let i = 0; i < 120 && !(await floorsDone()); i++) {
        // A step that does not complete (the engine failed to consume its
        // budget in time) ends the wait as "not yet" instead of ending the
        // run: the approach loop keeps polling.
        try { await exactInput(page, { tics: 4 }); } catch { return false; }
      }
      return floorsDone();
    }
    if (doorSector == null) return true;
    let opening = await liveSectorOpening(page, doorSector);
    if (opening == null || opening < 8) return false; // not started opening yet
    for (let i = 0; i < 30 && opening < PLAYER_HEIGHT_UNITS; i++) {
      await exactInput(page, { tics: 4 });
      opening = await liveSectorOpening(page, doorSector);
    }
    return opening >= PLAYER_HEIGHT_UNITS;
  };
  // `line` matters: a wall switch sits on a one-sided line, so the straight
  // walk to its midpoint always reads as blocked. Without the exception the
  // approach replans every step and never reaches the switch.
  return approachAndUseExit(page, { midpoint: edge.midpoint, trigger: edge.action, line: edge.line }, { ...options, success, failureLabel: 'trigger', maxTics: options.maxTicsPerEdge });
}
const PLAYER_HEIGHT_UNITS = 56;

// Walk over a key thing. The engine state does not report keycards, so
// arrival within pickup reach is the success condition (pickup radius is
// the player's 16-unit radius plus the item's; 28 units is inside it).
export async function collectKey(page, key, options = {}) {
  const target = { x: Number(key.x), y: Number(key.y) };
  const success = async () => {
    const state = await engineState(page);
    return distance({ x: Number(state.player.x), y: Number(state.player.y) }, target) < 28;
  };
  return approachAndUseExit(page, { midpoint: target, trigger: 'walk' }, { ...options, success, failureLabel: 'key', maxTics: options.maxTics || 350 });
}

// One full stage attempt on an already-open page.
export async function runStageAttempt(page, stage, options = {}) {
  const config = { maxTicsPerEdge: 280, godMode: false, ...options };
  const { graph, progression } = stage;
  const attempt = {
    version: AUTOPLAY_VERSION,
    map: stage.map,
    godMode: Boolean(config.godMode),
    startedAt: new Date().toISOString(),
    passed: false,
    plannedSectors: progression.sectors,
    exit: progression.exit,
    edgeResults: [],
    steps: 0,
    totalTics: 0
  };
  const stepLog = config.stepLog;
  let stepIndex = 0;
  let lastTelemetry = null;
  const onStep = async (event) => {
    stepIndex++;
    attempt.steps = stepIndex;
    if (event.result?.telemetry?.ready) lastTelemetry = event.result.telemetry;
    const player = event.result.state?.player || {};
    await config.onStep?.(event);
  };

  let initial = await engineState(page);
  attempt.startSector = Number(initial.currentSector);
  attempt.skill = initial.skill ?? null; // LinuxDOOM gameskill: 0 ITYTD .. 4 Nightmare
  if (attempt.startSector !== progression.startSector) {
    throw new Error(`Runtime start sector ${attempt.startSector} differs from static plan ${progression.startSector}`);
  }

  await page.evaluate(() => window.DoomControl.setPlaytestPaused(false));
  await page.evaluate(() => window.DoomControl.cancelAgentInput());
  await page.evaluate(() => window.DoomControl.resetPlaytestMetrics());

  attempt.startLevelTic = Number(initial.levelTime ?? -1);


  if (config.godMode) attempt.cheat = await page.evaluate(() => window.DoomControl.setGodMode(true));

  const transitions = progression.transitions;
  // Skipping ahead (landing in a later route sector) must never jump past a
  // key pickup or a trigger, and on a route that loops back through earlier
  // sectors it must only look at the stretch before the next such step.
  const skipLimit = (from) => {
    for (let j = from + 1; j < transitions.length; j++) {
      if (transitions[j].acquiredKeys?.length || transitions[j].firedTag != null || transitions[j].edge.kind === 'trigger') return j;
    }
    return transitions.length - 1;
  };
  const keyThings = graph.things?.keys || [];
  let recoveries = 0;
  let index = 0;
  while (index < transitions.length) {
    const edge = transitions[index].edge;
    const next = transitions[index + 1]?.edge || null;
    const limit = skipLimit(index);
    // route position k holds transitions[k-1].edge.to; allow positions index+2 .. limit+1
    const laterSectors = new Set(progression.sectors.slice(index + 2, limit + 2));
    let result = edge.kind === 'trigger'
      ? await activateTrigger(page, edge, { graph, maxTicsPerEdge: config.maxTicsPerEdge, maxCombatTicsPerEdge: config.maxCombatTicsPerEdge, decide: config.decide, onStep })
      : await navigateEdge(page, graph, edge, {
        maxTicsPerEdge: config.maxTicsPerEdge,
        maxCombatTicsPerEdge: config.maxCombatTicsPerEdge,
        decide: config.decide,
        onStep,
        acceptSectors: laterSectors,
        useNearPortal: Boolean(next && next.action === 'use'),
        doorSector: edge.action === 'use' ? Number(edge.to) : (next && next.action === 'use' ? Number(next.to) : null)
      });
    // Real-time momentum and combat can leave the planned sector. Rejoin
    // through actual sector portals rather than pushing across a blocked ledge.
    if (!result.passed && result.failure === 'edge_no_progress' && recoveries < 3) {
      const current = Number(result.finalState?.currentSector);
      if (current !== edge.from && current !== edge.to) {
        const detour = findSectorPath(graph, current, edge.to);
        if (detour.found) {
          recoveries++;
          attempt.totalTics += result.usedTics;
          for (const recoveryEdge of detour.edges) {
            result = await navigateEdge(page, graph, recoveryEdge, {
              maxTicsPerEdge: config.maxTicsPerEdge,
              maxCombatTicsPerEdge: config.maxCombatTicsPerEdge,
              decide: config.decide, onStep,
            });
            if (!result.passed) break;
          }
        }
      }
    }
    attempt.totalTics += result.usedTics;
    attempt.edgeResults.push({
      edge: edge.id, kind: edge.kind, action: edge.action,
      passed: result.passed, usedTics: result.usedTics, routeTics: result.routeTics ?? null, combatTics: result.combatTics ?? null,
      failure: result.failure || null,
      endSector: result.finalState?.currentSector ?? null,
      health: result.finalState?.player?.health ?? null
    });
    if (!result.passed) {
      // Route-position recovery: a fight can push the player back into an
      // earlier route sector (back onto a lift that then rises). If the
      // player stands somewhere the route already covered, resume there
      // instead of failing, a few times per run.
      const here = Number(result.finalState?.currentSector);
      let back = -1;
      for (let k = index; k >= 0; k--) if (progression.sectors[k] === here) { back = k; break; }
      if (result.failure === 'edge_no_progress' && back >= 0 && back < index && recoveries < 3) {
        recoveries++;
        attempt.recoveries = recoveries;
        index = back;
        continue;
      }
      attempt.failure = result.failure || 'edge_failed';
      attempt.failedEdge = edge.id;
      break;
    }
    // Continue from wherever the player actually landed on the planned route
    // (first occurrence after the current position, within the skip window).
    let landed = -1;
    for (let k = index + 1; k <= limit + 1 && k < progression.sectors.length; k++) {
      if (progression.sectors[k] === Number(result.reachedSector)) { landed = k; break; }
    }
    const nextIndex = landed > index ? landed : index + 1;
    // Keys: entering a key's sector is not picking it up. Walk to every key
    // the crossed transitions expect to have collected.
    for (let j = index; j < nextIndex && j < transitions.length; j++) {
      for (const keyName of transitions[j].acquiredKeys || []) {
        const key = keyThings.find(item => item.key === keyName && item.sector === Number(transitions[j].edge.to));
        if (!key) continue;
        const keyResult = await collectKey(page, key, { graph, decide: config.decide, onStep, maxCombatTicsPerEdge: config.maxCombatTicsPerEdge });
        attempt.totalTics += keyResult.usedTics;
        attempt.edgeResults.push({
          edge: `key:${keyName}:${key.sector}`, kind: 'key', action: 'walk',
          passed: keyResult.passed, usedTics: keyResult.usedTics, routeTics: keyResult.routeTics ?? null, combatTics: keyResult.combatTics ?? null,
          failure: keyResult.failure || null,
          endSector: keyResult.finalState?.currentSector ?? null,
          health: keyResult.finalState?.player?.health ?? null
        });
        if (!keyResult.passed) { attempt.failure = keyResult.failure || 'key_failed'; attempt.failedEdge = `key:${keyName}`; }
      }
    }
    if (attempt.failure) break;
    index = nextIndex;
  }

  if (!attempt.failure) {
    const exitResult = await approachAndUseExit(page, progression.exit, { graph, decide: config.decide, onStep, maxCombatTicsPerEdge: config.maxCombatTicsPerEdge });
    attempt.totalTics += exitResult.usedTics;
    attempt.exitResult = {
      passed: exitResult.passed, usedTics: exitResult.usedTics, failure: exitResult.failure || null,
      finalGameState: exitResult.finalState?.gameState ?? null
    };
    attempt.passed = exitResult.passed;
    if (!exitResult.passed) attempt.failure = exitResult.failure || 'exit_failed';
    else attempt.levelExitedTo = { episode: exitResult.finalState?.episode, map: exitResult.finalState?.map };
  }

  // After the exit fires the engine is in intermission and reports no player,
  // so the last in-level telemetry sample is the run's final measurement.
  const live = await telemetry(page).catch(() => null);
  // mergeTelemetry is the identity unless a counter went backwards, which
  // only a mid-command death and its reborn can do (see navigation_browser_agent).
  attempt.telemetry = live?.ready ? mergeTelemetry(lastTelemetry, live) : lastTelemetry;
  attempt.completedAt = new Date().toISOString();
  return attempt;
}

