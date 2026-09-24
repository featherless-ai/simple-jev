// Safe SIDEDEFS / sector-flat visual authoring for the direct LinuxDOOM browser port.
//
// This module changes only visual names already represented in existing map
// records: sidedef top/bottom/middle wall textures and sector floor/ceiling
// flats. It never moves geometry or changes BSP-derived data.

#include "doomdef.h"
#include "doomstat.h"
#include "doomdata.h"
#include "d_player.h"
#include "p_local.h"
#include "r_data.h"
#include "r_state.h"
#include "w_wad.h"

#include <emscripten/emscripten.h>

#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define DOOMCTL_VISUAL_BUFSIZE 65536
#define DOOMCTL_SIDE_RECORD_SIZE 30
#define DOOMCTL_SECTOR_RECORD_SIZE 26
#define DOOMCTL_MAX_SIDE_CHANGES 512
#define DOOMCTL_MAX_FLAT_CHANGES 256

extern int lastflat;
extern int numflats;

typedef struct
{
    int active;
    int side_index;
    char original_top[9];
    char original_bottom[9];
    char original_middle[9];
    char top[9];
    char bottom[9];
    char middle[9];
} doomctl_side_visual_change_t;

typedef struct
{
    int active;
    int sector_index;
    char original_floor[9];
    char original_ceiling[9];
    char floor[9];
    char ceiling[9];
} doomctl_sector_flat_change_t;

static char doomctl_visual_buffer[DOOMCTL_VISUAL_BUFSIZE];
static doomctl_side_visual_change_t doomctl_side_changes[DOOMCTL_MAX_SIDE_CHANGES];
static doomctl_sector_flat_change_t doomctl_flat_changes[DOOMCTL_MAX_FLAT_CHANGES];
static int doomctl_side_change_count = 0;
static int doomctl_flat_change_count = 0;
static int doomctl_visual_episode = -1;
static int doomctl_visual_map = -1;

static player_t *doomctl_visual_player(void)
{
    if (consoleplayer < 0 || consoleplayer >= MAXPLAYERS)
        return NULL;
    if (!playeringame[consoleplayer] || gamestate != GS_LEVEL)
        return NULL;
    if (players[consoleplayer].mo == NULL)
        return NULL;
    return &players[consoleplayer];
}

static void doomctl_visual_reset_internal(void)
{
    memset(doomctl_side_changes, 0, sizeof(doomctl_side_changes));
    memset(doomctl_flat_changes, 0, sizeof(doomctl_flat_changes));
    doomctl_side_change_count = 0;
    doomctl_flat_change_count = 0;
}

static void doomctl_visual_ensure_map(void)
{
    if (doomctl_visual_episode == gameepisode && doomctl_visual_map == gamemap)
        return;
    doomctl_visual_reset_internal();
    doomctl_visual_episode = gameepisode;
    doomctl_visual_map = gamemap;
}

static unsigned int doomctl_visual_read_u32(const unsigned char *p)
{
    return (unsigned int) p[0]
        | ((unsigned int) p[1] << 8)
        | ((unsigned int) p[2] << 16)
        | ((unsigned int) p[3] << 24);
}

static void doomctl_visual_name_from_raw(char out[9], const unsigned char *raw)
{
    int i;
    memset(out, 0, 9);
    for (i = 0; i < 8 && raw[i] != 0; ++i)
        out[i] = (char) raw[i];
}

static void doomctl_visual_name_to_raw(unsigned char *raw, const char *name)
{
    size_t n = strlen(name);
    if (n > 8) n = 8;
    memset(raw, 0, 8);
    memcpy(raw, name, n);
}

