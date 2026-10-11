import Analysis from '../config/Analysis.js';
import { extractResumeText } from '../service/resumeService.js';
import { analyzeWithLabd } from '../service/labdService.js';
import { httpError } from '../utils.js';
export async function analyzeResume(req, res) {
  const jobDescription = req.body.jobDescription?.trim();
  if (!req.file) throw httpError(400, 'Upload a resume PDF.');
  if (!jobDescription || jobDescription.length > 20000) throw httpError(400, 'Enter a job description between 1 and 20,000 characters.');
  const text = await extractResumeText(req.file.buffer);
  const comparison = await analyzeWithLabd(text, jobDescription);
  const record = await Analysis.create({ filename: req.file.originalname, jobDescription, ...comparison });
  res.status(201).json({ id: record.id, filename: record.filename, ...comparison });
}
