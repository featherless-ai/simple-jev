// Safe LINEDEFS / door authoring layer for the direct LinuxDOOM browser port.
//
// This module deliberately edits only semantic fields that do not alter map
// topology: linedef special and tag. Vertices, sidedefs and BSP-derived data
// remain untouched, so the resulting edits can be persisted by patching the
// original LINEDEFS lump without rebuilding NODES/SEGS/SSECTORS/BLOCKMAP.

#include "doomdef.h"
#include "doomstat.h"
#include "doomdata.h"
#include "d_player.h"
#include "p_local.h"
#include "p_spec.h"
#include "r_state.h"
#include "w_wad.h"

#include <emscripten/emscripten.h>

#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define DOOMCTL_LINE_BUFSIZE 65536
#define DOOMCTL_MAX_LINE_CHANGES 512
#define DOOMCTL_LINE_RECORD_SIZE 14

typedef struct
{
    int active;
    int line_index;
    short original_special;
    short original_tag;
    short special;
    short tag;
} doomctl_line_change_t;

static char doomctl_line_buffer[DOOMCTL_LINE_BUFSIZE];
static doomctl_line_change_t doomctl_line_changes[DOOMCTL_MAX_LINE_CHANGES];
static int doomctl_line_change_count = 0;
static int doomctl_line_episode = -1;
static int doomctl_line_map = -1;

static player_t *doomctl_line_player(void)
{
    if (consoleplayer < 0 || consoleplayer >= MAXPLAYERS)
        return NULL;
    if (!playeringame[consoleplayer] || gamestate != GS_LEVEL)
        return NULL;
    if (players[consoleplayer].mo == NULL)
        return NULL;
    return &players[consoleplayer];
}

static void doomctl_line_reset_internal(void)
{
    memset(doomctl_line_changes, 0, sizeof(doomctl_line_changes));
    doomctl_line_change_count = 0;
}

static void doomctl_line_ensure_map(void)
{
    if (doomctl_line_episode == gameepisode && doomctl_line_map == gamemap)
        return;

    doomctl_line_reset_internal();
    doomctl_line_episode = gameepisode;
    doomctl_line_map = gamemap;
}

static void doomctl_line_put_u16(unsigned char *p, int value)
{
    unsigned int v = (unsigned short) (short) value;
    p[0] = (unsigned char) (v & 0xff);
    p[1] = (unsigned char) ((v >> 8) & 0xff);
}

static int doomctl_line_get_i16(const unsigned char *p)
{
    unsigned int v = (unsigned int) p[0] | ((unsigned int) p[1] << 8);
    return (int) (short) v;
}

static const char *doomctl_line_action_name(int special)
{
    switch (special)
    {
        case 0:   return "none";
        case 1:   return "manual_door_raise";
        case 26:  return "manual_blue_door_raise";
        case 27:  return "manual_yellow_door_raise";
        case 28:  return "manual_red_door_raise";
        case 29:  return "switch_door_raise_once";
        case 31:  return "manual_door_open";
        case 32:  return "manual_blue_door_open";
        case 33:  return "manual_red_door_open";
        case 34:  return "manual_yellow_door_open";
        case 42:  return "button_door_close";
        case 50:  return "switch_door_close_once";
        case 61:  return "button_door_open";
        case 63:  return "button_door_raise";
        case 103: return "switch_door_open_once";
        case 111: return "switch_blazing_door_raise_once";
        case 112: return "switch_blazing_door_open_once";
        case 113: return "switch_blazing_door_close_once";
        case 114: return "button_blazing_door_raise";
        case 115: return "button_blazing_door_open";
        case 116: return "button_blazing_door_close";
        case 117: return "manual_blazing_door_raise";
        case 118: return "manual_blazing_door_open";
        case 133: return "switch_blue_blazing_door_open";
        case 135: return "switch_red_blazing_door_open";
        case 137: return "switch_yellow_blazing_door_open";
        default:  return "other_special";
    }
}

static int doomctl_line_is_door_special(int special)
{
    return strcmp(doomctl_line_action_name(special), "other_special") != 0
        && special != 0;
}

