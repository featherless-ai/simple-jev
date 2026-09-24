// Runtime PWAD import/reload adapter for the direct LinuxDOOM browser port.
//
// There are now two intentionally different paths:
//
// 1) Geometry/cold-boot path (preferred for structural PWADs): JavaScript writes
//    a candidate PWAD into the fresh Emscripten FS before main(), calls
//    doomctl_set_boot_pwad_path(), and D_DoomMain asks
//    doomctl_prepare_boot_pwad() to append that path to wadfiles BEFORE
//    W_InitMultipleFiles().  LinuxDOOM therefore constructs lumpinfo/lumpcache
//    and the first level from IWAD + candidate in one clean startup lifecycle.
//
// 2) Legacy live-reload path (kept for compatibility with older authoring
//    tools): append a validated PWAD after the IWAD and defer the map restart
//    through G_DeferedInitNew().  Structural geometry authoring no longer uses
//    this path because P_SetupLevel tears down the whole PU_LEVEL lifetime.
//    In particular, geometry must never call G_InitNew directly from an MCP
//    callback; that old path is retained here only as a CI compatibility marker.

#include "doomdef.h"
#include "doomstat.h"
#include "d_main.h"
#include "g_game.h"
#include "w_wad.h"

#include <emscripten/emscripten.h>

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define DOOMCTL_RELOAD_BUFSIZE 1024
#define DOOMCTL_MAX_IMPORTS 32
#define DOOMCTL_BOOT_PATH_BUFSIZE 512

extern void W_AddFile(char *filename);
extern int doomctl_reset_changeset(void);

static char doomctl_reload_buffer[DOOMCTL_RELOAD_BUFSIZE];
static char doomctl_boot_pwad_path[DOOMCTL_BOOT_PATH_BUFSIZE];
static int doomctl_import_count = 0;
static int doomctl_reload_pending = 0;
static int doomctl_reload_episode = 0;
static int doomctl_reload_map = 0;
static int doomctl_reload_was_import = 0;
static int doomctl_reload_imported_lumps = 0;
static int doomctl_reload_total_lumps = 0;

static unsigned int doomctl_read_u32(const unsigned char *p)
{
    return (unsigned int) p[0]
        | ((unsigned int) p[1] << 8)
        | ((unsigned int) p[2] << 16)
        | ((unsigned int) p[3] << 24);
}

static int doomctl_name_equals(const unsigned char *raw, const char *name)
{
    char value[9];
    int i;

    memset(value, 0, sizeof(value));
    for (i = 0; i < 8; ++i)
    {
        if (raw[i] == 0)
            break;
        value[i] = (char) raw[i];
    }
    return !strcmp(value, name);
}

static int doomctl_has_wad_extension(const char *path)
{
    size_t length;
    const char *ext;

    if (path == NULL)
        return 0;
    length = strlen(path);
    if (length < 4)
        return 0;
    ext = path + length - 4;
    return (ext[0] == '.')
        && (ext[1] == 'w' || ext[1] == 'W')
        && (ext[2] == 'a' || ext[2] == 'A')
        && (ext[3] == 'd' || ext[3] == 'D');
}

// Called from JavaScript after the WASM runtime/filesystem is initialized but
// before Module.callMain().  The path must already exist in Emscripten FS.
EMSCRIPTEN_KEEPALIVE
int doomctl_set_boot_pwad_path(const char *path)
{
    size_t length;

    doomctl_boot_pwad_path[0] = '\0';
    if (path == NULL || path[0] != '/' || !doomctl_has_wad_extension(path))
        return -1;

    length = strlen(path);
    if (length >= sizeof(doomctl_boot_pwad_path))
        return -2;

    memcpy(doomctl_boot_pwad_path, path, length + 1);
    return 1;
}

// Called by build-patched D_DoomMain immediately before W_InitMultipleFiles().
// D_AddFile copies the string, so clearing our staging buffer afterward is safe.
// Returning 1 means a cold-boot PWAD was added, 0 means normal IWAD-only boot.
int doomctl_prepare_boot_pwad(void)
{
    if (doomctl_boot_pwad_path[0] == '\0')
        return 0;

    D_AddFile(doomctl_boot_pwad_path);
    printf("DOOM MCP cold boot: staged %s before W_InitMultipleFiles\n",
           doomctl_boot_pwad_path);
    doomctl_boot_pwad_path[0] = '\0';
    return 1;
}

