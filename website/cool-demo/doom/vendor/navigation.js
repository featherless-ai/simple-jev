// Adapted from pavy23/web-doom; browser-only navigation. See ../README.md.
import { lineOfWalk, movementHazard, planLocalPath, solidLines } from './navigation_graph.js';
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
// Distance still to walk along the local path: to the current waypoint, then
// waypoint to waypoint, then to the final target. This is the progress
// measure for the no-progress budget: a detour around a pit (E1M3 sector 67
// sends the follower 700 units south before it can go north) moves the
// player away from the portal for a long time while making steady progress.
// The follower's stall recovery is a blind sidestep. On a walkway between
// nukage lakes (E1M3 sector 47) that sidestep is what killed four policy
// runs, so with a graph at hand the step is previewed against walls, drops
// and damaging shores; the side flips when the first side is unsafe, and
// both sides unsafe means a short backstep or, if that is unsafe too, a turn
// in place.
// A monster standing in a doorway is not an obstacle the geometry knows
// about, and no sidestep gets round one in a corridor. E1M1's exit corridor
// (edge 72:74:309) held the god-mode follower for 375 tics with an enemy in
// front the whole time, the route planner insisting the way was clear,
// because layer 1 never pulls the trigger. So when a recovery is already
// under way and something living is close and roughly ahead, shoot it. This
// is the same kind of deterministic rule as the sidestep it replaces, and it
// only fires while the follower is stalled.
const BLOCKER_RANGE = 112;      // player radius 16 + monster radius up to 31, plus reach
const BLOCKER_CONE = 50;        // degrees off the facing that count as "in the way"
const BLOCKER_AIM = 12;         // degrees that count as on target
export const BLOCKER_STEPS = 24; // steps to stay on a blocker once one is found
// The exact turn and tic count that zero a bearing in one step, capped at
// four tics. The same arithmetic the policy aims with, kept here so this
// layer does not depend on the policy above it: the engine turns about
// 7 degrees per tic at full deflection, and the agent's turn is capped at 0.7.
const DEGREES_PER_TURN_TIC = 7;
const MAX_TURN = 0.7;
function aimAt(bearing) {
  const degrees = Math.abs(Number(bearing) || 0);
  const tics = Math.max(1, Math.min(4, Math.ceil(degrees / (DEGREES_PER_TURN_TIC * MAX_TURN))));
  const magnitude = Math.min(MAX_TURN, degrees / (DEGREES_PER_TURN_TIC * tics));
  return { turn: bearing > 0 ? -magnitude : magnitude, tics };
}
// Turn onto the blocker and fire once on target. Standing still to shoot is a
// fight, so the source makes isCombatCommand true and the step is budgeted
// against maxCombatTics rather than draining the edge's no-progress budget.
export function blockerCommand(blocker, extra = {}) {
  const aligned = Math.abs(Number(blocker.bearing)) <= BLOCKER_AIM;
  const aim = aligned ? { turn: 0, tics: 3 } : aimAt(blocker.bearing);
  return { forward: 0, strafe: 0, turn: aim.turn, attack: aligned, tics: aim.tics, ...extra, source: 'recovery', recovery: 'blocker' };
}
export function blockingEnemy(state) {
  let nearest = null;
  for (const enemy of state?.enemies || []) {
    if (!(Number(enemy.health) > 0)) continue;
    const distance = Number(enemy.distance);
    const bearing = Number(enemy.relativeAngle);
    if (!Number.isFinite(distance) || !Number.isFinite(bearing)) continue;
    if (distance > BLOCKER_RANGE || Math.abs(bearing) > BLOCKER_CONE) continue;
    if (!nearest || distance < nearest.distance) nearest = { distance, bearing };
  }
  return nearest;
}
export function safeRecovery(graph, state, side, extra = {}, attempt = 0) {
  const geometry = graph?.geometry;
  const player = state?.player || {};
  const blocker = blockingEnemy(state);
  if (blocker) return blockerCommand(blocker, extra);
  const sidestep = { forward: 0.25, strafe: 0.55 * side, turn: -0.18 * side, tics: 3 };
  const otherSide = { forward: 0.25, strafe: -0.55 * side, turn: 0.18 * side, tics: 3 };
  const backstep = { forward: -0.5, strafe: 0, turn: 0, tics: 4 };
  const turnOnly = { forward: 0, strafe: 0, turn: 0.3 * side, tics: 3 };
  // Every third recovery on the same edge backs up first: two sidesteps
  // that did not move the player mean both sides are blocked (a barrel
  // beside a pillar), and the way out is behind.
  const candidates = attempt % 3 === 2 ? [backstep, sidestep, otherSide, turnOnly] : [sidestep, otherSide, backstep, turnOnly];
  for (const candidate of candidates) {
    if (geometry && (candidate.forward || candidate.strafe)) {
      const angle = Number(player.angle) * Math.PI / 180;
      const fx = Math.cos(angle), fy = Math.sin(angle), rx = Math.cos(angle - Math.PI / 2), ry = Math.sin(angle - Math.PI / 2);
      const magnitude = Math.hypot(candidate.forward, candidate.strafe);
      const length = 16 + 10 * candidate.tics * magnitude;
      const from = { x: Number(player.x), y: Number(player.y) };
      const to = { x: from.x + (candidate.forward * fx + candidate.strafe * rx) / magnitude * length, y: from.y + (candidate.forward * fy + candidate.strafe * ry) / magnitude * length };
      if (movementHazard(geometry, from, to)) continue;
    }
    return { ...candidate, ...extra };
  }
  return { forward: 0, strafe: 0, turn: 0.3 * side, tics: 3, ...extra };
}
export function remainingPathDistance(position, waypoints, finalTarget) {
  const points = [...(waypoints || []), finalTarget];
  let total = distance(position, points[0]);
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i]);
  return total;
}
// The point 28 units past the portal on the target sector's side. Taken from
// the portal line's normal when the geometry is at hand: the target sector's
// centre can lie on the wrong side of the portal (E1M3 sector 25 wraps
// around sector 24 in a U, its centre sits inside 24), and aiming at it sent
// the follower back into the sector it was leaving, turning in circles.
function crossingPoint(edge, targetCenter, geometry = null) {
  const line = geometry?.linedefs?.[edge.line];
  if (line && geometry.vertices?.[line.v1] && geometry.vertices?.[line.v2]) {
    const a = geometry.vertices[line.v1], b = geometry.vertices[line.v2];
    const dx = Number(b.x) - Number(a.x), dy = Number(b.y) - Number(a.y);
    const length = Math.hypot(dx, dy) || 1;
    // Right side of a linedef (y up): the direction rotated clockwise.
    const rightSector = line.right === 65535 ? null : geometry.sidedefs?.[line.right]?.sector;
    const sign = Number(rightSector) === Number(edge.to) ? 1 : -1;
    return { x: Number(edge.midpoint.x) + sign * dy / length * 28, y: Number(edge.midpoint.y) - sign * dx / length * 28 };
  }
  const dx = Number(targetCenter.x) - Number(edge.midpoint.x);
  const dy = Number(targetCenter.y) - Number(edge.midpoint.y);
  const length = Math.hypot(dx, dy) || 1;
  return { x: Number(edge.midpoint.x) + dx / length * 28, y: Number(edge.midpoint.y) + dy / length * 28 };
}
// `headed: true` (or DOOM_MCP_HEADED=1) opens a visible window so a local run
// can be watched; trials are otherwise identical, since the world only
// advances through exact-tic steps.
// The reborn that refuses a step also reloads the level, which resets the
// player's own counters: one E1M3 run came back reading 0 kills after 7,991
// world tics. The playtest accumulators (deaths, damage, world tics) survive
// it. So take the earlier value wherever the reading went backwards, and
// report the player as dead, which is what ended the run. On a run that
// never rebore nothing goes backwards and this is the identity.
export function mergeTelemetry(before, after) {
  if (!before?.ready) return after;
  if (!after?.ready) return before;
  const merged = { ...after };
  for (const key of ['kills', 'items', 'secrets', 'armor']) {
    if (Number(after[key] || 0) < Number(before[key] || 0)) merged[key] = before[key];
  }
  if (Number(after.deaths || 0) > 0) merged.health = 0;
  return merged;
}

