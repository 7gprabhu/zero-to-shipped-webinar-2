import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeWithLabd, parseAnalysis } from '../service/labdService.js';
const report = { score: 80, presentSkills: ['React'], missingSkills: ['TypeScript'], summary: 'Good match with a TypeScript gap.' };
test('accepts JSON and fenced JSON from message content', () => {
  assert.equal(parseAnalysis(JSON.stringify(report)).score, 80);
  assert.equal(parseAnalysis('```json\n' + JSON.stringify(report) + '\n```').method, 'labd-ai');
});
test('rejects malformed scores, lists and conflicting skills', () => {
  for (const bad of [{ ...report, score: 101 }, { ...report, score: '80' }, { ...report, presentSkills: [42] }, { ...report, missingSkills: ['react'] }]) {
    assert.throws(() => parseAnalysis(JSON.stringify(bad)), { status: 502 });
  }
  assert.throws(() => parseAnalysis('not JSON'), { status: 502 });
});
test('handles provider failures without exposing provider body or API key', async () => {
  for (const [providerStatus, expected] of [[401, 503], [402, 503], [403, 503], [429, 429], [500, 502]]) {
    await assert.rejects(analyzeWithLabd('React', 'React', { apiKey: 'test-key', fetchImpl: async () => new Response('private provider error', { status: providerStatus }) }), error => error.status === expected && !error.message.includes('private'));
  }
});
test('requires configuration and handles timeouts', async () => {
  await assert.rejects(analyzeWithLabd('React', 'React', { apiKey: '' }), { status: 503 });
  await assert.rejects(analyzeWithLabd('React', 'React', { apiKey: 'test', fetchImpl: async () => { throw new DOMException('timeout', 'TimeoutError'); } }), { status: 504 });
});
