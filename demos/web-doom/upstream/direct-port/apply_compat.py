#!/usr/bin/env python3
"""Minimal source compatibility edits for the direct LinuxDOOM browser build.

The upstream 1997 gameplay/rendering code remains intact. Browser platform files are
installed explicitly by CI; this script only resolves narrow modern-toolchain source
collisions, restores DOS-era audio scaling, injects the local-only v2 geometry bridge,
adds the v2.1 fresh-runtime PWAD boot hook, and (on GitHub Actions only) gates
publishing on the real geometry/ZDBSP integration self-test. Music adaptation is
handled separately by import_vanilla_opl.py.
"""
from pathlib import Path
import os
import subprocess
import sys

if len(sys.argv) != 2:
    raise SystemExit("usage: apply_compat.py /path/to/linuxdoom-1.10")

root = Path(sys.argv[1])
script_dir = Path(__file__).resolve().parent
repo_root = script_dir.parent

# Emscripten's compat/string.h already declares `char *strupr(char *)`, while
# LinuxDOOM 1.10 contains a local `void strupr(char *)`. Rename only Doom's
# private helper and its single call site.
p = root / "w_wad.c"
s = p.read_text()
replacements = [
    ("void strupr (char* s)", "static void doom_strupr (char* s)"),
    ("    strupr (name8.s);", "    doom_strupr (name8.s);"),
]
for old, new in replacements:
    if old not in s:
        raise SystemExit(f"expected source text not found in {p}: {old!r}")
    s = s.replace(old, new, 1)
p.write_text(s)

# LinuxDOOM disabled music on the Unix target and commented out the DOS
# 0..15 menu-volume -> 0..120 internal-volume scaling. Our imported DMX/OPL
# backend expects the internal 0..127 scale, just like modern Vanilla-accurate
# source ports do, so restore the original *8 handoff at startup and in the
# sound menu. This also puts SFX volume on the same historical internal scale.
p = root / "d_main.c"
s = p.read_text()
old = "S_Init (snd_SfxVolume /* *8 */, snd_MusicVolume /* *8*/ );"
new = "S_Init (snd_SfxVolume * 8, snd_MusicVolume * 8);"
if old not in s:
    raise SystemExit(f"expected DOS audio scaling anchor not found in {p}: {old!r}")
s = s.replace(old, new, 1)

# Structural PWADs must be present before LinuxDOOM allocates lumpcache and
# constructs its first level.  The browser writes the candidate into the fresh
# Emscripten filesystem before main(), doom_reload.c stages its path, and this
# hook appends it to Doom's wadfiles[] list immediately before
# W_InitMultipleFiles().  This deliberately avoids live P_SetupLevel teardown.
decl_anchor = "void D_CheckNetGame (void);\n"
decl = "extern int doomctl_prepare_boot_pwad (void);\n"
if decl_anchor not in s:
    raise SystemExit(f"expected cold-boot declaration anchor not found in {p}: {decl_anchor!r}")
if decl not in s:
    s = s.replace(decl_anchor, decl_anchor + decl, 1)

wad_anchor = (
    '    printf ("W_Init: Init WADfiles.\\n");\n'
    '    W_InitMultipleFiles (wadfiles);'
)
wad_replacement = (
    '    printf ("W_Init: Init WADfiles.\\n");\n'
    '    if (doomctl_prepare_boot_pwad () < 0)\n'
    '        I_Error ("DOOM MCP: failed to stage cold-boot PWAD");\n'
    '    W_InitMultipleFiles (wadfiles);'
)
if wad_anchor not in s:
    raise SystemExit(f"expected W_InitMultipleFiles anchor not found in {p}")
s = s.replace(wad_anchor, wad_replacement, 1)
p.write_text(s)

p = root / "m_menu.c"
s = p.read_text()
menu_replacements = [
    ("S_SetSfxVolume(snd_SfxVolume /* *8 */);",
     "S_SetSfxVolume(snd_SfxVolume * 8);"),
    ("S_SetMusicVolume(snd_MusicVolume /* *8 */);",
     "S_SetMusicVolume(snd_MusicVolume * 8);"),
]
for old, new in menu_replacements:
    if old not in s:
        raise SystemExit(f"expected DOS audio scaling anchor not found in {p}: {old!r}")
    s = s.replace(old, new, 1)
p.write_text(s)

# v2 geometry authoring operates in the local Node MCP process, but the browser
# still needs a narrow snapshot/apply websocket at :3781. Keep it out of the
# public shell source itself and inject it only during the direct build so the
# same checked-in bridge file is used by CI and local builds.
bridge_path = script_dir / "geometry_bridge.js"
if not bridge_path.is_file():
    raise SystemExit(f"geometry bridge source missing: {bridge_path}")
bridge = bridge_path.read_text()

p = root / "shell.html"
s = p.read_text()
marker = "\n  {{{ SCRIPT }}}\n"
if marker not in s:
    raise SystemExit(f"Emscripten SCRIPT marker not found in {p}")
if "127.0.0.1:3781/geometry" not in s:
    injected = "\n  <script>\n" + bridge + "\n  </script>\n"
    s = s.replace(marker, injected + marker, 1)
p.write_text(s)

# The main direct-port workflow already executes this script before compiling.
# On GitHub Actions, run the same real structural integration test used by the
# dedicated v2 workflow. A publish commit therefore cannot be produced unless
# a synthetic room can be built, passed through pinned/hash-verified ZDBSP WASM,
# and returned with non-empty vanilla NODES/BLOCKMAP plus a correctly-sized REJECT.
if os.environ.get("GITHUB_ACTIONS", "").lower() == "true":
    selftest = repo_root / "mcp" / "geometry_selftest.mjs"
    if not selftest.is_file():
        raise SystemExit(f"geometry integration self-test missing: {selftest}")
    node = os.environ.get("NODE_BINARY") or "node"
    print("Running DOOM MCP v2 geometry/ZDBSP integration gate...")
    subprocess.run([node, str(selftest)], cwd=str(selftest.parent), check=True)

print("Applied LinuxDOOM/Emscripten compatibility edits:")
print(" - w_wad.c: private strupr helper renamed to doom_strupr")
print(" - d_main.c/m_menu.c: restored DOS 0..15 -> internal *8 audio scaling")
print(" - d_main.c: fresh-runtime MCP candidate staged before W_InitMultipleFiles")
print(" - shell.html: injected local-only MCP v2.1 geometry cold-boot bridge (:3781)")
if os.environ.get("GITHUB_ACTIONS", "").lower() == "true":
    print(" - CI gate: structural room -> ZDBSP -> vanilla derived-lump self-test passed")
print(" - music compatibility is prepared separately by import_vanilla_opl.py")