// Adaptation: advance in real time; never pause for input or API latency.
export async function exactInput(page, command) {
  const tics = Math.max(1, Math.min(12, Math.trunc(command.tics || 1)));
  const before = await page.evaluate(() => window.DoomControl.getPlaytestTelemetry());
  await page.evaluate(cmd => window.DoomControl.queueAgentInput(cmd), { ...command, tics });
  await page.waitForFunction(() => {
    const state = window.DoomControl.getState();
    return !window.DoomControl.getAgentInputStatus().active || !state.ready || state.player?.health <= 0;
  }, null, { timeout: 8000 });
  const after = await page.evaluate(() => window.DoomControl.getPlaytestTelemetry());
  return {
    state: await page.evaluate(() => window.DoomControl.getState()),
    telemetry: mergeTelemetry(before, after),
    tics: Math.max(1, Number(after.worldTics || 0) - Number(before.worldTics || 0)),
  };
}
// Live floor/ceiling opening of one sector (world units). Returns null when
// the engine cannot report it (for example before the level is ready).
export async function liveSectorOpening(page, sectorIndex) {
  const index = Math.trunc(Number(sectorIndex));
  if (!Number.isFinite(index) || index < 0) return null;
  return page.evaluate(wanted => {
    const json = Module.ccall('doomctl_get_sectors_json', 'string', ['number'], [wanted + 1]);
    const parsed = JSON.parse(json);
    const row = parsed?.sectors?.find(item => Number(item.index) === wanted);
    return row ? Number(row.ceiling) - Number(row.floor) : null;
  }, index);
}

