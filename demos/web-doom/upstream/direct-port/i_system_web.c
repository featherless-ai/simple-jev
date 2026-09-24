// Browser system layer for the original id Software LinuxDOOM 1.10.

#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Include DOOM first: doomtype.h intentionally defines enum {false, true}.
#include "doomdef.h"
#include "m_misc.h"
#include "i_video.h"
#include "i_sound.h"
#include "d_net.h"
#include "g_game.h"
#include "i_system.h"

// Modern Emscripten defines true/false macros, so it must come after Doom's
// historical boolean enum has already been parsed.
#include <emscripten/emscripten.h>

int mb_used = 16;
static double web_basetime_ms = -1.0;

ticcmd_t emptycmd;

void I_Tactile(int on, int off, int total)
{
    (void)on; (void)off; (void)total;
}

ticcmd_t *I_BaseTiccmd(void)
{
    return &emptycmd;
}

int I_GetHeapSize(void)
{
    return mb_used * 1024 * 1024;
}

byte *I_ZoneBase(int *size)
{
    *size = I_GetHeapSize();
    return (byte *)malloc(*size);
}

int I_GetTime(void)
{
    double now = emscripten_get_now();
    if (web_basetime_ms < 0.0)
        web_basetime_ms = now;
    return (int)(((now - web_basetime_ms) * TICRATE) / 1000.0);
}

void I_Init(void)
{
    // LinuxDOOM 1.10's original Linux platform layer only initializes SFX
    // here because music was disabled on that target. The direct browser port
    // has a real OPL music backend, so initialize it explicitly after opening
    // SDL_mixer. This lets the OPL SDL driver attach its post-mix callback to
    // the already-open signed-16-bit stereo mixer used by the DMX SFX path.
    I_InitSound();
    I_InitMusic();
}

void I_Quit(void)
{
    D_QuitNetGame();

    // Music owns an SDL_mixer post-effect but not the mixer device itself when
    // I_InitSound() opened it first. Unregister the OPL callback before closing
    // the shared mixer so shutdown order mirrors ownership correctly.
    I_ShutdownMusic();
    I_ShutdownSound();

    M_SaveDefaults();
    I_ShutdownGraphics();
    emscripten_cancel_main_loop();
}

void I_WaitVBL(int count)
{
    if (count > 0)
        emscripten_sleep((count * 1000) / 70);
}

void I_BeginRead(void) {}
void I_EndRead(void) {}

byte *I_AllocLow(int length)
{
    byte *mem = (byte *)malloc(length);
    if (mem)
        memset(mem, 0, length);
    return mem;
}

extern boolean demorecording;

void I_Error(char *error, ...)
{
    va_list args;

    va_start(args, error);
    fprintf(stderr, "DOOM ERROR: ");
    vfprintf(stderr, error, args);
    fprintf(stderr, "\n");
    va_end(args);
    fflush(stderr);

    if (demorecording)
        G_CheckDemoStatus();

    D_QuitNetGame();
    I_ShutdownMusic();
    I_ShutdownSound();
    I_ShutdownGraphics();
    emscripten_cancel_main_loop();
    abort();
}
