// Deterministic AI input controller for the direct LinuxDOOM browser port.
//
// The controller overrides only the console player's ticcmd at G_Ticker time.
// Input lifetime is counted by actual P_Ticker world updates, not browser
// frames or pre-built netcmds, so it composes with the v0.7 exact-step gate.

#include "doomdef.h"
#include "doomstat.h"
#include "d_event.h"
#include "d_ticcmd.h"
#include "d_player.h"

#include <emscripten/emscripten.h>

#include <stdio.h>

#define DOOMCTL_AGENT_MAX_TICS 350
#define DOOMCTL_AGENT_BUFSIZE 1024

static int doomctl_agent_remaining = 0;
static int doomctl_agent_forward_pct = 0;
static int doomctl_agent_strafe_pct = 0;
static int doomctl_agent_turn_pct = 0;
static int doomctl_agent_attack = 0;
static int doomctl_agent_use = 0;
static int doomctl_agent_weapon_change = 0; // 0: none; otherwise weapontype_t + 1
static int doomctl_agent_episode = -1;
static int doomctl_agent_map = -1;
static int doomctl_agent_executed = 0;
static char doomctl_agent_buffer[DOOMCTL_AGENT_BUFSIZE];

static int doomctl_clamp_pct(int value)
{
    if (value < -100)
        return -100;
    if (value > 100)
        return 100;
    return value;
}

static void doomctl_clear_agent_internal(void)
{
    doomctl_agent_remaining = 0;
    doomctl_agent_forward_pct = 0;
    doomctl_agent_strafe_pct = 0;
    doomctl_agent_turn_pct = 0;
    doomctl_agent_attack = 0;
    doomctl_agent_use = 0;
    doomctl_agent_weapon_change = 0;
    doomctl_agent_episode = -1;
    doomctl_agent_map = -1;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_queue_agent_input(int forward_pct, int strafe_pct, int turn_pct,
                              int attack, int use, int tics)
{
    if (gamestate != GS_LEVEL || !players[consoleplayer].mo)
        return -1;
    if (tics < 1 || tics > DOOMCTL_AGENT_MAX_TICS)
        return -2;
    if (players[consoleplayer].playerstate != PST_LIVE)
        return -3;

    doomctl_agent_forward_pct = doomctl_clamp_pct(forward_pct);
    doomctl_agent_strafe_pct = doomctl_clamp_pct(strafe_pct);
    doomctl_agent_turn_pct = doomctl_clamp_pct(turn_pct);
    doomctl_agent_attack = attack ? 1 : 0;
    doomctl_agent_use = use ? 1 : 0;
    doomctl_agent_remaining = tics;
    doomctl_agent_episode = gameepisode;
    doomctl_agent_map = gamemap;
    doomctl_agent_executed = 0;
    return doomctl_agent_remaining;
}

// Weapon selection for the queued input: the keyboard's BT_CHANGE, applied by
// P_PlayerThink with its own rules (owned weapons only, normal switch time).
// `weapon` is a weapontype_t (0 fist .. 8 super shotgun). The bits ride on
// every ticcmd until one world tic has run, so a pause cannot swallow them.
EMSCRIPTEN_KEEPALIVE
int doomctl_queue_agent_weapon(int weapon)
{
    if (gamestate != GS_LEVEL || !players[consoleplayer].mo)
        return -1;
    if (weapon < 0 || weapon >= NUMWEAPONS)
        return -3;
    if (doomctl_agent_remaining <= 0)
        return -4;
    doomctl_agent_weapon_change = weapon + 1;
    return weapon;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_cancel_agent_input(void)
{
    int had_input;
    had_input = doomctl_agent_remaining > 0;
    doomctl_clear_agent_internal();
    return had_input;
}

// Called from the build-patched original G_Ticker() after the console player's
// net/demo command has been selected, immediately before gameplay consumes it.
void doomctl_apply_agent_ticcmd(ticcmd_t *cmd)
{
    int buttons;

    if (!cmd || doomctl_agent_remaining <= 0)
        return;
    if (gamestate != GS_LEVEL || gameepisode != doomctl_agent_episode
        || gamemap != doomctl_agent_map)
    {
        doomctl_clear_agent_internal();
        return;
    }
    if (!players[consoleplayer].mo || players[consoleplayer].playerstate != PST_LIVE)
    {
        doomctl_clear_agent_internal();
        return;
    }

    // Keep the original DOOM movement envelope: fast forward is 50 units in
    // ticcmd space, fast strafe is 40, and fast keyboard turn is 1280.
    cmd->forwardmove = (char)((doomctl_agent_forward_pct * 50) / 100);
    cmd->sidemove = (char)((doomctl_agent_strafe_pct * 40) / 100);

    // DOOM subtracts angleturn for a right turn; expose +turn as intuitive right.
    cmd->angleturn = (short)(-(doomctl_agent_turn_pct * 1280) / 100);
    cmd->chatchar = 0;

    // This is an autonomous override for movement/action bits. Never synthesize
    // BT_SPECIAL, save or pause commands here; a weapon change is a gameplay
    // input and goes through the same BT_CHANGE the keyboard uses.
    buttons = 0;
    if (doomctl_agent_attack)
        buttons |= BT_ATTACK;
    if (doomctl_agent_use)
        buttons |= BT_USE;
    if (doomctl_agent_weapon_change > 0 && doomctl_agent_executed == 0)
        buttons |= BT_CHANGE | (((doomctl_agent_weapon_change - 1) << BT_WEAPONSHIFT) & BT_WEAPONMASK);
    cmd->buttons = (byte)buttons;
}

// Called only after P_Ticker actually executes a world update. Paused browser
// frames therefore do not consume agent input lifetime.
void doomctl_agent_after_world_tic(void)
{
    if (doomctl_agent_remaining <= 0)
        return;

    doomctl_agent_remaining--;
    doomctl_agent_executed++;
    doomctl_agent_weapon_change = 0; // the change bits were on the ticcmd of the tic that just ran

    if (doomctl_agent_remaining <= 0)
        doomctl_clear_agent_internal();
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_agent_input_status_json(void)
{
    snprintf(doomctl_agent_buffer, sizeof(doomctl_agent_buffer),
        "{\"active\":%s,\"remainingTics\":%d,\"executedTics\":%d,"
        "\"forward\":%.2f,\"strafe\":%.2f,\"turn\":%.2f,"
        "\"attack\":%s,\"use\":%s,\"episode\":%d,\"map\":%d}",
        doomctl_agent_remaining > 0 ? "true" : "false",
        doomctl_agent_remaining,
        doomctl_agent_executed,
        doomctl_agent_forward_pct / 100.0,
        doomctl_agent_strafe_pct / 100.0,
        doomctl_agent_turn_pct / 100.0,
        doomctl_agent_attack ? "true" : "false",
        doomctl_agent_use ? "true" : "false",
        gameepisode, gamemap);
    return doomctl_agent_buffer;
}