static int doomctl_visual_canonical_name(const char *input, char out[9], int allow_dash)
{
    int i;
    size_t n;

    if (input == NULL)
        return 0;
    n = strlen(input);
    if (n < 1 || n > 8)
        return 0;
    if (allow_dash && n == 1 && input[0] == '-')
    {
        strcpy(out, "-");
        return 1;
    }

    memset(out, 0, 9);
    for (i = 0; i < (int) n; ++i)
    {
        unsigned char c = (unsigned char) input[i];
        if (!(isalnum(c) || c == '_' || c == '-'))
            return 0;
        out[i] = (char) toupper(c);
    }
    return 1;
}

static int doomctl_visual_current_marker(void)
{
    char mapname[9];
    snprintf(mapname, sizeof(mapname), "E%dM%d", gameepisode, gamemap);
    return W_CheckNumForName(mapname);
}

static int doomctl_visual_read_side_baseline(int side_index,
                                              char top[9], char bottom[9], char middle[9])
{
    int marker;
    int lump;
    int size;
    unsigned char *data;
    unsigned char *record;

    marker = doomctl_visual_current_marker();
    if (marker < 0 || side_index < 0)
        return 0;
    lump = marker + ML_SIDEDEFS;
    size = W_LumpLength(lump);
    if (size < 0 || size % DOOMCTL_SIDE_RECORD_SIZE != 0
     || side_index >= size / DOOMCTL_SIDE_RECORD_SIZE)
        return 0;

    data = (unsigned char *) malloc(size > 0 ? size : 1);
    if (data == NULL)
        return 0;
    W_ReadLump(lump, data);
    record = data + side_index * DOOMCTL_SIDE_RECORD_SIZE;
    doomctl_visual_name_from_raw(top, record + 4);
    doomctl_visual_name_from_raw(bottom, record + 12);
    doomctl_visual_name_from_raw(middle, record + 20);
    free(data);
    return 1;
}

static int doomctl_visual_read_sector_baseline(int sector_index,
                                                char floor[9], char ceiling[9])
{
    int marker;
    int lump;
    int size;
    unsigned char *data;
    unsigned char *record;

    marker = doomctl_visual_current_marker();
    if (marker < 0 || sector_index < 0)
        return 0;
    lump = marker + ML_SECTORS;
    size = W_LumpLength(lump);
    if (size < 0 || size % DOOMCTL_SECTOR_RECORD_SIZE != 0
     || sector_index >= size / DOOMCTL_SECTOR_RECORD_SIZE)
        return 0;

    data = (unsigned char *) malloc(size > 0 ? size : 1);
    if (data == NULL)
        return 0;
    W_ReadLump(lump, data);
    record = data + sector_index * DOOMCTL_SECTOR_RECORD_SIZE;
    doomctl_visual_name_from_raw(floor, record + 4);
    doomctl_visual_name_from_raw(ceiling, record + 12);
    free(data);
    return 1;
}

static doomctl_side_visual_change_t *doomctl_visual_side_change(int side_index, int create)
{
    int i;
    char top[9], bottom[9], middle[9];

    doomctl_visual_ensure_map();
    for (i = 0; i < doomctl_side_change_count; ++i)
        if (doomctl_side_changes[i].side_index == side_index)
            return &doomctl_side_changes[i];

    if (!create || doomctl_side_change_count >= DOOMCTL_MAX_SIDE_CHANGES)
        return NULL;
    if (!doomctl_visual_read_side_baseline(side_index, top, bottom, middle))
        return NULL;

    i = doomctl_side_change_count++;
    doomctl_side_changes[i].side_index = side_index;
    strcpy(doomctl_side_changes[i].original_top, top);
    strcpy(doomctl_side_changes[i].original_bottom, bottom);
    strcpy(doomctl_side_changes[i].original_middle, middle);
    strcpy(doomctl_side_changes[i].top, top);
    strcpy(doomctl_side_changes[i].bottom, bottom);
    strcpy(doomctl_side_changes[i].middle, middle);
    return &doomctl_side_changes[i];
}

static void doomctl_visual_refresh_side_active(doomctl_side_visual_change_t *change)
{
    change->active = strcmp(change->top, change->original_top)
                  || strcmp(change->bottom, change->original_bottom)
                  || strcmp(change->middle, change->original_middle);
}

