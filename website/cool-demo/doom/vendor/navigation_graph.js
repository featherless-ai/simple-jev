export const NAVIGATION_VERSION = '2.4.0-p1.3';

const NO_SIDE = 0xffff;
const ML_BLOCKING = 0x0001;
const PLAYER_HEIGHT = 56;
const MAX_STEP_UP = 24;
const MIN_PORTAL_WIDTH = 32;

const DOOR_SPECIALS = Object.freeze({
  1: { action: 'use', behavior: 'raise', key: null },
  26: { action: 'use', behavior: 'raise', key: 'blue' },
  27: { action: 'use', behavior: 'raise', key: 'yellow' },
  28: { action: 'use', behavior: 'raise', key: 'red' },
  31: { action: 'use', behavior: 'open', key: null },
  32: { action: 'use', behavior: 'open', key: 'blue' },
  33: { action: 'use', behavior: 'open', key: 'red' },
  34: { action: 'use', behavior: 'open', key: 'yellow' }
});
const LIFT_SPECIALS = new Set([62, 88]);
// Tagged (remote) door triggers: the line opens every sector carrying its
// tag. 'use' lines are switches, 'walk' lines fire when crossed; `stays`
// doors stay open, the others close again after ~4 s.
const REMOTE_DOOR_SPECIALS = Object.freeze({
  2: { trigger: 'walk', stays: true }, 86: { trigger: 'walk', stays: true },
  103: { trigger: 'use', stays: true }, 61: { trigger: 'use', stays: true },
  4: { trigger: 'walk', stays: false }, 90: { trigger: 'walk', stays: false },
  29: { trigger: 'use', stays: false }, 63: { trigger: 'use', stays: false },
  108: { trigger: 'walk', stays: false }, 109: { trigger: 'walk', stays: true }, 110: { trigger: 'walk', stays: false },
  111: { trigger: 'use', stays: false }, 112: { trigger: 'use', stays: true }, 113: { trigger: 'use', stays: false }, 114: { trigger: 'use', stays: true }
});
// Tagged floor movers: the line changes the floor height of every sector
// carrying its tag (stairs also climb through neighbouring sectors). Their
// effect on the graph is computed from the vanilla rules (P_FindNextHighest-
// Floor, P_FindLowestFloorSurrounding, EV_BuildStairs) so an edge that is
// too high a step now can be planned as passable once the trigger fired.
// Gun-activated (G1) variants are left out: the runner cannot shoot lines.
const FLOOR_SPECIALS = Object.freeze({
  7: { trigger: 'use', effect: 'stairs', step: 8 }, 8: { trigger: 'walk', effect: 'stairs', step: 8 },
  100: { trigger: 'walk', effect: 'stairs', step: 16 }, 127: { trigger: 'use', effect: 'stairs', step: 16 },
  18: { trigger: 'use', effect: 'raiseNext' }, 20: { trigger: 'use', effect: 'raiseNext' },
  22: { trigger: 'walk', effect: 'raiseNext' }, 69: { trigger: 'use', effect: 'raiseNext' }, 95: { trigger: 'walk', effect: 'raiseNext' },
  23: { trigger: 'use', effect: 'lowerLowest' }, 38: { trigger: 'walk', effect: 'lowerLowest' },
  60: { trigger: 'use', effect: 'lowerLowest' }, 82: { trigger: 'walk', effect: 'lowerLowest' },
  19: { trigger: 'walk', effect: 'lowerHighest' }, 45: { trigger: 'use', effect: 'lowerHighest' },
  83: { trigger: 'walk', effect: 'lowerHighest' }, 102: { trigger: 'use', effect: 'lowerHighest' },
  36: { trigger: 'walk', effect: 'lowerHighest', above: 8 }, 70: { trigger: 'use', effect: 'lowerHighest', above: 8 },
  71: { trigger: 'use', effect: 'lowerHighest', above: 8 }, 98: { trigger: 'walk', effect: 'lowerHighest', above: 8 }
});
const EXIT_SPECIALS = Object.freeze({
  11: { trigger: 'use', secret: false },
  51: { trigger: 'use', secret: true },
  52: { trigger: 'walk', secret: false },
  124: { trigger: 'walk', secret: true }
});
const KEY_TYPES = Object.freeze({ 5: 'blue', 6: 'yellow', 13: 'red' });
const START_TYPES = new Set([1, 2, 3, 4, 11]);

