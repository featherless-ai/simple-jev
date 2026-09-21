"""Hand-labeled scenarios: a fantasy village, a few NPCs, and things a player might say out loud.

Each item: which scene (who is within earshot), the transcript, who is actually being spoken to,
a category describing what makes it tricky, the dominant speech act, and optional game context
(who the player was last talking to, what was last said to them, who they are facing).
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

SCENES: dict[str, list[tuple[str, str]]] = {
    "tavern": [("Hanna", "innkeeper"), ("Jeff", "guard"), ("Anna", "merchant")],
    "forge": [("Marcus", "blacksmith"), ("Elara", "healer"), ("Jeff", "guard")],
    "square": [("Hanna", "innkeeper"), ("Jeff", "guard"), ("Anna", "merchant"), ("Marcus", "blacksmith"), ("Elara", "healer")],
    "road": [("Jeff", "guard"), ("Biscuit", "dog")],
    "shop": [("Anna", "merchant"), ("Elara", "healer")],
}

INTENTS = ["greeting", "farewell", "request_or_command", "question", "statement_or_smalltalk", "threat_or_insult", "none_or_unclear"]

# How a cheap speech-to-text system might spell these names.
MISHEARD = {"Hanna": "hannah", "Jeff": "geoff", "Anna": "ana", "Marcus": "markus", "Elara": "ilara", "Biscuit": "biscut"}


@dataclass
class Item:
    id: str
    scene: str
    text: str
    addressed: list[str]
    category: str
    intent: str
    ctx: dict[str, Any] | None = None
    group: bool = False
    ambiguous: bool = False

    @property
    def present(self) -> list[tuple[str, str]]:
        return SCENES[self.scene]

    @property
    def nobody(self) -> bool:
        return not self.addressed


def _all(scene: str) -> list[str]:
    return [n for n, _ in SCENES[scene]]


_RAW: list[tuple] = [
    # (scene, text, addressed, category, intent, ctx, group, ambiguous)
    # --- direct, single addressee
    ("tavern", "Hi Hanna, today I went to school with Jeff and Anna.", ["Hanna"], "direct_single_with_mentions", "statement_or_smalltalk"),
    ("tavern", "Anna, do you have any healing potions left?", ["Anna"], "direct_single", "question"),
    ("forge", "Marcus, this blade is dull already.", ["Marcus"], "direct_single", "statement_or_smalltalk"),
    ("shop", "Elara, my shoulder still aches from yesterday.", ["Elara"], "direct_single", "statement_or_smalltalk"),
    ("road", "Jeff, how far is it to the city?", ["Jeff"], "direct_single", "question"),
    ("square", "Good evening, Hanna.", ["Hanna"], "direct_single", "greeting"),
    ("forge", "Thank you, Marcus. I'll be back next week.", ["Marcus"], "direct_single", "farewell"),
    ("tavern", "Jeff, Jeff, Jeff. What are we going to do with you?", ["Jeff"], "direct_single", "statement_or_smalltalk"),
    # --- direct, several addressees
    ("tavern", "Hey, Jeff, Anna, please come over here.", ["Jeff", "Anna"], "direct_multi", "request_or_command"),
    ("tavern", "Hanna, watch the door. Jeff, with me.", ["Hanna", "Jeff"], "direct_multi_attention_shift", "request_or_command"),
    ("tavern", "Morning Hanna, morning Jeff.", ["Hanna", "Jeff"], "direct_multi", "greeting"),
    ("square", "Marcus and Elara, I need you both at the gate now.", ["Marcus", "Elara"], "direct_multi", "request_or_command"),
    ("tavern", "Hanna, two ales. Anna, I'll take the red cloak. Jeff... nothing for you.", ["Hanna", "Anna", "Jeff"], "direct_multi_attention_shift", "request_or_command"),
    ("road", "Good boy, Biscuit. Jeff, he's adorable.", ["Biscuit", "Jeff"], "direct_multi_attention_shift", "statement_or_smalltalk"),
    ("forge", "Elara, Jeff, stand back, he's about to quench it.", ["Elara", "Jeff"], "direct_multi_with_mentions", "request_or_command"),
    ("tavern", "Anna, Hanna, which of you sells rope?", ["Anna", "Hanna"], "direct_multi", "question"),
    ("forge", "Marcus, Elara, Jeff, thank you all for coming.", ["Marcus", "Elara", "Jeff"], "direct_multi", "statement_or_smalltalk"),
    # --- a present character is mentioned but NOT addressed
    ("tavern", "Hanna, have you seen Jeff today?", ["Hanna"], "mention_only", "question"),
    ("tavern", "Hanna, tell Anna her order is ready.", ["Hanna"], "mention_only_relay", "request_or_command"),
    ("tavern", "Jeff is the laziest guard I've ever seen.", ["Hanna"], "mention_only_topic_needs_context", "statement_or_smalltalk", {"last": "Hanna"}),
    ("tavern", "Anna's shop is closed again?", ["Hanna"], "mention_only_topic_needs_context", "question", {"last": "Hanna"}),
    ("shop", "Elara, is Marcus around? His forge was cold.", ["Elara"], "mention_absent", "question"),
    ("forge", "Marcus, Jeff said you owe him money.", ["Marcus"], "mention_only", "statement_or_smalltalk"),
    ("tavern", "Oh sure, Jeff will save us all.", ["Anna"], "mention_only_topic_needs_context", "statement_or_smalltalk", {"last": "Anna"}),
    ("tavern", "Psst, Anna. Don't look now, but Jeff is staring at you.", ["Anna"], "mention_only", "statement_or_smalltalk"),
    ("square", "Elara, Marcus is hurt, come quickly!", ["Elara"], "mention_only", "request_or_command"),
    ("road", "Jeff! Hanna's inn is on fire!", ["Jeff"], "mention_absent", "statement_or_smalltalk"),
    ("tavern", "Hanna, Jeff and Anna both told me you make the best stew.", ["Hanna"], "mention_only", "statement_or_smalltalk"),
    ("forge", "Marcus, does Elara still live by the river?", ["Marcus"], "mention_only", "question"),
    ("square", "Hanna! Over here! Bring Jeff if you see him.", ["Hanna"], "mention_only", "request_or_command"),
    ("road", "Come on, Jeff, keep up. Biscuit's faster than you.", ["Jeff"], "mention_only", "request_or_command"),
    ("shop", "That's robbery. Anna charges half that.", ["Elara"], "mention_only_topic_needs_context", "statement_or_smalltalk",
     {"last": "Elara", "last_line": ("Elara", "That will be five coins.")}),
    # --- reported speech / quoted vocatives
    ("tavern", "Jeff, Anna said 'Marcus, come here' but he ignored her.", ["Jeff"], "reported_speech", "statement_or_smalltalk"),
    ("shop", "Anna, yesterday Hanna shouted 'Jeff, get out of my inn' at the top of her lungs.", ["Anna"], "reported_speech", "statement_or_smalltalk"),
    ("forge", "Marcus, the note just says 'Elara, meet me at midnight.' Do you know who wrote it?", ["Marcus"], "reported_speech", "question"),
    # --- group broadcasts
    ("tavern", "Everyone, listen up!", _all("tavern"), "group_all", "request_or_command", None, True),
    ("square", "Alright you lot, back to work.", _all("square"), "group_all", "request_or_command", None, True),
    ("tavern", "Goodnight everyone.", _all("tavern"), "group_all", "farewell", None, True),
    ("forge", "Hello, all! Lovely day.", _all("forge"), "group_all", "greeting", None, True),
    ("square", "Could all of you please step back from the well?", _all("square"), "group_all", "request_or_command", None, True),
    ("tavern", "Nobody move. Hanna, blow out the candles.", _all("tavern"), "group_then_single", "request_or_command", None, True),
    ("square", "Whoever owns this cart, move it!", _all("square"), "group_unknown_owner", "request_or_command", None, True, True),
    # --- addressed by role or description, not by name
    ("tavern", "Innkeeper, a room for the night, please.", ["Hanna"], "role_address", "request_or_command"),
    ("tavern", "Guard! Someone stole my purse!", ["Jeff"], "role_address", "request_or_command"),
    ("forge", "Hey blacksmith, can you sharpen this?", ["Marcus"], "role_address", "request_or_command"),
    ("shop", "Healer, my arm won't stop bleeding.", ["Elara"], "role_address", "request_or_command"),
    ("square", "Guards, arrest that man!", ["Jeff"], "role_address_plural_one_present", "request_or_command"),
    ("forge", "You with the hammer, how much for a sword?", ["Marcus"], "description_address", "question"),
    ("tavern", "Barkeep, another round for the table.", ["Hanna"], "role_synonym", "request_or_command"),
    ("square", "Merchant, do you buy old armor?", ["Anna"], "role_address", "question"),
    ("square", "Hey! Yes, you, in the apron. Two loaves please.", ["Hanna"], "description_address_facing", "request_or_command", {"facing": "Hanna"}),
    # --- nobody: self-talk, out-of-game, someone not present
    ("tavern", "Hmm, where did I put that key?", [], "self_talk", "none_or_unclear"),
    ("forge", "Okay, okay, think. The map said north of the forge.", [], "self_talk", "none_or_unclear"),
    ("square", "hang on, my mic is cutting out", [], "out_of_game", "none_or_unclear"),
    ("tavern", "brb, dinner's ready", [], "out_of_game", "none_or_unclear"),
    ("road", "Ugh, this quest is impossible.", [], "self_talk", "none_or_unclear"),
    ("tavern", "Mom, I'll be home late!", [], "offstage_addressee", "none_or_unclear"),
    ("shop", "Note to self: buy more arrows.", [], "self_talk", "none_or_unclear"),
    # --- continuation of an ongoing conversation (no name in the utterance)
    ("tavern", "And what about you? Did you ever leave the village?", ["Hanna"], "continuation", "question",
     {"last": "Hanna", "last_line": ("Hanna", "I've run this inn for thirty years.")}),
    ("tavern", "No, I meant the other one.", ["Hanna"], "continuation", "statement_or_smalltalk",
     {"last": "Hanna", "last_line": ("Hanna", "We have ale and cider.")}),
    ("forge", "Thanks. See you tomorrow.", ["Marcus"], "continuation", "farewell", {"last": "Marcus"}),
    ("road", "Fine. Lead the way.", ["Jeff"], "continuation", "request_or_command", {"last": "Jeff"}),
    ("square", "Really? Then why is it already rusting?", ["Anna"], "continuation_with_mention", "question",
     {"last": "Anna", "last_line": ("Anna", "Marcus made this blade himself.")}),
    # --- deixis: "you" resolved by who the player is facing
    ("tavern", "You there, come here.", ["Jeff"], "facing_deixis", "request_or_command", {"facing": "Jeff"}),
    ("square", "Excuse me, do you know where the healer is?", ["Marcus"], "facing_deixis_role_mentioned", "question", {"facing": "Marcus"}),
    ("forge", "Are you the one who fixed my leg last spring?", ["Elara"], "facing_deixis", "question", {"facing": "Elara"}),
    ("road", "Who's a good boy? You are!", ["Biscuit"], "facing_deixis", "statement_or_smalltalk", {"facing": "Biscuit"}),
    # --- vocative buried mid-sentence
    ("tavern", "I think, Anna, that your prices are too high.", ["Anna"], "mid_sentence_vocative", "statement_or_smalltalk"),
    ("forge", "Honestly, Marcus, I expected better.", ["Marcus"], "mid_sentence_vocative", "statement_or_smalltalk"),
    ("square", "Could you, Elara, take a look at this rash?", ["Elara"], "mid_sentence_vocative", "request_or_command"),
    ("forge", "Is Marcus here? Oh, there you are. Marcus, I need horseshoes.", ["Marcus"], "mention_then_address", "request_or_command"),
    # --- hostile
    ("tavern", "Jeff, if you touch my bag again I'll break your fingers.", ["Jeff"], "threat", "threat_or_insult"),
    ("square", "Get out of my way, Marcus, or I'll move you myself.", ["Marcus"], "threat", "threat_or_insult"),
    ("shop", "Anna, you're a thief and everyone knows it.", ["Anna"], "insult", "threat_or_insult"),
    # --- the dog
    ("road", "Biscuit! Here, boy!", ["Biscuit"], "direct_single", "request_or_command"),
    ("road", "Jeff, does your dog bite?", ["Jeff"], "mention_only", "question"),
    # --- genuinely arguable labels; reported separately
    ("tavern", "Everyone except Jeff, come with me.", _all("tavern"), "exclusion", "request_or_command", None, True, True),
    ("tavern", "I'm not talking to you, Jeff. Hanna, another round.", ["Hanna", "Jeff"], "negated_address", "request_or_command", None, False, True),
    ("shop", "Elara... no wait, Anna, you're the merchant, right?", ["Anna"], "self_correction", "question", None, False, True),
]


def _ctx(raw: dict | None) -> dict[str, Any] | None:
    if not raw:
        return None
    out: dict[str, Any] = {}
    if "last" in raw:
        out["player_was_last_talking_to"] = raw["last"]
    if "last_line" in raw:
        out["last_thing_said_to_player"] = {"speaker": raw["last_line"][0], "text": raw["last_line"][1]}
    if "facing" in raw:
        out["player_is_facing"] = raw["facing"]
    return out


ITEMS: list[Item] = [
    Item(id=f"u{i:03d}", scene=r[0], text=r[1], addressed=r[2], category=r[3], intent=r[4],
         ctx=_ctx(r[5] if len(r) > 5 else None), group=bool(r[6]) if len(r) > 6 else False,
         ambiguous=bool(r[7]) if len(r) > 7 else False)
    for i, r in enumerate(_RAW)
]

for it in ITEMS:  # sanity: every addressee must be in the scene
    present = {n for n, _ in it.present}
    assert set(it.addressed) <= present, (it.id, it.addressed, present)
    assert it.intent in INTENTS, it.id


VARIANTS = ["clean", "stt", "stt_misheard"]


def transcript(item: Item, variant: str) -> str:
    """clean: as written. stt: lowercase, no punctuation. stt_misheard: also phonetic name misspellings + a filler."""
    t = item.text
    if variant == "clean":
        return t
    if variant == "stt_misheard":
        for name, heard in MISHEARD.items():
            t = re.sub(rf"\b{name}\b", heard, t, flags=re.IGNORECASE)
        if int(item.id[1:]) % 3 == 0:
            t = "um " + t
    t = t.lower()
    t = re.sub(r"[^\w\s']", " ", t)   # drop punctuation, keep apostrophes
    return re.sub(r"\s+", " ", t).strip()
