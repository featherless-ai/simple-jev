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
const mime = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
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
let browser;
try {
 browser = await chromium.launch({headless:true});
 const context = await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 const page = await context.newPage();
 await page.route('**/*', route => new URL(route.request().url()).origin === url ? route.continue() : route.abort());
for(const path of ['index.html','docs.html','demos.html','playground.html','evaluations.html','how-it-works.html','cool-demo/2048/index.html']){
 await page.goto(`${url}/${path}`);
 const header=page.locator('.site-header').first();await header.waitFor();await page.waitForFunction(()=>!!(document.querySelector('.site-header[data-enhanced]')||document.querySelector('simple-jev-demo-header')?.shadowRoot.querySelector('[data-enhanced]')));
 for(const width of [320,390,480,600,760,768,834,1024,1050,1051,1100,1280,1440,1920]){
  await page.setViewportSize({width,height:1000});
  await page.evaluate(()=>document.fonts.ready);
  const bounds=await header.boundingBox();assert.ok(bounds.x>=0 && bounds.x+bounds.width<=width+.5,`${path} header overflow ${width}`);
  const visibleRects = await header.locator('.wordmark, .header-credit, .header-toggle, .nav-github, nav > a').evaluateAll(els => els.filter(e => e.getBoundingClientRect().width && e.getBoundingClientRect().height).map(e => {const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,label:e.textContent}}));
  for (const rect of visibleRects) assert.ok(rect.left >= bounds.x - 1 && rect.right <= bounds.x + bounds.width + 1, `${path} header child overflow at ${width}: ${rect.label}`);
  for(let i=0;i<visibleRects.length;i++) for(let j=i+1;j<visibleRects.length;j++) {
    const a=visibleRects[i],b=visibleRects[j];
    assert.ok(Math.min(a.right,b.right)-Math.max(a.left,b.left)<1 || Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<1, `${path} overlapping header items at ${width}`);
  }
  if(path==='index.html') {
    const layout=await page.evaluate(()=>{
      const r=s=>{const x=document.querySelector(s).getBoundingClientRect();return {left:x.left,right:x.right,top:x.top,bottom:x.bottom,width:x.width}};
      return {hero:r('.hero'),card:r('.agent-quickstart'),title:r('.hero h1'),art:r('.hero-aside'),pageWidth:document.documentElement.scrollWidth};
    });
    assert.ok(Math.abs(layout.hero.left-bounds.x)<1 && Math.abs(layout.card.left-bounds.x)<1, `Misaligned gutters at ${width}`);
    assert.ok(layout.pageWidth<=width, `Page overflow at ${width}`);
    if(layout.art.width)assert.ok(layout.title.right<=layout.art.left, `Hero overlap at ${width}`);
  }
  assert.equal(await header.locator(':scope > .nav-github').isVisible(), true);
  assert.equal(await header.locator('nav .nav-github').count(), 0);
  const toggle=header.locator('.header-toggle');
  if(width<=1050){
   assert.equal(await toggle.isVisible(),true);assert.equal(await header.locator('nav').isVisible(),false);
   await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert.equal(await header.locator('nav a:visible').count(),6);
   const nav=await header.locator('nav').boundingBox();assert.ok(nav.x>=0&&nav.x+nav.width<=width+.5,`${path} menu overflow ${width}`);
   await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await toggle.evaluate(e=>e.getRootNode().activeElement===e),true);
  }else{
   assert.equal(await toggle.isVisible(),false);assert.equal(await header.locator('nav a:visible').count(),6);
   const rows=await header.locator('nav a').evaluateAll(els=>els.map(e=>Math.round(e.getBoundingClientRect().top)));assert.equal(new Set(rows).size,1);
  }
 }
 console.log('PASS',path);
}
// Regress pointer-down focus transitions, not just menu visibility.
for (const source of ['index.html', 'cool-demo/2048/index.html']) {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({width, height:900});
    await page.goto(`${url}/${source}`);
    const header = page.locator('.site-header').first();
    await header.locator('.header-toggle').click();
    const link = header.locator('nav a').filter({hasText:'API docs'});
    const rect = await link.boundingBox();
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.mouse.down();
    assert.equal(await header.locator('.header-toggle').getAttribute('aria-expanded'), 'true', 'Pointer down on a link must not dismiss its menu');
    await page.mouse.up();
    await page.waitForURL(`${url}/docs.html`);
  }
}
const touchContext = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const touchPage = await touchContext.newPage();
await touchPage.route('**/*', route => new URL(route.request().url()).origin === url ? route.continue() : route.abort());
for (const source of ['index.html', 'cool-demo/2048/index.html']) {
  await touchPage.goto(`${url}/${source}`);
  const header = touchPage.locator('.site-header').first();
  await header.locator('.header-toggle').tap();
  await header.locator('nav a').filter({hasText:'Cool demos'}).tap();
  await touchPage.waitForURL(`${url}/demos.html`);
}
await touchContext.close();
await page.goto(`${url}/index.html`);
await page.locator('.header-toggle').click();
await page.keyboard.press('Tab');
await page.keyboard.press('Enter');
await page.waitForURL(`${url}/demos.html`);
console.log('PASS real mouse, touch, and keyboard menu navigation');
await page.goto(`${url}/index.html`);
await page.locator('#copy-agent-prompt').click();
assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),await page.locator('#agent-quick-prompt').textContent());
console.log('PASS copy prompt and responsive navigation');
 await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async()=>{throw Error('Denied')}}}));
 await page.locator('#copy-agent-prompt').click();
 assert.equal(await page.evaluate(()=>getSelection().toString()), await page.locator('#agent-quick-prompt').textContent());
 assert.match(await page.locator('#agent-copy-status').textContent(), /manually/);
 console.log('PASS clipboard fallback');
} finally {
 await browser?.close();
 await new Promise(resolve => server.close(resolve));
}
