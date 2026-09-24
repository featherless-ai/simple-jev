// Explicit engine-control surface for the direct LinuxDOOM browser port.
//
// MCP and JavaScript only receive the functions exported here. Raw WASM memory
// is intentionally not exposed. The original LinuxDOOM simulation remains
// authoritative for actor state, sight, collision, spawning and removal.
// Authoring mutations are journaled so the current map can be exported as a
// small PWAD override instead of existing only in transient runtime memory.

#include "doomdef.h"
#include "doomstat.h"
#include "doomdata.h"
#include "d_player.h"
#include "p_local.h"
#include "p_mobj.h"
#include "r_state.h"
#include "w_wad.h"

// Include Emscripten after Doom's historical boolean definitions.
#include <emscripten/emscripten.h>

#include <math.h>
#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define DOOMCTL_STATE_BUFSIZE 65536
#define DOOMCTL_MAX_ENEMIES   96
#define DOOMCTL_MAX_SECTORS   256
#define DOOMCTL_MAX_SECTOR_CHANGES 256
#define DOOMCTL_MAX_SPAWN_CHANGES 128
#define DOOMCTL_MAX_REMOVE_CHANGES 128
#define DOOMCTL_VISIBLE_HALF_FOV 45.0
#define DOOMCTL_MAP_LUMPS (ML_BLOCKMAP + 1)

// Persistent mapthing option bits used by vanilla maps: present on all skills.
#define DOOMCTL_THING_ALL_SKILLS 7

typedef struct
{
    int active;
    int sector_index;
    short original_light;
    short light;
} doomctl_sector_change_t;

typedef struct
{
    int active;
    mobjtype_t mobj_type;
    mapthing_t thing;
} doomctl_thing_change_t;

static char doomctl_state_buffer[DOOMCTL_STATE_BUFSIZE];
static int doomctl_journal_episode = -1;
static int doomctl_journal_map = -1;
static doomctl_sector_change_t doomctl_sector_changes[DOOMCTL_MAX_SECTOR_CHANGES];
static doomctl_thing_change_t doomctl_spawn_changes[DOOMCTL_MAX_SPAWN_CHANGES];
static doomctl_thing_change_t doomctl_remove_changes[DOOMCTL_MAX_REMOVE_CHANGES];
static int doomctl_sector_change_count = 0;
static int doomctl_spawn_change_count = 0;
static int doomctl_remove_change_count = 0;

static player_t *doomctl_player(void)
{
    if (consoleplayer < 0 || consoleplayer >= MAXPLAYERS)
        return NULL;
    if (!playeringame[consoleplayer])
        return NULL;
    if (gamestate != GS_LEVEL)
        return NULL;
    if (players[consoleplayer].mo == NULL)
        return NULL;
    return &players[consoleplayer];
}

static void doomctl_append(size_t *used, const char *fmt, ...)
{
    va_list args;
    int wrote;

    if (*used >= DOOMCTL_STATE_BUFSIZE - 1)
        return;

    va_start(args, fmt);
    wrote = vsnprintf(doomctl_state_buffer + *used,
                      DOOMCTL_STATE_BUFSIZE - *used,
                      fmt, args);
    va_end(args);

    if (wrote <= 0)
        return;

    if ((size_t) wrote >= DOOMCTL_STATE_BUFSIZE - *used)
        *used = DOOMCTL_STATE_BUFSIZE - 1;
    else
        *used += (size_t) wrote;
}

static double doomctl_units(fixed_t value)
{
    return (double) value / (double) FRACUNIT;
}

static double doomctl_angle_degrees(angle_t angle)
{
    return ((double) angle * 360.0) / 4294967296.0;
}

static int doomctl_current_sector_index(player_t *player)
{
    sector_t *sector;

    if (player == NULL || player->mo == NULL || player->mo->subsector == NULL)
        return -1;

    sector = player->mo->subsector->sector;
    if (sector < sectors || sector >= sectors + numsectors)
        return -1;

    return (int) (sector - sectors);
}

static const char *doomctl_mobj_name(mobjtype_t type)
{
    switch (type)
    {
        case MT_POSSESSED: return "zombieman";
        case MT_SHOTGUY:   return "shotgun_guy";
        case MT_VILE:      return "arch_vile";
        case MT_UNDEAD:    return "revenant";
        case MT_FATSO:     return "mancubus";
        case MT_CHAINGUY:  return "chaingunner";
        case MT_TROOP:     return "imp";
        case MT_SERGEANT:  return "demon";
        case MT_SHADOWS:   return "spectre";
        case MT_HEAD:      return "cacodemon";
        case MT_BRUISER:   return "baron_of_hell";
        case MT_KNIGHT:    return "hell_knight";
        case MT_SKULL:     return "lost_soul";
        case MT_SPIDER:    return "spider_mastermind";
        case MT_BABY:      return "arachnotron";
        case MT_CYBORG:    return "cyberdemon";
        case MT_PAIN:      return "pain_elemental";
        case MT_WOLFSS:    return "wolf_ss";
        case MT_KEEN:      return "commander_keen";
        case MT_BOSSBRAIN: return "icon_of_sin";
        default:           return "unknown";
    }
}

