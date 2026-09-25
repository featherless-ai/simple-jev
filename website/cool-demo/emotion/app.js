import { fetchWithRetry, wait } from "../vision/queue.mjs";
import { buildRequest, readingFrom, emotions } from "./request.mjs";

const $ = (id) => document.getElementById(id),
  base = "https://simple-jev-demo-api.featherless.ai/v1";
const emoji = {
  happy: "😄",
  sad: "😢",
  angry: "😠",
  surprised: "😮",
  fearful: "😨",
  disgusted: "🤢",
  neutral: "😐",
};
// Frame starts are at least this far apart; requests are serial.
const MIN_INTERVAL = 1000,
  CAPTURE_WIDTH = 320,
  WINDOW_MS = 60000;
const video = $("video"),
  canvas = document.createElement("canvas");
let stream = null,
  controller = null,
  frames = 0;
const history = [];

function text(node, value) {
  node.textContent = value;
}

// ---------- bars ----------
for (const name of Object.keys(emotions)) {
  const row = document.createElement("div");
  row.className = "emotion-bar";
  row.id = `bar-${name}`;
  const label = document.createElement("span");
  label.className = "name";
  label.textContent = `${emoji[name]} ${name}`;
  const track = document.createElement("div");
  track.className = "track";
  const fill = document.createElement("div");
  fill.className = "fill";
  track.append(fill);
  const value = document.createElement("span");
  value.className = "value";
  value.textContent = "–";
  row.append(label, track, value);
  $("bars").append(row);
}

// ---------- camera loop ----------
function grab() {
  const height = Math.round(
    (CAPTURE_WIDTH * video.videoHeight) / video.videoWidth,
  );
  canvas.width = CAPTURE_WIDTH;
  canvas.height = height;
  canvas.getContext("2d").drawImage(video, 0, 0, CAPTURE_WIDTH, height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

async function run(signal) {
  while (!signal.aborted) {
    const started = performance.now();
    const body = buildRequest($("model").value, grab());
    const response = await fetchWithRetry(
      base + "/classifier",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "omit",
        signal,
      },
      {
        onRetry: (n, delay) =>
          text(
            $("status"),
            `Rate limited. Retry ${n} of 3 in ${Math.ceil(delay / 1000)} s…`,
          ),
      },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok)
      throw Error(
        response.status === 429
          ? "Rate limit persists after retries. Try again later."
          : data?.error?.message ||
              (typeof data?.detail === "string"
                ? data.detail
                : `API error ${response.status}`),
      );
    signal.throwIfAborted();
    const reading = readingFrom(data);
    const elapsed = performance.now() - started;
    frames++;
    render(reading, elapsed, data);
    text($("status"), "Live. Try smiling, frowning, or looking surprised.");
    await wait(Math.max(0, MIN_INTERVAL - elapsed), signal);
  }
}

async function start() {
  text($("status"), "Requesting camera access…");
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
      audio: false,
    });
  } catch (error) {
    text($("status"), `Camera unavailable: ${error.message}`);
    return;
  }
  video.srcObject = stream;
  await video.play();
  $("placeholder").hidden = true;
  $("toggle").textContent = "Stop camera";
  $("toggle").classList.add("running");
  $("model").disabled = true;
  controller = new AbortController();
  text($("status"), "Analyzing the first frame…");
  try {
    await run(controller.signal);
  } catch (error) {
    if (!controller.signal.aborted) text($("status"), error.message);
  } finally {
    stop();
  }
}

function stop() {
  controller?.abort();
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  video.srcObject = null;
  $("placeholder").hidden = false;
  $("noface").hidden = true;
  $("toggle").textContent = "Start camera";
  $("toggle").classList.remove("running");
  $("model").disabled = false;
  if ($("status").textContent.startsWith("Live"))
    text($("status"), "Stopped. The camera is off.");
}

$("toggle").addEventListener("click", () => (stream ? stop() : start()));
window.addEventListener("pagehide", stop);

// ---------- render ----------
function render(reading, elapsed, data) {
  $("noface").hidden = reading.faceVisible;
  text($("h-emoji"), emoji[reading.emotion]);
  text($("h-name"), reading.emotion);
  text(
    $("h-conf"),
    `${Math.round(reading.confidence * 100)}% probability` +
      (reading.faceVisible ? "" : " · no clear face"),
  );
  for (const name of Object.keys(emotions)) {
    const p = reading.probabilities[name],
      row = $(`bar-${name}`);
    row.classList.toggle("top", name === reading.emotion);
    row.querySelector(".fill").style.width = `${(p * 100).toFixed(1)}%`;
    text(row.querySelector(".value"), `${Math.round(p * 100)}%`);
  }
  $("v-dot").style.left = `${(reading.valence + 1) * 50}%`;
  text(
    $("v-val"),
    (reading.valence >= 0 ? "+" : "") + reading.valence.toFixed(2),
  );
  $("e-dot").style.left = `${reading.energy * 100}%`;
  text($("e-val"), reading.energy.toFixed(2));
  text($("m-frame"), `#${frames}`);
  text($("m-rt"), `${Math.round(elapsed)} ms`);
  text($("m-tok"), data.usage?.input_tokens ?? "–");
  text($("response"), JSON.stringify(data, null, 2));
  history.push({ t: Date.now(), ...reading });
  drawTimeline();
}

