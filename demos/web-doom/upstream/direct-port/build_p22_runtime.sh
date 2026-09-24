#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE_ROOT="${DOOM_P22_BUILD_CACHE:-$ROOT/.cache/p22-build}"
OUT_DIR="${DOOM_P22_RUNTIME_DIR:-$ROOT/mcp/.cache/p22-runtime}"
EMSDK_DIR="$CACHE_ROOT/emsdk"
ID_DIR="$CACHE_ROOT/id-doom"
SHAREWARE_DIR="$CACHE_ROOT/shareware"
SRC="$ID_DIR/linuxdoom-1.10"
EMSDK_VERSION="6.0.5"
DOOM_COMMIT="a77dfb96cb91780ca334d0d4cfd86957558007e0"

for cmd in git curl unzip python3 make md5sum; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "Missing required command: $cmd" >&2
    echo "On Ubuntu/WSL install prerequisites with: sudo apt update && sudo apt install -y git curl unzip python3 make" >&2
    exit 2
  }
done

mkdir -p "$CACHE_ROOT" "$SHAREWARE_DIR" "$OUT_DIR"

if [ ! -d "$EMSDK_DIR/.git" ]; then
  git clone --depth 1 https://github.com/emscripten-core/emsdk.git "$EMSDK_DIR"
fi
"$EMSDK_DIR/emsdk" install "$EMSDK_VERSION"
"$EMSDK_DIR/emsdk" activate "$EMSDK_VERSION"
# shellcheck disable=SC1091
source "$EMSDK_DIR/emsdk_env.sh"

if [ ! -d "$ID_DIR/.git" ]; then
  git clone https://github.com/id-Software/DOOM.git "$ID_DIR"
fi
git -C "$ID_DIR" fetch origin "$DOOM_COMMIT" --depth 1 || true
git -C "$ID_DIR" checkout -f "$DOOM_COMMIT"
git -C "$ID_DIR" clean -fdx linuxdoom-1.10

test -f "$SRC/d_main.c"

WAD="$SHAREWARE_DIR/doom1.wad"
if [ ! -f "$WAD" ] || [ "$(stat -c%s "$WAD" 2>/dev/null || echo 0)" -ne 4196020 ]; then
  curl -fL --retry 3 https://www.libsdl.org/projects/doom/data/doom1.wad.zip -o "$SHAREWARE_DIR/doom1.wad.zip"
  rm -f "$WAD"
  unzip -j -o "$SHAREWARE_DIR/doom1.wad.zip" -d "$SHAREWARE_DIR"
fi
test "$(head -c4 "$WAD")" = "IWAD"
test "$(stat -c%s "$WAD")" -eq 4196020
echo "5f4eb849b1af12887dec04a2a12e5e62  $WAD" | md5sum -c -
cp "$WAD" "$SRC/doom1.wad"

cp "$ROOT/direct-port/i_video_web.c"        "$SRC/i_video.c"
cp "$ROOT/direct-port/i_system_web.c"       "$SRC/i_system.c"
cp "$ROOT/direct-port/i_sound_web.c"        "$SRC/i_sound.c"
cp "$ROOT/direct-port/i_music_opl_bridge.c" "$SRC/i_music_opl_bridge.c"
cp "$ROOT/direct-port/i_net_localbots.c"    "$SRC/i_net.c"
cp "$ROOT/direct-port/Makefile.web"         "$SRC/Makefile.web"
cp "$ROOT/direct-port/shell.html"           "$SRC/shell.html"

export GITHUB_WORKSPACE="$ROOT"
python3 "$ROOT/direct-port/apply_compat.py" "$SRC"
python3 "$ROOT/direct-port/patch_local_bot_shell.py" "$SRC"

cd "$SRC"
emmake make -f Makefile.web prepare-opl prepare-control validate-mcp
cp "$ROOT/direct-port/doom_multi_agent.c" doom_agent_input.c
python3 "$ROOT/direct-port/patch_multi_agent.py" "$SRC"

P22_EXTRA="--pre-js $ROOT/direct-port/local_bot_live.js -sEXPORTED_FUNCTIONS=_main,_doomctl_queue_player_input,_doomctl_cancel_player_input,_doomctl_get_player_input_status_json,_doomctl_get_players_json,_doomctl_get_player_perception_json,_doomctl_get_local_player_capacity"
emmake make -f Makefile.web webdoom.html EXTRA_EMFLAGS="$P22_EXTRA"

test -s webdoom.html
test -s webdoom.js
test -s webdoom.wasm
test -s webdoom.data
grep -q "DoomLocalBots" webdoom.js
grep -q "doomctl_queue_player_input" webdoom.js

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cp webdoom.html "$OUT_DIR/index.html"
cp webdoom.js "$OUT_DIR/webdoom.js"
cp webdoom.wasm "$OUT_DIR/webdoom.wasm"
cp webdoom.data "$OUT_DIR/webdoom.data"
cp "$ROOT/direct-port/opl_music.js" "$OUT_DIR/opl_music.js"

cat > "$OUT_DIR/P2_RUNTIME.txt" <<EOF
Web DOOM P2.2 bot-capable local runtime
Built from LinuxDOOM: $DOOM_COMMIT
Emscripten: $EMSDK_VERSION
Default without -localplayers: single-player compatible
P2.2 local bot mode: up to four real player slots in one process
EOF

echo
echo "P2.2 bot-capable runtime ready:"
echo "  $OUT_DIR"
echo
echo "Set DOOM_MCP_GAME_DIR to this directory before npm start."
