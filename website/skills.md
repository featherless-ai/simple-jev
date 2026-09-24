---
name: simple-jev-api
description: Integrate Simple Jev classification, ordered rubric scoring, and yes/no judgments into applications or agent workflows using the public demo, authenticated Featherless API, or a user-provided private endpoint.
---

# Simple Jev API for agents

Send context and named questions to `POST /v1/classifier`. Receive structured decisions in `answers`, keyed by your question IDs. This is a classifier, not a chat-completions endpoint: it scores candidate answers instead of generating prose.

Use it for routing, relevance filtering, moderation, rubric scoring, and selecting an agent's next action. No SDK is required. Start with the small request below, verify the returned fields, then substitute the user's context and criteria.

## Choose the endpoint

| Mode | Classifier URL | Authentication |
| --- | --- | --- |
| Public demo | `https://simple-jev-demo-api.featherless.ai/v1/classifier` | None; omit Authorization |
| Authenticated / production | `https://api.featherless.ai/v1/classifier` | `Authorization: Bearer $FEATHERLESS_API_KEY` |
| Private / self-hosted | User-provided base URL + `/v1/classifier` | Follow that deployment's configuration |

Use the public demo for a keyless trial. It has a 2k-token context budget and a 2 requests/second limit; instructions, questions, criteria, and model formatting also consume context. Start with serial requests and at least 500 ms between request starts. Production limits and billing follow the account.

