// Browser platform layer for the original id Software LinuxDOOM 1.10.
// This file is written for pavy23/web-doom and replaces only i_video.c.

#include <stdint.h>
#include <stdlib.h>
#include <string.h>

// Parse Doom's historical boolean enum before modern Emscripten headers,
// which define true/false macros.
#include "doomdef.h"
#include "doomstat.h"
#include "d_event.h"
#include "d_main.h"
#include "i_system.h"
#include "i_video.h"
#include "v_video.h"

#include <SDL.h>
#include <emscripten/emscripten.h>

static SDL_Window *web_window;
static SDL_Renderer *web_renderer;
static SDL_Texture *web_texture;
static byte web_palette[256][4];
static byte web_rgba[SCREENWIDTH * SCREENHEIGHT * 4];
static int graphics_ready;
static int mouse_buttons;

// Install a browser-native pointer-lock gesture on the game canvas.  This is
// intentionally done from the platform layer instead of changing LinuxDOOM's
// gameplay code.  A click captures the mouse; Esc releases it as usual.
EM_JS(void, web_install_pointer_lock, (), {
    const canvas = (typeof Module !== 'undefined' && Module.canvas)
        ? Module.canvas
        : document.getElementById('canvas');

    if (!canvas || canvas.dataset.doomPointerLockInstalled === '1')
        return;

    canvas.dataset.doomPointerLockInstalled = '1';

    const updateCursor = () => {
        const locked = document.pointerLockElement === canvas;
        canvas.style.cursor = locked ? 'none' : 'default';
    };

    canvas.addEventListener('click', () => {
        canvas.focus();
        if (document.pointerLockElement === canvas || !canvas.requestPointerLock)
            return;

        try {
            const request = canvas.requestPointerLock();
            if (request && typeof request.catch === 'function')
                request.catch(err => console.warn('DOOM pointer lock failed:', err));
        } catch (err) {
            console.warn('DOOM pointer lock failed:', err);
        }
    });

    document.addEventListener('pointerlockchange', updateCursor);
    document.addEventListener('pointerlockerror', updateCursor);
    updateCursor();
});

static int translate_key(SDL_Keycode key)
{
    switch (key)
    {
        // Keep the original arrow-key behavior: left/right rotate,
        // up/down move forward/backward.
        case SDLK_LEFT:      return KEY_LEFTARROW;
        case SDLK_RIGHT:     return KEY_RIGHTARROW;
        case SDLK_UP:        return KEY_UPARROW;
        case SDLK_DOWN:      return KEY_DOWNARROW;
        case SDLK_ESCAPE:    return KEY_ESCAPE;
        case SDLK_RETURN:    return KEY_ENTER;
        case SDLK_TAB:       return KEY_TAB;
        case SDLK_F1:        return KEY_F1;
        case SDLK_F2:        return KEY_F2;
        case SDLK_F3:        return KEY_F3;
        case SDLK_F4:        return KEY_F4;
        case SDLK_F5:        return KEY_F5;
        case SDLK_F6:        return KEY_F6;
        case SDLK_F7:        return KEY_F7;
        case SDLK_F8:        return KEY_F8;
        case SDLK_F9:        return KEY_F9;
        case SDLK_F10:       return KEY_F10;
        case SDLK_F11:       return KEY_F11;
        case SDLK_F12:       return KEY_F12;
        case SDLK_BACKSPACE:
        case SDLK_DELETE:    return KEY_BACKSPACE;
        case SDLK_PAUSE:     return KEY_PAUSE;
        case SDLK_EQUALS:
        case SDLK_KP_PLUS:   return KEY_EQUALS;
        case SDLK_MINUS:
        case SDLK_KP_MINUS:  return KEY_MINUS;
        case SDLK_LSHIFT:
        case SDLK_RSHIFT:    return KEY_RSHIFT;
        case SDLK_LCTRL:
        case SDLK_RCTRL:     return KEY_RCTRL;
        case SDLK_LALT:
        case SDLK_RALT:      return KEY_RALT;

        // Modern browser controls layered onto the original bindings.
        // LinuxDOOM already binds ',' and '.' to dedicated strafe-left/right,
        // so A/D can strafe without modifying G_BuildTiccmd.
        case SDLK_w:         return KEY_UPARROW;
        case SDLK_s:         return KEY_DOWNARROW;
        case SDLK_a:         return ',';
        case SDLK_d:         return '.';
        case SDLK_j:         return KEY_RCTRL;
        case SDLK_e:         return ' ';
        default:
            if (key >= 32 && key <= 126)
            {
                if (key >= 'A' && key <= 'Z')
                    key = key - 'A' + 'a';
                return (int)key;
            }
            return 0;
    }
}

static void post_key(int down, SDL_Keycode key)
{
    int doomkey = translate_key(key);
    event_t ev;

    if (!doomkey)
        return;

    ev.type = down ? ev_keydown : ev_keyup;
    ev.data1 = doomkey;
    ev.data2 = 0;
    ev.data3 = 0;
    D_PostEvent(&ev);
}