static int doomctl_line_preset_special(const char *preset, int *special)
{
    if (preset == NULL || special == NULL)
        return 0;

    if (!strcmp(preset, "none")) *special = 0;
    else if (!strcmp(preset, "manual_raise")) *special = 1;
    else if (!strcmp(preset, "manual_open")) *special = 31;
    else if (!strcmp(preset, "switch_raise_once")) *special = 29;
    else if (!strcmp(preset, "switch_open_once")) *special = 103;
    else if (!strcmp(preset, "switch_close_once")) *special = 50;
    else if (!strcmp(preset, "button_raise")) *special = 63;
    else if (!strcmp(preset, "button_open")) *special = 61;
    else if (!strcmp(preset, "button_close")) *special = 42;
    else if (!strcmp(preset, "manual_blazing_raise")) *special = 117;
    else if (!strcmp(preset, "manual_blazing_open")) *special = 118;
    else if (!strcmp(preset, "switch_blazing_raise_once")) *special = 111;
    else if (!strcmp(preset, "switch_blazing_open_once")) *special = 112;
    else if (!strcmp(preset, "switch_blazing_close_once")) *special = 113;
    else if (!strcmp(preset, "button_blazing_raise")) *special = 114;
    else if (!strcmp(preset, "button_blazing_open")) *special = 115;
    else if (!strcmp(preset, "button_blazing_close")) *special = 116;
    else return 0;

    return 1;
}

static double doomctl_line_units(fixed_t value)
{
    return (double) value / (double) FRACUNIT;
}

static double doomctl_line_distance(player_t *player, line_t *line)
{
    fixed_t mx = line->v1->x / 2 + line->v2->x / 2;
    fixed_t my = line->v1->y / 2 + line->v2->y / 2;
    return doomctl_line_units(P_AproxDistance(mx - player->mo->x,
                                              my - player->mo->y));
}

static int doomctl_line_sector_index(sector_t *sector)
{
    if (sector == NULL || sector < sectors || sector >= sectors + numsectors)
        return -1;
    return (int) (sector - sectors);
}

static int doomctl_line_baseline_values(int line_index, short *special, short *tag)
{
    char mapname[9];
    int marker;
    int lump;
    int size;
    unsigned char *data;
    unsigned char *record;

    if (line_index < 0)
        return 0;

    snprintf(mapname, sizeof(mapname), "E%dM%d", gameepisode, gamemap);
    marker = W_CheckNumForName(mapname);
    if (marker < 0)
        return 0;

    lump = marker + ML_LINEDEFS;
    size = W_LumpLength(lump);
    if (size < 0 || size % DOOMCTL_LINE_RECORD_SIZE != 0
     || line_index >= size / DOOMCTL_LINE_RECORD_SIZE)
        return 0;

    data = (unsigned char *) malloc(size > 0 ? size : 1);
    if (data == NULL)
        return 0;
    W_ReadLump(lump, data);
    record = data + line_index * DOOMCTL_LINE_RECORD_SIZE;
    if (special != NULL) *special = (short) doomctl_line_get_i16(record + 6);
    if (tag != NULL) *tag = (short) doomctl_line_get_i16(record + 8);
    free(data);
    return 1;
}

static int doomctl_line_record_change(int line_index, short special, short tag)
{
    short original_special;
    short original_tag;
    int i;

    doomctl_line_ensure_map();
    if (!doomctl_line_baseline_values(line_index, &original_special, &original_tag))
        return 0;

    for (i = 0; i < doomctl_line_change_count; ++i)
    {
        doomctl_line_change_t *change = &doomctl_line_changes[i];
        if (change->line_index != line_index)
            continue;
        change->special = special;
        change->tag = tag;
        change->active = !(special == change->original_special
                        && tag == change->original_tag);
        return 1;
    }

    if (special == original_special && tag == original_tag)
        return 1;
    if (doomctl_line_change_count >= DOOMCTL_MAX_LINE_CHANGES)
        return 0;

    doomctl_line_changes[doomctl_line_change_count].active = 1;
    doomctl_line_changes[doomctl_line_change_count].line_index = line_index;
    doomctl_line_changes[doomctl_line_change_count].original_special = original_special;
    doomctl_line_changes[doomctl_line_change_count].original_tag = original_tag;
    doomctl_line_changes[doomctl_line_change_count].special = special;
    doomctl_line_changes[doomctl_line_change_count].tag = tag;
    ++doomctl_line_change_count;
    return 1;
}