static doomctl_sector_flat_change_t *doomctl_visual_flat_change(int sector_index, int create)
{
    int i;
    char floor[9], ceiling[9];

    doomctl_visual_ensure_map();
    for (i = 0; i < doomctl_flat_change_count; ++i)
        if (doomctl_flat_changes[i].sector_index == sector_index)
            return &doomctl_flat_changes[i];

    if (!create || doomctl_flat_change_count >= DOOMCTL_MAX_FLAT_CHANGES)
        return NULL;
    if (!doomctl_visual_read_sector_baseline(sector_index, floor, ceiling))
        return NULL;

    i = doomctl_flat_change_count++;
    doomctl_flat_changes[i].sector_index = sector_index;
    strcpy(doomctl_flat_changes[i].original_floor, floor);
    strcpy(doomctl_flat_changes[i].original_ceiling, ceiling);
    strcpy(doomctl_flat_changes[i].floor, floor);
    strcpy(doomctl_flat_changes[i].ceiling, ceiling);
    return &doomctl_flat_changes[i];
}

static void doomctl_visual_refresh_flat_active(doomctl_sector_flat_change_t *change)
{
    change->active = strcmp(change->floor, change->original_floor)
                  || strcmp(change->ceiling, change->original_ceiling);
}

static void doomctl_visual_current_side_names(int side_index,
                                              char top[9], char bottom[9], char middle[9])
{
    doomctl_side_visual_change_t *change;
    if (!doomctl_visual_read_side_baseline(side_index, top, bottom, middle))
    {
        strcpy(top, "?"); strcpy(bottom, "?"); strcpy(middle, "?");
        return;
    }
    change = doomctl_visual_side_change(side_index, 0);
    if (change != NULL)
    {
        strcpy(top, change->top);
        strcpy(bottom, change->bottom);
        strcpy(middle, change->middle);
    }
}

static void doomctl_visual_current_sector_names(int sector_index,
                                                char floor[9], char ceiling[9])
{
    doomctl_sector_flat_change_t *change;
    if (!doomctl_visual_read_sector_baseline(sector_index, floor, ceiling))
    {
        strcpy(floor, "?"); strcpy(ceiling, "?");
        return;
    }
    change = doomctl_visual_flat_change(sector_index, 0);
    if (change != NULL)
    {
        strcpy(floor, change->floor);
        strcpy(ceiling, change->ceiling);
    }
}

static int doomctl_visual_sector_index(sector_t *sector)
{
    if (sector == NULL || sector < sectors || sector >= sectors + numsectors)
        return -1;
    return (int) (sector - sectors);
}

static double doomctl_visual_units(fixed_t value)
{
    return (double) value / (double) FRACUNIT;
}

static double doomctl_visual_line_distance(player_t *player, line_t *line)
{
    fixed_t mx = line->v1->x / 2 + line->v2->x / 2;
    fixed_t my = line->v1->y / 2 + line->v2->y / 2;
    return doomctl_visual_units(P_AproxDistance(mx - player->mo->x, my - player->mo->y));
}

static double doomctl_visual_sector_distance(player_t *player, sector_t *sector)
{
    return doomctl_visual_units(P_AproxDistance(sector->soundorg.x - player->mo->x,
                                                sector->soundorg.y - player->mo->y));
}

static int doomctl_visual_active_side_count(void)
{
    int i, count = 0;
    doomctl_visual_ensure_map();
    for (i = 0; i < doomctl_side_change_count; ++i)
        if (doomctl_side_changes[i].active) ++count;
    return count;
}

static int doomctl_visual_active_flat_count(void)
{
    int i, count = 0;
    doomctl_visual_ensure_map();
    for (i = 0; i < doomctl_flat_change_count; ++i)
        if (doomctl_flat_changes[i].active) ++count;
    return count;
}

