#!/usr/bin/env python3
"""Add a tiny exported ChangeSet reset wrapper to the copied doom_control.c.

The authoring journal internals intentionally remain private/static in the
repository-owned control surface. Runtime PWAD reload lives in a separate C
translation unit, so the build copy gets one explicit wrapper that resets the
actor/sector journal plus linedef/visual journals and the playtest telemetry
baseline after a newly imported PWAD becomes the current baseline.
"""

from pathlib import Path
import sys


APPEND = r'''

extern void doomctl_reset_playtest_telemetry(void);

// Build-added authoring baseline reset used only after an explicit PWAD reload.
EMSCRIPTEN_KEEPALIVE
int doomctl_reset_changeset(void)
{
    if (gamestate != GS_LEVEL)
        return -1;

    doomctl_clear_journal_internal();
    doomctl_journal_episode = gameepisode;
    doomctl_journal_map = gamemap;
    doomctl_reset_linedef_changes();
    doomctl_reset_visual_changes();
    doomctl_reset_playtest_telemetry();
    return 1;
}
'''


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: patch_control_reload.py <copied-doom_control.c>")

    path = Path(sys.argv[1])
    text = path.read_text(encoding="utf-8")

    if "int doomctl_reset_changeset(void)" in text:
        print("doomctl_reset_changeset already present")
        return

    required = [
        "static void doomctl_clear_journal_internal(void)",
        "static int doomctl_journal_episode",
        "int doomctl_export_pwad(const char *path)",
        "extern void doomctl_reset_linedef_changes(void);",
        "extern void doomctl_reset_visual_changes(void);",
    ]
    missing = [marker for marker in required if marker not in text]
    if missing:
        raise SystemExit(f"doom_control.c markers missing: {missing}")

    path.write_text(text.rstrip() + APPEND + "\n", encoding="utf-8")
    print("Added doomctl_reset_changeset wrapper with authoring + playtest resets")


if __name__ == "__main__":
    main()
