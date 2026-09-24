#!/usr/bin/env python3
"""Prepare a historically accurate OPL music backend for direct LinuxDOOM.

The build checks out a pinned Chocolate Doom release and calls this script with:

    import_vanilla_opl.py <linuxdoom-source> <chocolate-doom-source>

Only the OPL/MIDI support code is imported. Gameplay, rendering and the rest of the
runtime remain the original id Software LinuxDOOM 1.10 direct browser port.

Chocolate Doom's i_oplmusic.c contains the researched Vanilla/DMX-compatible voice
allocation, volume mapping, frequency curves, GENMIDI programming and quirks. Its SDL
OPL driver feeds those register writes to Nuked OPL3 v1.8, running in OPL2 mode unless
DMXOPTION explicitly requests OPL3.
"""

from pathlib import Path
import shutil
import sys

if len(sys.argv) != 3:
    raise SystemExit("usage: import_vanilla_opl.py LINUXDOOM_SRC CHOCOLATE_DOOM_SRC")

root = Path(sys.argv[1]).resolve()
choco = Path(sys.argv[2]).resolve()
out = root / "choco_opl"
out.mkdir(parents=True, exist_ok=True)

# Small, self-contained subset required by i_oplmusic + SDL/Nuked OPL.
sources = {
    choco / "src" / "i_swap.h": out / "i_swap.h",
    choco / "src" / "memio.c": out / "memio.c",
    choco / "src" / "memio.h": out / "memio.h",
    choco / "src" / "mus2mid.c": out / "mus2mid.c",
    choco / "src" / "mus2mid.h": out / "mus2mid.h",
    choco / "src" / "midifile.c": out / "midifile.c",
    choco / "src" / "midifile.h": out / "midifile.h",
    choco / "src" / "i_oplmusic.c": out / "i_oplmusic.c",
    choco / "opl" / "opl.c": out / "opl.c",
    choco / "opl" / "opl.h": out / "opl.h",
    choco / "opl" / "opl_internal.h": out / "opl_internal.h",
    choco / "opl" / "opl_queue.c": out / "opl_queue.c",
    choco / "opl" / "opl_queue.h": out / "opl_queue.h",
    choco / "opl" / "opl_sdl.c": out / "opl_sdl.c",
    choco / "opl" / "opl3.c": out / "opl3.c",
    choco / "opl" / "opl3.h": out / "opl3.h",
}

for src, dst in sources.items():
    if not src.is_file():
        raise SystemExit(f"required Chocolate Doom source missing: {src}")
    shutil.copy2(src, dst)

# OPL code only needs a tiny subset of Chocolate Doom's generated config.h.
(out / "config.h").write_text(
    "#ifndef WEB_DOOM_CHOCO_OPL_CONFIG_H\n"
    "#define WEB_DOOM_CHOCO_OPL_CONFIG_H\n"
    "/* Browser build: use SDL2_mixer OPL driver only. */\n"
    "#endif\n"
)

packed = """
#ifndef PACKED_STRUCT
#define PACKED_STRUCT(...) struct __VA_ARGS__ __attribute__((packed))
#endif
"""

# The imported MIDI reader only needs realloc/fopen from newer Chocolate Doom's
# portability wrappers. LinuxDOOM already provides the other interfaces it needs.
p = out / "midifile.c"
s = p.read_text()
needle = '#include "midifile.h"\n'
if needle not in s:
    raise SystemExit("midifile.c include anchor changed upstream")
s = s.replace(needle, needle + packed, 1)
s = s.replace("I_Realloc(", "realloc(")
s = s.replace("M_fopen(", "fopen(")
p.write_text(s)

# mus2mid uses the packed on-disk MUS header structure.
p = out / "mus2mid.c"
s = p.read_text()
needle = '#include "mus2mid.h"\n'
if needle not in s:
    raise SystemExit("mus2mid.c include anchor changed upstream")
s = s.replace(needle, needle + packed, 1)
p.write_text(s)

# The native OPL driver probes a physical ISA card with chip timers. In the web
# build the SDL driver is itself the known software device, and blocking on that
# hardware probe can deadlock a browser audio callback. Skip only the physical
# presence test; all later register timing and callbacks remain unchanged.
p = out / "opl.c"
s = p.read_text()
old = """    result1 = OPL_Detect();\n    result2 = OPL_Detect();\n"""
new = """#ifdef __EMSCRIPTEN__\n    // SDL/Nuked is the known device in-browser; there is no ISA port to probe.\n    result1 = OPL_INIT_OPL3;\n    result2 = OPL_INIT_OPL3;\n#else\n    result1 = OPL_Detect();\n    result2 = OPL_Detect();\n#endif\n"""
if old not in s:
    raise SystemExit("opl.c detection anchor changed upstream")
s = s.replace(old, new, 1)
p.write_text(s)

# Adapt Chocolate Doom's OPL music module to LinuxDOOM 1.10's original I_* API.
p = out / "i_oplmusic.c"
s = p.read_text()

