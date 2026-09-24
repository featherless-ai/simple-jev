// AI playtest instrumentation for the direct LinuxDOOM browser port.
//
// This module does not change level content. It adds a bounded authoring-time
// execution controller and telemetry recorder so MCP clients can pause the
// world, advance exact P_Ticker world tics, and evaluate a playtest run.

#include "doomdef.h"
#include "doomstat.h"
#include "d_player.h"
#include "p_local.h"
#include "s_sound.h"

#include <emscripten/emscripten.h>

#include <stdio.h>
#include <string.h>

#define DOOMCTL_MAX_STEP_BUDGET 350
#define DOOMCTL_MAX_TRACKED_SECTORS 4096
#define DOOMCTL_PLAYTEST_BUFSIZE 8192

extern int leveltime;
extern void doomctl_agent_after_world_tic(void);

static char doomctl_playtest_buffer[DOOMCTL_PLAYTEST_BUFSIZE];
static int doomctl_step_budget = 0;
static int doomctl_metrics_episode = -1;
static int doomctl_metrics_map = -1;
static int doomctl_metrics_started = 0;
static int doomctl_world_tics = 0;
static int doomctl_start_leveltime = 0;
static int doomctl_start_kills = 0;
static int doomctl_start_items = 0;
static int doomctl_start_secrets = 0;
static int doomctl_min_health = 0;
static int doomctl_damage_taken = 0;
static int doomctl_health_gained = 0;
static int doomctl_deaths = 0;
static int doomctl_distance_units = 0;
static int doomctl_prev_health = 0;
static fixed_t doomctl_prev_x = 0;
static fixed_t doomctl_prev_y = 0;
static playerstate_t doomctl_prev_state = PST_LIVE;
static unsigned char doomctl_seen_sectors[DOOMCTL_MAX_TRACKED_SECTORS];
static int doomctl_seen_sector_count = 0;

static player_t *doomctl_playtest_player(void)
{
    if (consoleplayer < 0 || consoleplayer >= MAXPLAYERS)
        return NULL;
    if (!playeringame[consoleplayer] || gamestate != GS_LEVEL)
        return NULL;
    if (players[consoleplayer].mo == NULL)
        return NULL;
    return &players[consoleplayer];
}

static int doomctl_current_sector(player_t *player)
{
    sector_t *sector;
    if (player == NULL || player->mo == NULL || player->mo->subsector == NULL)
        return -1;
    sector = player->mo->subsector->sector;
    if (sector == NULL || sector < sectors || sector >= sectors + numsectors)
        return -1;
    return (int) (sector - sectors);
}

static void doomctl_mark_sector(player_t *player)
{
    int index;
    index = doomctl_current_sector(player);
    if (index < 0 || index >= DOOMCTL_MAX_TRACKED_SECTORS)
        return;
    if (!doomctl_seen_sectors[index])
    {
        doomctl_seen_sectors[index] = 1;
        ++doomctl_seen_sector_count;
    }
}

void doomctl_reset_playtest_telemetry(void)
{
    player_t *player;

    player = doomctl_playtest_player();
    doomctl_step_budget = 0;
    doomctl_metrics_episode = gameepisode;
    doomctl_metrics_map = gamemap;
    doomctl_world_tics = 0;
    doomctl_start_leveltime = leveltime;
    doomctl_seen_sector_count = 0;
    memset(doomctl_seen_sectors, 0, sizeof(doomctl_seen_sectors));
    doomctl_damage_taken = 0;
    doomctl_health_gained = 0;
    doomctl_deaths = 0;
    doomctl_distance_units = 0;

    if (player == NULL)
    {
        doomctl_metrics_started = 0;
        doomctl_start_kills = 0;
        doomctl_start_items = 0;
        doomctl_start_secrets = 0;
        doomctl_min_health = 0;
        doomctl_prev_health = 0;
        doomctl_prev_x = 0;
        doomctl_prev_y = 0;
        doomctl_prev_state = PST_LIVE;
        return;
    }

    doomctl_metrics_started = 1;
    doomctl_start_kills = player->killcount;
    doomctl_start_items = player->itemcount;
    doomctl_start_secrets = player->secretcount;
    doomctl_min_health = player->health;
    doomctl_prev_health = player->health;
    doomctl_prev_x = player->mo->x;
    doomctl_prev_y = player->mo->y;
    doomctl_prev_state = player->playerstate;
    doomctl_mark_sector(player);
}

static void doomctl_ensure_playtest_map(void)
{
    if (!doomctl_metrics_started
     || doomctl_metrics_episode != gameepisode
     || doomctl_metrics_map != gamemap)
        doomctl_reset_playtest_telemetry();
}

// Called by the build-patched P_Ticker pause gate. Returning true permits one
// otherwise-paused world tic and consumes exactly one requested step.
int doomctl_consume_world_step(void)
{
    if (!paused || doomctl_step_budget <= 0)
        return 0;
    --doomctl_step_budget;
    return 1;
}