int doomctl_linedef_change_count(void)
{
    int i;
    int count = 0;
    doomctl_line_ensure_map();
    for (i = 0; i < doomctl_line_change_count; ++i)
        if (doomctl_line_changes[i].active)
            ++count;
    return count;
}

void doomctl_reset_linedef_changes(void)
{
    doomctl_line_reset_internal();
    doomctl_line_episode = gameepisode;
    doomctl_line_map = gamemap;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_linedefs_json(int limit, int max_distance_units)
{
    player_t *player;
    int emitted;
    int i;
    size_t used;

    player = doomctl_line_player();
    doomctl_line_buffer[0] = '\0';
    if (player == NULL)
    {
        snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
                 "{\"ready\":false,\"error\":\"game_not_ready\"}");
        return doomctl_line_buffer;
    }

    if (limit <= 0 || limit > 512) limit = 512;
    if (max_distance_units < 0 || max_distance_units > 32768)
        max_distance_units = 0;

    doomctl_line_ensure_map();
    used = 0;
    emitted = 0;
    used += (size_t) snprintf(doomctl_line_buffer + used,
        sizeof(doomctl_line_buffer) - used,
        "{\"ready\":true,\"lineCount\":%d,\"changeCount\":%d,\"lines\":[",
        numlines, doomctl_linedef_change_count());

    for (i = 0; i < numlines && emitted < limit && used < sizeof(doomctl_line_buffer) - 512; ++i)
    {
        line_t *line = &lines[i];
        double distance = doomctl_line_distance(player, line);
        double x1 = doomctl_line_units(line->v1->x);
        double y1 = doomctl_line_units(line->v1->y);
        double x2 = doomctl_line_units(line->v2->x);
        double y2 = doomctl_line_units(line->v2->y);

        if (max_distance_units > 0 && distance > (double) max_distance_units)
            continue;

        used += (size_t) snprintf(doomctl_line_buffer + used,
            sizeof(doomctl_line_buffer) - used,
            "%s{\"index\":%d,\"special\":%d,\"action\":\"%s\",\"doorLike\":%s,"
            "\"tag\":%d,\"flags\":%d,\"twoSided\":%s,"
            "\"frontSector\":%d,\"backSector\":%d,"
            "\"x1\":%.3f,\"y1\":%.3f,\"x2\":%.3f,\"y2\":%.3f,\"distance\":%.3f}",
            emitted ? "," : "", i, line->special,
            doomctl_line_action_name(line->special),
            doomctl_line_is_door_special(line->special) ? "true" : "false",
            line->tag, line->flags,
            line->backsector != NULL ? "true" : "false",
            doomctl_line_sector_index(line->frontsector),
            doomctl_line_sector_index(line->backsector),
            x1, y1, x2, y2, distance);
        ++emitted;
    }

    snprintf(doomctl_line_buffer + used, sizeof(doomctl_line_buffer) - used, "]}");
    return doomctl_line_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_set_linedef_action_json(int line_index,
                                             const char *preset,
                                             int requested_tag)
{
    line_t *line;
    int special;
    short tag;

    doomctl_line_buffer[0] = '\0';
    if (doomctl_line_player() == NULL)
    {
        snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
                 "{\"updated\":false,\"error\":\"game_not_ready\"}");
        return doomctl_line_buffer;
    }
    if (line_index < 0 || line_index >= numlines)
    {
        snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
                 "{\"updated\":false,\"error\":\"invalid_line\"}");
        return doomctl_line_buffer;
    }
    if (!doomctl_line_preset_special(preset, &special))
    {
        snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
                 "{\"updated\":false,\"error\":\"unsupported_preset\"}");
        return doomctl_line_buffer;
    }
    if (requested_tag < -1 || requested_tag > 32767)
    {
        snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
                 "{\"updated\":false,\"error\":\"invalid_tag\"}");
        return doomctl_line_buffer;
    }

    line = &lines[line_index];
    tag = requested_tag < 0 ? line->tag : (short) requested_tag;
    if (!doomctl_line_record_change(line_index, (short) special, tag))
    {
        snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
                 "{\"updated\":false,\"error\":\"change_journal_full_or_baseline_missing\"}");
        return doomctl_line_buffer;
    }

    line->special = (short) special;
    line->tag = tag;
    snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
             "{\"updated\":true,\"index\":%d,\"special\":%d,"
             "\"action\":\"%s\",\"tag\":%d,\"persisted\":true}",
             line_index, special, doomctl_line_action_name(special), tag);
    return doomctl_line_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_activate_linedef_json(int line_index)
{
    player_t *player;
    line_t *line;
    int before;
    int used;

    player = doomctl_line_player();
    doomctl_line_buffer[0] = '\0';
    if (player == NULL)
    {
        snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
                 "{\"activated\":false,\"error\":\"game_not_ready\"}");
        return doomctl_line_buffer;
    }
    if (line_index < 0 || line_index >= numlines)
    {
        snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
                 "{\"activated\":false,\"error\":\"invalid_line\"}");
        return doomctl_line_buffer;
    }

    line = &lines[line_index];
    before = line->special;
    used = P_UseSpecialLine(player->mo, line, 0) ? 1 : 0;
    snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
             "{\"activated\":%s,\"index\":%d,\"specialBefore\":%d,"
             "\"specialAfter\":%d,\"actionBefore\":\"%s\","
             "\"playtestOnly\":true}",
             used ? "true" : "false", line_index, before, line->special,
             doomctl_line_action_name(before));
    return doomctl_line_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_get_linedef_changes_json(void)
{
    int i;
    int emitted;
    size_t used;

    doomctl_line_buffer[0] = '\0';
    if (doomctl_line_player() == NULL)
    {
        snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
                 "{\"ready\":false,\"error\":\"game_not_ready\"}");
        return doomctl_line_buffer;
    }

    doomctl_line_ensure_map();
    used = (size_t) snprintf(doomctl_line_buffer, sizeof(doomctl_line_buffer),
        "{\"ready\":true,\"count\":%d,\"linedefs\":[",
        doomctl_linedef_change_count());
    emitted = 0;

    for (i = 0; i < doomctl_line_change_count && used < sizeof(doomctl_line_buffer) - 256; ++i)
    {
        doomctl_line_change_t *change = &doomctl_line_changes[i];
        if (!change->active)
            continue;
        used += (size_t) snprintf(doomctl_line_buffer + used,
            sizeof(doomctl_line_buffer) - used,
            "%s{\"line\":%d,\"specialFrom\":%d,\"specialTo\":%d,"
            "\"actionTo\":\"%s\",\"tagFrom\":%d,\"tagTo\":%d}",
            emitted ? "," : "", change->line_index,
            change->original_special, change->special,
            doomctl_line_action_name(change->special),
            change->original_tag, change->tag);
        ++emitted;
    }

    snprintf(doomctl_line_buffer + used, sizeof(doomctl_line_buffer) - used, "]}");
    return doomctl_line_buffer;
}