function sideSector(g, sideIndex) {
  if (sideIndex === NO_SIDE) return null;
  return g.sidedefs[sideIndex]?.sector ?? null;
}
function unique(values) { return [...new Set(values)]; }
function dist(a, b) { return Math.hypot(Number(b.x) - Number(a.x), Number(b.y) - Number(a.y)); }
function lineMidpoint(g, line) {
  const a = g.vertices[line.v1], b = g.vertices[line.v2];
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
function lineWidth(g, line) {
  const a = g.vertices[line.v1], b = g.vertices[line.v2];
  return Math.hypot(b.x - a.x, b.y - a.y);
}
function sectorBoundarySegments(g, sector) {
  const out = [];
  for (let lineIndex = 0; lineIndex < g.linedefs.length; lineIndex++) {
    const line = g.linedefs[lineIndex];
    const right = sideSector(g, line.right);
    const left = sideSector(g, line.left);
    if (right === sector && left === sector) continue;
    if (right === sector || left === sector) {
      const a = g.vertices[line.v1], b = g.vertices[line.v2];
      if (a && b) out.push({ line: lineIndex, a, b });
    }
  }
  return out;
}
function pointOnSegment(point, a, b, epsilon = 0.0001) {
  const cross = (point.x - a.x) * (b.y - a.y) - (point.y - a.y) * (b.x - a.x);
  if (Math.abs(cross) > epsilon) return false;
  const dot = (point.x - a.x) * (point.x - b.x) + (point.y - a.y) * (point.y - b.y);
  return dot <= epsilon;
}
export function pointInSector(workspace, sector, point) {
  const g = workspace.geometry;
  if (!g.sectors[sector]) return false;
  const segments = sectorBoundarySegments(g, sector);
  if (!segments.length) return false;
  for (const { a, b } of segments) if (pointOnSegment(point, a, b)) return true;
  let inside = false;
  for (const { a, b } of segments) {
    const crosses = (a.y > point.y) !== (b.y > point.y);
    if (!crosses) continue;
    const xAtY = a.x + ((point.y - a.y) * (b.x - a.x)) / (b.y - a.y);
    if (xAtY > point.x) inside = !inside;
  }
  return inside;
}
export function locatePointSector(workspace, point) {
  const g = workspace.geometry;
  for (let sector = 0; sector < g.sectors.length; sector++) {
    if (pointInSector(workspace, sector, point)) return sector;
  }
  return null;
}
function sectorCenter(g, sector) {
  const vertices = [];
  const seen = new Set();
  for (const { a, b, line } of sectorBoundarySegments(g, sector)) {
    const linedef = g.linedefs[line];
    for (const [id, point] of [[linedef.v1, a], [linedef.v2, b]]) {
      if (!seen.has(id)) { seen.add(id); vertices.push(point); }
    }
  }
  if (!vertices.length) return { x: 0, y: 0 };
  return {
    x: vertices.reduce((sum, p) => sum + p.x, 0) / vertices.length,
    y: vertices.reduce((sum, p) => sum + p.y, 0) / vertices.length
  };
}
function doorSpec(line) { return DOOR_SPECIALS[Number(line.special)] || null; }
// Sectors sharing a two-sided line with `sector` (vanilla getNextSector).
function neighbourSectors(g, sector) {
  const out = new Set();
  g.linedefs.forEach(line => {
    const right = sideSector(g, line.right), left = sideSector(g, line.left);
    if (right == null || left == null || right === left) return;
    if (right === sector) out.add(left);
    else if (left === sector) out.add(right);
  });
  return [...out];
}
// Floor heights after a floor trigger fires: Map<sector, floor>.
function floorEffect(g, spec, tag) {
  const floors = new Map();
  const tagged = g.sectors.map((sector, index) => [index, sector]).filter(([, sector]) => Number(sector.tag) === tag);
  for (const [index, sector] of tagged) {
    const floor = Number(sector.floor);
    const around = neighbourSectors(g, index).map(other => Number(g.sectors[other].floor));
    if (spec.effect === 'raiseNext') {
      const higher = around.filter(h => h > floor);
      if (higher.length) floors.set(index, Math.min(...higher));
    } else if (spec.effect === 'lowerLowest') {
      floors.set(index, Math.min(floor, ...around));
    } else if (spec.effect === 'lowerHighest') {
      const highest = around.length ? Math.max(...around) : floor;
      floors.set(index, highest !== floor && spec.above ? highest + spec.above : highest);
    } else if (spec.effect === 'stairs') {
      // EV_BuildStairs: the tagged sector rises one step, then the chain
      // continues through the first two-sided line (linedef order) whose
      // front is the current sector and whose back shares its floor
      // texture; a sector already in the chain still adds a step.
      const texture = sector.floorFlat;
      let current = index;
      let height = floor + spec.step;
      floors.set(current, height);
      let ok = true;
      while (ok) {
        ok = false;
        for (let i = 0; i < g.linedefs.length; i++) {
          const line = g.linedefs[i];
          const right = sideSector(g, line.right), left = sideSector(g, line.left);
          if (right == null || left == null || right !== current || left === current) continue;
          const next = g.sectors[left];
          if (next.floorFlat !== texture) continue;
          height += spec.step;
          if (floors.has(left)) continue;
          floors.set(left, height);
          current = left;
          ok = true;
          break;
        }
      }
    }
  }
  return floors;
}
// Every tagged trigger on the map (doors and floor movers), grouped by tag.
function collectTriggers(g) {
  const byTag = new Map();
  const list = [];
  g.linedefs.forEach((line, lineIndex) => {
    const special = Number(line.special);
    const doorSpecEntry = REMOTE_DOOR_SPECIALS[special];
    const floorSpecEntry = FLOOR_SPECIALS[special];
    const spec = doorSpecEntry || floorSpecEntry;
    const tag = Number(line.tag || 0);
    if (!spec || !tag) return;
    const front = sideSector(g, line.right);
    const back = sideSector(g, line.left);
    if (front == null) return;
    const trigger = {
      line: lineIndex, special, tag, trigger: spec.trigger, stays: doorSpecEntry ? spec.stays : true,
      effect: doorSpecEntry ? 'door' : spec.effect,
      sector: front, back, midpoint: lineMidpoint(g, line)
    };
    if (floorSpecEntry) {
      const floors = floorEffect(g, spec, tag);
      if (!floors.size) return; // nothing moves (no higher neighbour, etc.)
      trigger.floors = Object.fromEntries(floors);
    }
    list.push(trigger);
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag).push(trigger);
  });
  return { list, byTag };
}
// A sector that a tagged trigger opens: closed now (no room for the
// player), tagged, and some trigger on the map carries its tag.
function remoteDoorTag(g, sectorIndex, triggersByTag) {
  const sector = g.sectors[sectorIndex];
  const tag = Number(sector.tag || 0);
  if (!tag || !triggersByTag.has(tag)) return null;
  if (!triggersByTag.get(tag).some(trigger => trigger.effect === 'door')) return null;
  return Number(sector.ceiling) - Number(sector.floor) < PLAYER_HEIGHT ? tag : null;
}
// `floors` (Map<sector, floor>) overrides the static floor heights, for the
// classification of an edge after a floor trigger fired.
function classifyPortal(g, lineIndex, fromSector, toSector, triggersByTag = new Map(), floors = null) {
  const line = g.linedefs[lineIndex];
  const from = g.sectors[fromSector], to = g.sectors[toSector];
  const midpoint = lineMidpoint(g, line);
  const width = lineWidth(g, line);
  const fromFloor = floors?.has(fromSector) ? floors.get(fromSector) : Number(from.floor);
  const toFloor = floors?.has(toSector) ? floors.get(toSector) : Number(to.floor);
  const floorDelta = toFloor - fromFloor;
  const opening = Math.min(Number(from.ceiling), Number(to.ceiling)) - Math.max(fromFloor, toFloor);
  const blocking = Boolean(Number(line.flags) & ML_BLOCKING);
  const door = doorSpec(line);
  const lift = LIFT_SPECIALS.has(Number(line.special));

  let kind = 'blocked';
  let passable = false;
  let action = null;
  let requiredKey = null;
  let requiredTag = null;
  let reason = null;
  const remoteTag = opening < PLAYER_HEIGHT && !blocking && !door && !lift
    ? (remoteDoorTag(g, toSector, triggersByTag) ?? remoteDoorTag(g, fromSector, triggersByTag))
    : null;

  if (blocking) {
    reason = 'linedef_blocking_flag';
  } else if ((remoteTag != null || door) && floorDelta > MAX_STEP_UP) {
    // A door opens its ceiling, never its floor: a door sector whose floor
    // sits more than a step above this side stays impassable from here
    // (E1M3 sector 51 from the nukage pit 66: 64 units up). Lifts are
    // exempt, their floor is what moves.
    reason = `door_step_up_too_high:${floorDelta}`;
  } else if (remoteTag != null && width >= MIN_PORTAL_WIDTH) {
    // Closed now; a tagged trigger elsewhere opens it. Passable once the
    // progression has fired that trigger.
    kind = 'door';
    passable = true;
    action = 'remote';
    requiredTag = remoteTag;
  } else if (door) {
    kind = 'door';
    passable = true;
    action = door.action;
    requiredKey = door.key;
  } else if (lift) {
    kind = 'lift';
    passable = true;
    action = Number(line.special) === 62 ? 'use' : 'walk';
  } else if (width < MIN_PORTAL_WIDTH) {
    reason = `portal_too_narrow:${width.toFixed(1)}`;
  } else if (opening < PLAYER_HEIGHT) {
    reason = `insufficient_vertical_opening:${opening}`;
  } else if (floorDelta > MAX_STEP_UP) {
    reason = `step_up_too_high:${floorDelta}`;
  } else {
    kind = floorDelta < -MAX_STEP_UP ? 'drop' : 'walk';
    passable = true;
  }

  return {
    id: `${fromSector}:${toSector}:${lineIndex}`,
    line: lineIndex,
    from: fromSector,
    to: toSector,
    kind,
    passable,
    action,
    requiredKey,
    requiredTag,
    reason,
    special: Number(line.special || 0),
    tag: Number(line.tag || 0),
    midpoint,
    width,
    opening,
    floorDelta,
    fromFloor,
    toFloor
  };
}
function keyMask(keys = []) {
  let mask = 0;
  const list = Array.isArray(keys) ? keys : [keys];
  for (const key of list) {
    if (key === 'blue') mask |= 1;
    else if (key === 'yellow') mask |= 2;
    else if (key === 'red') mask |= 4;
  }
  return mask;
}
function maskHas(mask, key) {
  if (!key) return true;
  const bit = key === 'blue' ? 1 : key === 'yellow' ? 2 : key === 'red' ? 4 : 0;
  return Boolean(mask & bit);
}
function maskKeys(mask) {
  return ['blue', 'yellow', 'red'].filter(key => maskHas(mask, key));
}
function thingList(workspace) {
  if (typeof workspace.listThings === 'function') return workspace.listThings({ limit: 65535 });
  return Array.isArray(workspace.geometry.things)
    ? workspace.geometry.things.map((thing, index) => ({ index, ...thing }))
    : [];
}

