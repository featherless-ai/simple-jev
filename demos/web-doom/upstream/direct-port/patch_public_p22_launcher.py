#!/usr/bin/env python3
"""Patch the P2.2 LinuxDOOM shell with public Classic/AI Deathmatch launch choices.

This runs only for the public P2.2 direct build. The generic checked-in shell
remains compatible with local MCP workflows. AI Deathmatch fetches the bundled
p22-demo.wad, writes it into the fresh Emscripten FS, stages it as the boot PWAD,
then starts four local LinuxDOOM player slots with Players 2-4 controlled by the
P2.2 live bot scheduler.

The Classic button deliberately keeps the legacy DOM id/class contract
`#start.ready:not([disabled])`. Existing P0/P1/P2 browser QA therefore continues
to select Classic mode without knowing about the new public dual launcher.
"""

from pathlib import Path
import sys


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: patch_public_p22_launcher.py <linuxdoom-source-dir>")

    path = Path(sys.argv[1]) / "shell.html"
    text = path.read_text(encoding="utf-8")

    old_button = '<button id="start" type="button" disabled>CLICK TO START</button>'
    new_buttons = '''<div id="launchChoices" aria-label="Game mode">
              <button id="start" class="launchChoice" type="button" disabled>PLAY CLASSIC DOOM</button>
              <button id="playAi" class="launchChoice" type="button" disabled>PLAY AI DEATHMATCH</button>
            </div>'''
    if new_buttons not in text:
        if old_button not in text:
            raise SystemExit("launcher button anchor not found")
        text = text.replace(old_button, new_buttons, 1)

    match_markup = '''        <div id="matchHud" aria-live="polite">
          <div id="matchRule">FIRST TO 10 · 05:00</div>
          <div id="matchScores"></div>
        </div>
        <div id="matchEnd" role="dialog" aria-modal="true" aria-label="Deathmatch result">
          <div id="matchEndBox">
            <div id="matchEndKicker">MATCH COMPLETE</div>
            <div id="matchWinner">PLAYER 1 WINS</div>
            <div id="matchEndReason"></div>
            <div id="matchFinalScores"></div>
            <div id="matchEndButtons">
              <button id="matchRematch" type="button">REMATCH</button>
              <button id="matchClassic" type="button">PLAY CLASSIC DOOM</button>
            </div>
          </div>
        </div>
'''
    if 'id="matchHud"' not in text:
        anchor = '        <div id="loading">\n'
        if anchor not in text:
            raise SystemExit("loading markup anchor not found")
        text = text.replace(anchor, match_markup + anchor, 1)

    css = '''
    #launchChoices { display: none; margin: 18px auto 0; gap: 10px; justify-content: center; flex-wrap: wrap; }
    #launchChoices.ready { display: flex; }
    .launchChoice { min-width: 190px; padding: 13px 18px; font-size: 12px; font-weight: 900; letter-spacing: .08em; border-color: rgba(255,255,255,.45); background: #171717; }
    .launchChoice:disabled { opacity: .45; cursor: default; }
    #playAi { border-color: rgba(255,126,76,.72); }
    #matchHud { display: none; position: absolute; top: 12px; left: 50%; transform: translateX(-50%); z-index: 5; min-width: min(560px,84%); text-align: center; pointer-events: none; }
    #matchHud.live { display: block; }
    #matchRule { display: inline-block; padding: 6px 10px; border: 1px solid rgba(255,255,255,.22); border-radius: 7px; background: rgba(0,0,0,.74); color: #fff; font-size: 11px; font-weight: 900; letter-spacing: .08em; }
    #matchRule.sudden { color: #ffcf6b; border-color: rgba(255,207,107,.72); }
    #matchScores { display: flex; justify-content: center; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
    .matchScore { min-width: 74px; padding: 5px 7px; border: 1px solid rgba(255,255,255,.15); border-radius: 6px; background: rgba(0,0,0,.68); color: #ddd; font-size: 10px; }
    .matchScore.human { border-color: rgba(116,255,147,.5); color: #c8ffd3; }
    .matchScore.leader { background: rgba(70,54,12,.82); border-color: rgba(255,207,107,.72); color: #fff3c4; }
    #matchEnd { display: none; position: absolute; inset: 0; z-index: 20; place-items: center; background: rgba(0,0,0,.82); pointer-events: auto; backdrop-filter: blur(3px); }
    #matchEnd.visible { display: grid; }
    #matchEndBox { width: min(520px,86%); padding: 30px 26px; text-align: center; border: 1px solid rgba(255,255,255,.22); border-radius: 10px; background: rgba(12,12,12,.96); box-shadow: 0 18px 70px rgba(0,0,0,.65); }
    #matchEndKicker { color: #8d8d8d; font-size: 10px; font-weight: 800; letter-spacing: .18em; }
    #matchWinner { margin-top: 9px; color: #fff; font-size: clamp(24px,4vw,42px); font-weight: 1000; letter-spacing: .08em; }
    #matchEndReason { margin-top: 8px; color: #ffcf6b; font-size: 12px; font-weight: 800; letter-spacing: .08em; }
    #matchFinalScores { display: flex; justify-content: center; gap: 7px; margin: 20px 0; flex-wrap: wrap; }
    #matchEndButtons { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
    #matchEndButtons button { min-width: 170px; padding: 12px 16px; font-size: 12px; font-weight: 900; letter-spacing: .08em; }
'''
    if "#launchChoices {" not in text:
        marker = "  </style>"
        if marker not in text:
            raise SystemExit("style closing tag not found")
        text = text.replace(marker, css + marker, 1)

    old_ref = "    const startButton = document.getElementById('start');\n"
    new_ref = (
        "    const launchChoices = document.getElementById('launchChoices');\n"
        "    const playClassicButton = document.getElementById('start');\n"
        "    const playAiButton = document.getElementById('playAi');\n"
    )
    if new_ref not in text:
        if old_ref not in text:
            raise SystemExit("start button JS reference not found")
        text = text.replace(old_ref, new_ref, 1)

    hud_refs = '''    const matchHud = document.getElementById('matchHud');
    const matchRule = document.getElementById('matchRule');
    const matchScores = document.getElementById('matchScores');
    const matchEnd = document.getElementById('matchEnd');
    const matchWinner = document.getElementById('matchWinner');
    const matchEndReason = document.getElementById('matchEndReason');
    const matchFinalScores = document.getElementById('matchFinalScores');
    const matchRematch = document.getElementById('matchRematch');
    const matchClassic = document.getElementById('matchClassic');
'''
    if "const matchHud =" not in text:
        anchor = "    const mcpBadge = document.getElementById('mcpBadge');\n"
        if anchor not in text:
            raise SystemExit("mcp badge JS reference not found")
        text = text.replace(anchor, anchor + hud_refs, 1)

    old_ready = '''      startButton.disabled = false;\n      startButton.classList.add('ready');\n      audioNote.classList.add('ready');'''
    new_ready = '''      playClassicButton.disabled = false;\n      playClassicButton.classList.add('ready');\n      playAiButton.disabled = false;\n      launchChoices.classList.add('ready');\n      audioNote.textContent = 'Classic runs the original shareware campaign. AI Deathmatch: first to 10 frags, 5 minute limit, sudden death on a tie.';\n      audioNote.classList.add('ready');\n      const queuedMode = sessionStorage.getItem(P22_NEXT_MODE_KEY);\n      if (queuedMode === 'ai' || queuedMode === 'classic') {\n        sessionStorage.removeItem(P22_NEXT_MODE_KEY);\n        setTimeout(() => { void startSelectedMode(queuedMode); }, 0);\n      }'''
    if new_ready not in text:
        if old_ready not in text:
            raise SystemExit("showReady block not found")
        text = text.replace(old_ready, new_ready, 1)

    start_anchor = "    startButton.addEventListener('click', () => {"
    end_anchor = "\n\n    for (const eventName of ['pointerdown', 'keydown', 'touchstart'])"
    if start_anchor in text:
        start = text.index(start_anchor)
        end = text.index(end_anchor, start)
        replacement = r'''    const PUBLIC_P22_DEMO_WAD = 'p22-demo.wad';
    const PUBLIC_P22_BOTS = ['easy', 'normal', 'hard'];
    const P22_NEXT_MODE_KEY = 'doom.p22.nextMode';
    let matchUiTimer = null;

    function setLaunchBusy(busy) {
      playClassicButton.disabled = Boolean(busy);
      playAiButton.disabled = Boolean(busy);
    }

    function formatClock(totalSeconds) {
      const seconds = Math.max(0, Math.trunc(Number(totalSeconds) || 0));
      const minutes = Math.floor(seconds / 60);
      return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }

    function playerLabel(slot) {
      if (slot === 0) return 'P1 HUMAN';
      const skill = PUBLIC_P22_BOTS[slot - 1] || 'BOT';
      return `P${slot + 1} ${skill.toUpperCase()}`;
    }

    function renderScoreNodes(container, scores) {
      const top = Math.max(...scores.map(value => Number(value || 0)));
      container.replaceChildren(...scores.map((score, slot) => {
        const node = document.createElement('div');
        node.className = 'matchScore';
        if (slot === 0) node.classList.add('human');
        if (Number(score) === top) node.classList.add('leader');
        node.textContent = `${playerLabel(slot)} · ${Number(score)}`;
        return node;
      }));
    }

    function renderMatchUi() {
      if (!window.DoomLocalBots || typeof window.DoomLocalBots.status !== 'function') return;
      const botStatus = window.DoomLocalBots.status();
      const current = botStatus?.match;
      if (!current || current.phase === 'idle') return;

      matchHud.classList.add('live');
      renderScoreNodes(matchScores, current.scores || [0, 0, 0, 0]);
      if (current.phase === 'sudden_death') {
        matchRule.textContent = 'SUDDEN DEATH · NEXT FRAG WINS';
        matchRule.classList.add('sudden');
      } else if (current.phase === 'finished') {
        matchRule.textContent = 'MATCH COMPLETE';
        matchRule.classList.remove('sudden');
      } else {
        matchRule.textContent = `FIRST TO ${current.config.fragLimit} · ${formatClock(current.remainingSeconds)}`;
        matchRule.classList.remove('sudden');
      }

      if (current.phase === 'finished') {
        const winner = Number(current.winner);
        matchWinner.textContent = `PLAYER ${winner + 1} WINS`;
        const reasons = {
          frag_limit: `${current.config.fragLimit} FRAGS`,
          time_limit: 'TIME LIMIT',
          sudden_death: 'SUDDEN DEATH'
        };
        matchEndReason.textContent = reasons[current.reason] || String(current.reason || '').toUpperCase();
        renderScoreNodes(matchFinalScores, current.scores || [0, 0, 0, 0]);
        matchEnd.classList.add('visible');
      }
    }

    function startMatchUi() {
      if (matchUiTimer) clearInterval(matchUiTimer);
      renderMatchUi();
      matchUiTimer = setInterval(renderMatchUi, 100);
    }

    function queueModeAndReload(mode) {
      sessionStorage.setItem(P22_NEXT_MODE_KEY, mode);
      location.reload();
    }

    async function stagePublicDeathmatchWad() {
      if (!Module.FS || typeof Module.FS.writeFile !== 'function') {
        throw new Error('Emscripten filesystem is unavailable');
      }
      statusEl.textContent = 'Loading AI deathmatch arena…';
      const response = await fetch(PUBLIC_P22_DEMO_WAD, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load ${PUBLIC_P22_DEMO_WAD}: HTTP ${response.status}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.length < 12 || bytes[0] !== 0x50 || bytes[1] !== 0x57 || bytes[2] !== 0x41 || bytes[3] !== 0x44) {
        throw new Error(`${PUBLIC_P22_DEMO_WAD} is not a PWAD`);
      }
      const virtualPath = `/${PUBLIC_P22_DEMO_WAD}`;
      try { Module.FS.unlink(virtualPath); } catch {}
      Module.FS.writeFile(virtualPath, bytes);
      const staged = Module.ccall('doomctl_set_boot_pwad_path', 'number', ['string'], [virtualPath]);
      if (Number(staged) <= 0) throw new Error(`Failed to stage ${PUBLIC_P22_DEMO_WAD}: ${staged}`);
      return bytes.length;
    }

    function configurePublicBots() {
      if (!window.DoomLocalBots || typeof window.DoomLocalBots.setSkill !== 'function') {
        throw new Error('P2.2 local bot runtime is unavailable');
      }
      PUBLIC_P22_BOTS.forEach((skill, index) => window.DoomLocalBots.setSkill(index + 1, skill));
      return window.DoomLocalBots.bootArgs();
    }

    async function startSelectedMode(mode) {
      if (!runtimeReady || gameStarted) return;
      gameStarted = true;
      setLaunchBusy(true);

      try {
        let args = [];
        if (mode === 'ai') {
          const bytes = await stagePublicDeathmatchWad();
          args = configurePublicBots();
          statusEl.textContent = `Starting AI Deathmatch · ${bytes} byte arena · FIRST TO 10 · 05:00…`;
        } else {
          statusEl.textContent = 'Starting Classic DOOM + hardware-style OPL audio…';
        }

        const result = Module.callMain(args);
        if (mode === 'ai' && window.DoomLocalBots && typeof window.DoomLocalBots.onGameStarted === 'function') {
          window.DoomLocalBots.onGameStarted(Module);
          startMatchUi();
        }
        window.DoomPublicLauncher = {
          mode,
          demoWad: mode === 'ai' ? PUBLIC_P22_DEMO_WAD : null,
          bots: mode === 'ai' ? [...PUBLIC_P22_BOTS] : [],
          rules: mode === 'ai' ? { fragLimit: 10, timeLimitSeconds: 300, tie: 'sudden_death' } : null,
          startedAt: new Date().toISOString()
        };
        resumeAudioContext();
        hideLauncher();
        if (mcpSocket && mcpSocket.readyState === WebSocket.OPEN) {
          mcpSocket.send(JSON.stringify({ event: 'game_started', mode }));
        }
        if (result && typeof result.catch === 'function') {
          result.catch(err => {
            console.error(err);
            loading.classList.remove('hidden');
            statusEl.textContent = 'Startup failed — see browser console.';
          });
        }
      } catch (err) {
        console.error(err);
        gameStarted = false;
        setLaunchBusy(false);
        loading.classList.remove('hidden');
        statusEl.textContent = 'Startup failed — see browser console.';
      }
    }

    playClassicButton.addEventListener('click', () => { void startSelectedMode('classic'); });
    playAiButton.addEventListener('click', () => { void startSelectedMode('ai'); });
    matchRematch.addEventListener('click', () => { queueModeAndReload('ai'); });
    matchClassic.addEventListener('click', () => { queueModeAndReload('classic'); });'''
        text = text[:start] + replacement + text[end:]

    required = [
        "PLAY CLASSIC DOOM",
        "PLAY AI DEATHMATCH",
        'id="start" class="launchChoice"',
        'id="matchHud"',
        'id="matchEnd"',
        'id="matchRematch"',
        "playClassicButton.classList.add('ready')",
        "stagePublicDeathmatchWad",
        "doomctl_set_boot_pwad_path",
        "PUBLIC_P22_BOTS = ['easy', 'normal', 'hard']",
        "FIRST TO ${current.config.fragLimit}",
        "SUDDEN DEATH · NEXT FRAG WINS",
        "queueModeAndReload('ai')",
        "DoomPublicLauncher",
    ]
    missing = [item for item in required if item not in text]
    if missing:
        raise SystemExit(f"public P2.2 launcher patch incomplete: {missing}")

    path.write_text(text, encoding="utf-8")
    print("Patched shell.html with P2.2 launcher, live scoreboard, match rules, and result flow")


if __name__ == "__main__":
    main()