// The public demo uses the shareware IWAD, so mutation tools only spawn enemy
// types whose sprites/states are guaranteed by Episode 1 data.
static int doomctl_spawnable_type(const char *name, mobjtype_t *type)
{
    if (name == NULL || type == NULL)
        return 0;

    if (!strcmp(name, "zombieman"))
        *type = MT_POSSESSED;
    else if (!strcmp(name, "shotgun_guy"))
        *type = MT_SHOTGUY;
    else if (!strcmp(name, "imp"))
        *type = MT_TROOP;
    else if (!strcmp(name, "demon"))
        *type = MT_SERGEANT;
    else if (!strcmp(name, "spectre"))
        *type = MT_SHADOWS;
    else if (!strcmp(name, "baron_of_hell"))
        *type = MT_BRUISER;
    else
        return 0;

    return 1;
}

static int doomctl_live_enemy(mobj_t *thing)
{
    return thing != NULL
        && (thing->flags & MF_COUNTKILL)
        && thing->health > 0;
}

static double doomctl_enemy_distance(player_t *player, mobj_t *thing)
{
    fixed_t dx;
    fixed_t dy;

    dx = thing->x - player->mo->x;
    dy = thing->y - player->mo->y;
    return doomctl_units(P_AproxDistance(dx, dy));
}

static double doomctl_relative_angle(player_t *player, mobj_t *thing)
{
    double target_angle;
    double player_angle;
    double relative;
    double dx;
    double dy;

    dx = doomctl_units(thing->x - player->mo->x);
    dy = doomctl_units(thing->y - player->mo->y);
    target_angle = atan2(dy, dx) * 57.2957795130823208768;
    if (target_angle < 0.0)
        target_angle += 360.0;

    player_angle = doomctl_angle_degrees(player->mo->angle);
    relative = target_angle - player_angle;

    while (relative > 180.0)
        relative -= 360.0;
    while (relative < -180.0)
        relative += 360.0;

    return relative;
}

static int doomctl_line_of_sight(player_t *player, mobj_t *thing)
{
    return P_CheckSight(player->mo, thing) ? 1 : 0;
}

static int doomctl_visible_enemy(player_t *player, mobj_t *thing,
                                 int *line_of_sight, double *relative_angle)
{
    int los;
    double angle;

    los = doomctl_line_of_sight(player, thing);
    angle = doomctl_relative_angle(player, thing);

    if (line_of_sight != NULL)
        *line_of_sight = los;
    if (relative_angle != NULL)
        *relative_angle = angle;

    return los && fabs(angle) <= DOOMCTL_VISIBLE_HALF_FOV;
}

static void doomctl_clear_journal_internal(void)
{
    memset(doomctl_sector_changes, 0, sizeof(doomctl_sector_changes));
    memset(doomctl_spawn_changes, 0, sizeof(doomctl_spawn_changes));
    memset(doomctl_remove_changes, 0, sizeof(doomctl_remove_changes));
    doomctl_sector_change_count = 0;
    doomctl_spawn_change_count = 0;
    doomctl_remove_change_count = 0;
}

static void doomctl_ensure_journal_map(void)
{
    if (doomctl_journal_episode == gameepisode && doomctl_journal_map == gamemap)
        return;

    doomctl_clear_journal_internal();
    doomctl_journal_episode = gameepisode;
    doomctl_journal_map = gamemap;
}

static int doomctl_active_sector_changes(void)
{
    int i;
    int count = 0;

    for (i = 0; i < doomctl_sector_change_count; ++i)
        if (doomctl_sector_changes[i].active)
            ++count;
    return count;
}

static int doomctl_active_spawn_changes(void)
{
    int i;
    int count = 0;

    for (i = 0; i < doomctl_spawn_change_count; ++i)
        if (doomctl_spawn_changes[i].active)
            ++count;
    return count;
}

static int doomctl_active_remove_changes(void)
{
    int i;
    int count = 0;

    for (i = 0; i < doomctl_remove_change_count; ++i)
        if (doomctl_remove_changes[i].active)
            ++count;
    return count;
}

