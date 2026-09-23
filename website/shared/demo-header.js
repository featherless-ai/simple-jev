/* Shared navigation for standalone games. Shadow DOM isolates game styles.
   Links resolve from this script's own URL so the header works from any path depth. */
const SITE_ROOT = new URL("../", document.currentScript.src).href;
class SimpleJevDemoHeader extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    this.attachShadow({mode:'open'}).innerHTML = `
      <style>
        :host { display:block; position:fixed; inset:0 0 auto; height:64px; z-index:5000; font:14px system-ui,sans-serif; }
        header { box-sizing:border-box; height:64px; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:8px 24px; background:#f8f9f6; border-bottom:1px solid #dce1d6; color:#202a26; }
        a { color:inherit; text-decoration:none; } a:hover { text-decoration:underline; }
        .brand { display:flex; align-items:center; gap:10px; font-size:18px; font-weight:700; white-space:nowrap; }
        img { width:44px; height:44px; object-fit:contain; }
        .identity { display:flex; align-items:center; gap:24px; }
        .built-by { display:flex; align-items:center; gap:8px; font-size:11px; color:#586a60; white-space:nowrap; }
        .built-by img { width:130px; height:42px; object-fit:contain; }
        nav { display:flex; gap:24px; align-items:center; font-weight:600; }
        a:focus-visible { outline:3px solid #d4792c; outline-offset:4px; border-radius:3px; }
        @media(max-width:760px) { .identity { gap:12px; } .built-by { gap:4px; } .built-by img { width:92px; } }
        @media(max-width:560px) { header { padding:8px 12px; gap:8px; } .brand { font-size:16px; gap:6px; } nav { gap:10px; font-size:12px; } .docs { display:none; } .built-by { flex-direction:column; gap:0; font-size:9px; } .built-by img { width:80px; height:24px; } :host { height:100px; } header { height:100px; flex-wrap:wrap; align-content:center; row-gap:6px; } .identity { width:100%; justify-content:space-between; } nav { width:100%; justify-content:space-between; } nav a[href="${SITE_ROOT}playground.html"] { display:none; } }
      </style>
      <header><div class="identity"><a class="brand" href="${SITE_ROOT}index.html" aria-label="Simple Jev home"><img src="${SITE_ROOT}assets/simple-jev.png" alt=""/><span>Simple Jev</span></a><a class="built-by" href="https://featherless.ai/" aria-label="Built by Featherless.ai"><span>Built by</span><img src="${SITE_ROOT}assets/featherless_logo_dark.svg" alt="Featherless.ai"/></a></div><nav aria-label="Demo navigation"><a href="${SITE_ROOT}demos.html">Cool demos</a><a href="${SITE_ROOT}how-it-works.html">How it works</a><a href="${SITE_ROOT}playground.html">Playground</a><a class="docs" href="${SITE_ROOT}docs.html">API docs</a></nav></header>`;
    // Game keyboard shortcuts must not intercept navigation keyboard events.
    this.addEventListener('keydown', event => event.stopPropagation());
    this.addEventListener('keyup', event => event.stopPropagation());
  }
}
customElements.define('simple-jev-demo-header', SimpleJevDemoHeader);
