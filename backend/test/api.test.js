import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import Analysis from '../config/Analysis.js';

function resumePDF(text) {
  const stream = `BT /F1 12 Tf 50 750 Td (${text}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

test('API extracts a real PDF, compares skills and calls persistence', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  let saved;
  const original = Analysis.create;
  Analysis.create = async data => { saved = data; return { id: 'test-id', ...data }; };
  t.after(() => { Analysis.create = original; });
  const form = new FormData();
  form.append('resume', new Blob([resumePDF('React JavaScript Git')], { type: 'application/pdf' }), 'resume.pdf');
  form.append('jobDescription', 'React and TypeScript required');
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/resumes/analyze`, { method: 'POST', body: form });
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.score, 50);
  assert.deepEqual(result.presentSkills, ['React']);
  assert.deepEqual(result.missingSkills, ['TypeScript']);
  assert.equal(saved.jobDescription, 'React and TypeScript required');
  assert.equal(saved.resumeText, undefined);
  const invalid = new FormData();
  invalid.append('jobDescription', 'React');
  const rejected = await fetch(`http://127.0.0.1:${server.address().port}/api/resumes/analyze`, { method: 'POST', body: invalid });
  assert.equal(rejected.status, 400);
});