static int doomctl_record_sector_light(int sector_index, short old_light, short light)
{
    int i;

    doomctl_ensure_journal_map();

    for (i = 0; i < doomctl_sector_change_count; ++i)
    {
        doomctl_sector_change_t *change = &doomctl_sector_changes[i];
        if (change->active && change->sector_index == sector_index)
        {
            change->light = light;
            if (change->light == change->original_light)
                change->active = 0;
            return 1;
        }
    }

    if (light == old_light)
        return 1;
    if (doomctl_sector_change_count >= DOOMCTL_MAX_SECTOR_CHANGES)
        return 0;

    doomctl_sector_changes[doomctl_sector_change_count].active = 1;
    doomctl_sector_changes[doomctl_sector_change_count].sector_index = sector_index;
    doomctl_sector_changes[doomctl_sector_change_count].original_light = old_light;
    doomctl_sector_changes[doomctl_sector_change_count].light = light;
    ++doomctl_sector_change_count;
    return 1;
}

static int doomctl_mapthing_equal(const mapthing_t *a, const mapthing_t *b)
{
    return a->x == b->x
        && a->y == b->y
        && a->angle == b->angle
        && a->type == b->type
        && a->options == b->options;
}

static int doomctl_record_spawn(mobjtype_t type, const mapthing_t *thing)
{
    doomctl_ensure_journal_map();
    if (doomctl_spawn_change_count >= DOOMCTL_MAX_SPAWN_CHANGES)
        return 0;

    doomctl_spawn_changes[doomctl_spawn_change_count].active = 1;
    doomctl_spawn_changes[doomctl_spawn_change_count].mobj_type = type;
    doomctl_spawn_changes[doomctl_spawn_change_count].thing = *thing;
    ++doomctl_spawn_change_count;
    return 1;
}

static int doomctl_cancel_recorded_spawn(const mobj_t *thing)
{
    int i;

    for (i = doomctl_spawn_change_count - 1; i >= 0; --i)
    {
        doomctl_thing_change_t *change = &doomctl_spawn_changes[i];
        if (change->active
         && change->mobj_type == thing->type
         && doomctl_mapthing_equal(&change->thing, &thing->spawnpoint))
        {
            change->active = 0;
            return 1;
        }
    }

    return 0;
}

static int doomctl_record_removal(const mobj_t *thing)
{
    int i;

    doomctl_ensure_journal_map();

    if (thing->spawnpoint.type <= 0)
        return 0;

    for (i = 0; i < doomctl_remove_change_count; ++i)
    {
        doomctl_thing_change_t *change = &doomctl_remove_changes[i];
        if (change->active && doomctl_mapthing_equal(&change->thing, &thing->spawnpoint))
            return 1;
    }

    if (doomctl_remove_change_count >= DOOMCTL_MAX_REMOVE_CHANGES)
        return 0;

    doomctl_remove_changes[doomctl_remove_change_count].active = 1;
    doomctl_remove_changes[doomctl_remove_change_count].mobj_type = thing->type;
    doomctl_remove_changes[doomctl_remove_change_count].thing = thing->spawnpoint;
    ++doomctl_remove_change_count;
    return 1;
}

static void doomctl_put_u16(unsigned char *p, int value)
{
    unsigned int v = (unsigned short) (short) value;
    p[0] = (unsigned char) (v & 0xff);
    p[1] = (unsigned char) ((v >> 8) & 0xff);
}

static int doomctl_get_i16(const unsigned char *p)
{
    unsigned int v = (unsigned int) p[0] | ((unsigned int) p[1] << 8);
    return (int) (short) v;
}

static void doomctl_put_u32(unsigned char *p, int value)
{
    unsigned int v = (unsigned int) value;
    p[0] = (unsigned char) (v & 0xff);
    p[1] = (unsigned char) ((v >> 8) & 0xff);
    p[2] = (unsigned char) ((v >> 16) & 0xff);
    p[3] = (unsigned char) ((v >> 24) & 0xff);
}

static void doomctl_encode_mapthing(unsigned char *dest, const mapthing_t *thing)
{
    doomctl_put_u16(dest + 0, thing->x);
    doomctl_put_u16(dest + 2, thing->y);
    doomctl_put_u16(dest + 4, thing->angle);
    doomctl_put_u16(dest + 6, thing->type);
    doomctl_put_u16(dest + 8, thing->options);
}

static int doomctl_raw_thing_matches(const unsigned char *record,
                                     const mapthing_t *thing)
{
    return doomctl_get_i16(record + 0) == thing->x
        && doomctl_get_i16(record + 2) == thing->y
        && doomctl_get_i16(record + 4) == thing->angle
        && doomctl_get_i16(record + 6) == thing->type
        && doomctl_get_i16(record + 8) == thing->options;
}

