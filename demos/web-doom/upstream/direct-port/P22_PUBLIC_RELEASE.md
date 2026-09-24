# P2.2 Public Release

This file marks the public `/direct/` release baseline immediately before P3.0.

## AI Deathmatch rules

- **FIRST TO 10 FRAGS**
- **5:00 regulation time limit**
- Regulation tie -> **SUDDEN DEATH**
- Sudden death ends when the tied leaders are separated by the next scoring change

## Match-end flow

When a winner is decided:

1. bot ticcmd overrides are cancelled;
2. LinuxDOOM world simulation is paused;
3. the final scoreboard and winner overlay are shown;
4. **REMATCH** reloads a clean WASM session and restarts the same AI arena;
5. **PLAY CLASSIC DOOM** reloads a clean session into Classic mode.

The public build is generated and browser-verified by `.github/workflows/p22-direct-public.yml` before files are published under `/direct/`.