# We deliberately do not import Chocolate Doom's generic sound-module layer.
s = s.replace('#include "deh_main.h"\n', '')

anchor = '#include "midifile.h"\n'
if anchor not in s:
    raise SystemExit("i_oplmusic.c include anchor changed upstream")
compat = r'''

// -------------------------------------------------------------------------
// Direct LinuxDOOM compatibility boundary.
// -------------------------------------------------------------------------
#ifndef PACKED_STRUCT
#define PACKED_STRUCT(...) struct __VA_ARGS__ __attribute__((packed))
#endif
#define DEH_String(x) (x)
#define W_ReleaseLumpName(name) ((void)0)

typedef enum {
    opl_doom1_1_666,
    opl_doom2_1_666,
    opl_doom_1_9
} opl_driver_ver_t;

// Browser mixer rate. Nuked OPL internally resamples its chip model to this
// output rate while register timing remains driven by the OPL callback queue.
static int snd_samplerate = 44100;

static char *WebOPLTempFile(const char *leaf)
{
    size_t n = strlen(leaf) + 1;
    char *result = malloc(n);
    if (result != NULL)
        memcpy(result, leaf, n);
    return result;
}

#define M_TempFile(name) WebOPLTempFile(name)
#define M_remove(name) remove(name)
'''
s = s.replace(anchor, anchor + compat, 1)

# The bottom of i_oplmusic.c declares Chocolate Doom's generic module object and
# debug interface. The direct port calls the static implementation through
# wrappers matching LinuxDOOM's 1997 i_sound.h instead.
cut = 'const static snddevice_t music_opl_devices[]'
pos = s.find(cut)
if pos < 0:
    raise SystemExit("i_oplmusic.c module boundary changed upstream")
s = s[:pos]

wrappers = r'''
// -------------------------------------------------------------------------
// Original LinuxDOOM 1.10 music API wrappers.
// WebAssembly uses 32-bit pointers, matching the historical int song handle.
// -------------------------------------------------------------------------
void I_InitMusic(void)
{
    if (!I_OPL_InitMusic())
        fprintf(stderr, "I_InitMusic: Vanilla OPL backend failed to initialize\n");
    else
        fprintf(stderr, "I_InitMusic: Vanilla DMX + Nuked OPL2 backend ready\n");
}

void I_ShutdownMusic(void)
{
    I_OPL_ShutdownMusic();
}

void I_SetMusicVolume(int volume)
{
    I_OPL_SetMusicVolume(volume);
}

void I_PauseSong(int handle)
{
    (void) handle;
    I_OPL_PauseSong();
}

void I_ResumeSong(int handle)
{
    (void) handle;
    I_OPL_ResumeSong();
}

int I_RegisterSong(void *data)
{
    byte *mus = (byte *) data;
    unsigned int score_len;
    unsigned int score_start;
    int len;
    void *handle;

    if (mus == NULL || memcmp(mus, "MUS\x1a", 4) != 0)
    {
        fprintf(stderr, "I_RegisterSong: expected a DOOM MUS lump\n");
        return 0;
    }

    score_len = (unsigned int) mus[4] | ((unsigned int) mus[5] << 8);
    score_start = (unsigned int) mus[6] | ((unsigned int) mus[7] << 8);
    len = (int) (score_start + score_len);

    handle = I_OPL_RegisterSong(data, len);
    return (int) (uintptr_t) handle;
}

void I_PlaySong(int handle, int looping)
{
    I_OPL_PlaySong((void *) (uintptr_t) handle, looping ? true : false);
}

void I_StopSong(int handle)
{
    (void) handle;
    I_OPL_StopSong();
}

void I_UnRegisterSong(int handle)
{
    I_OPL_UnRegisterSong((void *) (uintptr_t) handle);
}
'''

# uintptr_t for the int<->pointer WebAssembly song handle conversion.
s = s.replace('#include <string.h>\n', '#include <string.h>\n#include <stdint.h>\n', 1)
s += wrappers
p.write_text(s)

# Assert the exact pieces that make this path meaningfully different from the
# previous WebAudio approximation.
text = p.read_text()
for required in (
    "frequency_curve[]",
    "volume_mapping_table[]",
    "ReplaceExistingVoice",
    "GENMIDI_NUM_INSTRS",
    "OPL_WriteRegister",
    "opl_doom_1_9",
    "Vanilla DMX + Nuked OPL2 backend ready",
):
    if required not in text:
        raise SystemExit(f"adapted i_oplmusic.c lost required feature: {required}")

print("Prepared pinned Vanilla-DMX OPL backend:")
print(" - Chocolate Doom i_oplmusic DMX behavior")
print(" - MUS -> MIDI timing path")
print(" - GENMIDI instrument/register programming")
print(" - SDL OPL callback scheduler")
print(" - Nuked OPL3 v1.8 chip emulator, OPL2 mode by default")