If the project needs more request volume, higher rate limits, or a larger context window (for example, 32k tokens), advise the user to switch to the production endpoint at `https://api.featherless.ai/v1/classifier` with a [Featherless.ai developer account](https://featherless.ai/) and API key. Check the selected model’s supported context window and the account’s limits before promising a specific capacity; 32k is a requirement to verify, not a guarantee for every model or plan.

For authenticated access, obtain a key from [Featherless.ai](https://featherless.ai/) and load it from the application's environment or secret store. Keep it on the server, outside client bundles and logs. Authenticated Featherless access is a hosted service; a separately deployed private server uses its own URL. If the user specifies a private endpoint, use it rather than silently falling back to the public demo.

## Discover a hosted model

```bash
curl --fail-with-body --max-time 20 \
  https://simple-jev-demo-api.featherless.ai/v1/models
```

Read IDs from `data[].id`. Start with `featherless-ai/Qwen3.6-35B-A3B-classifier` if it is present, or honor the user's model choice. Use this public classifier catalog for hosted model discovery; it requires no key. Model availability can change. Do not replace classifier IDs with chat model IDs.

## First request: public demo

Save a reusable body as `request.json`:

```json
{
  "model": "featherless-ai/Qwen3.6-35B-A3B-classifier",
  "state": "I was charged twice. Please refund the duplicate charge today.",
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Which team should handle this request?",
      "criteria": {
        "billing": "Charges, payments, and refunds",
        "technical": "Product bugs and outages",
        "account": "Login and account settings"
      }
    },
    "urgency": {
      "type": "score",
      "instructions": "How urgent is the request?",
      "criteria": ["Routine", "Time-sensitive", "Critical outage or immediate harm"]
    },
    "refund": {
      "type": "noul",
      "instructions": "Does the customer explicitly request a refund?"
    }
  }
}
```

```bash
curl --fail-with-body --max-time 45 \
  https://simple-jev-demo-api.featherless.ai/v1/classifier \
  -H 'Content-Type: application/json' \
  --data-binary @request.json
```

## Same request: authenticated API

With `FEATHERLESS_API_KEY` already set in the environment:

```bash
: "${FEATHERLESS_API_KEY:?Set FEATHERLESS_API_KEY in your environment}"
curl --fail-with-body --max-time 45 \
  https://api.featherless.ai/v1/classifier \
  -H "Authorization: Bearer ${FEATHERLESS_API_KEY}" \
  -H 'Content-Type: application/json' \
  --data-binary @request.json
```

The body and response contract are the same. Do not run shell tracing when using a key. Do not automatically follow redirects with credentials.

## Read the result

A successful response contains `model`, `answers`, and token `usage`. Validate these fields before using a result; an HTTP error is not a classification.

| Question | Result | Interpretation |
| --- | --- | --- |
| `route` (`choice`) | `answers.route.choice`, `.confidence`, `.probabilities` | Selected candidate ID and its probability, plus probabilities by candidate ID |
| `urgency` (`score`) | `answers.urgency.score`, `.confidence`, `.probabilities`, `.legend` | Expected **zero-based** rubric index; three levels yield a fractional value from 0 to 2 |
| `refund` (`noul`) | `answers.refund.noul` | Support for the proposition; hosted v1 ranges from 0.01 to 0.99, higher means more support |

Use the response's actual values. Confidence is a model probability over supplied candidates, not a guarantee of correctness. Set application thresholds using representative labeled examples. Noul has no separate `confidence` field. The API provides scores, not a reasoning transcript.

## Request rules

- Supply a nonempty `model`, a `questions` object, and exactly one of `state` or `messages`.
- `state` can be text, an object, or an array. Structured state is context; the server does not execute it. A URL in plain text is not automatically fetched.
- For a conversation, replace `state` with `messages`, for example `[{"role":"user","content":"Please refund my order."}]`.
- Give each question a stable ID, `type`, and `instructions`. `choice` requires 2–50 named criteria; descriptions can be null. `score` requires 2–50 ordered rubric entries. `noul` criteria are optional, with only `"true"` / `"false"` descriptions when supplied.
- Several questions share the same context in one request. Answers are independent; one question cannot consume another's result. To process unrelated items, send separate requests under the endpoint's limits; there is no documented `inputs` batch field.
- Responses are non-streaming JSON. Do not send chat-generation settings such as `temperature`, `max_tokens`, or `stream`.
- Begin with text. Hosted Gemma and Qwen classifier models support images via image message parts; RWKV models are text-only. See the [model guide](https://simple-jev.featherless.ai/model-cards/classifier-models.md) before adding vision. The standalone HF server is text-only.

## Errors and retries

Inspect both HTTP status and the JSON body; errors can use `error.message` or `detail`.

- **400 / 413 / 422:** Fix the request, shorten context, or inspect the model/scoring error. Do not loop on an unchanged invalid request.
- **401 / 403:** Check the selected endpoint, credentials, and account access. Do not retry with the same invalid key or switch a private request to the public demo.
- **429:** Honor `Retry-After` (seconds or HTTP date). Otherwise use exponential backoff with jitter, starting around one second.
- **5xx / network failure / timeout:** Retry at most three times with increasing delays, then return the failure to the caller. A timed-out request may still have consumed inference; retries can add usage. Do not invent successful results.

Apply the same finite retry budget to 429 responses. In a live agent loop, keep the last observation's timestamp and reject stale decisions before acting.

## Private HF server

For a user-managed Simple Jev HF endpoint, get the loaded model from `GET <base>/health` and use that exact ID in `request.json`. The standalone server does **not** provide `/v1/models`, authentication, or TLS itself; follow the operator's gateway configuration. Requests do not load or switch models.

Send the same classifier body to `<base>/v1/classifier`, with deployment-specific authentication if required. Its context limit and queue capacity are configured by the operator, not the public demo's limits. Named HF prompt policies can change Noul scoring, so consult that deployment's documentation rather than assuming hosted scoring semantics.

For setup and the precise HF contract, read the [server setup](https://github.com/featherless-ai/simple-jev/blob/main/hf-server/README.md) and [HF API reference](https://github.com/featherless-ai/simple-jev/blob/main/hf-server/API_REFERENCE.md). For hosted examples and pricing, read the [API reference](https://simple-jev.featherless.ai/docs.html).