void doomctl_reset_visual_changes(void)
{
    doomctl_visual_reset_internal();
    doomctl_visual_episode = gameepisode;
    doomctl_visual_map = gamemap;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_visuals_json(int limit, int max_distance_units)
{
    player_t *player;
    int current_sector;
    int i, emitted, walls_emitted;
    size_t used;

    player = doomctl_visual_player();
    doomctl_visual_buffer[0] = '\0';
    if (player == NULL)
    {
        snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer),
                 "{\"ready\":false,\"error\":\"game_not_ready\"}");
        return doomctl_visual_buffer;
    }
    if (limit <= 0 || limit > 256) limit = 128;
    if (max_distance_units < 0 || max_distance_units > 32768) max_distance_units = 0;

    doomctl_visual_ensure_map();
    current_sector = doomctl_visual_sector_index(player->mo->subsector->sector);
    used = (size_t) snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer),
        "{\"ready\":true,\"currentSector\":%d,\"sidedefChangeCount\":%d,"
        "\"sectorFlatChangeCount\":%d,\"sectors\":[",
        current_sector, doomctl_visual_active_side_count(), doomctl_visual_active_flat_count());

    emitted = 0;
    for (i = 0; i < numsectors && emitted < limit && used < sizeof(doomctl_visual_buffer) - 512; ++i)
    {
        char floor[9], ceiling[9];
        double distance = doomctl_visual_sector_distance(player, &sectors[i]);
        if (max_distance_units > 0 && distance > (double) max_distance_units && i != current_sector)
            continue;
        doomctl_visual_current_sector_names(i, floor, ceiling);
        used += (size_t) snprintf(doomctl_visual_buffer + used,
            sizeof(doomctl_visual_buffer) - used,
            "%s{\"index\":%d,\"current\":%s,\"floorFlat\":\"%s\","
            "\"ceilingFlat\":\"%s\",\"light\":%d,\"distance\":%.3f}",
            emitted ? "," : "", i, i == current_sector ? "true" : "false",
            floor, ceiling, sectors[i].lightlevel, distance);
        ++emitted;
    }

    used += (size_t) snprintf(doomctl_visual_buffer + used,
        sizeof(doomctl_visual_buffer) - used, "],\"walls\":[");
    walls_emitted = 0;
    for (i = 0; i < numlines && walls_emitted < limit && used < sizeof(doomctl_visual_buffer) - 768; ++i)
    {
        line_t *line = &lines[i];
        double distance = doomctl_visual_line_distance(player, line);
        int side_no;
        if (max_distance_units > 0 && distance > (double) max_distance_units)
            continue;
        for (side_no = 0; side_no < 2 && walls_emitted < limit; ++side_no)
        {
            int side_index = line->sidenum[side_no];
            char top[9], bottom[9], middle[9];
            sector_t *sector;
            if (side_index < 0 || side_index >= numsides)
                continue;
            sector = sides[side_index].sector;
            doomctl_visual_current_side_names(side_index, top, bottom, middle);
            used += (size_t) snprintf(doomctl_visual_buffer + used,
                sizeof(doomctl_visual_buffer) - used,
                "%s{\"line\":%d,\"side\":\"%s\",\"sideIndex\":%d,"
                "\"sector\":%d,\"top\":\"%s\",\"middle\":\"%s\","
                "\"bottom\":\"%s\",\"distance\":%.3f}",
                walls_emitted ? "," : "", i, side_no == 0 ? "front" : "back",
                side_index, doomctl_visual_sector_index(sector), top, middle, bottom, distance);
            ++walls_emitted;
        }
    }
    snprintf(doomctl_visual_buffer + used, sizeof(doomctl_visual_buffer) - used, "]}");
    return doomctl_visual_buffer;
}