// Live floor height of one sector (world units), for lifts.
export async function liveSectorFloor(page, sectorIndex) {
  const index = Math.trunc(Number(sectorIndex));
  if (!Number.isFinite(index) || index < 0) return null;
  return page.evaluate(wanted => {
    const json = Module.ccall('doomctl_get_sectors_json', 'string', ['number'], [wanted + 1]);
    const parsed = JSON.parse(json);
    const row = parsed?.sectors?.find(item => Number(item.index) === wanted);
    return row ? Number(row.floor) : null;
  }, index);
}

const PLAYER_HEIGHT_UNITS = 56;

// Vanilla EV_VerticalDoor toggles a door that is already moving: USE while
// opening starts it closing again. So USE is only pressed when the tracked
// door is closed or closing, never while it is opening or standing open.
function decideDoorUse(opening, previousOpening) {
  if (opening == null) return null;
  const rising = previousOpening != null && opening > previousOpening + 0.25;
  if (rising) return false;
  return opening < PLAYER_HEIGHT_UNITS;
}

export async function navigateEdge(page, graph, edge, options = {}) {
  const maxTics = Number(options.maxTicsPerEdge || 210);
  // Steps a policy spends standing and fighting (or backing off) do not move
  // the player along the edge, so they are budgeted separately: the route
  // budget still catches a stuck follower, the combat budget a fight that
  // never ends. Both are reported; totalTics in the objective counts all.
  const maxCombatTics = Number(options.maxCombatTicsPerEdge ?? 600);
  let routeTics = 0;
  let combatTics = 0;
  // The route budget counts tics without progress: it resets whenever the
  // distance to the portal reaches a new minimum. A follower that fights
  // its way along a long edge is not "stuck"; one that never gets closer is.
  let bestPortalDistance = Infinity;
  let ticsSinceProgress = 0;
  let waypoints = null;
  const targetNode = graph.nodes[edge.to];
  const cross = crossingPoint(edge, targetNode.center, graph.geometry);
  const trace = [];
  let usedTics = 0;
  let lastDistance = Infinity;
  let stalled = 0;
  let recoverySide = 1;
  let recoveries = 0;
  let clearing = 0;        // steps left on a blocking monster (see blockerCommand)
  let lastUse = false;
  // Door awareness: a door edge tracks its own target sector; an edge that
  // ends in a thin door frame tracks the door behind it (options.doorSector).
  const doorSector = options.doorSector != null ? Number(options.doorSector)
    : (edge.action === 'use' ? Number(edge.to) : null);
  let previousOpening = null;
  // Lift awareness: the sector carrying the line's tag is the platform; the
  // edge is passable only while its floor sits at the other sector's floor.
  // A rider that stops to fight (policy override) lets the lift cycle back
  // up; so while the lift is away the runner calls it (USE, for switch
  // lifts) and holds, and while it is level the walk-off command outranks
  // the policy for that step.
  let liftSector = null;
  let liftTargetFloor = null;
  let liftLastFloor = null;
  let liftStillTics = 0;      // tics the platform has not moved while we wait on it
  let liftRecross = false;    // step off and back on to re-fire a walk-over lift trigger
  let liftLeaveSteps = 0;     // consecutive walk-off steps that outranked the policy
  if (edge.kind === 'lift' && edge.tag) {
    if (graph.nodes[edge.from]?.tag === edge.tag) { liftSector = edge.from; liftTargetFloor = graph.nodes[edge.to].floor; }
    else if (graph.nodes[edge.to]?.tag === edge.tag) { liftSector = edge.to; liftTargetFloor = graph.nodes[edge.from].floor; }
  }

  while (ticsSinceProgress < maxTics && combatTics < maxCombatTics) {
    const state = await page.evaluate(() => window.DoomControl.getState());
    if (!state?.ready || !state.player) throw new Error('Navigation runtime lost player state');
    let wantUse = edge.action === 'use' || Boolean(options.useNearPortal);
    let liftLevel = null;   // null: not a lift edge; true: platform at the target floor
    let liftMoving = false;
    if (liftSector != null) {
      const floor = await liveSectorFloor(page, liftSector);
      liftLevel = floor != null && Math.abs(floor - liftTargetFloor) <= 4;
      liftMoving = liftLastFloor != null && floor !== liftLastFloor;
      liftLastFloor = floor;
    }
    let doorOpening = null;
    if (doorSector != null) {
      doorOpening = await liveSectorOpening(page, doorSector);
      const decided = decideDoorUse(doorOpening, previousOpening);
      if (decided != null) wantUse = decided;
      previousOpening = doorOpening;
    }
    // A thin sector (door frame, step lip) can be crossed without the player
    // centre ever registering inside it; callers may list any later route
    // sector as an acceptable landing so the follower does not chase it.
    const reached = Number(state.currentSector);
    if (reached === Number(edge.to) || (options.acceptSectors && options.acceptSectors.has(reached))) {
      return { passed: true, edge, usedTics, routeTics, combatTics, trace, finalState: state, reachedSector: reached };
    }
    if (Number(state.player.health || 0) <= 0) return { passed: false, edge, usedTics, trace, failure: 'player_dead', finalState: state };

    const position = { x: Number(state.player.x), y: Number(state.player.y) };
    const portalDistance = distance(position, edge.midpoint);
    // Local routing: go around walls inside a non-convex sector. Planned on
    // the first step and again whenever the follower stalls.
    const ignoreLines = edge.line != null ? [edge.line] : [];
    if (waypoints == null || stalled >= 7) {
      waypoints = planLocalPath(graph, Number(state.currentSector), position, edge.midpoint, { ignoreLines });
    }
    while (waypoints.length && distance(position, waypoints[0]) < 24) waypoints.shift();
    // A fight (or a policy strafe) moves the player off the planned line; the
    // straight walk to the next waypoint can then cross a pit that the plan
    // went around. Re-check it every step and replan when it is not clear
    // (E1M3 sector 47: eight of ten runs ended in the nukage this way).
    const nextPoint = waypoints.length ? waypoints[0] : edge.midpoint;
    if (graph?.geometry && !lineOfWalk(graph.geometry, position, nextPoint, solidLines(graph.geometry).filter(line => !ignoreLines.includes(line.index)))) {
      waypoints = planLocalPath(graph, Number(state.currentSector), position, edge.midpoint, { ignoreLines });
      while (waypoints.length && distance(position, waypoints[0]) < 24) waypoints.shift();
    }
    const target = waypoints.length ? waypoints[0] : (portalDistance < 44 ? cross : edge.midpoint);
    const targetDistance = distance(position, target);
    const desired = headingDegrees(position, target);
    const delta = angleDelta(Number(state.player.angle), desired);
    let command;

    if (targetDistance >= lastDistance - 0.75) stalled++;
    else stalled = Math.max(0, stalled - 1);
    lastDistance = targetDistance;

    // Clearing a blocker takes a run of steps, not one in seven. A single
    // recovery step turned 0.15 onto the monster and the next route step
    // turned straight back toward the waypoint, so the aim never finished and
    // the trigger never came. Once a blocker is found, stay on it until it is
    // gone or the budget runs out.
    const blocker = clearing > 0 ? blockingEnemy(state) : null;
    if (blocker) clearing--; else clearing = 0;

    if (blocker) {
      command = blockerCommand(blocker, { use: wantUse });
    } else if (stalled >= 7) {
      command = safeRecovery(graph, state, recoverySide, { use: wantUse }, recoveries++);
      if (command.recovery === 'blocker') clearing = BLOCKER_STEPS;
      recoverySide *= -1;
      stalled = 0;
    } else if (Math.abs(delta) > 10) {
      // Agent +turn means intuitive right; positive geometric delta is CCW/left.
      const magnitude = Math.min(0.7, Math.max(0.16, Math.abs(delta) / 90 * 0.55));
      command = { turn: delta > 0 ? -magnitude : magnitude, use: false, tics: Math.abs(delta) > 50 ? 3 : 2 };
    } else {
      const nearPortal = portalDistance < 56;
      command = {
        forward: nearPortal ? 0.72 : 0.62,
        turn: delta > 3 ? -0.08 : delta < -3 ? 0.08 : 0,
        // useNearPortal covers a door that starts immediately behind this
        // portal: the closed door blocks the player radius before the centre
        // can enter the thin door-frame sector, so USE must be pressed here.
        use: wantUse && nearPortal,
        tics: nearPortal ? 3 : 4
      };
    }

    // Lift rules (see liftSector above).
    let transitPriority = false;
    const onPlatform = Number(state.currentSector) === liftSector;
    if (liftSector != null && liftRecross) {
      // Re-fire a walk-over lift: back off the platform, then the normal
      // approach walks back across its trigger line.
      if (onPlatform) {
        command = { forward: -0.6, strafe: 0, turn: 0, attack: false, use: false, tics: 4, source: 'geometric', lift: 'recross' };
        transitPriority = true;
      } else {
        liftRecross = false;
        liftStillTics = 0;
      }
    } else if (liftLevel === false && onPlatform) {
      // On the platform while it is away from the target floor: call it and
      // hold, facing the portal so USE reaches the line; if it does not move
      // for 28 tics the trigger is a walk-over line, so step off and back on.
      liftStillTics = liftMoving ? 0 : liftStillTics + 4;
      if (liftStillTics >= 28) { liftRecross = true; liftStillTics = 0; }
      const aim = Math.abs(delta) > 10 ? (delta > 0 ? -0.3 : 0.3) : 0;
      command = { forward: 0, strafe: 0, turn: aim, attack: false, use: edge.action === 'use', tics: 4, source: 'geometric', lift: 'wait' };
      // The policy may fight from the platform (a stationary override keeps
      // the USE), but it may not walk the player off it.
      transitPriority = 'stationary';
      liftLeaveSteps = 0;
    } else if (liftLevel === true && onPlatform) {
      // Level: leave now, before it cycles. The walk-off outranks the policy
      // for a few steps; if the player is still on the platform after that
      // something blocks the way (a monster in the portal) and the policy,
      // whose stall rule fights, gets the step back.
      liftLeaveSteps++;
      transitPriority = liftLeaveSteps <= 6;
      command = { ...command, lift: 'leave' };
    } else {
      liftLeaveSteps = 0;
    }

    // Optional external policy (for example a System One tactical layer) may
    // replace the geometric command for this step. It receives the raw engine
    // state and the deterministic proposal, and must return a full command or
    // a falsy value to keep the proposal.
    if (typeof options.decide === 'function' && transitPriority !== true) {
      const override = await options.decide({ state, edge, proposal: command, portalDistance, targetDistance, delta, usedTics });
      if (override) {
        const stationary = Number(override.forward || 0) === 0 && Number(override.strafe || 0) === 0;
        if (transitPriority !== 'stationary') command = override;
        else if (stationary) command = { ...override, use: command.use, lift: 'wait' };
      }
    }

    // USE is edge-triggered in the engine (P_PlayerThink's usedown latch):
    // held across steps it registers once, so a first press out of reach
    // would never be repeated. Never send it on two consecutive steps.
    if (command.use && lastUse) command = { ...command, use: false };
    lastUse = Boolean(command.use);
    const result = await exactInput(page, command);
    usedTics += result.tics;
    if (result.interrupted) {
      return { passed: false, edge, usedTics, routeTics, combatTics, trace, failure: interruptedFailure(result), finalState: result.state };
    }
    if (isCombatCommand(command)) combatTics += result.tics; else routeTics += result.tics;
    // Only route steps count against the no-progress budget; a standing
    // fight is budgeted by combatTics.
    const remaining = remainingPathDistance(position, waypoints, edge.midpoint);
    if (remaining < bestPortalDistance - 4) { bestPortalDistance = remaining; ticsSinceProgress = 0; }
    else if (!isCombatCommand(command)) ticsSinceProgress += result.tics;
    if (typeof options.onStep === 'function') {
      await options.onStep({ edge, state, command, result, usedTics, routeTics, combatTics, ticsSinceProgress, portalDistance, targetDistance, delta, doorOpening });
    }
    if (trace.length < 80) trace.push({
      tics: usedTics,
      sector: result.state.currentSector,
      x: result.state.player?.x,
      y: result.state.player?.y,
      angle: result.state.player?.angle,
      portalDistance,
      targetDistance,
      delta,
      doorOpening,
      command
    });
  }
  const finalState = await page.evaluate(() => window.DoomControl.getState());
  const finalSector = Number(finalState?.currentSector);
  const finalPassed = finalSector === Number(edge.to) || Boolean(options.acceptSectors && options.acceptSectors.has(finalSector));
  const failure = finalPassed ? undefined : (combatTics >= maxCombatTics ? 'edge_combat_budget_exhausted' : 'edge_no_progress');
  return { passed: finalPassed, edge, usedTics, routeTics, combatTics, ticsSinceProgress, trace, failure, finalState, reachedSector: finalSector };
}

// A policy command that holds position or backs off (fight, retreat) rather
// than moving along the route. Geometric commands never count as combat.
export function isCombatCommand(command) {
  if (!command || !command.source || command.source === 'geometric') return false;
  return Number(command.forward || 0) <= 0;
}


export function interruptedFailure(result) { return Number(result?.telemetry?.deaths || 0) > 0 ? "player_dead" : "input_interrupted"; }
