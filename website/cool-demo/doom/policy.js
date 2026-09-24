export const DEFAULT_MODEL = 'featherless-ai/Qwen3.6-35B-A3B-classifier';
export const API = 'https://simple-jev-demo-api.featherless.ai/v1';
export const actions = {
  advance: 'Follow the exit route; fire at an aligned enemy while moving.',
  fight: 'Stop, aim at the nearest visible enemy, and fire.',
  dodge_left: 'Strafe left while aiming and firing at the nearest visible enemy.',
  dodge_right: 'Strafe right while aiming and firing at the nearest visible enemy.',
  retreat: 'Back away from the nearest visible enemy while aiming and firing.',
};
export function targets(state) {
  return (state.enemies || []).filter(e => e.health > 0 && (e.lineOfSight || e.visible))
    .sort((a,b) => a.distance - b.distance).slice(0, 4);
}
export function buildRequest(state, context, model) {
  return {
    model,
    state: {
      health: state.player.health, armor: state.player.armor,
      weapon: state.player.weapon, ammo: state.player.ammo,
      route: { bearing: Math.round(context.delta || 0), distance: Math.round(context.targetDistance || 0) },
      enemies: targets(state).map(e => ({ name: e.name, health: e.health, distance: Math.round(e.distance), bearing: Math.round(e.relativeAngle) })),
    },
    questions: { action: {
      type: 'choice',
      instructions: 'Play DOOM. Reach the exit alive. Bearings are degrees, positive left. Clear nearby enemies blocking the route. Fight when a target is close; dodge incoming fire. Advance when enemies are distant. Retreat only when low health and too close. Choose the next short combat action. Navigation and aiming are handled by code.',
      criteria: actions,
    } },
  };
}
export function readAction(body) {
  const answer = body?.answers?.action;
  if (!Object.hasOwn(actions, answer?.choice)) throw Error('Classifier returned an invalid action.');
  return answer.choice;
}
export function combatCommand(action, state, proposal) {
  if (!Object.hasOwn(actions, action)) throw Error('Unknown combat action');
  const enemy = targets(state)[0];
  if (!enemy) return proposal;
  const bearing = Number(enemy.relativeAngle);
  const tics = Math.max(1, Math.min(4, Math.ceil(Math.abs(bearing) / 4.9)));
  const turn = Math.max(-.7, Math.min(.7, -bearing / (7 * tics)));
  if (action === 'advance') return { ...proposal, attack: Math.abs(bearing) < 12, source: 'classifier' };
  return {
    forward: action === 'retreat' ? -.35 : 0,
    strafe: action === 'dodge_left' ? -.5 : action === 'dodge_right' ? .5 : 0,
    turn, attack: Math.abs(bearing) < 15, use: false,
    tics: Math.abs(bearing) > 5 ? tics : 8, source: 'classifier',
  };
}
