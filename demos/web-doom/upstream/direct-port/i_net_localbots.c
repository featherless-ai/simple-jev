// P2.2 single-process local multiplayer shim for original LinuxDOOM 1.10.
//
// This is intentionally NOT a network transport. It keeps netgame=false and a
// single network node so d_net.c never waits for remote packets, while exposing
// 1..4 local player slots. G_Ticker receives independent bot ticcmd overrides
// for those slots from doom_multi_agent.c. P3.0 will provide real remote I_NetCmd.

#include <stdlib.h>
#include <string.h>

#include "doomdef.h"
#include "doomstat.h"
#include "d_net.h"
#include "i_net.h"
#include "i_system.h"
#include "m_argv.h"

#include <emscripten/emscripten.h>

static int doomctl_local_players = 1;

static int doomctl_parse_local_players(void)
{
    int p;
    int count;

    p = M_CheckParm("-localplayers");
    if (p && p < myargc - 1)
    {
        count = atoi(myargv[p + 1]);
        if (count < 1)
            count = 1;
        if (count > MAXPLAYERS)
            count = MAXPLAYERS;
        return count;
    }

    p = M_CheckParm("-localbots");
    if (p && p < myargc - 1)
    {
        count = atoi(myargv[p + 1]) + 1;
        if (count < 1)
            count = 1;
        if (count > MAXPLAYERS)
            count = MAXPLAYERS;
        return count;
    }

    return 1;
}

void I_InitNetwork(void)
{
    doomcom = (doomcom_t *)malloc(sizeof(*doomcom));
    if (!doomcom)
        I_Error("Could not allocate doomcom");

    memset(doomcom, 0, sizeof(*doomcom));
    doomctl_local_players = doomctl_parse_local_players();

    // A local bot arena deliberately remains one net node. d_net.c therefore
    // advances from the console player's rebound tic stream without waiting on
    // nonexistent remote nodes. playeringame[] is populated by D_CheckNetGame
    // from doomcom->numplayers after this function returns.
    netgame = false;
    doomcom->id = DOOMCOM_ID;
    doomcom->ticdup = 1;
    doomcom->extratics = 0;
    doomcom->consoleplayer = 0;
    doomcom->numplayers = doomctl_local_players;
    doomcom->numnodes = 1;
    doomcom->remotenode = -1;

    if (doomctl_local_players > 1)
    {
        deathmatch = 1;
        doomcom->deathmatch = 1;
        autostart = true;
    }
    else
    {
        doomcom->deathmatch = 0;
    }
}

void I_NetCmd(void)
{
    // Node zero loops back inside HSendPacket(). There are deliberately no
    // remote packets in P2.2 local-bot mode.
    doomcom->remotenode = -1;
}

// Used only by the P2.2 G_DoReborn compatibility patch. Vanilla G_DoReborn
// treats netgame=false as single-player and reloads the whole level on death.
// Local P2.2 arenas intentionally keep netgame=false to avoid remote-node
// synchronization, but still need normal per-player deathmatch respawns.
int doomctl_is_local_multiplayer(void)
{
    return doomctl_local_players > 1;
}

EMSCRIPTEN_KEEPALIVE
int doomctl_get_local_player_capacity(void)
{
    return doomctl_local_players;
}
