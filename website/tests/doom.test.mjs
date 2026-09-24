import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRequest, readAction, combatCommand, targets, DEFAULT_MODEL } from '../cool-demo/doom/policy.js';
const state = { player: { health: 65, armor: 20, weapon: 1, ammo: { bullets: 30 } }, enemies: [
  { name: 'imp', health: 60, distance: 120, relativeAngle: 25, lineOfSight: true },
  { name: 'dead enemy', health: 0, distance: 10, relativeAngle: 0, visible: true },
  { name: 'hidden enemy', health: 20, distance: 40, relativeAngle: 90, visible: false },
] };
test('request uses only live visible targets and bounded classifier choices', () => {
  assert.equal(targets(state).length, 1);
  const request = buildRequest(state, { delta: 20, targetDistance: 42 }, DEFAULT_MODEL);
  assert.equal(request.model, DEFAULT_MODEL);
  assert.equal(request.questions.action.type, 'choice');
  assert.equal(Object.keys(request.questions.action.criteria).length, 5);
  assert.equal(request.state.enemies[0].name, 'imp');
  assert.ok(JSON.stringify(request).length < 2000);
});
test('invalid API actions are rejected', () => {
  assert.throws(() => readAction({ answers: { action: { choice: 'teleport' } } }));
  assert.throws(() => readAction({}));
  assert.equal(readAction({ answers: { action: { choice: 'fight' } } }), 'fight');
});
test('commands aim at current enemy rather than a stale API snapshot', () => {
  const command = combatCommand('fight', state, {});
  assert.ok(command.turn < 0 && command.turn >= -.7);
  assert.equal(command.attack, false);
  const aligned = { ...state, enemies: [{ ...state.enemies[0], relativeAngle: 0 }] };
  assert.equal(combatCommand('fight', aligned, {}).attack, true);
  const proposal = { forward: 1, use: true };
  assert.deepEqual(combatCommand('fight', { ...state, enemies: [] }, proposal), proposal);
  assert.equal(combatCommand('advance', aligned, proposal).use, true);
});

test('shipped route retains geometry needed to navigate around the E1M1 wall', async () => {
  const { readFile } = await import('node:fs/promises');
  const { planLocalPath } = await import('../cool-demo/doom/vendor/navigation_graph.js');
  const { graph } = JSON.parse(await readFile(new URL('../cool-demo/doom/vendor/e1m1.json', import.meta.url)));
  const path = planLocalPath(graph, 7, { x: 2000, y: -2500 }, { x: 2496, y: -2624 });
  assert.ok(path.length > 0, 'Must route around the raised platform, not push into its wall');
});
