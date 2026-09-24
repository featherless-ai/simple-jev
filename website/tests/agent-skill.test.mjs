import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('agent discovery resolves to the published skill with an accurate integrity digest', async () => {
  const manifest = JSON.parse(await readFile(new URL('../.well-known/agent-skills/index.json', import.meta.url)));
  for (const entry of manifest.skills) {
    assert.equal(entry.type, 'skill-md');
    const url = new URL(entry.url);
    assert.equal(url.origin, 'https://simplejev.ai');
    const skill = await readFile(new URL(`..${url.pathname}`, import.meta.url));
    assert.equal(entry.digest, `sha256:${createHash('sha256').update(skill).digest('hex')}`);
    const name = skill.toString().match(/^name: (.+)$/m)?.[1];
    assert.equal(entry.name, name);
  }
});
