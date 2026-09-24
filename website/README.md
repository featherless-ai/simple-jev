# simple-jev.com — static site

A demo-first design for Simple Jev. Plain HTML, CSS, and JavaScript; no build, framework, keys, or website backend.

The dedicated [API documentation](docs.html) covers the request contract, all three question types, response interpretation, runnable client examples, errors, and self-hosting differences.

## Editable live playground

Visitors can load customer support, product review, or community moderation scenarios. Each scenario includes several example contexts and an editable starting question set. Loading a scenario explicitly replaces the context and questions; choosing a context preset only changes the context.

The question editor supports:

- Adding common question examples or writing a custom question.
- Editing answer IDs, question types, and instructions.
- Choice options as `answer_id | optional description`, one per line.
- Score rubrics in low-to-high order, one level per line.
- Noul yes/no propositions, returned as support for “yes.”
- Removing questions and running up to six questions per demo request.

Requests update immediately in the JSON inspector, but editing never sends context to the API. Run submits the current valid request. Blank questions, duplicate answer IDs, duplicate choice IDs, and invalid criteria counts are rejected locally. All questions share the demo's 2k-token context budget; six is a UI cap, not an API-wide limit.

Results are rendered from the submitted question definitions, including arbitrary answer IDs and rubric lengths. Scores display their exact expected zero-based level and a rubric distribution. Every edit clears previous results. There are no simulated initial scores.

## Preview

From the repository root:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory website
```

Open the [playground](http://127.0.0.1:8765/) or the [API documentation](http://127.0.0.1:8765/docs.html). Serving over HTTP/HTTPS is recommended; do not rely on opening the HTML through `file://`.

## Files

- `demos.html`: community spotlight and links to preselected playground scenarios.
- `cool-demo/bookmarks/`: browser-bookmark upload and a small, live structured-classification sample.
- `index.html`: homepage, API example, and link to the playground.
- `playground.html`: dedicated interactive editor and results page.
- `syntax.js`: safe syntax highlighting for static examples and live JSON.
- `docs.html`: detailed API reference with copyable curl, JavaScript, and Python examples.
- `docs.css`: documentation layout and responsive reference tables.
- `docs.js`: code example copy controls; no API requests.
- `styles.css`: responsive styles, keyboard focus, and reduced-motion support.
- `demo.js`: dynamic editor, model discovery, classification, result rendering, and copy controls.
- `playground.mjs`: scenario/question examples, request construction, and response validation.
- `tests/playground.test.mjs`: offline request/response contract tests (`node --test website/tests/playground.test.mjs`).
- `assets/simple-jev.png`: the official Simple Jev mascot badge, used as the logo and favicon.
- `assets/featherless_logo_dark.svg`: supplied Featherless logo for the “Built by Featherless.ai” attribution.

## Evaluation explorer

