# Simple Jev DOOM autoplay

Browser-hosted E1M1 autoplay, adapted from [pavy23/web-doom](https://github.com/pavy23/web-doom) at revision `f26b13c7892b69c010a1c60fa270254eaacf3e24`. Original announcement: https://x.com/meta_pavy/status/2101820142238011534.

Serve the website directory over HTTP and open `/cool-demo/doom/`. No build, local service, account, or key is required. The engine assets total roughly 6 MB.

## Behavior

- Start autoplay boots the shareware E1M1 map at skill 2 (Hey, Not Too Rough), without god mode.
- The upstream geometric route follower handles doors, navigation, recovery and the exit. The public Simple Jev classifier chooses combat actions. The default model is `featherless-ai/Qwen3.6-35B-A3B-classifier`.
- The game runs continuously at its normal tick rate. API calls are asynchronous and serial, with at least 550 ms between starts. The local controller aims and fires while waiting for a fresh decision. Responses older than three seconds are displayed but not applied. Commands always re-aim from current game state.
- The dashboard shows observed game state, the actual returned choice and probabilities, latency, decision history, and the request/response JSON. Explanations are descriptions of available actions, not model-generated reasoning.
- Stop aborts inference and cancels queued agent input; it does not pause the game. New run reloads the page. Death, route failure, or level completion ends the agent run. Level completion is not guaranteed.
- Network errors and HTTP 429 use local control with a retry delay of at least five seconds. Nothing is stored in browser storage.

## Upstream source and licenses

Original DOOM by id Software. The runtime is pavy23's direct LinuxDOOM WebAssembly build, using the bundled shareware data and upstream OPL audio subsystem. Upstream credits are retained in `vendor/SOURCE.txt`, with the GPL license in `vendor/COPYING`.

`vendor/webdoom.js`, `.wasm`, `.data`, and `opl_music.js` come from upstream `direct/`. The JavaScript's localhost MCP WebSocket connections are disabled for this hosted integration. The engine binaries and data are unchanged. Source and build scripts for the direct port are retained in `demos/web-doom/upstream/direct-port/` in the Simple Jev repository; those scripts identify and fetch the pinned original engine/music sources.

`vendor/navigation_graph.js` is upstream's navigation geometry module. `vendor/navigation.js` and `vendor/runner.js` extract the browser-independent portions of the upstream navigation agent and stage runner. Changes remove Node/Playwright/CLI/file-output code, use a browser adapter, remove fixed-tick startup normalization, replace pause/step control with continuous-time input, and rejoin the planned route through sector portals when real-time movement leaves it. `vendor/e1m1.json` is the unmodified shareware map's navigation graph and exit progression, generated with upstream `GeometryWorkspace`, `installThingAuthoring`, `buildNavigationGraph`, and `findExitProgression`.

Our `runtime.js`, `policy.js`, `app.js`, HTML and CSS provide the hosted shell, public API adapter, and decision dashboard. The original upstream TypeSafe policy is not used.

Validate with `node --test website/tests/doom.test.mjs`. The continuous runtime also requires a browser smoke check, including slow/error API responses and Stop while a request is pending.
