#!/usr/bin/env python3
"""Wire the separate linedef authoring module into the copied PWAD exporter.

The repository source keeps actor/sector authoring in doom_control.c and linedef
semantics in doom_linedefs.c. At build time this adapter inserts one extern and
one ML_LINEDEFS branch so the existing PWAD writer patches LINEDEFS too.
"""
from pathlib import Path
import sys


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: patch_control_linedefs.py <copied-doom_control.c>")

    path = Path(sys.argv[1])
    text = path.read_text(encoding="utf-8")

    extern_anchor = '#define DOOMCTL_THING_ALL_SKILLS 7\n'
    extern_text = (
        '#define DOOMCTL_THING_ALL_SKILLS 7\n\n'
        'extern int doomctl_build_linedefs_lump(int lump, unsigned char **out_data, int *out_size);\n'
        'extern void doomctl_reset_linedef_changes(void);\n'
    )
    if 'doomctl_build_linedefs_lump' not in text:
        if extern_anchor not in text:
            raise SystemExit('extern insertion anchor missing')
        text = text.replace(extern_anchor, extern_text, 1)

    old = '''        if (i == ML_THINGS)\n            ok = doomctl_build_things_lump(lump, &data, &size);\n        else if (i == ML_SECTORS)\n            ok = doomctl_build_sectors_lump(lump, &data, &size);\n        else\n'''
    new = '''        if (i == ML_THINGS)\n            ok = doomctl_build_things_lump(lump, &data, &size);\n        else if (i == ML_LINEDEFS)\n            ok = doomctl_build_linedefs_lump(lump, &data, &size);\n        else if (i == ML_SECTORS)\n            ok = doomctl_build_sectors_lump(lump, &data, &size);\n        else\n'''
    if 'else if (i == ML_LINEDEFS)' not in text:
        if old not in text:
            raise SystemExit('PWAD exporter branch anchor missing')
        text = text.replace(old, new, 1)

    path.write_text(text, encoding='utf-8')
    print('Wired LINEDEFS authoring into PWAD exporter')


if __name__ == '__main__':
    main()
