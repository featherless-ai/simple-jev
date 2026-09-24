#!/usr/bin/env python3
"""Upgrade LinuxDOOM for P2.2 independent local-player bot control.

Run after direct-port/patch_agent_input.py. It preserves the proven P1 hook
location while applying an independent ticcmd override to every playeringame[]
slot. It also keeps Vanilla deathmatch respawn semantics for P2.2 local
multi-player sessions even though they deliberately keep netgame=false and use
only one network node.

P2.2 also enforces one shared death presentation rule for every local player:
P1 human and P2-P4 bots remain in PST_DEAD for 45 tics (~1.29 seconds), then
the engine bridge itself emits the respawn BT_USE. No JS scheduler may shorten
or accidentally omit that window.
"""

from pathlib import Path
import sys


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: patch_multi_agent.py <linuxdoom-source-dir>")

    root = Path(sys.argv[1])
    path = root / "g_game.c"
    text = path.read_text(encoding="utf-8")

    old_decl = "    extern void doomctl_apply_agent_ticcmd(ticcmd_t *cmd);\n"
    new_decl = "    extern void doomctl_apply_player_agent_ticcmd(int player, ticcmd_t *cmd);\n"
    if new_decl not in text:
        if old_decl not in text:
            raise SystemExit("existing P1 agent declaration not found in g_game.c")
        text = text.replace(old_decl, new_decl, 1)

    old_call = (
        "\t    // MCP autonomous playtest input overrides only the local command\n"
        "\t    // that is about to be consumed by gameplay.\n"
        "\t    if (i == consoleplayer)\n"
        "\t\tdoomctl_apply_agent_ticcmd(cmd);\n"
    )
    new_call = (
        "\t    // P2.2 local bot arena: every local player slot may own an\n"
        "\t    // independent deterministic ticcmd override.\n"
        "\t    doomctl_apply_player_agent_ticcmd(i, cmd);\n"
    )
    if new_call not in text:
        if old_call not in text:
            raise SystemExit("existing P1 console-agent call block not found in g_game.c")
        text = text.replace(old_call, new_call, 1)

    old_reborn = (
        "void G_DoReborn (int playernum) \n"
        "{ \n"
        "    int                             i; \n"
        "\t \n"
        "    if (!netgame)\n"
    )
    new_reborn = (
        "extern int doomctl_is_local_multiplayer(void);\n\n"
        "void G_DoReborn (int playernum) \n"
        "{ \n"
        "    int                             i; \n"
        "\t \n"
        "    if (!netgame && !doomctl_is_local_multiplayer())\n"
    )
    if new_reborn not in text:
        if old_reborn not in text:
            raise SystemExit("Vanilla G_DoReborn single-player branch not found in g_game.c")
        text = text.replace(old_reborn, new_reborn, 1)

    # The P2.2 build copies direct-port/doom_multi_agent.c to this source file
    # immediately before invoking this patcher. Own the death/respawn timing in
    # the engine-facing ticcmd hook itself. That hook runs for P1-P4 every tic,
    # even when a slot has no active bot override, so human and bots cannot
    # diverge in respawn timing.
    agent_path = root / "doom_agent_input.c"
    if agent_path.exists():
        agent = agent_path.read_text(encoding="utf-8")

        delay_anchor = "#define DOOMCTL_PLAYERS_BUFSIZE 16384\n"
        delay_block = (
            "#define DOOMCTL_PLAYERS_BUFSIZE 16384\n"
            "#define DOOMCTL_RESPAWN_DELAY_TICS 45\n\n"
            "static int doomctl_death_tic[MAXPLAYERS] = { -1, -1, -1, -1 };\n"
        )
        if "DOOMCTL_RESPAWN_DELAY_TICS" not in agent:
            if delay_anchor not in agent:
                raise SystemExit("doom_agent_input.c delay anchor not found")
            agent = agent.replace(delay_anchor, delay_block, 1)

        old_prologue = (
            "    if (!cmd || player < 0 || player >= MAXPLAYERS)\n"
            "        return;\n"
            "    agent = &doomctl_agents[player];\n"
            "    if (agent->remaining <= 0)\n"
            "        return;\n"
            "    if (gamestate != GS_LEVEL || gameepisode != agent->episode || gamemap != agent->map)\n"
            "    {\n"
            "        doomctl_clear_player_agent(player);\n"
            "        return;\n"
            "    }\n"
            "    if (!doomctl_valid_player(player) || !players[player].mo)\n"
            "    {\n"
            "        doomctl_clear_player_agent(player);\n"
            "        return;\n"
            "    }\n\n"
        )
        new_prologue = (
            "    if (!cmd || player < 0 || player >= MAXPLAYERS)\n"
            "        return;\n"
            "    agent = &doomctl_agents[player];\n"
            "    if (gamestate != GS_LEVEL)\n"
            "    {\n"
            "        if (agent->remaining > 0)\n"
            "            doomctl_clear_player_agent(player);\n"
            "        return;\n"
            "    }\n"
            "    if (!doomctl_valid_player(player) || !players[player].mo)\n"
            "    {\n"
            "        if (agent->remaining > 0)\n"
            "            doomctl_clear_player_agent(player);\n"
            "        return;\n"
            "    }\n\n"
            "    // Shared death presentation for every local deathmatch slot.\n"
            "    // While dead, suppress attack/use regardless of human keyboard or\n"
            "    // bot scheduler input. After 45 tics, synthesize exactly the USE\n"
            "    // command Vanilla DOOM expects to enter PST_REBORN.\n"
            "    if (players[player].playerstate == PST_LIVE)\n"
            "    {\n"
            "        doomctl_death_tic[player] = -1;\n"
            "    }\n"
            "    else if (players[player].playerstate == PST_DEAD)\n"
            "    {\n"
            "        if (doomctl_death_tic[player] < 0)\n"
            "            doomctl_death_tic[player] = gametic;\n"
            "        cmd->buttons &= (byte)~(BT_ATTACK | BT_USE);\n"
            "        if (gametic - doomctl_death_tic[player] >= DOOMCTL_RESPAWN_DELAY_TICS)\n"
            "            cmd->buttons |= BT_USE;\n"
            "        return;\n"
            "    }\n\n"
            "    if (agent->remaining <= 0)\n"
            "        return;\n"
            "    if (gameepisode != agent->episode || gamemap != agent->map)\n"
            "    {\n"
            "        doomctl_clear_player_agent(player);\n"
            "        return;\n"
            "    }\n\n"
        )
        if "synthesize exactly the USE" not in agent:
            if old_prologue not in agent:
                raise SystemExit("doom_agent_input.c function prologue not found")
            agent = agent.replace(old_prologue, new_prologue, 1)

        agent_path.write_text(agent, encoding="utf-8")

    path.write_text(text, encoding="utf-8")
    print("Patched G_Ticker for P2.2 per-player ticcmds, local deathmatch rebirth, and engine-owned 45-tic respawn delay")


if __name__ == "__main__":
    main()
