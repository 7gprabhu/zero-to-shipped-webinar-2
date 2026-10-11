import { httpError } from '../utils.js';
export async function extractResumeText(buffer) {
  if (!buffer || buffer.subarray(0, 5).toString() !== '%PDF-') throw httpError(400, 'The uploaded file is not a valid PDF.');
  let parser;
  try {
    const { PDFParse } = await import('pdf-parse');
    parser = new PDFParse({ data: new Uint8Array(buffer) });
  } catch (error) {
    console.error('PDF parser initialization failed:', error.name);
    throw httpError(503, 'The PDF parser could not start on the server. Check the Vercel runtime logs and PDF library dependencies.');
  }
  try {
    const { text } = await parser.getText();
    if (!text.trim()) throw httpError(422, 'No readable text found. Upload a text-based PDF; scanned resumes need OCR.');
    return text;
  } catch (error) {
    if (error.status) throw error;
    throw httpError(422, 'Unable to read this PDF. It may be damaged or password-protected.');
  } finally { await parser.destroy(); }
}
