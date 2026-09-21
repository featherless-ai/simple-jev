/**
 * Everything the model sees is built here: the state object, the question
 * objects, and the cache key derived from both. The matcher layer prints
 * `question` verbatim in failure messages, so the wording lives in one place.
 */
import { createHash } from "node:crypto";
import type { ChoiceQuestion, NoulQuestion } from "@typesafe-ai/sdk";
import { choice, noul } from "@typesafe-ai/sdk";
import { JevtestConfigError } from "./errors.js";
import type { Context, Expectation, Subject } from "./types.js";

/** Bumped when the question wording or state shape changes; part of every cache key. */
export const CACHE_VERSION = 1;

/** An expectation in its object form, with the yes/no criteria if the caller gave them. */
export interface NormalizedExpectation {
  text: string;
  yes?: string;
  no?: string;
}

/** Turn the string or object form of an expectation into the object form. */
export function normalizeExpectation(expectation: Expectation): NormalizedExpectation {
  if (typeof expectation === "string") {
    return { text: expectation };
  }
  return {
    text: expectation.text,
    ...(expectation.yes === undefined ? {} : { yes: expectation.yes }),
    ...(expectation.no === undefined ? {} : { no: expectation.no }),
  };
}

/** A subject as text: strings unchanged, anything else as JSON with sorted keys. */
export function serializeSubject(subject: Subject): string {
  if (typeof subject === "string") return subject;
  return stableStringify(subject, 2);
}

/** JSON with recursively sorted object keys, so equal values produce equal text. */
export function stableStringify(value: unknown, indent = 0): string {
  return JSON.stringify(sortKeys(value), null, indent) ?? "null";
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) sorted[key] = sortKeys(source[key]);
    return sorted;
  }
  return value;
}

/**
 * The state sent to the model: the subject under `output`, plus any context
 * fields. The subject keeps its JSON shape; it is never stringified.
 *
 * @throws {JevtestConfigError} A context key would shadow `output`.
 */
export function buildState(subject: Subject, context?: Context): { output: Subject } & Context {
  if (context && Object.hasOwn(context, "output")) {
    throw new JevtestConfigError(
      'A context key named "output" would shadow the subject. Rename it, e.g. "expectedOutput".',
    );
  }
  return { output: subject, ...context };
}

/** State for a semantic diff: the two versions side by side, plus context. */
export function buildDiffState(
  previous: Subject,
  current: Subject,
  context?: Context,
): { previous: Subject; current: Subject } & Context {
  for (const key of ["previous", "current"]) {
    if (context && Object.hasOwn(context, key)) {
      throw new JevtestConfigError(
        `A context key named "${key}" would shadow the compared outputs. Rename it.`,
      );
    }
  }
  return { previous, current, ...context };
}

const CONTEXT_NOTE =
  "Other fields in the state are context that may be needed to judge `output`; do not judge them.";

/** The yes/no question behind `toSatisfy`. */
export function buildSatisfyQuestion(expectation: Expectation, hasContext: boolean): NoulQuestion {
  const { text, yes, no } = normalizeExpectation(expectation);
  const notes = [
    "Judge only what `output` actually says or does, not what it might imply.",
    ...(hasContext ? [CONTEXT_NOTE] : []),
  ];
  return noul(
    {
      task: "Judge whether `output` satisfies the expectation.",
      expectation: text,
      notes,
    },
    {
      true: yes ?? "`output` clearly satisfies the expectation.",
      false: no ?? "`output` does not satisfy the expectation, or only partially.",
    },
  );
}

/** The pick-one question behind semantic snapshots. */
export function buildDiffQuestion(intent: string | undefined, hasContext: boolean): ChoiceQuestion {
  const notes = [
    "Compare meaning, not wording.",
    ...(intent === undefined ? [] : [`What matters about this output: ${intent}`]),
    ...(hasContext ? ["Other fields in the state are context; do not classify them."] : []),
  ];
  return choice(
    {
      task: "Classify how `current` differs from `previous` in meaning.",
      notes,
    },
    {
      cosmetic:
        "Same meaning, facts, commitments and structure; only wording, punctuation, whitespace, ordering of equivalent items or formatting differ.",
      behavioral:
        "Facts, numbers, commitments, instructions, tone toward the reader, or the set of items changed. A reader would act or understand differently.",
      unclear: "Cannot tell, or the change is borderline.",
    },
  );
}

/** Stable cache key for one question about one state answered by one model. */
export function questionKey(model: string, state: unknown, question: unknown): string {
  const payload = stableStringify({ v: CACHE_VERSION, model, state, question });
  return createHash("sha256").update(payload).digest("hex");
}
