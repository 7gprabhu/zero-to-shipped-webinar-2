import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readAnalysisResponse } from '../src/api.js';
test('plain-text platform errors show a useful message', async () => {
  await assert.rejects(readAnalysisResponse(new Response('A server error has occurred', { status: 500 })), /HTTP 500.*Vercel function logs/);
});
test('HTML routing responses do not produce JSON syntax errors', async () => {
  await assert.rejects(readAnalysisResponse(new Response('<html>Landing page</html>')), /unexpected response/);
});
test('preserves backend JSON errors', async () => {
  await assert.rejects(readAnalysisResponse(Response.json({ message: 'Database is not configured.' }, { status: 503 })), /Database is not configured/);
});
test('identifies platform upload limits', async () => {
  await assert.rejects(readAnalysisResponse(new Response('too large', { status: 413 })), /smaller than 4 MB/);
});
test('accepts results and rejects malformed success responses', async () => {
  const data = { score: 80, presentSkills: ['React'], missingSkills: ['TypeScript'], summary: 'Good match.' };
  assert.deepEqual(await readAnalysisResponse(Response.json(data)), data);
  await assert.rejects(readAnalysisResponse(Response.json({ score: 80 })), /invalid analysis/);
});