static void doomctl_visual_emit_texture_lump(size_t *used, const char *lumpname,
                                              int *emitted, int limit)
{
    int lump = W_CheckNumForName((char *) lumpname);
    int size;
    unsigned char *data;
    unsigned int count;
    unsigned int i;

    if (lump < 0 || *emitted >= limit) return;
    size = W_LumpLength(lump);
    if (size < 8) return;
    data = (unsigned char *) malloc(size);
    if (data == NULL) return;
    W_ReadLump(lump, data);
    count = doomctl_visual_read_u32(data);
    if (count > 4096 || 4UL + (unsigned long) count * 4UL > (unsigned long) size)
    {
        free(data); return;
    }
    for (i = 0; i < count && *emitted < limit && *used < sizeof(doomctl_visual_buffer) - 64; ++i)
    {
        unsigned int offset = doomctl_visual_read_u32(data + 4 + i * 4);
        char name[9];
        if (offset + 8 > (unsigned int) size) continue;
        doomctl_visual_name_from_raw(name, data + offset);
        *used += (size_t) snprintf(doomctl_visual_buffer + *used,
            sizeof(doomctl_visual_buffer) - *used,
            "%s\"%s\"", *emitted ? "," : "", name);
        ++(*emitted);
    }
    free(data);
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_list_visual_assets_json(int limit)
{
    int emitted;
    int lump;
    size_t used;

    doomctl_visual_buffer[0] = '\0';
    if (doomctl_visual_player() == NULL)
    {
        snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer),
                 "{\"ready\":false,\"error\":\"game_not_ready\"}");
        return doomctl_visual_buffer;
    }
    if (limit <= 0 || limit > 1024) limit = 512;

    used = (size_t) snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer),
                             "{\"ready\":true,\"wallTextures\":[");
    emitted = 0;
    doomctl_visual_emit_texture_lump(&used, "TEXTURE1", &emitted, limit);
    doomctl_visual_emit_texture_lump(&used, "TEXTURE2", &emitted, limit);
    used += (size_t) snprintf(doomctl_visual_buffer + used,
                             sizeof(doomctl_visual_buffer) - used, "],\"flats\":[");
    emitted = 0;
    for (lump = firstflat; lump <= lastflat && emitted < limit
         && used < sizeof(doomctl_visual_buffer) - 64; ++lump)
    {
        char name[9];
        doomctl_visual_name_from_raw(name, (unsigned char *) lumpinfo[lump].name);
        used += (size_t) snprintf(doomctl_visual_buffer + used,
            sizeof(doomctl_visual_buffer) - used,
            "%s\"%s\"", emitted ? "," : "", name);
        ++emitted;
    }
    snprintf(doomctl_visual_buffer + used, sizeof(doomctl_visual_buffer) - used, "]}");
    return doomctl_visual_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_set_wall_texture_json(int line_index, int side_no,
                                           const char *slot, const char *requested_name)
{
    line_t *line;
    int side_index;
    int texture_num;
    char name[9];
    doomctl_side_visual_change_t *change;

    doomctl_visual_buffer[0] = '\0';
    if (doomctl_visual_player() == NULL)
        goto not_ready;
    if (line_index < 0 || line_index >= numlines || (side_no != 0 && side_no != 1))
        goto invalid_target;
    if (!doomctl_visual_canonical_name(requested_name, name, 1))
        goto invalid_name;

    texture_num = R_CheckTextureNumForName(name);
    if (texture_num < 0)
        goto missing_asset;

    line = &lines[line_index];
    side_index = line->sidenum[side_no];
    if (side_index < 0 || side_index >= numsides)
        goto invalid_target;
    change = doomctl_visual_side_change(side_index, 1);
    if (change == NULL)
        goto journal_error;

    if (!strcmp(slot, "top"))
    {
        sides[side_index].toptexture = (short) texture_num;
        strcpy(change->top, name);
    }
    else if (!strcmp(slot, "bottom"))
    {
        sides[side_index].bottomtexture = (short) texture_num;
        strcpy(change->bottom, name);
    }
    else if (!strcmp(slot, "middle"))
    {
        sides[side_index].midtexture = (short) texture_num;
        strcpy(change->middle, name);
    }
    else
        goto invalid_slot;

    doomctl_visual_refresh_side_active(change);
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer),
        "{\"updated\":true,\"line\":%d,\"side\":\"%s\",\"sideIndex\":%d,"
        "\"slot\":\"%s\",\"texture\":\"%s\",\"persisted\":true}",
        line_index, side_no == 0 ? "front" : "back", side_index, slot, name);
    return doomctl_visual_buffer;