static int doomctl_validate_current_map_pwad(const char *path,
                                             int *out_lump_count)
{
    static const char *expected[] = {
        "THINGS", "LINEDEFS", "SIDEDEFS", "VERTEXES", "SEGS",
        "SSECTORS", "NODES", "SECTORS", "REJECT", "BLOCKMAP"
    };
    FILE *fp;
    unsigned char header[12];
    unsigned char entry[16];
    char mapname[9];
    long file_size;
    unsigned int lump_count;
    unsigned int directory_offset;
    unsigned int i;
    int marker_index;

    fp = fopen(path, "rb");
    if (fp == NULL)
        return -10;

    if (fseek(fp, 0, SEEK_END) != 0)
    {
        fclose(fp);
        return -11;
    }
    file_size = ftell(fp);
    if (file_size < 12 || file_size > 16 * 1024 * 1024L)
    {
        fclose(fp);
        return -12;
    }
    if (fseek(fp, 0, SEEK_SET) != 0
     || fread(header, 1, sizeof(header), fp) != sizeof(header))
    {
        fclose(fp);
        return -11;
    }

    if (memcmp(header, "PWAD", 4) != 0)
    {
        fclose(fp);
        return -13;
    }

    lump_count = doomctl_read_u32(header + 4);
    directory_offset = doomctl_read_u32(header + 8);
    if (lump_count == 0 || lump_count > 4096
     || directory_offset > (unsigned long) file_size
     || (unsigned long) directory_offset + (unsigned long) lump_count * 16UL
        > (unsigned long) file_size)
    {
        fclose(fp);
        return -14;
    }

    snprintf(mapname, sizeof(mapname), "E%dM%d", gameepisode, gamemap);
    marker_index = -1;

    for (i = 0; i < lump_count; ++i)
    {
        unsigned int position;
        unsigned int size;

        if (fseek(fp, (long) directory_offset + (long) i * 16L, SEEK_SET) != 0
         || fread(entry, 1, sizeof(entry), fp) != sizeof(entry))
        {
            fclose(fp);
            return -15;
        }

        position = doomctl_read_u32(entry + 0);
        size = doomctl_read_u32(entry + 4);
        if ((unsigned long) position + (unsigned long) size
            > (unsigned long) file_size)
        {
            fclose(fp);
            return -16;
        }

        if (doomctl_name_equals(entry + 8, mapname))
            marker_index = (int) i;
    }

    if (marker_index < 0 || marker_index + 10 >= (int) lump_count)
    {
        fclose(fp);
        return -17;
    }

    for (i = 0; i < 10; ++i)
    {
        if (fseek(fp,
                  (long) directory_offset + (long) (marker_index + 1 + (int) i) * 16L,
                  SEEK_SET) != 0
         || fread(entry, 1, sizeof(entry), fp) != sizeof(entry))
        {
            fclose(fp);
            return -15;
        }
        if (!doomctl_name_equals(entry + 8, expected[i]))
        {
            fclose(fp);
            return -18;
        }
    }

    fclose(fp);
    if (out_lump_count != NULL)
        *out_lump_count = (int) lump_count;
    return 1;
}

