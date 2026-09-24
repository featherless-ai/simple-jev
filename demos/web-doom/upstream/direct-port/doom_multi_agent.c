// P2.2 deterministic multi-player input controller for the direct LinuxDOOM port.
//
// Each local player slot owns an independent bounded ticcmd override. The
// console-player API from P1.3 is preserved for backwards compatibility.
// P2.2 uses this with i_net_localbots.c: one network node, up to four local
// player_t slots, and no remote transport.

#include "doomdef.h"
#include "doomstat.h"
#include "d_ticcmd.h"
#include "d_event.h"
#include "d_player.h"
#include "p_local.h"
#include "p_mobj.h"

#include <emscripten/emscripten.h>

#include <math.h>
#include <stdio.h>
#include <string.h>

#define DOOMCTL_AGENT_MAX_TICS 350
#define DOOMCTL_AGENT_BUFSIZE 4096
#define DOOMCTL_PLAYERS_BUFSIZE 16384

typedef struct
{
    int remaining;
    int forward_pct;
    int strafe_pct;
    int turn_pct;
    int attack;
    int use;
    int weapon_change;   // 0: none; otherwise weapontype_t + 1, sent as BT_CHANGE until a world tic ran
    int episode;
    int map;
    int executed;
} doomctl_player_agent_t;

static doomctl_player_agent_t doomctl_agents[MAXPLAYERS];
static char doomctl_agent_buffer[DOOMCTL_AGENT_BUFSIZE];
static char doomctl_players_buffer[DOOMCTL_PLAYERS_BUFSIZE];

static int doomctl_clamp_pct(int value)
{
    if (value < -100)
        return -100;
    if (value > 100)
        return 100;
    return value;
}

static int doomctl_valid_player(int player)
{
    return player >= 0 && player < MAXPLAYERS && playeringame[player];
}

