// Browser SFX backend for the direct id Software LinuxDOOM 1.10 port.
//
// Music is intentionally NOT implemented here. The music side is supplied by
// the imported Vanilla-DMX-compatible OPL backend prepared at build time from
// Chocolate Doom's OPL music code plus the Nuked OPL emulator. Keeping SFX and
// music separate makes it possible to reproduce the old Sound Blaster/AdLib
// register path without disturbing the already-working DMX sound effects.

#include "doomdef.h"
#include "doomstat.h"
#include "sounds.h"
#include "w_wad.h"
#include "z_zone.h"
#include "i_sound.h"

#include <SDL.h>
#include <SDL_mixer.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define WEB_MIX_FREQ 44100
#define WEB_MIX_CHANNELS 32

// LinuxDOOM's config code still references this historical variable even
// though the browser backend has no external sndserver process.
char *sndserver_filename = "";

typedef struct
{
    Mix_Chunk *chunk;
} web_sfx_channel_t;

static web_sfx_channel_t web_channels[WEB_MIX_CHANNELS];
static int web_audio_ready;

static unsigned int read_le16(const unsigned char *p)
{
    return (unsigned int)p[0] | ((unsigned int)p[1] << 8);
}

static unsigned int read_le32(const unsigned char *p)
{
    return (unsigned int)p[0]
        | ((unsigned int)p[1] << 8)
        | ((unsigned int)p[2] << 16)
        | ((unsigned int)p[3] << 24);
}

static void put_le16(unsigned char *p, unsigned int v)
{
    p[0] = (unsigned char)(v & 255);
    p[1] = (unsigned char)((v >> 8) & 255);
}

static void put_le32(unsigned char *p, unsigned int v)
{
    p[0] = (unsigned char)(v & 255);
    p[1] = (unsigned char)((v >> 8) & 255);
    p[2] = (unsigned char)((v >> 16) & 255);
    p[3] = (unsigned char)((v >> 24) & 255);
}

static void free_channel_chunk(int channel)
{
    if (channel < 0 || channel >= WEB_MIX_CHANNELS)
        return;

    if (web_channels[channel].chunk)
    {
        Mix_FreeChunk(web_channels[channel].chunk);
        web_channels[channel].chunk = 0;
    }
}

static void set_channel_params(int channel, int vol, int sep)
{
    int mixer_volume;
    int left;
    int right;

    if (channel < 0 || channel >= WEB_MIX_CHANNELS)
        return;

    if (vol < 0) vol = 0;
    if (vol > 127) vol = 127;
    if (sep < 0) sep = 0;
    if (sep > 255) sep = 255;

    mixer_volume = (vol * MIX_MAX_VOLUME) / 127;
    Mix_Volume(channel, mixer_volume);

    // DOOM separation: 0 = hard left, 128 = center, 255 = hard right.
    if (sep <= 128)
    {
        left = 255;
        right = sep * 2;
    }
    else
    {
        left = (255 - sep) * 2;
        right = 255;
    }

    if (left < 0) left = 0;
    if (left > 255) left = 255;
    if (right < 0) right = 0;
    if (right > 255) right = 255;
    Mix_SetPanning(channel, (Uint8)left, (Uint8)right);
}

// Convert a DOOM/DMX type-3 SFX lump into an in-memory WAV. Encoding pitch
// into the WAV sample rate preserves LinuxDOOM's original pitch variation
// while allowing SDL_mixer to resample to the browser device.
static unsigned char *dmx_to_wav(const unsigned char *dmx, int lump_len,
                                 int pitch, int *wav_len)
{
    unsigned int format;
    unsigned int sample_rate;
    unsigned int sample_count;
    unsigned int pitched_rate;
    unsigned int data_offset;
    unsigned int usable;
    unsigned int total;
    unsigned char *wav;

    if (!dmx || lump_len < 8 || !wav_len)
        return 0;

    format = read_le16(dmx);
    sample_rate = read_le16(dmx + 2);
    sample_count = read_le32(dmx + 4);
    data_offset = 8;

    if (format != 3 || sample_rate == 0)
        return 0;

    usable = (unsigned int)(lump_len - (int)data_offset);
    if (sample_count > usable)
        sample_count = usable;

    if (pitch < 1) pitch = 1;
    if (pitch > 255) pitch = 255;
    pitched_rate = (sample_rate * (unsigned int)pitch) / 128U;
    if (pitched_rate < 1000U) pitched_rate = 1000U;

    total = 44U + sample_count;
    wav = (unsigned char *)malloc(total);
    if (!wav)
        return 0;

    memcpy(wav, "RIFF", 4);
    put_le32(wav + 4, total - 8U);
    memcpy(wav + 8, "WAVEfmt ", 8);
    put_le32(wav + 16, 16U);
    put_le16(wav + 20, 1U);
    put_le16(wav + 22, 1U);
    put_le32(wav + 24, pitched_rate);
    put_le32(wav + 28, pitched_rate);
    put_le16(wav + 32, 1U);
    put_le16(wav + 34, 8U);
    memcpy(wav + 36, "data", 4);
    put_le32(wav + 40, sample_count);
    memcpy(wav + 44, dmx + data_offset, sample_count);

    *wav_len = (int)total;
    return wav;
}