static void doomctl_schedule_reload(int was_import,
                                    int imported_lumps,
                                    int total_lumps)
{
    doomctl_reload_pending = 1;
    doomctl_reload_episode = gameepisode;
    doomctl_reload_map = gamemap;
    doomctl_reload_was_import = was_import;
    doomctl_reload_imported_lumps = imported_lumps;
    doomctl_reload_total_lumps = total_lumps;

    // Compatibility path only. Structural geometry uses fresh-runtime cold boot.
    G_DeferedInitNew(gameskill, gameepisode, gamemap);
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_reload_status_json(void)
{
    int reset_result;

    doomctl_reload_buffer[0] = '\0';

    if (!doomctl_reload_pending)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"pending\":false,\"completed\":true,"
                 "\"episode\":%d,\"map\":%d}",
                 gameepisode, gamemap);
        return doomctl_reload_buffer;
    }

    if (gameaction != ga_nothing
     || gamestate != GS_LEVEL
     || gameepisode != doomctl_reload_episode
     || gamemap != doomctl_reload_map)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"pending\":true,\"completed\":false,"
                 "\"episode\":%d,\"map\":%d,\"gameaction\":%d,"
                 "\"gamestate\":%d}",
                 gameepisode, gamemap, (int) gameaction, (int) gamestate);
        return doomctl_reload_buffer;
    }

    reset_result = doomctl_reset_changeset();
    doomctl_reload_pending = 0;

    snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
             "{\"pending\":false,\"completed\":true,"
             "\"episode\":%d,\"map\":%d,\"wasImport\":%s,"
             "\"importedLumps\":%d,\"totalLumps\":%d,"
             "\"importsThisSession\":%d,\"changeSetReset\":%s}",
             gameepisode, gamemap,
             doomctl_reload_was_import ? "true" : "false",
             doomctl_reload_imported_lumps, doomctl_reload_total_lumps,
             doomctl_import_count, reset_result > 0 ? "true" : "false");
    return doomctl_reload_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_load_pwad_json(const char *path)
{
    int validation;
    int imported_lumps;
    int before;
    int expected_total;
    void **newcache;

    doomctl_reload_buffer[0] = '\0';

    if (doomctl_reload_pending)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"loaded\":false,\"error\":\"reload_in_progress\"}");
        return doomctl_reload_buffer;
    }
    if (gamestate != GS_LEVEL)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"loaded\":false,\"error\":\"game_not_ready\"}");
        return doomctl_reload_buffer;
    }
    if (path == NULL || path[0] == '\0')
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"loaded\":false,\"error\":\"invalid_path\"}");
        return doomctl_reload_buffer;
    }
    if (doomctl_import_count >= DOOMCTL_MAX_IMPORTS)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"loaded\":false,\"error\":\"import_limit_reached\"}");
        return doomctl_reload_buffer;
    }

    validation = doomctl_validate_current_map_pwad(path, &imported_lumps);
    if (validation <= 0)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"loaded\":false,\"error\":\"invalid_pwad\",\"code\":%d}",
                 validation);
        return doomctl_reload_buffer;
    }

    before = numlumps;
    expected_total = before + imported_lumps;

    // Legacy compatibility path: live appends need a larger cache array. New
    // geometry cold boot does not need this because W_InitMultipleFiles sizes
    // lumpcache once from IWAD + candidate before any level is constructed.
    newcache = (void **) realloc(lumpcache,
                                (size_t) expected_total * sizeof(*lumpcache));
    if (newcache == NULL)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"loaded\":false,\"error\":\"lumpcache_realloc_failed\"}");
        return doomctl_reload_buffer;
    }
    lumpcache = newcache;
    memset(lumpcache + before, 0,
           (size_t) imported_lumps * sizeof(*lumpcache));

    W_AddFile((char *) path);
    if (numlumps != expected_total)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"loaded\":false,\"error\":\"wad_append_failed\","
                 "\"expectedLumps\":%d,\"actualLumps\":%d}",
                 expected_total, numlumps);
        return doomctl_reload_buffer;
    }

    ++doomctl_import_count;
    doomctl_schedule_reload(1, imported_lumps, numlumps);

    snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
             "{\"loaded\":true,\"scheduled\":true,\"completed\":false,"
             "\"episode\":%d,\"map\":%d,\"importedLumps\":%d,"
             "\"totalLumps\":%d,\"importsThisSession\":%d}",
             gameepisode, gamemap, imported_lumps, numlumps,
             doomctl_import_count);
    return doomctl_reload_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *doomctl_reload_current_map_json(void)
{
    doomctl_reload_buffer[0] = '\0';

    if (doomctl_reload_pending)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"reloaded\":false,\"error\":\"reload_in_progress\"}");
        return doomctl_reload_buffer;
    }
    if (gamestate != GS_LEVEL)
    {
        snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
                 "{\"reloaded\":false,\"error\":\"game_not_ready\"}");
        return doomctl_reload_buffer;
    }

    doomctl_schedule_reload(0, 0, numlumps);

    snprintf(doomctl_reload_buffer, DOOMCTL_RELOAD_BUFSIZE,
             "{\"reloaded\":true,\"scheduled\":true,\"completed\":false,"
             "\"episode\":%d,\"map\":%d}",
             gameepisode, gamemap);
    return doomctl_reload_buffer;
}