// Called at the end of each P_Ticker world update, including explicit steps.
void doomctl_playtest_after_world_tic(void)
{
    player_t *player;
    fixed_t moved;

    player = doomctl_playtest_player();
    if (player == NULL)
        return;

    doomctl_ensure_playtest_map();
    ++doomctl_world_tics;

    if (player->health < doomctl_prev_health)
        doomctl_damage_taken += doomctl_prev_health - player->health;
    else if (player->health > doomctl_prev_health)
        doomctl_health_gained += player->health - doomctl_prev_health;

    if (player->health < doomctl_min_health)
        doomctl_min_health = player->health;

    if (doomctl_prev_state != PST_DEAD && player->playerstate == PST_DEAD)
        ++doomctl_deaths;

    moved = P_AproxDistance(player->mo->x - doomctl_prev_x,
                            player->mo->y - doomctl_prev_y);
    if (moved > 0)
        doomctl_distance_units += (int) (moved / FRACUNIT);

    doomctl_prev_health = player->health;
    doomctl_prev_x = player->mo->x;
    doomctl_prev_y = player->mo->y;
    doomctl_prev_state = player->playerstate;
    doomctl_mark_sector(player);

    // Agent input lifetime is tied to actual world simulation, not to browser
    // frames or G_Ticker calls that are stopped by the pause gate.
    doomctl_agent_after_world_tic();
}

EMSCRIPTEN_KEEPALIVE
int doomctl_set_playtest_paused(int should_pause)
{
    int requested;

    requested = should_pause ? 1 : 0;
    if (gamestate != GS_LEVEL)
        return -1;

    if (requested && !paused)
    {
        paused = true;
        S_PauseSound();
    }
    else if (!requested && paused)
    {
        paused = false;
        doomctl_step_budget = 0;
        S_ResumeSound();
    }

    return paused ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_step_playtest_tics(int count)
{
    if (gamestate != GS_LEVEL)
        return -1;
    if (!paused)
        return -2;
    if (count < 1 || count > DOOMCTL_MAX_STEP_BUDGET)
        return -3;
    if (doomctl_step_budget + count > DOOMCTL_MAX_STEP_BUDGET)
        return -4;

    doomctl_step_budget += count;
    return doomctl_step_budget;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_reset_playtest_metrics(void)
{
    if (gamestate != GS_LEVEL)
        return -1;
    doomctl_reset_playtest_telemetry();
    return 1;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_playtest_telemetry_json(void)
{
    player_t *player;
    int sector_index;
    int elapsed_level_tics;

    player = doomctl_playtest_player();
    doomctl_playtest_buffer[0] = '\0';
    if (player == NULL)
    {
        snprintf(doomctl_playtest_buffer, sizeof(doomctl_playtest_buffer),
                 "{\"ready\":false,\"error\":\"game_not_ready\"}");
        return doomctl_playtest_buffer;
    }

    doomctl_ensure_playtest_map();
    sector_index = doomctl_current_sector(player);
    elapsed_level_tics = leveltime - doomctl_start_leveltime;

    snprintf(doomctl_playtest_buffer, sizeof(doomctl_playtest_buffer),
        "{\"ready\":true,\"episode\":%d,\"map\":%d,"
        "\"paused\":%s,\"stepBudget\":%d,\"worldTics\":%d,"
        "\"elapsedLevelTics\":%d,\"elapsedSeconds\":%.3f,"
        "\"currentSector\":%d,\"visitedSectors\":%d,\"sectorCount\":%d,"
        "\"distanceUnits\":%d,\"health\":%d,\"minHealth\":%d,"
        "\"damageTaken\":%d,\"healthGained\":%d,\"deaths\":%d,"
        "\"kills\":%d,\"killDelta\":%d,\"items\":%d,\"itemDelta\":%d,"
        "\"secrets\":%d,\"secretDelta\":%d,\"armor\":%d,"
        "\"ammo\":{\"bullets\":%d,\"shells\":%d,\"cells\":%d,\"rockets\":%d}}",
        gameepisode, gamemap,
        paused ? "true" : "false", doomctl_step_budget, doomctl_world_tics,
        elapsed_level_tics, (double) elapsed_level_tics / 35.0,
        sector_index, doomctl_seen_sector_count, numsectors,
        doomctl_distance_units, player->health, doomctl_min_health,
        doomctl_damage_taken, doomctl_health_gained, doomctl_deaths,
        player->killcount, player->killcount - doomctl_start_kills,
        player->itemcount, player->itemcount - doomctl_start_items,
        player->secretcount, player->secretcount - doomctl_start_secrets,
        player->armorpoints,
        player->ammo[am_clip], player->ammo[am_shell],
        player->ammo[am_cell], player->ammo[am_misl]);

    return doomctl_playtest_buffer;
}