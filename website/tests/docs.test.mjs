import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../docs.html', import.meta.url), 'utf8');

test('API beta pricing lists all eight models in the requested order', () => {
  const pricing = html.split('<h3>Beta pricing</h3>')[1].split('</table>')[0];
  const rows = [...pricing.matchAll(/<tr>\s*<td>\s*<code>([^<]+)<\/code>\s*<\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>\s*<\/tr>/g)]
    .map(([, model, price, vision]) => [model, price, vision]);
  assert.deepEqual(rows, [
    ['featherless-ai/Qwen3.6-35B-A3B-classifier', '$0.28', 'Supported'],
    ['featherless-ai/Qwen3.8-27B-classifier', '$0.30', 'Supported'],
    ['featherless-ai/Qwen3.5-4B-classifier', '$0.03', 'Supported'],
    ['featherless-ai/gemma-4-26B-A4B-classifier', '$0.28', 'Supported'],
    ['featherless-ai/gemma-4-12B-it-classifier', '$0.24', 'Supported'],
    ['featherless-ai/RWKV-std-classifier', '$0.20', 'Text only'],
    ['featherless-ai/RWKV-mid-classifier', '$0.10', 'Text only'],
    ['featherless-ai/RWKV-small-classifier', '$0.03', 'Text only'],
  ]);
  assert.match(pricing, /Input token price \(per million\)/);
  const experimental = pricing.split('scope="rowgroup">Experimental</th>')[1];
  assert.equal([...experimental.matchAll(/<code>/g)].length, 3);
  assert.doesNotMatch(experimental, /Qwen|gemma/);
});

test('local serving docs distinguish questions, input tokens, and choices', () => {
  const limits = html.split('<h3>Set the three independent limits</h3>')[1];
  assert.ok(limits);
  assert.match(limits, /--max-request-branches 256/);
  assert.match(limits, /Default: 100; schema maximum: 256/);
  assert.match(limits, /--max-model-len 32768/);
  assert.match(limits, /Default: 16384/);
  assert.match(limits, /--max-choice-options 255/);
  assert.match(limits, /valid range: 2–255/);
  assert.match(limits, /three branches, not 765/);
  assert.match(limits, /startup settings, not request fields/);
  assert.match(limits, /native context support/);
  for (const relative of ['../../README.md', '../../hf-server/README.md', '../../hf-server/API_REFERENCE.md']) {
    const markdown = readFileSync(new URL(relative, import.meta.url), 'utf8');
    for (const flag of ['--max-request-branches 256', '--max-model-len 32768', '--max-choice-options 255']) {
      assert.ok(markdown.includes(flag), `${relative} must demonstrate ${flag}`);
    }
  }
});
