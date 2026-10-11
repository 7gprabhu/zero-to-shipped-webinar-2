import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { analyzeResume } from '../controller/resumeController.js';
const router = Router();
router.post('/analyze', upload.single('resume'), analyzeResume);
export default router;