static int doomctl_build_things_lump(int lump, unsigned char **out_data,
                                     int *out_size)
{
    unsigned char *source;
    unsigned char *dest;
    unsigned char removed_used[DOOMCTL_MAX_REMOVE_CHANGES];
    int source_size;
    int source_count;
    int max_size;
    int source_index;
    int dest_count;
    int i;

    source_size = W_LumpLength(lump);
    if (source_size < 0 || source_size % 10 != 0)
        return 0;

    source = (unsigned char *) malloc(source_size > 0 ? source_size : 1);
    if (source == NULL)
        return 0;
    if (source_size > 0)
        W_ReadLump(lump, source);

    max_size = source_size + doomctl_active_spawn_changes() * 10;
    dest = (unsigned char *) malloc(max_size > 0 ? max_size : 1);
    if (dest == NULL)
    {
        free(source);
        return 0;
    }

    memset(removed_used, 0, sizeof(removed_used));
    source_count = source_size / 10;
    dest_count = 0;

    for (source_index = 0; source_index < source_count; ++source_index)
    {
        unsigned char *record = source + source_index * 10;
        int remove = 0;

        for (i = 0; i < doomctl_remove_change_count; ++i)
        {
            if (!doomctl_remove_changes[i].active || removed_used[i])
                continue;
            if (doomctl_raw_thing_matches(record, &doomctl_remove_changes[i].thing))
            {
                removed_used[i] = 1;
                remove = 1;
                break;
            }
        }

        if (!remove)
        {
            memcpy(dest + dest_count * 10, record, 10);
            ++dest_count;
        }
    }

    for (i = 0; i < doomctl_spawn_change_count; ++i)
    {
        if (!doomctl_spawn_changes[i].active)
            continue;
        doomctl_encode_mapthing(dest + dest_count * 10,
                                &doomctl_spawn_changes[i].thing);
        ++dest_count;
    }

    free(source);
    *out_data = dest;
    *out_size = dest_count * 10;
    return 1;
}

