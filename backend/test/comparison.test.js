import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareSkills } from '../service/comparisonService.js';
import { extractResumeText } from '../service/resumeService.js';
test('scores only the skills requested by the JD', () => {
  const result = compareSkills('React, JavaScript and Git', 'React, TypeScript required');
  assert.equal(result.score, 50);
  assert.deepEqual(result.presentSkills, ['React']);
  assert.deepEqual(result.missingSkills, ['TypeScript']);
});
test('matches aliases and punctuation without partial words', () => {
  const result = compareSkills('C++ nodejs JavaScript GitHub', 'C++ Node.js Java Git');
  assert.deepEqual(result.presentSkills, ['Node.js', 'C++']);
  assert.deepEqual(result.missingSkills, ['Git', 'Java']);
});
test('does not fabricate a score for an unrecognized JD', () => {
  assert.equal(compareSkills('React', 'Looking for a chef').score, null);
});
test('rejects a disguised PDF', async () => {
  await assert.rejects(extractResumeText(Buffer.from('not a pdf')), { status: 400 });
});