void I_InitGraphics(void)
{
    if (graphics_ready)
        return;

    if (SDL_InitSubSystem(SDL_INIT_VIDEO | SDL_INIT_EVENTS) < 0)
        I_Error("SDL video init failed: %s", SDL_GetError());

    web_window = SDL_CreateWindow("DOOM - direct LinuxDOOM web port",
                                  SDL_WINDOWPOS_CENTERED,
                                  SDL_WINDOWPOS_CENTERED,
                                  SCREENWIDTH * 3,
                                  SCREENHEIGHT * 3,
                                  SDL_WINDOW_SHOWN | SDL_WINDOW_RESIZABLE);
    if (!web_window)
        I_Error("SDL_CreateWindow failed: %s", SDL_GetError());

    web_renderer = SDL_CreateRenderer(web_window, -1,
                                     SDL_RENDERER_ACCELERATED |
                                     SDL_RENDERER_PRESENTVSYNC);
    if (!web_renderer)
        web_renderer = SDL_CreateRenderer(web_window, -1, 0);
    if (!web_renderer)
        I_Error("SDL_CreateRenderer failed: %s", SDL_GetError());

    SDL_RenderSetLogicalSize(web_renderer, SCREENWIDTH, SCREENHEIGHT);

    web_texture = SDL_CreateTexture(web_renderer,
                                    SDL_PIXELFORMAT_RGBA32,
                                    SDL_TEXTUREACCESS_STREAMING,
                                    SCREENWIDTH,
                                    SCREENHEIGHT);
    if (!web_texture)
        I_Error("SDL_CreateTexture failed: %s", SDL_GetError());

    memset(web_palette, 0, sizeof(web_palette));
    memset(web_rgba, 0, sizeof(web_rgba));
    web_install_pointer_lock();
    graphics_ready = 1;
}

void I_ShutdownGraphics(void)
{
    if (web_texture) SDL_DestroyTexture(web_texture);
    if (web_renderer) SDL_DestroyRenderer(web_renderer);
    if (web_window) SDL_DestroyWindow(web_window);
    web_texture = NULL;
    web_renderer = NULL;
    web_window = NULL;
    graphics_ready = 0;
}

void I_SetPalette(byte *palette)
{
    int i;
    for (i = 0; i < 256; ++i)
    {
        web_palette[i][0] = palette[i * 3 + 0];
        web_palette[i][1] = palette[i * 3 + 1];
        web_palette[i][2] = palette[i * 3 + 2];
        web_palette[i][3] = 255;
    }
}

void I_UpdateNoBlit(void)
{
}

void I_FinishUpdate(void)
{
    int i;
    byte *src;
    byte *dst;

    if (!graphics_ready || !screens[0])
        return;

    src = screens[0];
    dst = web_rgba;

    for (i = 0; i < SCREENWIDTH * SCREENHEIGHT; ++i)
    {
        const byte *c = web_palette[src[i]];
        dst[i * 4 + 0] = c[0];
        dst[i * 4 + 1] = c[1];
        dst[i * 4 + 2] = c[2];
        dst[i * 4 + 3] = 255;
    }

    SDL_UpdateTexture(web_texture, NULL, web_rgba, SCREENWIDTH * 4);
    SDL_RenderClear(web_renderer);
    SDL_RenderCopy(web_renderer, web_texture, NULL, NULL);
    SDL_RenderPresent(web_renderer);
}

void I_ReadScreen(byte *scr)
{
    memcpy(scr, screens[0], SCREENWIDTH * SCREENHEIGHT);
}

void I_StartFrame(void)
{
    // The 1997 D_DoomLoop remains untouched. Asyncify turns this platform
    // yield point into a browser-friendly continuation once per rendered frame.
    emscripten_sleep(0);
}

void I_StartTic(void)
{
    SDL_Event sdl;
    event_t ev;

    while (SDL_PollEvent(&sdl))
    {
        switch (sdl.type)
        {
            case SDL_KEYDOWN:
                if (!sdl.key.repeat) post_key(1, sdl.key.keysym.sym);
                break;
            case SDL_KEYUP:
                post_key(0, sdl.key.keysym.sym);
                break;
            case SDL_MOUSEBUTTONDOWN:
            case SDL_MOUSEBUTTONUP:
                if (sdl.button.button == SDL_BUTTON_LEFT)
                {
                    if (sdl.type == SDL_MOUSEBUTTONDOWN) mouse_buttons |= 1;
                    else mouse_buttons &= ~1;
                }
                if (sdl.button.button == SDL_BUTTON_RIGHT)
                {
                    if (sdl.type == SDL_MOUSEBUTTONDOWN) mouse_buttons |= 2;
                    else mouse_buttons &= ~2;
                }
                if (sdl.button.button == SDL_BUTTON_MIDDLE)
                {
                    if (sdl.type == SDL_MOUSEBUTTONDOWN) mouse_buttons |= 4;
                    else mouse_buttons &= ~4;
                }
                ev.type = ev_mouse;
                ev.data1 = mouse_buttons;
                ev.data2 = 0;
                ev.data3 = 0;
                D_PostEvent(&ev);
                break;
            case SDL_MOUSEMOTION:
                ev.type = ev_mouse;
                ev.data1 = mouse_buttons;

                // The previous browser adapter multiplied horizontal motion by
                // four.  Use eight for roughly 2x turn sensitivity while still
                // passing through LinuxDOOM's own mouseSensitivity scaling.
                ev.data2 = sdl.motion.xrel * 8;

                // Vanilla DOOM maps mouse Y to forward/back movement.  For a
                // modern WASD + pointer-lock scheme, ignore vertical mouse
                // movement instead of allowing accidental forward/back motion.
                ev.data3 = 0;
                D_PostEvent(&ev);
                break;
            case SDL_QUIT:
                I_Quit();
                break;
            default:
                break;
        }
    }
}