export function buildNavigationGraph(workspace) {
  const g = workspace.geometry;
  // The graph is rebuilt after edits (auto-repair diagnoses, repairs and
  // diagnoses again on the same geometry object): drop the per-geometry
  // caches so local routing sees the current walls, and so the movable
  // sector set below can be defined again.
  for (const key of ['__solidLines', '__solidThings', '__movableSectors', '__sightLines']) if (Object.prototype.hasOwnProperty.call(g, key)) delete g[key];
  const nodes = g.sectors.map((sector, index) => ({
    sector: index,
    center: sectorCenter(g, index),
    floor: Number(sector.floor),
    ceiling: Number(sector.ceiling),
    light: Number(sector.light),
    special: Number(sector.special || 0),
    tag: Number(sector.tag || 0)
  }));
  const triggers = collectTriggers(g);
  const edges = [];
  for (let lineIndex = 0; lineIndex < g.linedefs.length; lineIndex++) {
    const line = g.linedefs[lineIndex];
    const right = sideSector(g, line.right);
    const left = sideSector(g, line.left);
    if (right == null || left == null || right === left) continue;
    edges.push(classifyPortal(g, lineIndex, right, left, triggers.byTag));
    edges.push(classifyPortal(g, lineIndex, left, right, triggers.byTag));
  }
  // Edges that a floor trigger makes passable (E1M3: the stairs to the exit
  // corridor, a nukage floor raised to the door sill). One variant per tag,
  // usable once the progression has fired that tag; the static edge stays
  // as the record of why it is blocked now.
  const movableSectors = new Set();
  const baseById = new Map(edges.map(edge => [edge.id, edge]));
  for (const trigger of triggers.list) {
    if (!trigger.floors) continue;
    const floors = new Map(Object.entries(trigger.floors).map(([sector, floor]) => [Number(sector), Number(floor)]));
    for (const sector of floors.keys()) movableSectors.add(sector);
    for (let lineIndex = 0; lineIndex < g.linedefs.length; lineIndex++) {
      const line = g.linedefs[lineIndex];
      const right = sideSector(g, line.right);
      const left = sideSector(g, line.left);
      if (right == null || left == null || right === left) continue;
      if (!floors.has(right) && !floors.has(left)) continue;
      for (const [from, to] of [[right, left], [left, right]]) {
        const base = baseById.get(`${from}:${to}:${lineIndex}`);
        if (!base || (base.passable && base.requiredTag == null)) continue;
        const after = classifyPortal(g, lineIndex, from, to, triggers.byTag, floors);
        if (!after.passable) continue;
        const id = `${after.id}@${trigger.tag}`;
        if (baseById.has(id)) continue;
        const variant = { ...after, id, requiredTag: trigger.tag, afterTag: trigger.tag, reason: null };
        baseById.set(id, variant);
        edges.push(variant);
      }
    }
  }
  Object.defineProperty(g, '__movableSectors', { value: movableSectors, enumerable: false, configurable: true });

  const things = thingList(workspace).map(thing => ({
    ...thing,
    sector: locatePointSector(workspace, { x: Number(thing.x), y: Number(thing.y) })
  }));
  const keys = things.filter(thing => KEY_TYPES[Number(thing.doomEdNum)]).map(thing => ({
    thing: thing.index,
    key: KEY_TYPES[Number(thing.doomEdNum)],
    sector: thing.sector,
    x: Number(thing.x), y: Number(thing.y)
  })).filter(item => item.sector != null);
  const starts = things.filter(thing => START_TYPES.has(Number(thing.doomEdNum))).map(thing => ({
    thing: thing.index,
    doomEdNum: Number(thing.doomEdNum),
    sector: thing.sector,
    x: Number(thing.x), y: Number(thing.y), angle: Number(thing.angle || 0)
  })).filter(item => item.sector != null);

  const exits = [];
  g.linedefs.forEach((line, lineIndex) => {
    const spec = EXIT_SPECIALS[Number(line.special)];
    if (!spec) return;
    const sectors = unique([sideSector(g, line.right), sideSector(g, line.left)].filter(value => value != null));
    exits.push({ line: lineIndex, special: Number(line.special), ...spec, sectors, midpoint: lineMidpoint(g, line) });
  });

  const outgoing = Object.fromEntries(nodes.map(node => [node.sector, []]));
  for (const edge of edges) outgoing[edge.from].push(edge.id);
  const passableEdges = edges.filter(edge => edge.passable).length;
  const graph = {
    version: NAVIGATION_VERSION,
    map: workspace.mapName,
    constraints: { playerHeight: PLAYER_HEIGHT, maxStepUp: MAX_STEP_UP, minPortalWidth: MIN_PORTAL_WIDTH },
    nodes,
    edges,
    outgoing,
    things: { starts, keys },
    exits,
    triggers: triggers.list,
    summary: {
      sectors: nodes.length,
      directedEdges: edges.length,
      passableEdges,
      blockedEdges: edges.length - passableEdges,
      remoteDoorEdges: edges.filter(edge => edge.requiredTag != null && edge.afterTag == null).length,
      floorTriggerEdges: edges.filter(edge => edge.afterTag != null).length,
      triggers: triggers.list.length,
      starts: starts.length,
      keys: keys.length,
      exits: exits.length
    }
  };
  // Raw geometry for local routing; not enumerable so JSON reports stay small.
  Object.defineProperty(graph, 'geometry', { value: g, enumerable: false });
  return graph;
}