not_ready:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"game_not_ready\"}");
    return doomctl_visual_buffer;
invalid_target:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"invalid_wall_target\"}");
    return doomctl_visual_buffer;
invalid_name:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"invalid_texture_name\"}");
    return doomctl_visual_buffer;
missing_asset:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"texture_not_found\"}");
    return doomctl_visual_buffer;
journal_error:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"visual_journal_full_or_baseline_missing\"}");
    return doomctl_visual_buffer;
invalid_slot:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"invalid_texture_slot\"}");
    return doomctl_visual_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_set_sector_flat_json(int sector_index,
                                          const char *surface,
                                          const char *requested_name)
{
    char name[9];
    int lump;
    int flat_num;
    doomctl_sector_flat_change_t *change;

    doomctl_visual_buffer[0] = '\0';
    if (doomctl_visual_player() == NULL)
        goto not_ready;
    if (sector_index < 0 || sector_index >= numsectors)
        goto invalid_sector;
    if (!doomctl_visual_canonical_name(requested_name, name, 0))
        goto invalid_name;

    lump = W_CheckNumForName(name);
    if (lump < firstflat || lump > lastflat)
        goto missing_flat;
    flat_num = lump - firstflat;
    change = doomctl_visual_flat_change(sector_index, 1);
    if (change == NULL)
        goto journal_error;

    if (!strcmp(surface, "floor"))
    {
        sectors[sector_index].floorpic = (short) flat_num;
        strcpy(change->floor, name);
    }
    else if (!strcmp(surface, "ceiling"))
    {
        sectors[sector_index].ceilingpic = (short) flat_num;
        strcpy(change->ceiling, name);
    }
    else
        goto invalid_surface;

    doomctl_visual_refresh_flat_active(change);
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer),
        "{\"updated\":true,\"sector\":%d,\"surface\":\"%s\","
        "\"flat\":\"%s\",\"persisted\":true}", sector_index, surface, name);
    return doomctl_visual_buffer;

not_ready:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"game_not_ready\"}");
    return doomctl_visual_buffer;
invalid_sector:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"invalid_sector\"}");
    return doomctl_visual_buffer;
invalid_name:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"invalid_flat_name\"}");
    return doomctl_visual_buffer;
missing_flat:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"flat_not_found\"}");
    return doomctl_visual_buffer;
journal_error:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"visual_journal_full_or_baseline_missing\"}");
    return doomctl_visual_buffer;
