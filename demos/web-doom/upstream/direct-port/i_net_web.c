// Browser single-player network shim for the original LinuxDOOM 1.10.
// Multiplayer is deliberately out of scope for the first direct-port milestone.

#include <stdlib.h>
#include <string.h>

#include "doomdef.h"
#include "doomstat.h"
#include "d_net.h"
#include "i_net.h"
#include "i_system.h"

void I_InitNetwork(void)
{
    doomcom = (doomcom_t *)malloc(sizeof(*doomcom));
    if (!doomcom)
        I_Error("Could not allocate doomcom");

    memset(doomcom, 0, sizeof(*doomcom));

    netgame = false;
    doomcom->id = DOOMCOM_ID;
    doomcom->ticdup = 1;
    doomcom->extratics = 0;
    doomcom->deathmatch = 0;
    doomcom->consoleplayer = 0;
    doomcom->numplayers = 1;
    doomcom->numnodes = 1;
    doomcom->remotenode = -1;
}

void I_NetCmd(void)
{
    // In single-player mode HSendPacket() loops node zero back internally,
    // so the platform network driver should never need to send a packet.
    doomcom->remotenode = -1;
}
