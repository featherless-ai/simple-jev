#!/usr/bin/env python3
"""Wire bounded MCP playtest stepping/telemetry into pristine LinuxDOOM p_tick.c.

The normal renderer/event loop keeps running while paused. Vanilla P_Ticker()
already stops world simulation on `paused`; this patch permits only explicitly
budgeted MCP steps through that gate and records one telemetry sample after each
actual world tic.
"""

from pathlib import Path
import sys


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: patch_playtest_ticker.py <linuxdoom-source-dir>")

    path = Path(sys.argv[1]) / "p_tick.c"
    text = path.read_text(encoding="utf-8", errors="replace")

    if "doomctl_consume_world_step" not in text:
        anchor = '#include "p_local.h"\n'
        insert = (
            '#include "p_local.h"\n\n'
            'extern int doomctl_consume_world_step(void);\n'
            'extern void doomctl_playtest_after_world_tic(void);\n'
        )
        if anchor not in text:
            raise SystemExit("p_tick.c include anchor missing")
        text = text.replace(anchor, insert, 1)

    old_pause = "    if (paused)\n\treturn;"
    new_pause = "    if (paused && !doomctl_consume_world_step())\n\treturn;"
    if new_pause not in text:
        if old_pause not in text:
            raise SystemExit("P_Ticker pause gate anchor missing")
        text = text.replace(old_pause, new_pause, 1)

    old_end = "    // for par times\n    leveltime++;\t\n}"
    new_end = (
        "    // for par times\n"
        "    leveltime++;\t\n"
        "    doomctl_playtest_after_world_tic();\n"
        "}"
    )
    if "doomctl_playtest_after_world_tic();" not in text:
        if old_end not in text:
            raise SystemExit("P_Ticker end anchor missing")
        text = text.replace(old_end, new_end, 1)

    path.write_text(text, encoding="utf-8")
    print("Patched P_Ticker for MCP pause/step telemetry")


if __name__ == "__main__":
    main()
