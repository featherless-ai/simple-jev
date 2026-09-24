/* Standalone games use the same navigation styles and behavior as site pages. */
const sharedHeaderBase = new URL('.', document.currentScript.src);
const siteBase = new URL('../', sharedHeaderBase);
class SimpleJevDemoHeader extends HTMLElement {
  async connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    const local = path => new URL(path, siteBase).href;
    const links = [
      ['Cool demos', 'demos.html'], ['Playground', 'playground.html'],
      ['Evaluations', 'evaluations.html'], ['API docs', 'docs.html'],
      ['How it works', 'how-it-works.html'], ['RFDT', 'index.html#rfdt'],
    ];
    root.innerHTML = `
      <link rel="stylesheet" href="${new URL('header.css', sharedHeaderBase)}" />
      <style>
        :host { display:block; position:fixed; inset:0 0 auto; z-index:5000; background:#f8f9f6; border-bottom:1px solid #dce1d6; }
        .site-header.wrap { border-bottom:0; }
      </style>
      <header class="site-header wrap">
        <a class="wordmark" href="${local('index.html')}" aria-label="Simple Jev home"><img class="brand-logo" src="${local('assets/simple-jev.png')}" alt="Simple Jev" width="48" height="48" /></a>
        <a class="built-by header-credit" href="https://featherless.ai/" aria-label="Built by Featherless.ai"><span>Built by</span><img src="${local('assets/featherless_logo_dark.svg')}" alt="Featherless.ai" width="120" height="40" /></a>
        <nav aria-label="Main navigation">${links.map(([label,path]) => `<a href="${local(path)}">${label}</a>`).join('')}
          <a class="nav-github" href="https://github.com/featherless-ai/simple-jev">GitHub <span aria-hidden="true">↗</span></a>
        </nav>
      </header>`;
    this.addEventListener('keydown', event => event.stopPropagation());
    this.addEventListener('keyup', event => event.stopPropagation());
    const { setupHeader } = await import(new URL('header.js', sharedHeaderBase));
    setupHeader(root.querySelector('header'));
  }
}
customElements.define('simple-jev-demo-header', SimpleJevDemoHeader);