static int doomctl_build_sectors_lump(int lump, unsigned char **out_data,
                                      int *out_size)
{
    unsigned char *data;
    int size;
    int count;
    int i;

    size = W_LumpLength(lump);
    if (size < 0 || size % 26 != 0)
        return 0;

    data = (unsigned char *) malloc(size > 0 ? size : 1);
    if (data == NULL)
        return 0;
    if (size > 0)
        W_ReadLump(lump, data);

    count = size / 26;
    for (i = 0; i < doomctl_sector_change_count; ++i)
    {
        doomctl_sector_change_t *change = &doomctl_sector_changes[i];
        if (!change->active)
            continue;
        if (change->sector_index < 0 || change->sector_index >= count)
        {
            free(data);
            return 0;
        }
        // mapsector_t lightlevel is after 2 heights + 2 eight-char flat names.
        doomctl_put_u16(data + change->sector_index * 26 + 20, change->light);
    }

    *out_data = data;
    *out_size = size;
    return 1;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_state_json(void)
{
    player_t *player;
    mobj_t *mo;
    thinker_t *thinker;
    int enemy_count;
    int visible_count;
    int emitted;
    int current_sector;
    size_t used;

    used = 0;
    doomctl_state_buffer[0] = '\0';
    player = doomctl_player();

    if (player == NULL)
    {
        snprintf(doomctl_state_buffer, DOOMCTL_STATE_BUFSIZE,
                 "{\"ready\":false,\"gameState\":%d,\"episode\":%d,\"map\":%d,\"tic\":%d}",
                 (int) gamestate, gameepisode, gamemap, gametic);
        return doomctl_state_buffer;
    }

    mo = player->mo;
    current_sector = doomctl_current_sector_index(player);
    enemy_count = 0;
    visible_count = 0;

    for (thinker = thinkercap.next;
         thinker != &thinkercap;
         thinker = thinker->next)
    {
        mobj_t *thing;

        if (thinker->function.acp1 != (actionf_p1) P_MobjThinker)
            continue;

        thing = (mobj_t *) thinker;
        if (!doomctl_live_enemy(thing))
            continue;

        ++enemy_count;
        if (doomctl_visible_enemy(player, thing, NULL, NULL))
            ++visible_count;
    }

    doomctl_append(&used,
        "{\"ready\":true,\"episode\":%d,\"map\":%d,\"skill\":%d,\"tic\":%d,"
        "\"levelTime\":%d,\"currentSector\":%d,\"player\":{"
        "\"health\":%d,\"armor\":%d,\"armorType\":%d,\"weapon\":%d,"
        "\"x\":%.3f,\"y\":%.3f,\"z\":%.3f,\"angle\":%.3f,"
        "\"ammo\":{\"bullets\":%d,\"shells\":%d,\"cells\":%d,\"rockets\":%d},"
        "\"maxAmmo\":{\"bullets\":%d,\"shells\":%d,\"cells\":%d,\"rockets\":%d},"
        "\"kills\":%d,\"items\":%d,\"secrets\":%d},"
        "\"totals\":{\"kills\":%d,\"items\":%d,\"secrets\":%d},"
        "\"enemyCount\":%d,\"visibleEnemyCount\":%d,\"enemies\":[",
        gameepisode, gamemap, (int) gameskill, gametic, leveltime,
        current_sector,
        player->health, player->armorpoints, player->armortype,
        (int) player->readyweapon,
        doomctl_units(mo->x), doomctl_units(mo->y), doomctl_units(mo->z),
        doomctl_angle_degrees(mo->angle),
        player->ammo[am_clip], player->ammo[am_shell],
        player->ammo[am_cell], player->ammo[am_misl],
        player->maxammo[am_clip], player->maxammo[am_shell],
        player->maxammo[am_cell], player->maxammo[am_misl],
        player->killcount, player->itemcount, player->secretcount,
        totalkills, totalitems, totalsecret, enemy_count, visible_count);

    emitted = 0;
    for (thinker = thinkercap.next;
         thinker != &thinkercap && emitted < DOOMCTL_MAX_ENEMIES;
         thinker = thinker->next)
    {
        mobj_t *thing;
        double distance;
        double relative_angle;
        int line_of_sight;
        int visible;

        if (thinker->function.acp1 != (actionf_p1) P_MobjThinker)
            continue;

        thing = (mobj_t *) thinker;
        if (!doomctl_live_enemy(thing))
            continue;

        distance = doomctl_enemy_distance(player, thing);
        visible = doomctl_visible_enemy(player, thing,
                                        &line_of_sight, &relative_angle);

        doomctl_append(&used,
            "%s{\"type\":%d,\"name\":\"%s\",\"health\":%d,"
            "\"x\":%.3f,\"y\":%.3f,\"z\":%.3f,"
            "\"distance\":%.3f,\"relativeAngle\":%.3f,"
            "\"lineOfSight\":%s,\"visible\":%s}",
            emitted ? "," : "",
            (int) thing->type, doomctl_mobj_name(thing->type), thing->health,
            doomctl_units(thing->x), doomctl_units(thing->y),
            doomctl_units(thing->z), distance, relative_angle,
            line_of_sight ? "true" : "false",
            visible ? "true" : "false");
        ++emitted;
    }

    doomctl_append(&used, "]}");
    return doomctl_state_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_sectors_json(int limit)
{
    player_t *player;
    int current_sector;
    int emitted;
    int i;
    size_t used;

    player = doomctl_player();
    doomctl_state_buffer[0] = '\0';
    if (player == NULL)
    {
        snprintf(doomctl_state_buffer, DOOMCTL_STATE_BUFSIZE,
                 "{\"ready\":false,\"error\":\"game_not_ready\"}");
        return doomctl_state_buffer;
    }

    if (limit <= 0 || limit > DOOMCTL_MAX_SECTORS)
        limit = DOOMCTL_MAX_SECTORS;

    used = 0;
    current_sector = doomctl_current_sector_index(player);
    doomctl_append(&used,
        "{\"ready\":true,\"sectorCount\":%d,\"currentSector\":%d,\"sectors\":[",
        numsectors, current_sector);

    emitted = 0;
    for (i = 0; i < numsectors && emitted < limit; ++i)
    {
        sector_t *sector = &sectors[i];
        double distance = doomctl_units(P_AproxDistance(
            sector->soundorg.x - player->mo->x,
            sector->soundorg.y - player->mo->y));

        doomctl_append(&used,
            "%s{\"index\":%d,\"current\":%s,\"floor\":%.3f,"
            "\"ceiling\":%.3f,\"light\":%d,\"special\":%d,\"tag\":%d,"
            "\"originX\":%.3f,\"originY\":%.3f,\"distance\":%.3f}",
            emitted ? "," : "", i,
            i == current_sector ? "true" : "false",
            doomctl_units(sector->floorheight), doomctl_units(sector->ceilingheight),
            sector->lightlevel, sector->special, sector->tag,
            doomctl_units(sector->soundorg.x), doomctl_units(sector->soundorg.y),
            distance);
        ++emitted;
    }

    doomctl_append(&used, "]}");
    return doomctl_state_buffer;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_set_sector_light(int sector_index, int light)
{
    short old_light;

    if (doomctl_player() == NULL)
        return -1;
    if (sector_index < 0 || sector_index >= numsectors)
        return -2;
    if (light < 0 || light > 255)
        return -3;

    old_light = sectors[sector_index].lightlevel;
    if (!doomctl_record_sector_light(sector_index, old_light, (short) light))
        return -4;

    sectors[sector_index].lightlevel = (short) light;
    return sectors[sector_index].lightlevel;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_heal(int amount)
{
    player_t *player = doomctl_player();
    int health;

    if (player == NULL)
        return -1;
    if (amount < 0)
        return -2;

    health = player->health + amount;
    if (health > 200)
        health = 200;

    player->health = health;
    player->mo->health = health;
    return health;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_give_ammo(int ammo_type, int amount)
{
    player_t *player = doomctl_player();
    int value;

    if (player == NULL)
        return -1;
    if (ammo_type < 0 || ammo_type >= NUMAMMO || amount < 0)
        return -2;

    value = player->ammo[ammo_type] + amount;
    if (value > player->maxammo[ammo_type])
        value = player->maxammo[ammo_type];

    player->ammo[ammo_type] = value;
    return value;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_teleport(int x_units, int y_units)
{
    player_t *player = doomctl_player();
    mobj_t *mo;
    fixed_t x;
    fixed_t y;

    if (player == NULL)
        return -1;

    if (x_units < -32768 || x_units > 32767
     || y_units < -32768 || y_units > 32767)
        return -2;

    mo = player->mo;
    x = (fixed_t) (x_units * FRACUNIT);
    y = (fixed_t) (y_units * FRACUNIT);

    if (!P_TeleportMove(mo, x, y))
        return 0;

    mo->z = mo->floorz;
    player->viewz = mo->z + player->viewheight;
    mo->momx = 0;
    mo->momy = 0;
    mo->momz = 0;

    return 1;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_spawn_enemy(const char *name, int count, int distance_units)
{
    player_t *player;
    mobjtype_t type;
    mobj_t *player_mo;
    unsigned angle_index;
    fixed_t forward;
    int spawned;
    int i;

    player = doomctl_player();
    if (player == NULL)
        return -1;
    if (!doomctl_spawnable_type(name, &type))
        return -2;
    if (count < 1 || count > 8 || distance_units < 64 || distance_units > 1024)
        return -3;

    doomctl_ensure_journal_map();
    if (doomctl_spawn_change_count + count > DOOMCTL_MAX_SPAWN_CHANGES)
        return -4;

    player_mo = player->mo;
    angle_index = player_mo->angle >> ANGLETOFINESHIFT;
    forward = (fixed_t) (distance_units * FRACUNIT);
    spawned = 0;

    for (i = 0; i < count; ++i)
    {
        int side_units;
        fixed_t side;
        fixed_t x;
        fixed_t y;
        mobj_t *thing;
        mapthing_t mapthing;
        int degrees;

        side_units = (i * 2 - (count - 1)) * 24;
        side = (fixed_t) (side_units * FRACUNIT);

        x = player_mo->x
          + FixedMul(forward, finecosine[angle_index])
          - FixedMul(side, finesine[angle_index]);
        y = player_mo->y
          + FixedMul(forward, finesine[angle_index])
          + FixedMul(side, finecosine[angle_index]);

        thing = P_SpawnMobj(x, y, ONFLOORZ, type);
        if (thing == NULL)
            continue;

        if (!P_CheckPosition(thing, x, y))
        {
            P_RemoveMobj(thing);
            continue;
        }

        thing->angle = player_mo->angle + ANG180;
        degrees = (int) (doomctl_angle_degrees(thing->angle) + 0.5);
        if (degrees >= 360)
            degrees -= 360;

        mapthing.x = (short) (thing->x / FRACUNIT);
        mapthing.y = (short) (thing->y / FRACUNIT);
        mapthing.angle = (short) degrees;
        mapthing.type = (short) mobjinfo[type].doomednum;
        mapthing.options = DOOMCTL_THING_ALL_SKILLS;
        thing->spawnpoint = mapthing;

        if (!doomctl_record_spawn(type, &mapthing))
        {
            P_RemoveMobj(thing);
            continue;
        }

        thing->target = player_mo;
        if (thing->info->seestate != S_NULL)
            P_SetMobjState(thing, thing->info->seestate);

        if (thing->flags & MF_COUNTKILL)
            ++totalkills;
        ++spawned;
    }

    return spawned;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_remove_nearest_enemy_json(int visible_only,
                                               int max_distance_units)
{
    player_t *player;
    thinker_t *thinker;
    mobj_t *nearest;
    double nearest_distance;
    double nearest_angle;
    int nearest_los;
    int nearest_visible;
    mobjtype_t nearest_type;
    const char *nearest_name;
    int cancelled_spawn;

    player = doomctl_player();
    doomctl_state_buffer[0] = '\0';

    if (player == NULL)
    {
        snprintf(doomctl_state_buffer, DOOMCTL_STATE_BUFSIZE,
                 "{\"removed\":false,\"error\":\"game_not_ready\"}");
        return doomctl_state_buffer;
    }

    if (max_distance_units < 0 || max_distance_units > 8192)
    {
        snprintf(doomctl_state_buffer, DOOMCTL_STATE_BUFSIZE,
                 "{\"removed\":false,\"error\":\"invalid_distance\"}");
        return doomctl_state_buffer;
    }

    nearest = NULL;
    nearest_distance = 0.0;
    nearest_angle = 0.0;
    nearest_los = 0;
    nearest_visible = 0;

    for (thinker = thinkercap.next;
         thinker != &thinkercap;
         thinker = thinker->next)
    {
        mobj_t *thing;
        double distance;
        double relative_angle;
        int line_of_sight;
        int visible;

        if (thinker->function.acp1 != (actionf_p1) P_MobjThinker)
            continue;

        thing = (mobj_t *) thinker;
        if (!doomctl_live_enemy(thing))
            continue;

        distance = doomctl_enemy_distance(player, thing);
        if (max_distance_units > 0 && distance > (double) max_distance_units)
            continue;

        visible = doomctl_visible_enemy(player, thing,
                                        &line_of_sight, &relative_angle);
        if (visible_only && !visible)
            continue;

        if (nearest == NULL || distance < nearest_distance)
        {
            nearest = thing;
            nearest_distance = distance;
            nearest_angle = relative_angle;
            nearest_los = line_of_sight;
            nearest_visible = visible;
        }
    }

    if (nearest == NULL)
    {
        snprintf(doomctl_state_buffer, DOOMCTL_STATE_BUFSIZE,
                 "{\"removed\":false,\"reason\":\"no_matching_enemy\"}");
        return doomctl_state_buffer;
    }

    doomctl_ensure_journal_map();
    cancelled_spawn = doomctl_cancel_recorded_spawn(nearest);
    if (!cancelled_spawn && !doomctl_record_removal(nearest))
    {
        snprintf(doomctl_state_buffer, DOOMCTL_STATE_BUFSIZE,
                 "{\"removed\":false,\"error\":\"change_journal_full_or_unpersistable\"}");
        return doomctl_state_buffer;
    }

    nearest_type = nearest->type;
    nearest_name = doomctl_mobj_name(nearest_type);

    if ((nearest->flags & MF_COUNTKILL) && totalkills > 0)
        --totalkills;
    P_RemoveMobj(nearest);

    snprintf(doomctl_state_buffer, DOOMCTL_STATE_BUFSIZE,
             "{\"removed\":true,\"type\":%d,\"name\":\"%s\","
             "\"distance\":%.3f,\"relativeAngle\":%.3f,"
             "\"lineOfSight\":%s,\"visible\":%s,\"persisted\":true}",
             (int) nearest_type, nearest_name, nearest_distance, nearest_angle,
             nearest_los ? "true" : "false",
             nearest_visible ? "true" : "false");
    return doomctl_state_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_changeset_json(void)
{
    int i;
    int emitted;
    size_t used;

    if (doomctl_player() == NULL)
    {
        snprintf(doomctl_state_buffer, DOOMCTL_STATE_BUFSIZE,
                 "{\"ready\":false,\"error\":\"game_not_ready\"}");
        return doomctl_state_buffer;
    }

    doomctl_ensure_journal_map();
    used = 0;
    doomctl_state_buffer[0] = '\0';

    doomctl_append(&used,
        "{\"ready\":true,\"episode\":%d,\"map\":%d,"
        "\"sectorLightCount\":%d,\"spawnCount\":%d,\"removeCount\":%d,"
        "\"sectorLights\":[",
        gameepisode, gamemap,
        doomctl_active_sector_changes(), doomctl_active_spawn_changes(),
        doomctl_active_remove_changes());

    emitted = 0;
    for (i = 0; i < doomctl_sector_change_count; ++i)
    {
        doomctl_sector_change_t *change = &doomctl_sector_changes[i];
        if (!change->active)
            continue;
        doomctl_append(&used,
            "%s{\"sector\":%d,\"from\":%d,\"to\":%d}",
            emitted ? "," : "", change->sector_index,
            change->original_light, change->light);
        ++emitted;
    }

    doomctl_append(&used, "],\"spawnedThings\":[");
    emitted = 0;
    for (i = 0; i < doomctl_spawn_change_count; ++i)
    {
        doomctl_thing_change_t *change = &doomctl_spawn_changes[i];
        if (!change->active)
            continue;
        doomctl_append(&used,
            "%s{\"name\":\"%s\",\"x\":%d,\"y\":%d,\"angle\":%d,"
            "\"doomedType\":%d,\"options\":%d}",
            emitted ? "," : "", doomctl_mobj_name(change->mobj_type),
            change->thing.x, change->thing.y, change->thing.angle,
            change->thing.type, change->thing.options);
        ++emitted;
    }

    doomctl_append(&used, "],\"removedThings\":[");
    emitted = 0;
    for (i = 0; i < doomctl_remove_change_count; ++i)
    {
        doomctl_thing_change_t *change = &doomctl_remove_changes[i];
        if (!change->active)
            continue;
        doomctl_append(&used,
            "%s{\"name\":\"%s\",\"x\":%d,\"y\":%d,\"angle\":%d,"
            "\"doomedType\":%d,\"options\":%d}",
            emitted ? "," : "", doomctl_mobj_name(change->mobj_type),
            change->thing.x, change->thing.y, change->thing.angle,
            change->thing.type, change->thing.options);
        ++emitted;
    }

    doomctl_append(&used, "]}");
    return doomctl_state_buffer;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_export_pwad(const char *path)
{
    char mapname[9];
    int marker;
    int positions[DOOMCTL_MAP_LUMPS];
    int sizes[DOOMCTL_MAP_LUMPS];
    char names[DOOMCTL_MAP_LUMPS][8];
    FILE *fp;
    unsigned char header[12];
    int i;
    int directory_offset;
    int final_size;

    if (doomctl_player() == NULL)
        return -1;
    if (path == NULL || path[0] == '\0')
        return -2;

    doomctl_ensure_journal_map();
    snprintf(mapname, sizeof(mapname), "E%dM%d", gameepisode, gamemap);
    marker = W_CheckNumForName(mapname);
    if (marker < 0 || marker + ML_BLOCKMAP >= numlumps)
        return -3;

    fp = fopen(path, "wb");
    if (fp == NULL)
        return -4;

    memset(header, 0, sizeof(header));
    memcpy(header, "PWAD", 4);
    if (fwrite(header, 1, sizeof(header), fp) != sizeof(header))
    {
        fclose(fp);
        return -4;
    }

    for (i = 0; i < DOOMCTL_MAP_LUMPS; ++i)
    {
        int lump = marker + i;
        unsigned char *data = NULL;
        int size = 0;
        int ok = 1;

        positions[i] = (int) ftell(fp);
        memcpy(names[i], lumpinfo[lump].name, 8);

        if (i == ML_THINGS)
            ok = doomctl_build_things_lump(lump, &data, &size);
        else if (i == ML_SECTORS)
            ok = doomctl_build_sectors_lump(lump, &data, &size);
        else
        {
            size = W_LumpLength(lump);
            if (size < 0)
                ok = 0;
            else if (size > 0)
            {
                data = (unsigned char *) malloc(size);
                if (data == NULL)
                    ok = 0;
                else
                    W_ReadLump(lump, data);
            }
        }

        if (!ok)
        {
            if (data != NULL)
                free(data);
            fclose(fp);
            return -5;
        }

        sizes[i] = size;
        if (size > 0 && fwrite(data, 1, size, fp) != (size_t) size)
        {
            free(data);
            fclose(fp);
            return -4;
        }
        if (data != NULL)
            free(data);
    }

    directory_offset = (int) ftell(fp);
    for (i = 0; i < DOOMCTL_MAP_LUMPS; ++i)
    {
        unsigned char entry[16];
        memset(entry, 0, sizeof(entry));
        doomctl_put_u32(entry + 0, positions[i]);
        doomctl_put_u32(entry + 4, sizes[i]);
        memcpy(entry + 8, names[i], 8);
        if (fwrite(entry, 1, sizeof(entry), fp) != sizeof(entry))
        {
            fclose(fp);
            return -4;
        }
    }

    final_size = (int) ftell(fp);
    memset(header, 0, sizeof(header));
    memcpy(header, "PWAD", 4);
    doomctl_put_u32(header + 4, DOOMCTL_MAP_LUMPS);
    doomctl_put_u32(header + 8, directory_offset);
    if (fseek(fp, 0, SEEK_SET) != 0
     || fwrite(header, 1, sizeof(header), fp) != sizeof(header))
    {
        fclose(fp);
        return -4;
    }

    fclose(fp);
    return final_size;
}
