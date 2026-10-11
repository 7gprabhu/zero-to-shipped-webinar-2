import multer from 'multer';
import { httpError } from '../utils.js';
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 1, fieldSize: 50000 },
  fileFilter(req, file, cb) {
    if (!/\.pdf$/i.test(file.originalname) || file.mimetype !== 'application/pdf') return cb(httpError(400, 'Choose a PDF file.'));
    cb(null, true);
  }
});