invalid_surface:
    snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer), "{\"updated\":false,\"error\":\"invalid_surface\"}");
    return doomctl_visual_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_visual_changes_json(void)
{
    int i, emitted;
    size_t used;

    doomctl_visual_buffer[0] = '\0';
    if (doomctl_visual_player() == NULL)
    {
        snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer),
                 "{\"ready\":false,\"error\":\"game_not_ready\"}");
        return doomctl_visual_buffer;
    }
    doomctl_visual_ensure_map();
    used = (size_t) snprintf(doomctl_visual_buffer, sizeof(doomctl_visual_buffer),
        "{\"ready\":true,\"sidedefCount\":%d,\"sectorFlatCount\":%d,\"sidedefs\":[",
        doomctl_visual_active_side_count(), doomctl_visual_active_flat_count());
    emitted = 0;
    for (i = 0; i < doomctl_side_change_count && used < sizeof(doomctl_visual_buffer) - 384; ++i)
    {
        doomctl_side_visual_change_t *c = &doomctl_side_changes[i];
        if (!c->active) continue;
        used += (size_t) snprintf(doomctl_visual_buffer + used,
            sizeof(doomctl_visual_buffer) - used,
            "%s{\"side\":%d,\"topFrom\":\"%s\",\"topTo\":\"%s\","
            "\"middleFrom\":\"%s\",\"middleTo\":\"%s\","
            "\"bottomFrom\":\"%s\",\"bottomTo\":\"%s\"}",
            emitted ? "," : "", c->side_index,
            c->original_top, c->top, c->original_middle, c->middle,
            c->original_bottom, c->bottom);
        ++emitted;
    }
    used += (size_t) snprintf(doomctl_visual_buffer + used,
        sizeof(doomctl_visual_buffer) - used, "],\"sectorFlats\":[");
    emitted = 0;
    for (i = 0; i < doomctl_flat_change_count && used < sizeof(doomctl_visual_buffer) - 256; ++i)
    {
        doomctl_sector_flat_change_t *c = &doomctl_flat_changes[i];
        if (!c->active) continue;
        used += (size_t) snprintf(doomctl_visual_buffer + used,
            sizeof(doomctl_visual_buffer) - used,
            "%s{\"sector\":%d,\"floorFrom\":\"%s\",\"floorTo\":\"%s\","
            "\"ceilingFrom\":\"%s\",\"ceilingTo\":\"%s\"}",
            emitted ? "," : "", c->sector_index,
            c->original_floor, c->floor, c->original_ceiling, c->ceiling);
        ++emitted;
    }
    snprintf(doomctl_visual_buffer + used, sizeof(doomctl_visual_buffer) - used, "]}");
    return doomctl_visual_buffer;
}

int doomctl_build_sidedefs_lump(int lump, unsigned char **out_data, int *out_size)
{
    unsigned char *data;
    int size;
    int count;
    int i;

    doomctl_visual_ensure_map();
    size = W_LumpLength(lump);
    if (size < 0 || size % DOOMCTL_SIDE_RECORD_SIZE != 0)
        return 0;
    data = (unsigned char *) malloc(size > 0 ? size : 1);
    if (data == NULL) return 0;
    if (size > 0) W_ReadLump(lump, data);
    count = size / DOOMCTL_SIDE_RECORD_SIZE;

    for (i = 0; i < doomctl_side_change_count; ++i)
    {
        doomctl_side_visual_change_t *c = &doomctl_side_changes[i];
        unsigned char *record;
        if (!c->active) continue;
        if (c->side_index < 0 || c->side_index >= count) { free(data); return 0; }
        record = data + c->side_index * DOOMCTL_SIDE_RECORD_SIZE;
        doomctl_visual_name_to_raw(record + 4, c->top);
        doomctl_visual_name_to_raw(record + 12, c->bottom);
        doomctl_visual_name_to_raw(record + 20, c->middle);
    }
    *out_data = data;
    *out_size = size;
    return 1;
}

int doomctl_patch_visual_sectors_lump(unsigned char *data, int size)
{
    int count;
    int i;

    doomctl_visual_ensure_map();
    if (data == NULL || size < 0 || size % DOOMCTL_SECTOR_RECORD_SIZE != 0)
        return 0;
    count = size / DOOMCTL_SECTOR_RECORD_SIZE;
    for (i = 0; i < doomctl_flat_change_count; ++i)
    {
        doomctl_sector_flat_change_t *c = &doomctl_flat_changes[i];
        unsigned char *record;
        if (!c->active) continue;
        if (c->sector_index < 0 || c->sector_index >= count) return 0;
        record = data + c->sector_index * DOOMCTL_SECTOR_RECORD_SIZE;
        doomctl_visual_name_to_raw(record + 4, c->floor);
        doomctl_visual_name_to_raw(record + 12, c->ceiling);
    }
    return 1;
}
