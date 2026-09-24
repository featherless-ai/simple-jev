#!/usr/bin/env python3
"""Wire SIDEDEFS and sector-flat visual authoring into doom_control.c at build time."""
from pathlib import Path
import sys


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: patch_control_visuals.py <copied-doom_control.c>")

    path = Path(sys.argv[1])
    text = path.read_text(encoding="utf-8")

    extern_anchor = "extern void doomctl_reset_linedef_changes(void);\n"
    extern_block = (
        "extern void doomctl_reset_linedef_changes(void);\n"
        "extern int doomctl_build_sidedefs_lump(int lump, unsigned char **out_data, int *out_size);\n"
        "extern int doomctl_patch_visual_sectors_lump(unsigned char *data, int size);\n"
        "extern void doomctl_reset_visual_changes(void);\n"
    )
    if "doomctl_build_sidedefs_lump" not in text:
        if extern_anchor not in text:
            raise SystemExit("visual extern insertion anchor missing")
        text = text.replace(extern_anchor, extern_block, 1)

    old = '''        else if (i == ML_LINEDEFS)\n            ok = doomctl_build_linedefs_lump(lump, &data, &size);\n        else if (i == ML_SECTORS)\n            ok = doomctl_build_sectors_lump(lump, &data, &size);\n        else\n'''
    new = '''        else if (i == ML_LINEDEFS)\n            ok = doomctl_build_linedefs_lump(lump, &data, &size);\n        else if (i == ML_SIDEDEFS)\n            ok = doomctl_build_sidedefs_lump(lump, &data, &size);\n        else if (i == ML_SECTORS)\n        {\n            ok = doomctl_build_sectors_lump(lump, &data, &size);\n            if (ok)\n                ok = doomctl_patch_visual_sectors_lump(data, size);\n        }\n        else\n'''
    if "else if (i == ML_SIDEDEFS)" not in text:
        if old not in text:
            raise SystemExit("visual PWAD exporter branch anchor missing")
        text = text.replace(old, new, 1)

    path.write_text(text, encoding="utf-8")
    print("Wired SIDEDEFS and sector-flat visual authoring into PWAD exporter")


if __name__ == "__main__":
    main()
