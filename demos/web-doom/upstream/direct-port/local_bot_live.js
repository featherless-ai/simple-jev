// P2.2 optional real-time local bot scheduler.
//
// Enable with a URL like:
//   ?p22Bots=easy,normal,hard&p22Map=E1M1
// Player 1 / slot 0 remains controlled by normal keyboard/mouse input. Slots
// 1..3 receive deterministic LinuxDOOM ticcmds through doom_multi_agent.c.
// This file is a P2.2 build-only --pre-js input; normal single-player builds do
// not include it.
(function () {
  const PRESETS = Object.freeze({
    easy: Object.freeze({ reactionTics: 10, aimToleranceDeg: 20, turnGain: 0.32, forward: 0.46, strafe: 0.18, aggression: 0.40, itemBias: 0.72, dodge: 0.18 }),
    normal: Object.freeze({ reactionTics: 5, aimToleranceDeg: 11, turnGain: 0.48, forward: 0.62, strafe: 0.30, aggression: 0.62, itemBias: 0.58, dodge: 0.30 }),
    hard: Object.freeze({ reactionTics: 3, aimToleranceDeg: 6, turnGain: 0.64, forward: 0.78, strafe: 0.42, aggression: 0.80, itemBias: 0.44, dodge: 0.44 }),
    nightmare: Object.freeze({ reactionTics: 1, aimToleranceDeg: 2.5, turnGain: 0.86, forward: 0.96, strafe: 0.58, aggression: 0.96, itemBias: 0.30, dodge: 0.60 })
  });

  const params = new URLSearchParams(location.search);
  const rawBots = String(params.get('p22Bots') || '').trim();
  const mapName = String(params.get('p22Map') || 'E1M1').trim().toUpperCase();
  let skills = rawBots ? rawBots.split(',').map(value => value.trim().toLowerCase()).filter(Boolean) : [];
  if (skills.length > 3) skills = skills.slice(0, 3);
  while (skills.length && skills.length < 3) skills.push(skills[skills.length - 1]);
  const invalid = skills.find(skill => !PRESETS[skill]);
  if (invalid) {
    console.error(`P2.2 local bots disabled: unknown skill ${invalid}`);
    skills = [];
  }

  let timer = null;
  let moduleRef = null;
  let decisions = [0, 0, 0, 0];
  let attacks = [0, 0, 0, 0];
  let visibleDecisions = [0, 0, 0, 0];
  let lastError = null;
  let startedAt = null;

  const requestedFragLimit = Number(params.get('p22FragLimit'));
  const requestedTimeLimit = Number(params.get('p22TimeLimit'));
  let matchConfig = {
    fragLimit: Number.isFinite(requestedFragLimit) && requestedFragLimit > 0 ? Math.max(1, Math.min(99, Math.trunc(requestedFragLimit))) : 10,
    timeLimitSeconds: Number.isFinite(requestedTimeLimit) && requestedTimeLimit > 0 ? Math.max(1, Math.min(3600, Math.trunc(requestedTimeLimit))) : 300
  };
  let match = freshMatchState();

  function freshMatchState() {
    return {
      phase: 'idle',
      startedAtMs: null,
      finishedAtMs: null,
      winner: null,
      reason: null,
      finalScores: null,
      suddenDeathContenders: [],
      suddenDeathBaseline: null
    };
  }

  function warpArgs(map) {
    const episode = /^E([1-9])M([1-9])$/.exec(map);
    if (episode) return ['-warp', String(Number(episode[1])), String(Number(episode[2]))];
    const mapxx = /^MAP(\d\d)$/.exec(map);
    if (mapxx) return ['-warp', String(Number(mapxx[1]))];
    throw new Error(`Unsupported P2.2 map ${map}`);
  }
  function clamp(value, min = -1, max = 1) { return Math.max(min, Math.min(max, Number(value))); }
  function burstGate(skill, gametic, player) {
    const phase = Math.floor(gametic / Math.max(1, skill.reactionTics)) + player * 5;
    const slots = 5;
    const active = Math.max(1, Math.min(slots, Math.round(1 + skill.aggression * 4)));
    return (phase % slots) < active;
  }
  function turnToward(delta, skill, boost = 1) {
    const authority = 0.72 + Number(skill.turnGain || 0) * 0.72;
    return Math.round(clamp(-(Number(delta) / 42) * authority * boost) * 100);
  }
  function commandFor(perception, skill, gametic) {
    const player = Number(perception.player);
    const baseTics = Math.max(1, Math.min(35, Number(skill.reactionTics)));
    if (!perception.live) return { player, forward: 0, strafe: 0, turn: 0, attack: true, use: true, tics: baseTics };
    if (!perception.target) {
      const sign = ((Math.floor(gametic / 48) + player) % 2) ? 1 : -1;
      return {
        player,
        forward: Math.round(skill.forward * 48),
        strafe: Math.round(sign * skill.strafe * 18),
        turn: Math.round(sign * 28),
        attack: false,
        use: false,
        tics: baseTics
      };
    }

    const delta = Number(perception.angleDelta || 0);
    const absDelta = Math.abs(delta);
    const visible = Boolean(perception.visible);
    const distance = Number(perception.distance || 9999);
    const aim = Number(skill.aimToleranceDeg);
    const fireCone = Math.max(aim * 1.65, distance < 192 ? 15 : 7);
    const dodgeSign = ((Math.floor(gametic / 35) + player) % 2) ? 1 : -1;

    if (absDelta > 34) {
      return {
        player,
        forward: visible ? 4 : 12,
        strafe: 0,
        turn: turnToward(delta, skill, 1.2),
        attack: false,
        use: false,
        tics: Math.max(1, Math.ceil(baseTics * 0.55))
      };
    }

    if (!visible) {
      return {
        player,
        forward: Math.round(skill.forward * (absDelta < 18 ? 58 : 28)),
        strafe: Math.round(dodgeSign * skill.strafe * 18),
        turn: turnToward(delta, skill, 1.05),
        attack: false,
        use: false,
        tics: Math.max(1, Math.ceil(baseTics * 0.75))
      };
    }

    let forward;
    if (distance > 360) forward = Math.round(skill.forward * 92);
    else if (distance > 220) forward = Math.round(skill.forward * 58);
    else if (distance < 110) forward = -Math.round(28 + skill.aggression * 24);
    else forward = Math.round(skill.forward * 14);

    const strafe = Math.round(dodgeSign * skill.strafe * skill.dodge * 82);
    const attack = absDelta <= fireCone && burstGate(skill, gametic, player);
    return {
      player,
      forward,
      strafe,
      turn: turnToward(delta, skill, 0.82),
      attack,
      use: false,
      tics: Math.max(1, Math.ceil(baseTics * 0.6))
    };
  }
  function ccall(name, returnType, argTypes, args) {
    if (!moduleRef || typeof moduleRef.ccall !== 'function') throw new Error('P2.2 Module.ccall is not ready');
    return moduleRef.ccall(name, returnType, argTypes, args);
  }
  function playersState() {
    return JSON.parse(ccall('doomctl_get_players_json', 'string', [], []));
  }
  function perception(player) {
    return JSON.parse(ccall('doomctl_get_player_perception_json', 'string', ['number'], [player]));
  }
  function inputStatus(player) {
    return JSON.parse(ccall('doomctl_get_player_input_status_json', 'string', ['number'], [player]));
  }
  function queue(command) {
    return ccall('doomctl_queue_player_input', 'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number'],
      [command.player, command.forward, command.strafe, command.turn, command.attack ? 1 : 0, command.use ? 1 : 0, command.tics]);
  }
  function cancelBotInputs() {
    if (!moduleRef) return;
    for (let player = 1; player <= 3; player++) {
      try { ccall('doomctl_cancel_player_input', 'number', ['number'], [player]); } catch {}
    }
  }
  function scoresFromState(state) {
    const scores = [0, 0, 0, 0];
    for (const row of state?.players || []) {
      const slot = Number(row.player);
      if (slot >= 0 && slot < scores.length) scores[slot] = Number(row.frags || 0);
    }
    return scores;
  }
  function topPlayers(scores, candidates = [0, 1, 2, 3]) {
    const best = Math.max(...candidates.map(slot => Number(scores[slot] || 0)));
    return candidates.filter(slot => Number(scores[slot] || 0) === best);
  }
  function enterSuddenDeath(scores, contenders) {
    match.phase = 'sudden_death';
    match.suddenDeathContenders = [...contenders];
    match.suddenDeathBaseline = [...scores];
    console.log(`P2.2 sudden death: ${contenders.map(slot => `P${slot + 1}`).join(', ')}`);
  }
  function finishMatch(winner, reason, scores) {
    if (match.phase === 'finished') return;
    match.phase = 'finished';
    match.winner = Number(winner);
    match.reason = String(reason);
    match.finalScores = [...scores];
    match.finishedAtMs = Date.now();
    cancelBotInputs();
    try {
      if (globalThis.DoomControl && typeof globalThis.DoomControl.setPlaytestPaused === 'function') {
        globalThis.DoomControl.setPlaytestPaused(true);
      }
    } catch (error) {
      console.warn('P2.2 match pause failed:', error);
    }
    console.log(`P2.2 match finished: P${match.winner + 1} wins by ${match.reason}`);
  }
  function updateMatch(state, nowMs = Date.now()) {
    if (!skills.length || !state?.ready || !Array.isArray(state.players) || state.players.length < 2) return;
    const scores = scoresFromState(state);
    if (match.phase === 'idle') {
      match.phase = 'running';
      match.startedAtMs = nowMs;
    }
    if (match.phase === 'finished') return;

    if (match.phase === 'running') {
      const leaders = topPlayers(scores);
      const bestScore = Number(scores[leaders[0]] || 0);
      if (bestScore >= matchConfig.fragLimit) {
        if (leaders.length === 1) finishMatch(leaders[0], 'frag_limit', scores);
        else enterSuddenDeath(scores, leaders);
        return;
      }

      const elapsedSeconds = Math.max(0, (nowMs - Number(match.startedAtMs || nowMs)) / 1000);
      if (elapsedSeconds >= matchConfig.timeLimitSeconds) {
        if (leaders.length === 1) finishMatch(leaders[0], 'time_limit', scores);
        else enterSuddenDeath(scores, leaders);
        return;
      }
    }

    if (match.phase === 'sudden_death') {
      const contenders = match.suddenDeathContenders.length ? match.suddenDeathContenders : topPlayers(scores);
      const leaders = topPlayers(scores, contenders);
      const baseline = match.suddenDeathBaseline || scores;
      const changed = contenders.some(slot => Number(scores[slot] || 0) !== Number(baseline[slot] || 0));
      if (changed && leaders.length === 1) finishMatch(leaders[0], 'sudden_death', scores);
    }
  }
  function matchStatus(nowMs = Date.now()) {
    let scores = match.finalScores ? [...match.finalScores] : [0, 0, 0, 0];
    try {
      if (moduleRef && !match.finalScores) scores = scoresFromState(playersState());
    } catch {}
    let remainingSeconds = matchConfig.timeLimitSeconds;
    if (match.startedAtMs) {
      remainingSeconds = Math.max(0, Math.ceil(matchConfig.timeLimitSeconds - (nowMs - match.startedAtMs) / 1000));
    }
    return {
      config: { ...matchConfig },
      phase: match.phase,
      startedAt: match.startedAtMs ? new Date(match.startedAtMs).toISOString() : null,
      finishedAt: match.finishedAtMs ? new Date(match.finishedAtMs).toISOString() : null,
      remainingSeconds,
      scores,
      winner: match.winner,
      reason: match.reason,
      suddenDeathContenders: [...match.suddenDeathContenders]
    };
  }
  function configureMatch(options = {}) {
    if (match.phase === 'running' || match.phase === 'sudden_death') {
      throw new Error('Cannot reconfigure an active P2.2 match');
    }
    const fragLimit = options.fragLimit === undefined ? matchConfig.fragLimit : Number(options.fragLimit);
    const timeLimitSeconds = options.timeLimitSeconds === undefined ? matchConfig.timeLimitSeconds : Number(options.timeLimitSeconds);
    if (!Number.isFinite(fragLimit) || fragLimit < 1 || fragLimit > 99) throw new Error('fragLimit must be 1..99');
    if (!Number.isFinite(timeLimitSeconds) || timeLimitSeconds < 1 || timeLimitSeconds > 3600) throw new Error('timeLimitSeconds must be 1..3600');
    matchConfig = { fragLimit: Math.trunc(fragLimit), timeLimitSeconds: Math.trunc(timeLimitSeconds) };
    match = freshMatchState();
    return matchStatus();
  }
  function tick() {
    if (!moduleRef || !skills.length) return;
    try {
      const state = playersState();
      if (!state?.ready || !Array.isArray(state.players) || state.players.length < 4) return;
      updateMatch(state);
      if (match.phase === 'finished') return;
      const gametic = Number(state.gametic || 0);
      for (let slot = 1; slot <= 3; slot++) {
        const status = inputStatus(slot);
        if (status?.active && Number(status.remainingTics || 0) > 0) continue;
        const p = perception(slot);
        const command = commandFor(p, PRESETS[skills[slot - 1]], gametic);
        const result = queue(command);
        if (Number(result) > 0) {
          decisions[slot]++;
          if (p?.visible) visibleDecisions[slot]++;
          if (command.attack) attacks[slot]++;
        }
      }
    } catch (error) {
      lastError = String(error?.message || error);
      console.error('P2.2 live bot scheduler:', error);
    }
  }
  function start(module) {
    moduleRef = module || moduleRef || globalThis.Module;
    if (!skills.length || timer) return Boolean(timer);
    startedAt = new Date().toISOString();
    match = freshMatchState();
    timer = setInterval(tick, 28);
    console.log(`P2.2 live bots started: P2=${skills[0]}, P3=${skills[1]}, P4=${skills[2]}`);
    return true;
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    cancelBotInputs();
    return true;
  }
  function setSkill(player, skill) {
    const slot = Number(player);
    const key = String(skill || '').toLowerCase();
    if (slot < 1 || slot > 3) throw new Error('Bot player must be 1..3 (Player 2..4)');
    if (!PRESETS[key]) throw new Error(`Unknown bot skill ${skill}`);
    skills[slot - 1] = key;
    return status();
  }
  function status() {
    let players = null;
    try { if (moduleRef) players = playersState(); } catch {}
    return {
      enabled: Boolean(skills.length),
      running: Boolean(timer),
      humanPlayer: 0,
      botPlayers: skills.map((skill, index) => ({ player: index + 1, skill })),
      map: mapName,
      decisions: [...decisions],
      visibleDecisions: [...visibleDecisions],
      attacks: [...attacks],
      startedAt,
      lastError,
      players,
      match: matchStatus()
    };
  }

  globalThis.DoomLocalBots = {
    version: '2.9.0-p2.2-match',
    presets: PRESETS,
    enabled: () => Boolean(skills.length),
    bootArgs: () => skills.length ? ['-deathmatch', ...warpArgs(mapName), '-localplayers', '4'] : [],
    onGameStarted: module => start(module),
    start,
    stop,
    status,
    setSkill,
    configureMatch,
    matchStatus
  };
})();