Open [Evaluations](http://127.0.0.1:8765/evaluations.html) for the six-model comparison, preferred prompt formats, expandable breakdowns, and source-backed examples. It is a static snapshot, not live inference. Closed sections explain what clicking reveals, with explicit View/Hide controls and full-row hover/keyboard-focus highlighting. Vision tables mark each metric’s winner (including ties), place unmeasured Jev at the far right of the overview, and avoid duplicating accuracy columns.

- The first table ranks the selected Qwen/Gemma prompt-search results on the 231 public JevBench decisions against Jev’s **published 200/231**. This development set was used for prompt selection, not held-out testing.
- The separate decision column averages **26 English items equally**: **33,099 scored questions across 21,364 input rows**. Its Jev reference is an endpoint run, whose JevBench result was 199/231. These columns are not combined.
- Public drill-downs show difficulty, family and primitive scores, plus all 231 source questions and saved model answers. Jev’s published source supplies correctness only; its answer labels are not invented.
- Decision drill-downs show six domains, all 26 item scores, scoring rules, provenance and one real gold-labelled example per item. These examples are not fabricated model outputs.
- Vision adds a sortable column and **03 / VISION BENCHMARKS**: **63,372 questions per model** across CIFAR-10, Oxford-IIIT Pets (37 breeds), MME perception, three POPE variants and TallyQA. The column is an equal-weight mean of seven **accuracy** scores; native MME points and POPE F1 remain separate in the expandable details. It is a page-specific summary, not an official composite. No Jev vision result is available, so Jev displays “—” and is excluded from vision ranking; blue vision styling never claims a win against Jev.
- Each vision configuration has an actual example question/gold answer and a lazy-loaded source PNG with a verified hash, source attribution and dataset metadata. Images are copied without additional preprocessing into `assets/evaluations/images/`. POPE variants share the underlying image set, but the page uses distinct absent-object examples (adversarial case 2, popular case 8, random case 14) to illustrate their different negative-question sampling. CIFAR-10 uses the clearer airplane case `image-000010`, chosen visually rather than by model outcome; its original 32×32 PNG is enlarged with nearest-neighbor-style pixel rendering. The remaining configurations use their first source case. These illustrative cases are not model outputs or selected wins. Image source terms remain those of the original datasets, not the JevBench MIT license.
- The Jev 199/231 replication note lives inside **01 / JEVBENCH**, leaving the headline 200/231 baseline unchanged.
- `assets/evaluations/results.json` includes source SHA-256 hashes. `public-examples.json` loads only when the public section opens. Benchmark strings render with text-only DOM APIs.

Deploy `evaluations.html`, `evaluations.css`, `evaluations.mjs` and `assets/evaluations/` with the rest of the site. The existing deployment workflow already stages these files.

Regenerate the frozen data from the research workspace (no model/API calls):

```bash
python3 scripts/export_eval_page.py --workspace /workspace/open-jev
node --test website/tests/*.test.mjs
```

The exporter requires sibling `simple-jev-eval`, `simple-jev-prompt-lab` and `reports` artifacts. It cross-checks canonical evaluator manifests, public row IDs, correct counts, matched decision coverage and aggregate scores before writing website data. Normal hosting and tests use the bundled snapshot and do not need those research checkouts.

Optional browser integration checks require Playwright and its Chromium headless shell, system libraries and fonts:

```bash
# Resolve an existing Playwright installation, or set PLAYWRIGHT_MODULE to its index.mjs.
node website/tests/evaluations.browser.mjs
```

The browser checks start and stop their own local HTTP server. They cover desktop/mobile layouts, sorting, keyboard disclosures, deep links, filters, empty states, retries, and inert dataset text; screenshots go to `/tmp/simple-jev-evaluations-{desktop,mobile}.png`.

## API behavior

The client uses `https://simple-jev-demo-api.featherless.ai/v1/models` and `/v1/classifier`, with Qwen3.6-35B-A3B selected initially. The model list is fetched on load. Context is sent only after a visitor presses Run (or explicitly invokes the page's `run_classifier` WebMCP tool).

The API allows cross-origin browser requests and requires no authentication. The page displays the demo's 2k-token context and 4 RPS limits. A 1,200-character input cap is a UI convenience, not a token-count guarantee; the API enforces its real context limit. Requests time out after 45 seconds, double submission is blocked, and HTTP 429 activates a retry cooldown. The page never fabricates a successful response when the API fails.

The optional, feature-detected WebMCP tools share the visible UI actions: `stage_classifier_message` only edits the form, while `run_classifier` sends the request. Unsupported browsers ignore this integration. No analytics, local storage, or client-side secret is used. The public API's own data handling is separate from this page.

## Hosting

Serve this folder's public files from any static host and point `simple-jev.com` to that host when ready. There is no build step. Deploy `index.html`, `demos.html`, `playground.html`, `syntax.js`, `styles.css`, `demo.js`, `playground.mjs`, `docs.html`, `docs.css`, `docs.js`, and `assets/`; the README is not needed. Use HTTPS. This work does not configure DNS or publish the domain.

The live API model list and one real classification were checked during development. The static page also includes loading, validation, network-error, and rate-limit handling. Classification correctness depends on the selected model; demo outputs are not benchmark results.

## Gemma mixed-question diagnostic

On 2026-09-18, the original App outage preset reproduced an API-side error with `featherless-ai/gemma-4-26B-A4B-classifier`, including in direct HTTP requests outside the browser:

| Questions in the request | Observed result                         |
| ------------------------ | --------------------------------------- |
| Routing + urgency        | HTTP 200                                |
| Refund (Noul) alone      | HTTP 200                                |
| All three together       | HTTP 422: `Expected nine finite logits` |

The combined browser request also returned `Expected one finite logit per choice` on a later attempt. These are API-side answer-scoring failures; the underlying serving bug has not been established. The successful isolated requests above are observations, not a guarantee that isolated calls always succeed. The page preserves the error JSON for inspection/copying and distinguishes this scoring error from a context-length problem. It does not silently switch models, replace Noul with another question type, or manufacture scores. Other inputs, including the Double charge preset, have returned successfully on Gemma.

## Production playground connection

Select Production, enter a Featherless API key, and run a classification. Both modes use the public demo’s `/v1/models` catalog without authentication. Production classification uses `https://api.featherless.ai/v1/classifier` with Bearer authentication. The refresh button reloads the shared demo model list. The key stays in page memory, is excluded from the JSON inspector and copy controls, and is cleared when returning to the demo. Authenticated requests reject redirects. No key is saved to browser storage. Production requests use the account’s limits and billing; the playground retains its 1,200-character and six-question UI caps. Production authentication requires your own key and was not live-tested with an account credential.

## Playable driving demo

Open [Simple Jev Pilot](http://127.0.0.1:8765/cool-demo/drive/) or use the Cool demos page. It adapts Standard Agents’ JevPilot to our public classifier API. Manual driving, three worlds, AI autopilot, and JSON inspection are available. Source and rebuild instructions are in `demos/jevpilot/README.md`; include `website/cool-demo/drive/` in static deployment. This demo has its own Vite build; other website pages remain build-free.

## Playable 2048

The Cool demos page links to `/cool-demo/2048/`. This build-free game supports keyboard, swipe, and button controls, one AI move or continuous play, model selection, and Gemma/Qwen image input. It calls the public demo directly and stores usage only in page memory. Include `cool-demo/2048/` when deploying the website. See its README for implementation and validation details.

## Shared game navigation

Both 2048 and the driving simulator load `shared/demo-header.js`, providing the Simple Jev home link, Cool demos, Playground, and API docs. Include `shared/` when deploying. The driving source references the shared script externally so changing navigation does not require rebuilding the simulator.

## Bookmark sorter

`/cool-demo/bookmarks/` accepts a local Netscape-format browser export (Chrome, Firefox, Safari, or Edge), selects at most 30 links, and sends one shared-context request with 30 choice questions to the public demo API. It rejects files over 5 MB, scans at most 10,000 anchors, and bounds/normalizes title and URL input before building the request. The export stays in the browser; only the selected titles and URLs are sent when the visitor runs the classifier. Include `cool-demo/bookmarks/` and `shared/` when deploying.

## Vision catalog demo

`/cool-demo/vision/` classifies the full 11-photo catalog with Gemma or Qwen. Four images share each API request. Batches run serially with a short delay and bounded HTTP 429 retries that honor Retry-After. Cancel preserves completed results. Source credits are in `catalog.json`. Include `cool-demo/vision/` in deployment; no build is needed.

## Production deployment

`.github/workflows/deploy-website.yml` publishes to Cloudflare Pages in **Recursal PROD** when `main` receives changes under `website/`, `demos/jevpilot/`, or the deployment workflow. You can also run **Deploy website** manually from GitHub Actions on `main`.

Configure the repository Actions secret `CLOUDFLARE_API_TOKEN` with **Account → Cloudflare Pages → Edit**, restricted to Recursal PROD. The workflow supplies the PROD account ID and deploys to the `simple-jev` project (`https://simple-jev-6i4.pages.dev`). DNS and custom domains are managed separately; deployments update the existing project.

The workflow installs locked dependencies, runs website tests and the driving API adapter tests, rebuilds the driving simulator, and stages the website without tests or README files. The deployment token is supplied only to the upload step. No local Cloudflare login is required by CI.

## DOOM autoplay

`cool-demo/doom/` hosts a Web DOOM adaptation with a large live game view beside a classifier decision dashboard. Navigation runs locally and combat decisions use the public Simple Jev API. Gameplay continues during requests and after stopping the agent. Include the whole `cool-demo/doom/` directory (including its WebAssembly/data files) and `shared/` when deploying. Source attribution and behavior are documented in `cool-demo/doom/README.md`.

## Agent API guide

`skills.md` is the canonical agent quick start for the public demo, authenticated Featherless API, and user-managed HF endpoints. `llms.txt` indexes the skill and reference docs. `.well-known/agent-skills/index.json` discovers the skill and includes its SHA-256 digest; update the digest whenever `skills.md` changes. Deploy all three files, including the hidden `.well-known/` directory. The homepage and API docs link to the guide. Agents can read it directly or save it as `SKILL.md` inside their skill directory.

## Shared responsive header and agent prompt

All main pages load `shared/header.css` and `shared/header.js`. Standalone games reuse them through `shared/demo-header.js`. Navigation stays on one row above 1050px and uses an accessible Menu disclosure for the six site links at tablet/mobile widths. GitHub remains visible outside the menu at every width. The homepage's copyable agent prompt uses `shared/agent-prompt.js`, with manual selection if clipboard access is unavailable. Include these shared files in deployment.

Optional browser regression checks: `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node website/tests/header.browser.mjs`. They cover seven pages at fourteen widths (320–1920px), including gutter alignment and element overlap, menu keyboard behavior, and both clipboard paths.