// Called from the existing PWAD exporter after a build-time adapter adds the
// ML_LINEDEFS case. Ownership of *out_data transfers to the caller.
int doomctl_build_linedefs_lump(int lump, unsigned char **out_data, int *out_size)
{
    unsigned char *data;
    int size;
    int count;
    int i;

    doomctl_line_ensure_map();
    size = W_LumpLength(lump);
    if (size < 0 || size % DOOMCTL_LINE_RECORD_SIZE != 0)
        return 0;

    data = (unsigned char *) malloc(size > 0 ? size : 1);
    if (data == NULL)
        return 0;
    if (size > 0)
        W_ReadLump(lump, data);

    count = size / DOOMCTL_LINE_RECORD_SIZE;
    for (i = 0; i < doomctl_line_change_count; ++i)
    {
        doomctl_line_change_t *change = &doomctl_line_changes[i];
        unsigned char *record;
        if (!change->active)
            continue;
        if (change->line_index < 0 || change->line_index >= count)
        {
            free(data);
            return 0;
        }
        record = data + change->line_index * DOOMCTL_LINE_RECORD_SIZE;
        doomctl_line_put_u16(record + 6, change->special);
        doomctl_line_put_u16(record + 8, change->tag);
    }

    *out_data = data;
    *out_size = size;
    return 1;
}
