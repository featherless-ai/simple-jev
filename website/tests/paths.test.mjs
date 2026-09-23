import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const siteFiles = walk(websiteRoot).filter(
  (f) => !relative(websiteRoot, f).startsWith(`tests${join("")}`) && !f.endsWith("README.md"),
);

// The site is served from the URL root and under the /simple-jev/ prefix.
// Internal references must therefore be relative so pages resolve at both.
test("every internal page reference is relative and resolves to a site file", () => {
  const problems = [];
  for (const file of siteFiles.filter((f) => f.endsWith(".html"))) {
    const rel = relative(websiteRoot, file);
    const html = readFileSync(file, "utf8");
    const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (/^(https?:|\/\/|mailto:|tel:|data:|#)/.test(ref)) continue;
      if (ref.startsWith("/"))
        problems.push(`${rel}: root-absolute ref "${ref}" breaks under the /simple-jev/ prefix`);
      const target = resolve(dirname(file), ref.split(/[?#]/)[0]);
      if (!existsSync(target)) problems.push(`${rel}: ref "${ref}" does not match a site file`);
    }
  }
  assert.deepEqual(problems, [], "site pages must be prefix-agnostic");
});

test("shared demo header derives its links from its own script URL", () => {
  const src = readFileSync(join(websiteRoot, "shared/demo-header.js"), "utf8");
  assert.match(
    src,
    /SITE_ROOT = new URL\("\.\.\/", document\.currentScript\.src\)/,
    "header links must resolve from the script location, not the site root",
  );
  for (const target of ["index.html", "demos.html", "how-it-works.html", "playground.html", "docs.html", "assets/simple-jev.png", "assets/featherless_logo_dark.svg"]) {
    assert.ok(src.includes(`\${SITE_ROOT}${target}"`), `header must link ${target} through SITE_ROOT`);
  }
  assert.doesNotMatch(src, /(?:href|src)="\//, "header must not contain root-absolute refs");
});

test("driving simulator build uses paths relative to the page", () => {
  const driveRoot = join(websiteRoot, "cool-demo/drive");
  const html = readFileSync(join(driveRoot, "index.html"), "utf8");
  assert.doesNotMatch(html, /(?:href|src)="\/[^/"]/, "built page must not contain root-absolute refs");
  for (const file of readdirSync(join(driveRoot, "assets"))) {
    if (!file.endsWith(".js")) continue;
    const src = readFileSync(join(driveRoot, "assets", file), "utf8");
    assert.doesNotMatch(
      src,
      /["'`]\/cool-demo\//,
      `${file} embeds root-absolute /cool-demo/ paths; rebuild with a relative Vite base`,
    );
  }
});

test("URL prefix rules keep /simple-jev/ working", () => {
  const lines = readFileSync(join(websiteRoot, "_redirects"), "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const rewrite = "/simple-jev/* /:splat 200";
  assert.ok(lines.includes(rewrite), "_redirects must contain the prefix rewrite");
  const rewriteAt = lines.indexOf(rewrite);
  for (const line of lines) {
    if (line === rewrite) continue;
    assert.ok(
      lines.indexOf(line) < rewriteAt,
      `redirect "${line}" must precede the catch-all rewrite`,
    );
  }
  // Redirecting .html URLs to extensionless paths loses the prefix, so they
  // are rewritten in place (200) instead. Every top-level page needs a rule.
  for (const entry of readdirSync(websiteRoot)) {
    if (!entry.endsWith(".html")) continue;
    const target = entry === "index.html" ? "/" : `/${entry.replace(/\.html$/, "")}`;
    assert.ok(
      lines.includes(`/simple-jev/${entry} ${target} 200`),
      `_redirects must serve /simple-jev/${entry} without a redirect`,
    );
  }
  for (const dir of ["/simple-jev", "/simple-jev/cool-demo", "/simple-jev/cool-demo/2048", "/simple-jev/cool-demo/bookmarks", "/simple-jev/cool-demo/drive", "/simple-jev/cool-demo/vision"]) {
    assert.ok(lines.includes(`${dir} ${dir}/ 301`), `_redirects must keep the prefix when normalizing ${dir}`);
  }
});