// ---- Local (within-sector) routing -------------------------------------
// Sector-level edges assume the player can walk straight from where it is
// to the next portal. In a non-convex sector that line can cross a wall
// (E1M2's start room). planLocalPath returns intermediate waypoints found
// on a visibility graph over the sector's wall corners, pushed inward by
// the player radius, so the follower goes around instead of into the wall.
const LOCAL_CLEARANCE = 36;
function segmentsCross(p, q, a, b) {
  const d = (q.x - p.x) * (b.y - a.y) - (q.y - p.y) * (b.x - a.x);
  if (Math.abs(d) < 1e-9) return false;
  const t = ((a.x - p.x) * (b.y - a.y) - (a.y - p.y) * (b.x - a.x)) / d;
  const u = ((a.x - p.x) * (q.y - p.y) - (a.y - p.y) * (q.x - p.x)) / d;
  return t > 0.001 && t < 0.999 && u > 0.001 && u < 0.999;
}
// Sector specials that hurt a player standing in them (nukage, blood, the
// exit-on-death one).
const DAMAGING_SPECIALS = new Set([4, 5, 7, 11, 16]);
export function isDamagingSector(g, sector) {
  return sector != null && DAMAGING_SPECIALS.has(Number(g.sectors[sector]?.special));
}
// Lines the player cannot (or must not) walk through: one-sided,
// blocking-flagged, two-sided with no room / too high a step, and the shore
// of a damaging sector (a line with hazard on exactly one side: crossing it
// in one direction walks into nukage). The edge being walked is excluded
// by planLocalPath's `ignoreLines`, so a route that has to enter a nukage
// sector still can.
export function solidLines(g) {
  if (g.__solidLines) return g.__solidLines;
  const out = [];
  g.linedefs.forEach((line, index) => {
    const right = sideSector(g, line.right);
    const left = sideSector(g, line.left);
    let solid = right == null || left == null || Boolean(Number(line.flags) & ML_BLOCKING);
    let hazard = null;
    if (!solid && right !== left) {
      const a = g.sectors[right], b = g.sectors[left];
      const opening = Math.min(Number(a.ceiling), Number(b.ceiling)) - Math.max(Number(a.floor), Number(b.floor));
      // doors and lifts open; treat them as passable here
      // Floor movers are NOT exempt: a sunken pit that a switch raises later
      // (E1M3 sector 48) is a pit now. The edge being walked is excluded by
      // planLocalPath's `ignoreLines` instead.
      const opens = DOOR_SPECIALS[Number(line.special)] || LIFT_SPECIALS.has(Number(line.special)) || REMOTE_DOOR_SPECIALS[Number(line.special)] || (a.tag && Number(a.ceiling) === Number(a.floor)) || (b.tag && Number(b.ceiling) === Number(b.floor));
      const drop = Math.abs(Number(a.floor) - Number(b.floor)) > MAX_STEP_UP;
      if (!opens && (opening < PLAYER_HEIGHT || drop)) { solid = true; hazard = drop ? 'drop' : 'wall'; }
      else if (isDamagingSector(g, right) !== isDamagingSector(g, left)) { solid = true; hazard = 'damage'; }
    }
    if (solid) out.push({ index, a: g.vertices[line.v1], b: g.vertices[line.v2], right, left, hazard: hazard || 'wall' });
  });
  Object.defineProperty(g, '__solidLines', { value: out, enumerable: false, configurable: true });
  return out;
}
// The first solid line a straight move from `from` to `to` would cross, or
// null when the move is clear. Used by the policy's terrain guard before a
// combat step (retreat, strafe, loot detour) is sent to the engine: a
// backpedal into a nukage pit is a fatal step no judgment should take.
export function movementHazard(g, from, to, { ignoreLines = [] } = {}) {
  const ignored = new Set(ignoreLines.map(Number));
  for (const line of solidLines(g)) {
    if (ignored.has(line.index)) continue;
    if (segmentsCross(from, to, line.a, line.b) || pointSegmentDistance(to, line.a, line.b) < PLAYER_RADIUS) {
      return { kind: line.hazard, line: line.index };
    }
  }
  return null;
}
function pointSegmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
function segmentSegmentDistance(p, q, a, b) {
  if (segmentsCross(p, q, a, b)) return 0;
  return Math.min(pointSegmentDistance(p, a, b), pointSegmentDistance(q, a, b), pointSegmentDistance(a, p, q), pointSegmentDistance(b, p, q));
}
// Solid decorations the player collides with (radius from the vanilla mobj table).
const SOLID_THING_RADIUS = Object.freeze({ 2035: 10, 2028: 16, 30: 16, 31: 16, 32: 16, 33: 16, 34: 16, 35: 16, 36: 16, 37: 16, 41: 16, 42: 16, 43: 16, 44: 16, 45: 16, 46: 16, 47: 16, 48: 16, 54: 32, 55: 16, 56: 16, 57: 16 });
export function solidThings(g) {
  if (g.__solidThings) return g.__solidThings;
  const out = [];
  for (const thing of g.things || []) {
    const type = Number(thing.doomEdNum ?? thing.type);
    const radius = SOLID_THING_RADIUS[type];
    if (radius) out.push({ x: Number(thing.x), y: Number(thing.y), radius });
  }
  Object.defineProperty(g, '__solidThings', { value: out, enumerable: false, configurable: true });
  return out;
}
const PLAYER_RADIUS = 16;
// Can a player (radius 16) walk from `from` to `to` without touching a wall
// or a solid thing? A capsule test, not just a crossing test: a path that
// grazes a corner or runs along a wall line is not walkable either.
export function lineOfWalk(g, from, to, lines = solidLines(g), clearance = PLAYER_RADIUS + 2) {
  for (const line of lines) {
    // Already pressed against this wall (the engine let the player get
    // that close): a move that crosses nothing and ends no closer than it
    // started is a move away from it, not into it. Without this, a player
    // touching a wall or a barrel had no walkable line at all and the
    // planner gave up (E1M3 sector 24: pillar in front, barrel behind).
    const startDistance = pointSegmentDistance(from, line.a, line.b);
    if (startDistance < clearance) {
      if (segmentsCross(from, to, line.a, line.b) || pointSegmentDistance(to, line.a, line.b) < startDistance - 0.5) return false;
      continue;
    }
    if (segmentSegmentDistance(from, to, line.a, line.b) < clearance) return false;
  }
  for (const thing of solidThings(g)) {
    const reach = thing.radius + PLAYER_RADIUS + 1;
    const startDistance = dist(from, thing);
    if (startDistance < reach) {
      if (dist(to, thing) < startDistance - 0.5) return false;
      continue;
    }
    if (pointSegmentDistance(thing, from, to) < reach) return false;
  }
  return true;
}
// `ignoreLines`: line indices that are not obstacles for this plan, normally
// the portal line the follower is heading for (a line whose static heights
// say "solid" but which a fired floor trigger has since made passable).
// Candidate standing points of a sector: the vertices of its solid lines
// pushed inward by LOCAL_CLEARANCE in eight directions, kept when inside the
// sector and clear of walls and solid things. Waypoints for planLocalPath,
// cover spots for the policy.
export function localCandidates(g, sector, lines = solidLines(g)) {
  const candidates = [];
  const seen = new Set();
  for (const line of lines) {
    if (line.right !== sector && line.left !== sector) continue;
    for (const v of [line.a, line.b]) {
      for (const [dx, dy] of [[LOCAL_CLEARANCE, 0], [-LOCAL_CLEARANCE, 0], [0, LOCAL_CLEARANCE], [0, -LOCAL_CLEARANCE], [LOCAL_CLEARANCE, LOCAL_CLEARANCE], [-LOCAL_CLEARANCE, LOCAL_CLEARANCE], [LOCAL_CLEARANCE, -LOCAL_CLEARANCE], [-LOCAL_CLEARANCE, -LOCAL_CLEARANCE]]) {
        const p = { x: Number(v.x) + dx, y: Number(v.y) + dy };
        const key = `${Math.round(p.x)},${Math.round(p.y)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!locatePointSectorFast(g, sector, p)) continue;
        // Not on or within player reach of any wall / solid thing.
        if (lines.some(line => pointSegmentDistance(p, line.a, line.b) < PLAYER_RADIUS + 2)) continue;
        if (solidThings(g).some(thing => Math.hypot(thing.x - p.x, thing.y - p.y) < thing.radius + PLAYER_RADIUS + 1)) continue;
        candidates.push(p);
      }
    }
  }
  return candidates;
}
// Lines that block sight for good: one-sided walls. (Two-sided lines with a
// closed door between them open later, so they are not counted; a cover spot
// is behind a real wall.)
export function sightBlockingLines(g) {
  if (g.__sightLines) return g.__sightLines;
  const out = [];
  g.linedefs.forEach((line, index) => {
    const right = sideSector(g, line.right), left = sideSector(g, line.left);
    if (right == null || left == null) out.push({ index, a: g.vertices[line.v1], b: g.vertices[line.v2] });
  });
  Object.defineProperty(g, '__sightLines', { value: out, enumerable: false, configurable: true });
  return out;
}
export function hasLineOfSight2D(g, from, to) {
  for (const line of sightBlockingLines(g)) if (segmentsCross(from, to, line.a, line.b)) return false;
  return true;
}
// The nearest standing point in `sector`, walkable from `from`, from which
// none of `threats` (world positions) has a line of sight, within
// `maxDistance`; null when there is none. Hitscan enemies hit at any range,
// so the only defence against two of them in an open room is a wall.
export function coverPoint(g, sector, from, threats, { maxDistance = 256 } = {}) {
  const lines = solidLines(g);
  const candidates = localCandidates(g, sector, lines);
  // Walking distance, not straight-line: the spot behind the pillar is
  // reached around the pillar. One Dijkstra from `from` over the sector's
  // candidate points gives every candidate's path at once.
  const nodes = [from, ...candidates];
  const n = nodes.length;
  const best = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const done = new Array(n).fill(false);
  best[0] = 0;
  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || best[i] < best[u])) u = i;
    if (u < 0 || best[u] === Infinity || best[u] > maxDistance) break;
    done[u] = true;
    for (let v = 1; v < n; v++) {
      if (done[v]) continue;
      const cost = best[u] + dist(nodes[u], nodes[v]);
      if (cost >= best[v] || cost > maxDistance) continue;
      if (!lineOfWalk(g, nodes[u], nodes[v], lines)) continue;
      best[v] = cost; prev[v] = u;
    }
  }
  let pick = -1;
  for (let i = 1; i < n; i++) {
    if (best[i] === Infinity || best[i] > maxDistance || (pick >= 0 && best[i] >= best[pick])) continue;
    if (threats.some(t => hasLineOfSight2D(g, nodes[i], t))) continue;
    pick = i;
  }
  if (pick < 0) return null;
  const path = [];
  for (let cursor = pick; cursor > 0; cursor = prev[cursor]) path.push(nodes[cursor]);
  path.reverse();
  return { x: nodes[pick].x, y: nodes[pick].y, distance: best[pick], waypoints: path };
}
export function planLocalPath(graph, sector, from, to, { ignoreLines = [] } = {}) {
  const g = graph.geometry;
  if (!g) return [];
  const ignored = new Set(ignoreLines.map(Number));
  const lines = ignored.size ? solidLines(g).filter(line => !ignored.has(line.index)) : solidLines(g);
  if (lineOfWalk(g, from, to, lines)) return [];
  const candidates = localCandidates(g, sector, lines);
  // Dijkstra over the visibility graph {from, candidates, to}.
  const nodes = [from, ...candidates, to];
  const n = nodes.length;
  const best = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const done = new Array(n).fill(false);
  best[0] = 0;
  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || best[i] < best[u])) u = i;
    if (u < 0 || best[u] === Infinity) break;
    done[u] = true;
    if (u === n - 1) break;
    for (let v = 1; v < n; v++) {
      if (done[v]) continue;
      if (!lineOfWalk(g, nodes[u], nodes[v], lines)) continue;
      const cost = best[u] + dist(nodes[u], nodes[v]);
      if (cost < best[v]) { best[v] = cost; prev[v] = u; }
    }
  }
  if (best[n - 1] === Infinity) return [];
  const path = [];
  for (let cursor = prev[n - 1]; cursor > 0; cursor = prev[cursor]) path.push(nodes[cursor]);
  return path.reverse();
}
function locatePointSectorFast(g, sector, point) {
  return pointInSector({ geometry: g }, sector, point);
}

// `tags` is the set of trigger tags already fired (or 'all' to assume every
// trigger can be fired, for reachability estimates).
function usableEdge(edge, mask, { allowDrops = true, tags = 'all' } = {}) {
  if (!edge.passable) return false;
  if (edge.kind === 'drop' && !allowDrops) return false;
  if (!maskHas(mask, edge.requiredKey)) return false;
  if (edge.requiredTag != null && tags !== 'all' && !tags.has(edge.requiredTag)) return false;
  return true;
}
// The pseudo-edge a progression records for firing a trigger: the runner
// walks to the line and uses (or crosses) it. A walk trigger leaves the
// player in the line's back sector; a switch keeps it where it stands.
function triggerEdge(graph, trigger) {
  const to = trigger.trigger === 'walk' && trigger.back != null ? trigger.back : trigger.sector;
  return {
    id: `trigger:${trigger.line}`,
    line: trigger.line,
    from: trigger.sector,
    to,
    kind: 'trigger',
    action: trigger.trigger,
    stays: trigger.stays,
    tag: trigger.tag,
    special: trigger.special,
    passable: true,
    requiredKey: null,
    requiredTag: null,
    midpoint: trigger.midpoint,
    effect: trigger.effect || 'door',
    doorSectors: trigger.effect && trigger.effect !== 'door' ? [] : graph.nodes.filter(node => node.tag === trigger.tag).map(node => node.sector),
    ...(trigger.floors ? { floors: trigger.floors } : {})
  };
}
function edgeCost(graph, edge) {
  const a = graph.nodes[edge.from]?.center || edge.midpoint;
  const b = graph.nodes[edge.to]?.center || edge.midpoint;
  const base = Math.max(1, dist(a, edge.midpoint) + dist(edge.midpoint, b));
  return base + (edge.kind === 'door' ? 24 : edge.kind === 'lift' ? 48 : edge.kind === 'drop' ? 8 : 0);
}

export function findSectorPath(graph, fromSector, toSector, options = {}) {
  const start = Math.trunc(Number(fromSector)), target = Math.trunc(Number(toSector));
  if (!graph.nodes[start] || !graph.nodes[target]) throw new Error('Navigation path endpoints must be valid sector indices');
  const mask = keyMask(options.keys || []);
  const distMap = new Map([[start, 0]]);
  const prev = new Map();
  const open = new Set([start]);

  while (open.size) {
    let current = null, best = Infinity;
    for (const sector of open) {
      const score = distMap.get(sector) ?? Infinity;
      if (score < best) { best = score; current = sector; }
    }
    open.delete(current);
    if (current === target) break;
    for (const edge of graph.edges) {
      if (edge.from !== current || !usableEdge(edge, mask, options)) continue;
      const nextScore = best + edgeCost(graph, edge);
      if (nextScore < (distMap.get(edge.to) ?? Infinity)) {
        distMap.set(edge.to, nextScore);
        prev.set(edge.to, edge);
        open.add(edge.to);
      }
    }
  }
  if (!distMap.has(target)) return { found: false, fromSector: start, toSector: target, keys: maskKeys(mask), reason: 'unreachable' };

  const edges = [];
  let cursor = target;
  while (cursor !== start) {
    const edge = prev.get(cursor);
    if (!edge) throw new Error('Navigation path reconstruction failed');
    edges.push(edge);
    cursor = edge.from;
  }
  edges.reverse();
  return {
    found: true,
    fromSector: start,
    toSector: target,
    keys: maskKeys(mask),
    cost: distMap.get(target),
    sectors: [start, ...edges.map(edge => edge.to)],
    edges
  };
}

export function reachableSectors(graph, startSector, options = {}) {
  const start = Math.trunc(Number(startSector));
  if (!graph.nodes[start]) throw new Error(`Unknown start sector ${startSector}`);
  const mask = keyMask(options.keys || []);
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    for (const edge of graph.edges) {
      if (edge.from !== current || !usableEdge(edge, mask, options) || seen.has(edge.to)) continue;
      seen.add(edge.to); queue.push(edge.to);
    }
  }
  return [...seen].sort((a, b) => a - b);
}

export function findExitProgression(graph, startSector, options = {}) {
  const start = Math.trunc(Number(startSector));
  if (!graph.nodes[start]) throw new Error(`Unknown start sector ${startSector}`);
  const keysBySector = new Map();
  for (const item of graph.things.keys || []) {
    if (!keysBySector.has(item.sector)) keysBySector.set(item.sector, []);
    keysBySector.get(item.sector).push(item.key);
  }
  const exitBySector = new Map();
  for (const exit of graph.exits || []) for (const sector of exit.sectors) {
    if (!exitBySector.has(sector)) exitBySector.set(sector, []);
    exitBySector.get(sector).push(exit);
  }

  const triggersBySector = new Map();
  for (const trigger of graph.triggers || []) {
    if (!triggersBySector.has(trigger.sector)) triggersBySector.set(trigger.sector, []);
    triggersBySector.get(trigger.sector).push(trigger);
  }
  const tagsId = tags => [...tags].sort((a, b) => a - b).join(',');

  const initialMask = keyMask(options.keys || []) | keyMask(keysBySector.get(start) || []);
  const initialTags = new Set(options.tags || []);
  const startId = `${start}:${initialMask}:${tagsId(initialTags)}`;
  const queue = [{ sector: start, mask: initialMask, tags: initialTags, id: startId }];
  const seen = new Set([startId]);
  const prev = new Map();
  let goal = null;

  while (queue.length) {
    const state = queue.shift();
    const exits = exitBySector.get(state.sector) || [];
    const allowedExit = exits.find(exit => options.includeSecret !== false || !exit.secret);
    if (allowedExit) { goal = { ...state, exit: allowedExit }; break; }
    // Fire a trigger that stands in this sector: same keys, one more tag.
    for (const trigger of triggersBySector.get(state.sector) || []) {
      if (state.tags.has(trigger.tag)) continue;
      const edge = triggerEdge(graph, trigger);
      const nextTags = new Set([...state.tags, trigger.tag]);
      const nextMask = state.mask | keyMask(keysBySector.get(edge.to) || []);
      const id = `${edge.to}:${nextMask}:${tagsId(nextTags)}`;
      if (seen.has(id)) continue;
      seen.add(id);
      prev.set(id, { previous: state.id, edge, acquiredKeys: maskKeys(nextMask & ~state.mask), firedTag: trigger.tag });
      queue.push({ sector: edge.to, mask: nextMask, tags: nextTags, id });
    }
    for (const edge of graph.edges) {
      if (edge.from !== state.sector || !usableEdge(edge, state.mask, { ...options, tags: state.tags })) continue;
      const nextMask = state.mask | keyMask(keysBySector.get(edge.to) || []);
      const id = `${edge.to}:${nextMask}:${tagsId(state.tags)}`;
      if (seen.has(id)) continue;
      seen.add(id);
      prev.set(id, { previous: state.id, edge, acquiredKeys: maskKeys(nextMask & ~state.mask) });
      queue.push({ sector: edge.to, mask: nextMask, tags: state.tags, id });
    }
  }
  if (!goal) return { found: false, startSector: start, reason: 'no_reachable_exit', exploredStates: seen.size };

  const transitions = [];
  let cursor = goal.id;
  while (cursor !== startId) {
    const row = prev.get(cursor);
    if (!row) throw new Error('Exit progression reconstruction failed');
    transitions.push({ edge: row.edge, acquiredKeys: row.acquiredKeys, ...(row.firedTag != null ? { firedTag: row.firedTag } : {}) });
    cursor = row.previous;
  }
  transitions.reverse();
  return {
    found: true,
    startSector: start,
    finalSector: goal.sector,
    keys: maskKeys(goal.mask),
    tags: [...goal.tags],
    sectors: [start, ...transitions.map(item => item.edge.to)],
    transitions,
    exit: goal.exit,
    exploredStates: seen.size,
    note: 'Sector-level progression assumes a key located in an entered sector can be collected before leaving that sector.'
  };
}
