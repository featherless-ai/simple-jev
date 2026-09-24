export function setupHeader(header) {
  if (!header || header.hasAttribute('data-enhanced')) return;
  const nav = header.querySelector('nav');
  if (!nav) return;
  nav.id ||= 'site-navigation';
  const github = nav.querySelector('.nav-github');
  if (github) header.append(github);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'header-toggle';
  button.textContent = 'Menu';
  button.setAttribute('aria-controls', nav.id);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Open navigation menu');
  const setOpen = open => {
    header.toggleAttribute('data-menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation menu`);
    button.textContent = open ? 'Close' : 'Menu';
  };
  button.addEventListener('click', () => setOpen(!header.hasAttribute('data-menu-open')));
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.hasAttribute('data-menu-open')) {
      setOpen(false); button.focus(); event.preventDefault();
    }
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  header.addEventListener('focusout', event => {
    // During pointer focus changes activeElement can temporarily be the body.
    // Use the destination instead so links remain visible until click fires.
    // A null destination also occurs for non-focusable pointer targets; the
    // outside-click handler handles those after the click has completed.
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  document.addEventListener('click', event => {
    if (!event.composedPath().includes(header)) setOpen(false);
  });
  const desktop = matchMedia('(min-width: 1051px)');
  desktop.addEventListener('change', () => setOpen(false));
  header.insertBefore(button, nav);
  header.setAttribute('data-enhanced', '');
}
document.querySelectorAll('.site-header').forEach(setupHeader);
