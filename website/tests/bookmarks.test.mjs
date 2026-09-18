import assert from 'node:assert/strict'
import test from 'node:test'
import { BATCH_SIZE, CATEGORIES, LIMITS, SAMPLE_BOOKMARKS, answerFor, buildRequest, sanitizeText, validBookmarkUrl } from '../cool-demo/bookmarks/bookmarks.mjs'

test('bookmark requests contain one valid choice question per bookmark', () => {
  const request = buildRequest('example-model', SAMPLE_BOOKMARKS.slice(0, BATCH_SIZE))
  assert.equal(request.model, 'example-model')
  assert.equal(Object.keys(request.questions).length, BATCH_SIZE)
  assert.deepEqual(request.questions.bookmark_1.criteria, CATEGORIES)
  assert.match(request.state, /GitHub Actions/)
})

test('bookmark answer validation rejects unknown or incomplete categories', () => {
  const probabilities = Object.fromEntries(Object.keys(CATEGORIES).map((key) => [key, 0]))
  probabilities.technology_software = 1
  assert.equal(answerFor({ answers: { bookmark_1: { choice: 'technology_software', probabilities } } }, 'bookmark_1').choice, 'technology_software')
  assert.throws(() => answerFor({ answers: { bookmark_1: { choice: 'unknown', probabilities } } }, 'bookmark_1'))
  assert.throws(() => answerFor({ answers: { bookmark_1: { choice: 'technology_software', probabilities: {} } } }, 'bookmark_1'))
})

test('bookmark input normalization removes control characters and bounds URLs', () => {
  assert.equal(sanitizeText('  Good\u0000\n title\t ', 180), 'Good title')
  assert.equal(validBookmarkUrl('https://example.com/\u0000path'), 'https://example.com/path')
  assert.equal(validBookmarkUrl('javascript:alert(1)'), null)
  assert.equal(validBookmarkUrl(`https://example.com/${'a'.repeat(LIMITS.URL_CHARS)}`), null)
})
