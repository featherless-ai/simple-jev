# Emotion camera

Static page at `/cool-demo/emotion/`, linked from Cool demos, with shared navigation. The visitor's webcam feeds a live reading of their facial expression: the most likely of seven emotions with its probability distribution, valence (negative to positive), energy (calm to intense), and a 60-second valence timeline with hover details.

Each frame is a 320-pixel-wide JPEG still sent in one `/v1/classifier` request with four questions sharing the image context:

| Question | Type | Displayed as |
| --- | --- | --- |
| `emotion` | `choice` over happy, sad, angry, surprised, fearful, disgusted, neutral | Top emotion and probability bars |
| `valence` | `score` over a five-level rubric | Expected index mapped to −1…+1 |
| `energy` | `score` over a four-level rubric | Expected index mapped to 0…1 |
| `face` | `noul` | "No face detected" badge below 0.5 |

Requests are serial and start at least one second apart, so the display updates as fast as responses arrive (about 1.5–2 seconds per frame on Gemma). HTTP 429 reuses the vision demo's bounded retry helper (`../vision/queue.mjs`), honoring Retry-After. Persistent rate limits or other API errors stop the camera and show the error; readings are never fabricated. Responses that fail validation are rejected rather than partially displayed.

The camera starts only after the visitor presses Start camera and grants access. Frames are sent only while it runs, are not stored, and the camera stops on Stop camera, on any error, and when the page is hidden. No credentials, cookies, or browser storage are used.

Gemma 4 26B is selected by default because it read exaggerated expressions most reliably in informal testing; the Qwen models are available from the model list. Emotion recognition from a single still is approximate, and subtle expressions tend to read as neutral. Probabilities are model preferences among the supplied options, not calibrated certainty. With four questions, a frame used about 4,700 input tokens on the public demo; the image portion is roughly constant for Gemma, so a smaller capture mainly reduces upload size.

Include this folder, `cool-demo/vision/queue.mjs`, and `shared/` in deployment; no build is needed. Camera access requires HTTPS or `localhost`/`127.0.0.1`.

Run `node --test website/tests/emotion.test.mjs`.