// ---------- timeline ----------
const SVG_NS = "http://www.w3.org/2000/svg";
function el(name, attrs) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}
let geometry = null;
function drawTimeline() {
  const svg = $("svg"),
    W = svg.clientWidth,
    H = svg.clientHeight,
    padL = 64,
    padR = 8,
    padT = 8,
    padB = 20,
    now = Date.now();
  while (history.length && now - history[0].t > WINDOW_MS + 2000)
    history.shift();
  const x = (t) => padL + (1 - (now - t) / WINDOW_MS) * (W - padL - padR),
    y = (v) => padT + (1 - (v + 1) / 2) * (H - padT - padB);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.replaceChildren();
  for (const [v, label] of [
    [1, "positive"],
    [0, "neutral"],
    [-1, "negative"],
  ]) {
    svg.append(
      el("line", {
        x1: padL,
        x2: W - padR,
        y1: y(v),
        y2: y(v),
        stroke: "#dfe4dc",
        ...(v ? { "stroke-dasharray": "3 4" } : {}),
      }),
    );
    const t = el("text", {
      x: padL - 8,
      y: y(v) + 4,
      "text-anchor": "end",
      "font-size": 11,
      fill: "#68726d",
    });
    t.textContent = label;
    svg.append(t);
  }
  for (const [s, anchor] of [
    [60, "start"],
    [30, "middle"],
    [0, "end"],
  ]) {
    const t = el("text", {
      x: x(now - s * 1000),
      y: H - 4,
      "text-anchor": anchor,
      "font-size": 11,
      fill: "#68726d",
    });
    t.textContent = s ? `-${s}s` : "now";
    svg.append(t);
  }
  const points = history.filter((p) => now - p.t <= WINDOW_MS);
  if (points.length > 1)
    svg.append(
      el("path", {
        d: points
          .map(
            (p, i) =>
              `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.valence).toFixed(1)}`,
          )
          .join(""),
        fill: "none",
        stroke: "#1d2926",
        "stroke-width": 2,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
      }),
    );
  const last = points.at(-1);
  if (last)
    svg.append(
      el("circle", {
        cx: x(last.t),
        cy: y(last.valence),
        r: 5,
        fill: "#1d2926",
        stroke: "white",
        "stroke-width": 2,
      }),
    );
  geometry = { x, y, points, padT, H, padB };
}
drawTimeline();
setInterval(() => stream && drawTimeline(), 500);
window.addEventListener("resize", drawTimeline);

$("chart").addEventListener("mousemove", (event) => {
  if (!geometry?.points.length) return;
  const svg = $("svg"),
    rect = svg.getBoundingClientRect(),
    mx = event.clientX - rect.left;
  const best = geometry.points.reduce((a, b) =>
    Math.abs(geometry.x(b.t) - mx) < Math.abs(geometry.x(a.t) - mx) ? b : a,
  );
  const bx = geometry.x(best.t),
    by = geometry.y(best.valence);
  svg.querySelector(".crosshair")?.remove();
  const cross = el("g", { class: "crosshair" });
  cross.append(
    el("line", {
      x1: bx,
      x2: bx,
      y1: geometry.padT,
      y2: geometry.H - geometry.padB,
      stroke: "#68726d",
    }),
    el("circle", {
      cx: bx,
      cy: by,
      r: 5,
      fill: "#1d2926",
      stroke: "white",
      "stroke-width": 2,
    }),
  );
  svg.append(cross);
  const tip = $("tip"),
    ago = Math.round((Date.now() - best.t) / 1000);
  tip.replaceChildren();
  const strong = document.createElement("b");
  strong.textContent = `${emoji[best.emotion]} ${best.emotion}`;
  tip.append(
    strong,
    ` · ${Math.round(best.confidence * 100)}%`,
    document.createElement("br"),
    `valence ${(best.valence >= 0 ? "+" : "") + best.valence.toFixed(2)} · ${ago}s ago`,
  );
  tip.style.display = "block";
  tip.style.left = `${Math.min(bx + 12, rect.width - tip.offsetWidth)}px`;
  tip.style.top = `${Math.max(0, by - 44)}px`;
});
$("chart").addEventListener("mouseleave", () => {
  $("tip").style.display = "none";
  $("svg").querySelector(".crosshair")?.remove();
});

// ---------- models ----------
try {
  const response = await fetch(base + "/models", {
    credentials: "omit",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw Error(`Model list unavailable (${response.status})`);
  const ids = ((await response.json())?.data ?? [])
    .map((m) => m?.id)
    .filter((id) => typeof id === "string" && /gemma|qwen/i.test(id))
    .sort();
  if (!ids.length) throw Error("No vision models are available right now.");
  $("model").replaceChildren(...ids.map((id) => new Option(id, id)));
  // Gemma read facial expressions most reliably in testing.
  const preferred = "featherless-ai/gemma-4-26B-A4B-classifier";
  if (ids.includes(preferred)) $("model").value = preferred;
  $("model").disabled = false;
  $("toggle").disabled = false;
  text($("status"), "Ready. Press Start camera and allow camera access.");
} catch (error) {
  text($("status"), `Could not load models: ${error.message}`);
}
