// Optional browser integration checks (not part of the dependency-free node:test suite).
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node website/tests/header.browser.mjs
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, sep, extname } from 'node:path';
const modulePath = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.wasm': 'application/wasm' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('Invalid path');
    const body = await readFile(path); res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'text/plain' }); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/webdoom.wasm', async route => {
    await new Promise(done => setTimeout(done, 1800));
    await route.continue();
  });
  await page.route('**/public/v1/**', route => route.abort());
  await page.goto(`${url}/cool-demo/doom/index.html`);
  await page.waitForFunction(() => !document.getElementById('start').disabled);
  assert.equal(await page.locator('#screen-start-button').isEnabled(), true);
  await page.locator('#screen-start-button').click();
  assert.equal(await page.locator('#screen-start').isVisible(), false);
  await page.waitForFunction(() => window.DoomControl.getState().player?.health > 0);
  assert.deepEqual(errors, [], 'Delayed WebAssembly must not abort startup');
  await page.locator('#stop').click();
  console.log('PASS DOOM starts after delayed WebAssembly download');
  for (const path of ['index.html', 'demos.html']) {
    await page.goto(`${url}/${path}`);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const preview = page.locator('.vision-preview');
      const result = await preview.evaluate(el => {
        const bounds = el.getBoundingClientRect();
        return { height: bounds.height, fits: [...el.children].every(img => {
          const r = img.getBoundingClientRect();
          return img.complete && img.naturalWidth > 0 && r.top >= bounds.top && r.bottom <= bounds.bottom + 1;
        }) };
      });
      assert.equal(result.height, path === 'index.html' ? 180 : 320);
      assert.ok(result.fits, `${path} preview images fit at ${width}px`);
    }
  }
  console.log('PASS Vision Lab thumbnail at mobile, tablet, and desktop widths');
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
