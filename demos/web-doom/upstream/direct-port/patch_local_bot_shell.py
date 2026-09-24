#!/usr/bin/env python3
"""Add optional P2.2 human+3-bot hooks to an Emscripten shell.html.

The normal launcher still passes [] when DoomLocalBots is absent. A P2.2 build
that includes local_bot_live.js may provide custom startup args and start the
real-time bot scheduler immediately after callMain.
"""

from pathlib import Path
import sys


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: patch_local_bot_shell.py <linuxdoom-source-dir>")

    path = Path(sys.argv[1]) / "shell.html"
    text = path.read_text(encoding="utf-8")

    old = """      try {\n        const result = Module.callMain([]);\n        resumeAudioContext();\n        hideLauncher();\n"""
    new = """      try {\n        const p22BootArgs = (window.DoomLocalBots && typeof window.DoomLocalBots.bootArgs === 'function')\n          ? window.DoomLocalBots.bootArgs()\n          : [];\n        const result = Module.callMain(p22BootArgs);\n        if (window.DoomLocalBots && typeof window.DoomLocalBots.onGameStarted === 'function') {\n          window.DoomLocalBots.onGameStarted(Module);\n        }\n        resumeAudioContext();\n        hideLauncher();\n"""

    if new not in text:
        if old not in text:
            raise SystemExit("shell start/callMain block not found")
        text = text.replace(old, new, 1)

    path.write_text(text, encoding="utf-8")
    print("Patched shell.html with optional P2.2 live-bot boot/scheduler hooks")


if __name__ == "__main__":
    main()