static void doomctl_clear_player_agent(int player)
{
    doomctl_player_agent_t *agent;
    if (player < 0 || player >= MAXPLAYERS)
        return;
    agent = &doomctl_agents[player];
    memset(agent, 0, sizeof(*agent));
    agent->episode = -1;
    agent->map = -1;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_queue_player_input(int player, int forward_pct, int strafe_pct,
                               int turn_pct, int attack, int use, int tics)
{
    doomctl_player_agent_t *agent;

    if (gamestate != GS_LEVEL)
        return -1;
    if (!doomctl_valid_player(player) || !players[player].mo)
        return -2;
    if (tics < 1 || tics > DOOMCTL_AGENT_MAX_TICS)
        return -3;

    agent = &doomctl_agents[player];
    agent->forward_pct = doomctl_clamp_pct(forward_pct);
    agent->strafe_pct = doomctl_clamp_pct(strafe_pct);
    agent->turn_pct = doomctl_clamp_pct(turn_pct);
    agent->attack = attack ? 1 : 0;
    agent->use = use ? 1 : 0;
    agent->remaining = tics;
    agent->episode = gameepisode;
    agent->map = gamemap;
    agent->executed = 0;
    return agent->remaining;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_queue_agent_input(int forward_pct, int strafe_pct, int turn_pct,
                              int attack, int use, int tics)
{
    return doomctl_queue_player_input(consoleplayer, forward_pct, strafe_pct,
                                      turn_pct, attack, use, tics);
}

// Weapon selection for a queued input: the same BT_CHANGE the keyboard's
// number keys produce, so P_PlayerThink applies its own rules (the weapon
// must be owned; the switch takes the usual lower/raise time). `weapon` is
// a weapontype_t (0 fist .. 8 super shotgun). The change bits ride on every
// ticcmd until one world tic has run with them, then clear, so a pause
// between steps cannot swallow the press. Call after queueing the input.
EMSCRIPTEN_KEEPALIVE
int doomctl_queue_player_weapon(int player, int weapon)
{
    doomctl_player_agent_t *agent;
    if (gamestate != GS_LEVEL)
        return -1;
    if (!doomctl_valid_player(player) || !players[player].mo)
        return -2;
    if (weapon < 0 || weapon >= NUMWEAPONS)
        return -3;
    agent = &doomctl_agents[player];
    if (agent->remaining <= 0)
        return -4;
    agent->weapon_change = weapon + 1;
    return weapon;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_queue_agent_weapon(int weapon)
{
    return doomctl_queue_player_weapon(consoleplayer, weapon);
}

EMSCRIPTEN_KEEPALIVE
int doomctl_cancel_player_input(int player)
{
    int active;
    if (player < 0 || player >= MAXPLAYERS)
        return -1;
    active = doomctl_agents[player].remaining > 0;
    doomctl_clear_player_agent(player);
    return active;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_cancel_agent_input(void)
{
    return doomctl_cancel_player_input(consoleplayer);
}

void doomctl_apply_player_agent_ticcmd(int player, ticcmd_t *cmd)
{
    doomctl_player_agent_t *agent;
    int buttons;

    if (!cmd || player < 0 || player >= MAXPLAYERS)
        return;
    agent = &doomctl_agents[player];
    if (agent->remaining <= 0)
        return;
    if (gamestate != GS_LEVEL || gameepisode != agent->episode || gamemap != agent->map)
    {
        doomctl_clear_player_agent(player);
        return;
    }
    if (!doomctl_valid_player(player) || !players[player].mo)
    {
        doomctl_clear_player_agent(player);
        return;
    }

    // Preserve the original LinuxDOOM movement envelope.
    if (players[player].playerstate == PST_LIVE)
    {
        cmd->forwardmove = (char)((agent->forward_pct * 50) / 100);
        cmd->sidemove = (char)((agent->strafe_pct * 40) / 100);
        // LinuxDOOM subtracts angleturn for a right turn. +turn here is intuitive right.
        cmd->angleturn = (short)(-(agent->turn_pct * 1280) / 100);
    }
    else
    {
        cmd->forwardmove = 0;
        cmd->sidemove = 0;
        cmd->angleturn = 0;
    }
    cmd->chatchar = 0;

    buttons = 0;
    if (agent->attack)
        buttons |= BT_ATTACK;
    if (agent->use)
        buttons |= BT_USE;
    if (agent->weapon_change > 0 && agent->executed == 0)
        buttons |= BT_CHANGE | (((agent->weapon_change - 1) << BT_WEAPONSHIFT) & BT_WEAPONMASK);
    cmd->buttons = (byte)buttons;
}

// Legacy console-player hook retained for the existing P1.3/P1.4 harness.
void doomctl_apply_agent_ticcmd(ticcmd_t *cmd)
{
    doomctl_apply_player_agent_ticcmd(consoleplayer, cmd);
}

void doomctl_agent_after_world_tic(void)
{
    int player;
    for (player = 0; player < MAXPLAYERS; player++)
    {
        doomctl_player_agent_t *agent = &doomctl_agents[player];
        if (agent->remaining <= 0)
            continue;
        agent->remaining--;
        agent->executed++;
        agent->weapon_change = 0;   // the change bits were on the ticcmd of the tic that just ran
        if (agent->remaining <= 0)
            doomctl_clear_player_agent(player);
    }
}

static double doomctl_angle_degrees(angle_t angle)
{
    return ((double)((unsigned int)angle)) * (360.0 / 4294967296.0);
}

static double doomctl_normalize_delta(double value)
{
    while (value > 180.0)
        value -= 360.0;
    while (value < -180.0)
        value += 360.0;
    return value;
}

static int doomctl_total_frags(int player)
{
    int i;
    int total = 0;
    for (i = 0; i < MAXPLAYERS; i++)
        total += players[player].frags[i];
    return total;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_player_input_status_json(int player)
{
    doomctl_player_agent_t *agent;
    if (player < 0 || player >= MAXPLAYERS)
    {
        snprintf(doomctl_agent_buffer, sizeof(doomctl_agent_buffer),
                 "{\"ok\":false,\"error\":\"invalid_player\"}");
        return doomctl_agent_buffer;
    }
    agent = &doomctl_agents[player];
    snprintf(doomctl_agent_buffer, sizeof(doomctl_agent_buffer),
        "{\"ok\":true,\"player\":%d,\"active\":%s,\"remainingTics\":%d,"
        "\"executedTics\":%d,\"forward\":%.2f,\"strafe\":%.2f,"
        "\"turn\":%.2f,\"attack\":%s,\"use\":%s}",
        player,
        agent->remaining > 0 ? "true" : "false",
        agent->remaining,
        agent->executed,
        agent->forward_pct / 100.0,
        agent->strafe_pct / 100.0,
        agent->turn_pct / 100.0,
        agent->attack ? "true" : "false",
        agent->use ? "true" : "false");
    return doomctl_agent_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_agent_input_status_json(void)
{
    return doomctl_get_player_input_status_json(consoleplayer);
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_players_json(void)
{
    int player;
    int first = 1;
    int used = 0;

    used += snprintf(doomctl_players_buffer + used, sizeof(doomctl_players_buffer) - used,
                     "{\"ready\":%s,\"episode\":%d,\"map\":%d,\"gametic\":%d,\"players\":[",
                     gamestate == GS_LEVEL ? "true" : "false", gameepisode, gamemap, gametic);

    for (player = 0; player < MAXPLAYERS && used < (int)sizeof(doomctl_players_buffer) - 512; player++)
    {
        player_t *p;
        int x = 0, y = 0, z = 0;
        double angle = 0.0;
        if (!playeringame[player])
            continue;
        p = &players[player];
        if (p->mo)
        {
            x = p->mo->x >> FRACBITS;
            y = p->mo->y >> FRACBITS;
            z = p->mo->z >> FRACBITS;
            angle = doomctl_angle_degrees(p->mo->angle);
        }
        if (!first)
            used += snprintf(doomctl_players_buffer + used, sizeof(doomctl_players_buffer) - used, ",");
        first = 0;
        used += snprintf(doomctl_players_buffer + used, sizeof(doomctl_players_buffer) - used,
            "{\"player\":%d,\"console\":%s,\"live\":%s,\"state\":%d,"
            "\"x\":%d,\"y\":%d,\"z\":%d,\"angle\":%.3f,"
            "\"health\":%d,\"armor\":%d,\"readyWeapon\":%d,\"frags\":%d,"
            "\"inputRemaining\":%d}",
            player,
            player == consoleplayer ? "true" : "false",
            (p->playerstate == PST_LIVE && p->mo != NULL) ? "true" : "false",
            (int)p->playerstate,
            x, y, z, angle,
            p->health, p->armorpoints, (int)p->readyweapon, doomctl_total_frags(player),
            doomctl_agents[player].remaining);
    }

    snprintf(doomctl_players_buffer + used, sizeof(doomctl_players_buffer) - used, "]}");
    return doomctl_players_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_player_perception_json(int player)
{
    player_t *self;
    int other;
    int best = -1;
    int best_visible = 0;
    double best_distance = 1.0e30;
    int sx = 0, sy = 0, tx = 0, ty = 0;
    double self_angle = 0.0;
    double desired = 0.0;
    double delta = 0.0;

    if (!doomctl_valid_player(player) || !players[player].mo)
    {
        snprintf(doomctl_agent_buffer, sizeof(doomctl_agent_buffer),
                 "{\"ok\":false,\"player\":%d,\"error\":\"player_not_ready\"}", player);
        return doomctl_agent_buffer;
    }

    self = &players[player];
    sx = self->mo->x >> FRACBITS;
    sy = self->mo->y >> FRACBITS;
    self_angle = doomctl_angle_degrees(self->mo->angle);

    for (other = 0; other < MAXPLAYERS; other++)
    {
        player_t *target;
        int ox, oy;
        double dx, dy, distance;
        int visible;
        if (other == player || !doomctl_valid_player(other))
            continue;
        target = &players[other];
        if (!target->mo || target->playerstate != PST_LIVE)
            continue;
        ox = target->mo->x >> FRACBITS;
        oy = target->mo->y >> FRACBITS;
        dx = (double)(ox - sx);
        dy = (double)(oy - sy);
        distance = sqrt(dx * dx + dy * dy);
        visible = P_CheckSight(self->mo, target->mo) ? 1 : 0;

        // Prefer a visible opponent; within the same visibility class choose nearest.
        if (best < 0 || (visible && !best_visible) || (visible == best_visible && distance < best_distance))
        {
            best = other;
            best_visible = visible;
            best_distance = distance;
            tx = ox;
            ty = oy;
        }
    }

    if (best >= 0)
    {
        desired = atan2((double)(ty - sy), (double)(tx - sx)) * 180.0 / 3.14159265358979323846;
        if (desired < 0.0)
            desired += 360.0;
        delta = doomctl_normalize_delta(desired - self_angle);
    }

    snprintf(doomctl_agent_buffer, sizeof(doomctl_agent_buffer),
        "{\"ok\":true,\"player\":%d,\"live\":%s,\"x\":%d,\"y\":%d,"
        "\"angle\":%.3f,\"health\":%d,\"target\":%s,"
        "\"targetPlayer\":%d,\"targetX\":%d,\"targetY\":%d,"
        "\"visible\":%s,\"distance\":%.3f,\"desiredAngle\":%.3f,\"angleDelta\":%.3f}",
        player,
        self->playerstate == PST_LIVE ? "true" : "false",
        sx, sy, self_angle, self->health,
        best >= 0 ? "true" : "false",
        best, tx, ty,
        best_visible ? "true" : "false",
        best >= 0 ? best_distance : -1.0,
        best >= 0 ? desired : 0.0,
        best >= 0 ? delta : 0.0);
    return doomctl_agent_buffer;
}
