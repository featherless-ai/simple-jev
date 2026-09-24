#!/usr/bin/env python3
"""Patch pristine LinuxDOOM G_Ticker() with the bounded MCP agent input hook.

The hook runs only after the console player's real net/demo ticcmd has been
selected, immediately before gameplay consumes it. It does not alter input
event handling or the netcmd generation path.
"""

from pathlib import Path
import sys


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: patch_agent_input.py <linuxdoom-source-dir>")

    root = Path(sys.argv[1])
    path = root / "g_game.c"
    text = path.read_text(encoding="utf-8")

    if "doomctl_apply_agent_ticcmd(cmd);" in text:
        print("agent ticcmd hook already present")
        return

    marker = "    // get commands, check consistancy,\n"
    if marker not in text:
        raise SystemExit("G_Ticker command marker missing")
    text = text.replace(
        marker,
        "    extern void doomctl_apply_agent_ticcmd(ticcmd_t *cmd);\n\n" + marker,
        1,
    )

    needle = "\t    if (demorecording) \n\t\tG_WriteDemoTiccmd (cmd);\n"
    if needle not in text:
        raise SystemExit("G_Ticker selected-command block missing")
    replacement = needle + (
        "\n"
        "\t    // MCP autonomous playtest input overrides only the local command\n"
        "\t    // that is about to be consumed by gameplay.\n"
        "\t    if (i == consoleplayer)\n"
        "\t\tdoomctl_apply_agent_ticcmd(cmd);\n"
    )
    text = text.replace(needle, replacement, 1)

    path.write_text(text, encoding="utf-8")
    print("Patched G_Ticker with deterministic MCP ticcmd override")


if __name__ == "__main__":
    main()