void I_InitSound(void)
{
    int i;

    if (web_audio_ready)
        return;

    if (SDL_InitSubSystem(SDL_INIT_AUDIO) < 0)
    {
        fprintf(stderr, "I_InitSound: SDL audio init failed: %s\n", SDL_GetError());
        return;
    }

    // Signed 16-bit stereo is also the format expected by Chocolate Doom's
    // OPL SDL backend, which later registers a post-mix effect on this mixer.
    if (Mix_OpenAudio(WEB_MIX_FREQ, AUDIO_S16SYS, 2, 1024) < 0)
    {
        fprintf(stderr, "I_InitSound: Mix_OpenAudio failed: %s\n", Mix_GetError());
        return;
    }

    Mix_AllocateChannels(WEB_MIX_CHANNELS);
    for (i = 0; i < WEB_MIX_CHANNELS; ++i)
        web_channels[i].chunk = 0;

    web_audio_ready = 1;
    fprintf(stderr, "I_InitSound: direct SDL/WebAudio SFX backend ready\n");
}

void I_UpdateSound(void) {}
void I_SubmitSound(void) {}
void I_SetChannels(void) {}

void I_ShutdownSound(void)
{
    int i;

    if (!web_audio_ready)
        return;

    for (i = 0; i < WEB_MIX_CHANNELS; ++i)
    {
        Mix_HaltChannel(i);
        free_channel_chunk(i);
    }

    // I_ShutdownMusic runs separately. The imported OPL backend sees that it
    // did not own SDL_mixer and therefore does not close this shared device.
    Mix_CloseAudio();
    SDL_QuitSubSystem(SDL_INIT_AUDIO);
    web_audio_ready = 0;
}

int I_GetSfxLumpNum(sfxinfo_t *sfxinfo)
{
    char namebuf[9];
    namebuf[0] = 'd';
    namebuf[1] = 's';
    namebuf[2] = '\0';
    strncat(namebuf, sfxinfo->name, 6);
    return W_GetNumForName(namebuf);
}

int I_StartSound(int id, int vol, int sep, int pitch, int priority)
{
    int lumpnum;
    int lump_len;
    unsigned char *dmx;
    unsigned char *wav;
    int wav_len;
    SDL_RWops *rw;
    Mix_Chunk *chunk;
    int channel;

    (void)priority;

    if (!web_audio_ready || id <= 0 || id >= NUMSFX)
        return 0;

    lumpnum = S_sfx[id].lumpnum;
    if (lumpnum < 0)
        lumpnum = I_GetSfxLumpNum(&S_sfx[id]);

    lump_len = W_LumpLength(lumpnum);
    dmx = (unsigned char *)W_CacheLumpNum(lumpnum, PU_CACHE);
    wav_len = 0;
    wav = dmx_to_wav(dmx, lump_len, pitch, &wav_len);
    if (!wav)
        return 0;

    rw = SDL_RWFromMem(wav, wav_len);
    if (!rw)
    {
        free(wav);
        return 0;
    }

    chunk = Mix_LoadWAV_RW(rw, 1);
    free(wav);
    if (!chunk)
    {
        fprintf(stderr, "I_StartSound: decode failed for sfx %d: %s\n",
                id, Mix_GetError());
        return 0;
    }

    channel = Mix_PlayChannel(-1, chunk, 0);
    if (channel < 0 || channel >= WEB_MIX_CHANNELS)
    {
        Mix_FreeChunk(chunk);
        return 0;
    }

    free_channel_chunk(channel);
    web_channels[channel].chunk = chunk;
    set_channel_params(channel, vol, sep);
    return channel + 1;
}

void I_StopSound(int handle)
{
    int channel = handle - 1;
    if (channel < 0 || channel >= WEB_MIX_CHANNELS)
        return;
    Mix_HaltChannel(channel);
    free_channel_chunk(channel);
}

int I_SoundIsPlaying(int handle)
{
    int channel = handle - 1;
    int playing;

    if (channel < 0 || channel >= WEB_MIX_CHANNELS)
        return 0;

    playing = Mix_Playing(channel);
    if (!playing)
        free_channel_chunk(channel);
    return playing ? 1 : 0;
}

void I_UpdateSoundParams(int handle, int vol, int sep, int pitch)
{
    int channel = handle - 1;
    (void)pitch;
    set_channel_params(channel, vol, sep);
}
