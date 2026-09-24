// Live-only cheat and audio helpers for the direct LinuxDOOM browser port.
//
// These controls deliberately mutate only the running game session. They are
// never recorded in the authoring ChangeSet and never serialized into PWADs.

#include "doomdef.h"
#include "doomstat.h"
#include "d_player.h"
#include "g_game.h"
#include "p_inter.h"

#include <SDL.h>
#include <SDL_mixer.h>
#include <emscripten/emscripten.h>
#include <stdio.h>
#include <string.h>

#define CHEAT_JSON_SIZE 4096

static char cheat_json[CHEAT_JSON_SIZE];

static player_t *doomctl_player(void)
{
    if (consoleplayer < 0 || consoleplayer >= MAXPLAYERS)
        return 0;
    return &players[consoleplayer];
}

static int doomctl_map_is_valid(int episode, int map)
{
    if (map < 1)
        return 0;

    if (gamemode == shareware)
        return episode == 1 && map <= 9;
    if (gamemode == registered)
        return episode >= 1 && episode <= 3 && map <= 9;
    if (gamemode == retail)
        return episode >= 1 && episode <= 4 && map <= 9;
    if (gamemode == commercial)
        return episode == 1 && map <= 34;

    return episode >= 1 && episode <= 4 && map <= 9;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_cheat_status_json(void)
{
    player_t *p = doomctl_player();
    int i;
    int keys = 0;
    int weapons = 0;

    if (!p)
    {
        snprintf(cheat_json, sizeof(cheat_json), "{\"ready\":false}");
        return cheat_json;
    }

    for (i = 0; i < NUMCARDS; ++i)
        if (p->cards[i]) ++keys;
    for (i = 0; i < NUMWEAPONS; ++i)
        if (p->weaponowned[i]) ++weapons;

    snprintf(cheat_json, sizeof(cheat_json),
        "{\"ready\":true,\"episode\":%d,\"map\":%d,"
        "\"health\":%d,\"armor\":%d,\"armorType\":%d,"
        "\"godMode\":%s,\"noclip\":%s,\"keys\":%d,\"weapons\":%d,"
        "\"ammo\":{\"bullets\":%d,\"shells\":%d,\"cells\":%d,\"rockets\":%d},"
        "\"powers\":{\"invulnerability\":%d,\"berserk\":%d,\"invisibility\":%d,"
        "\"radiation\":%d,\"allmap\":%d,\"lightamp\":%d}}",
        gameepisode, gamemap,
        p->health, p->armorpoints, p->armortype,
        (p->cheats & CF_GODMODE) ? "true" : "false",
        (p->cheats & CF_NOCLIP) ? "true" : "false",
        keys, weapons,
        p->ammo[am_clip], p->ammo[am_shell], p->ammo[am_cell], p->ammo[am_misl],
        p->powers[pw_invulnerability], p->powers[pw_strength], p->powers[pw_invisibility],
        p->powers[pw_ironfeet], p->powers[pw_allmap], p->powers[pw_infrared]);
    return cheat_json;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_set_god_mode(int enabled)
{
    player_t *p = doomctl_player();
    if (!p) return -1;

    if (enabled)
    {
        p->cheats |= CF_GODMODE;
        if (p->health < 100) p->health = 100;
        if (p->mo && p->mo->health < 100) p->mo->health = 100;
    }
    else
    {
        p->cheats &= ~CF_GODMODE;
    }
    return (p->cheats & CF_GODMODE) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_set_noclip(int enabled)
{
    player_t *p = doomctl_player();
    if (!p) return -1;
    if (enabled) p->cheats |= CF_NOCLIP;
    else p->cheats &= ~CF_NOCLIP;
    return (p->cheats & CF_NOCLIP) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_give_arsenal(int include_keys)
{
    player_t *p = doomctl_player();
    int i;
    if (!p) return -1;

    p->armorpoints = 200;
    p->armortype = 2;
    for (i = 0; i < NUMWEAPONS; ++i)
        p->weaponowned[i] = true;
    for (i = 0; i < NUMAMMO; ++i)
        p->ammo[i] = p->maxammo[i];
    if (include_keys)
        for (i = 0; i < NUMCARDS; ++i)
            p->cards[i] = true;
    return 1;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_give_keys(void)
{
    player_t *p = doomctl_player();
    int i;
    if (!p) return -1;
    for (i = 0; i < NUMCARDS; ++i)
        p->cards[i] = true;
    return NUMCARDS;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_set_health_armor(int health, int armor, int armor_type)
{
    player_t *p = doomctl_player();
    if (!p) return -1;

    if (health < 1) health = 1;
    if (health > 200) health = 200;
    if (armor < 0) armor = 0;
    if (armor > 200) armor = 200;
    if (armor_type < 0) armor_type = 0;
    if (armor_type > 2) armor_type = 2;

    p->health = health;
    if (p->mo) p->mo->health = health;
    p->armorpoints = armor;
    p->armortype = armor_type;
    return health;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_give_powerup(const char *name)
{
    player_t *p = doomctl_player();
    int power = -1;
    if (!p || !name) return -1;

    if (!strcmp(name, "invulnerability")) power = pw_invulnerability;
    else if (!strcmp(name, "berserk")) power = pw_strength;
    else if (!strcmp(name, "invisibility")) power = pw_invisibility;
    else if (!strcmp(name, "radiation")) power = pw_ironfeet;
    else if (!strcmp(name, "allmap")) power = pw_allmap;
    else if (!strcmp(name, "lightamp")) power = pw_infrared;
    else return -2;

    P_GivePower(p, power);
    return p->powers[power];
}

EMSCRIPTEN_KEEPALIVE
int doomctl_warp(int episode, int map)
{
    if (!doomctl_map_is_valid(episode, map))
        return 0;

    G_InitNew(gameskill, episode, map);
    return 1;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_audio_resume(void)
{
    int frequency;
    int channels;
    Uint16 format;

    if (!(SDL_WasInit(SDL_INIT_AUDIO) & SDL_INIT_AUDIO))
        return 0;
    if (!Mix_QuerySpec(&frequency, &format, &channels))
        return 0;

    SDL_PauseAudio(0);
    Mix_Resume(-1);
    return 1;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_audio_status_json(void)
{
    int frequency = 0;
    int channels = 0;
    Uint16 format = 0;
    int sdl_ready = (SDL_WasInit(SDL_INIT_AUDIO) & SDL_INIT_AUDIO) ? 1 : 0;
    int mixer_ready = Mix_QuerySpec(&frequency, &format, &channels) ? 1 : 0;

    snprintf(cheat_json, sizeof(cheat_json),
        "{\"sdlAudio\":%s,\"mixerOpen\":%s,\"frequency\":%d,\"channels\":%d,\"format\":%u}",
        sdl_ready ? "true" : "false",
        mixer_ready ? "true" : "false",
        frequency, channels, (unsigned int)format);
    return cheat_json;
}
