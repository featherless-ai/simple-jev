"""Validate classifier request data without rendering prompts or running a model.

Use ClassifierRequest.model_validate() for an incoming Python dictionary, or
ClassifierRequest.model_validate_json() for a JSON string/bytes. Both return the
same typed request and raise pydantic.ValidationError for invalid known fields.
The prompt builder accepts either that model or the original dictionary.

Example: validate a state-based request and build its prompt plan::

    from common import ClassifierRequest, prepare_prompt

    request = ClassifierRequest.model_validate({
        "model": "my-model",
        "state": "The bicycle is red.",
        "questions": {
            "color": {
                "type": "choice",
                "instructions": "What color is the bicycle?",
                "criteria": {"red": None, "blue": "A blue bicycle"},
            },
            "support": {
                "type": "score",
                "instructions": "How strongly is redness supported?",
                "criteria": ["Unsupported", "Partly supported", "Supported"],
            },
            "is_red": {
                "type": "noul",
                "instructions": "Is the bicycle red?",
            },
        },
        "temperature": 0.7,  # Unknown top-level fields are ignored.
    })
    plan = prepare_prompt(request, version="v1")
    assert len(plan.questions) == 3  # One scoring branch per question.
    assert request.questions["color"].type == "choice"

Example: use chat history instead of state::

    chat_request = ClassifierRequest.model_validate({
        "model": "my-model",
        "messages": [{"role": "user", "content": "The bicycle is red."}],
        "questions": {
            "is_red": {"type": "noul", "instructions": "Is it red?"},
        },
    })
    serialized = chat_request.model_dump_json()
    restored = ClassifierRequest.model_validate_json(serialized)
    assert restored == chat_request

Supply exactly one non-null context: state or messages. This module validates
structure only. A server adapter decides which model, roles, tools, and media it
supports, applies its chat template, and enforces token/queue limits. Acceptance
by this schema does not imply that an inference backend supports every field.
"""

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, JsonValue, model_validator


class StrictModel(BaseModel):
    """Reject unknown fields on classifier-owned question and option objects.

    'Strict' here refers to extra-field handling, not Pydantic's strict typing
    mode. Normal Pydantic conversions still apply. Keeping these objects closed
    surfaces misspelled option names rather than silently changing behavior.
    """

    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)


# Instructions and criterion descriptions may be plain text, structured JSON,
# or null. The builder preserves strings and serializes structured entries with
# deterministic JSON. A null choice description means no additional description;
# the candidate's dictionary key still identifies the answer.
EntryType = str | dict[str, JsonValue] | list[JsonValue] | None


class ScoreQuestion(StrictModel):
    """An ordered rubric, from lowest to highest, with 2–50 levels.

    Example: {"type": "score", "instructions": "Quality?",
              "criteria": ["Poor", "Acceptable", "Excellent"]}

    v1 reads label logits and returns the expected zero-based level
    index, which may be fractional. The example's public score range is 0–2.
    Criteria order is meaningful and must be preserved by every implementation.
    """

    type: Literal["score"]
    instructions: EntryType
    criteria: list[EntryType] = Field(min_length=2, max_length=50)


class ChoiceQuestion(StrictModel):
    """Select among 2–255 candidate IDs with optional descriptions.

    Example: {"type": "choice", "instructions": "Color?",
              "criteria": {"red": None, "blue": "A blue object"}}

    Dictionary keys are the public answer values. Insertion order assigns model
    labels (A, B, ...) and resolves exact ties. Descriptions do not replace IDs.
    """

    type: Literal["choice"]
    instructions: EntryType
    criteria: dict[str, EntryType] = Field(min_length=2, max_length=255)


class NoulQuestion(StrictModel):
    """A truth/support judgment, returned on the public [0.01, 0.99] range.

    Example: {"type": "noul", "instructions": "Is the object red?",
              "criteria": {"true": "Red", "false": "Another color"}}

    Criteria are optional; when present, only the string keys 'true' and 'false'
    are accepted (either or both may be provided). v1 uses the fixed
    1–9 rating labels and maps their expected rating to the public range. This
    value is not a calibrated probability or a binary-token softmax.
    """

    type: Literal["noul"]
    instructions: EntryType
    criteria: dict[Literal["true", "false"], EntryType] | None = None


# The explicit discriminator selects one question schema using its `type` field.
# This produces errors for the intended question type instead of trying all three
# shapes. Missing or unrecognized types fail validation.
Question = Annotated[
    ScoreQuestion | ChoiceQuestion | NoulQuestion, Field(discriminator="type")
]


class Options(StrictModel):
    """Output diagnostics only; prompt/scoring behavior belongs to the version.

    raw_logits requests logits in diagnostic answers. The response builder also
    requires advanced=True to expose them. It never changes the prompt itself.
    Removed scoring-mode and score-format switches are rejected as extra fields.
    """

    raw_logits: bool = False


class ChatMessage(BaseModel):
    """Preserve supplied chat data for the server's native message renderer.

    Unlike questions/options, additional message fields are retained, allowing
    adapters to inspect attributes such as tool-call metadata. Content can be
    text, structured content blocks, or null. A text-only backend must still
    reject unsupported content/roles: this shared schema does not do that job.
    """

    model_config = ConfigDict(extra="allow", allow_inf_nan=False)
    role: Literal["system", "developer", "user", "assistant", "tool", "function"]
    content: str | list[dict[str, JsonValue]] | None = None


class ClassifierRequest(BaseModel):
    """The shared, engine-independent classifier request boundary.

    Unknown top-level fields are discarded, including completion settings, so
    callers need not strip unrelated client arguments. Known fields still
    validate normally. Missing required fields still fail even if a misspelled
    replacement was ignored. Messages retain extras; questions/options reject
    them, as documented on their respective models.
    """

    model_config = ConfigDict(extra="ignore", allow_inf_nan=False)

    # The server resolves this name; the schema only requires a nonempty string.
    model: str = Field(min_length=1)

    # Empty text, {} and [] are valid state values. None means absent. A messages
    # context must contain at least one turn. The validator below enforces XOR.
    state: str | dict[str, JsonValue] | list[JsonValue] | None = None
    messages: list[ChatMessage] | None = Field(default=None, min_length=1)

    # Keys become final response answer IDs. Input order is retained by the
    # builder. v1 has one branch per question; servers can impose a lower limit.
    questions: dict[str, Question] = Field(min_length=1, max_length=256)
    options: Options = Field(default_factory=Options)

    # Adapter-facing data retained for compatibility. The prompt builder does
    # not interpret these fields or add them to its classifier instructions.
    tools: list[dict[str, JsonValue]] | None = None
    mm_processor_kwargs: dict[str, JsonValue] | None = None
    media_io_kwargs: dict[str, dict[str, JsonValue]] | None = None

    @model_validator(mode="after")
    def validate_context(self):
        """Check relationships that individual field schemas cannot enforce."""
        # Compare against None, not truthiness: an empty string is valid state.
        if (self.state is None) == (self.messages is None):
            raise ValueError("Provide exactly one of state or messages")
        if any(not key for key in self.questions):
            raise ValueError("Question IDs must not be empty")
        return self
