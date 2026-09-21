"""State and questions for one utterance. All questions go in one request (speculative fan-out)."""
from __future__ import annotations

from typing import Any

from typesafe_sdk import Choice, Noul, Score

from .dataset import INTENTS, Item, transcript

URGENCY_LEVELS = [
    "No response is needed soon: casual remark, greeting, or thinking aloud",
    "A reply or action is expected, but it can wait a moment",
    "Immediate attention or action is needed: danger, an emergency, or an urgent command",
]


def build_state(present: list[tuple[str, str]], text: str, ctx: dict[str, Any] | None, variant: str) -> dict[str, Any]:
    quality = ("Clean transcript with punctuation." if variant == "clean" else
               "Raw speech-to-text output: lowercase, no punctuation, and names may be spelled the way they sound.")
    return {
        "setting": "A fantasy village in a video game. The player speaks out loud and a speech-to-text system "
                   "transcribes it. The characters listed are the non-player characters within earshot.",
        "characters_present": [{"name": n, "role": r} for n, r in present],
        "recent_context": ctx or "no prior conversation; the player just walked up",
        "transcript": text,
        "transcript_quality": quality,
    }


def build_questions(present: list[tuple[str, str]]) -> dict[str, Any]:
    qs: dict[str, Any] = {}
    for name, role in present:
        qs[f"addr_{name}"] = Noul(
            instructions={
                "question": f"Is the player speaking to {name}, the {role}?",
                "speaking_to_means": f"{name} is an intended listener who should pay attention or respond. That includes being "
                                     f"addressed by name, nickname, role, or description; being the character the player faces "
                                     f"when saying 'you'; being part of a group the player addresses; or being the natural "
                                     f"continuation of an ongoing conversation with {name}.",
                "not_speaking_to": f"{name} is merely the topic, a third party the player talks about, someone the player asks "
                                   f"another character to relay a message to, or a name that only appears inside quoted speech.",
            },
            criteria={"true": f"{name} is an intended listener of this utterance.",
                      "false": f"{name} is not being spoken to."},
        )
    qs["group_address"] = Noul(
        instructions="The player is addressing all the characters present as a group, for example with 'everyone', "
                     "'all of you', 'you lot', or a plural role like 'guards' when speaking to the room.",
        criteria={"true": "The utterance is aimed at everyone present.", "false": "The utterance is aimed at specific people or nobody."})
    qs["nobody"] = Noul(
        instructions="The player is not talking to any of the characters present: they are talking to themself, thinking "
                     "aloud, speaking to someone who is not here, or saying something out-of-game such as a remark about "
                     "their microphone or needing to step away.",
        criteria={"true": "None of the listed characters is an intended listener.", "false": "At least one listed character is being spoken to."})
    qs["intent"] = Choice(
        instructions="What is the player mainly doing with this utterance?",
        criteria={"greeting": "Saying hello or opening a conversation", "farewell": "Saying goodbye or closing a conversation",
                  "request_or_command": "Asking or telling someone to do something, including calling them over or ordering goods",
                  "question": "Asking for information", "statement_or_smalltalk": "Sharing information, an opinion, or chit-chat",
                  "threat_or_insult": "Threatening, insulting, or intimidating someone",
                  "none_or_unclear": "Not directed at the characters, or no clear purpose (self-talk, out-of-game remarks)"})
    qs["urgency"] = Score(instructions="How urgently do the people being spoken to need to react?", criteria=URGENCY_LEVELS)
    qs["attitude"] = Choice(
        instructions="What is the player's attitude toward the person or people they are speaking to?",
        criteria={"friendly": "Warm, polite, playful, or grateful", "neutral": "Matter-of-fact or businesslike",
                  "hostile": "Angry, rude, threatening, or contemptuous"})
    qs["primary"] = Choice(
        instructions="Who is the main person the player is speaking to? Pick 'everyone' for a group address and 'nobody' if the "
                     "player is not talking to any character present.",
        criteria={**{n: f"{n} the {r}" for n, r in present}, "everyone": "All characters present, as a group",
                  "nobody": "None of the characters present"})
    return qs


def request_for(item: Item, variant: str) -> tuple[dict[str, Any], dict[str, Any]]:
    return build_state(item.present, transcript(item, variant), item.ctx, variant), build_questions(item.present)
