import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import resumeRoutes from './routes/resumeRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/db.js';
import { httpError } from './utils.js';
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(value => value.trim());
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.vary('Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// Vercel imports this app directly; initialize and reuse MongoDB per instance.
app.use(async (req, res, next) => {
  if (!process.env.VERCEL) return next();
  try { await connectDB(); next(); } catch (error) {
    console.error('MongoDB connection failed:', error.name);
    next(httpError(503, process.env.MONGODB_URI
      ? 'Cannot connect to MongoDB. Check the database credentials and Atlas network access in the backend configuration.'
      : 'Database is not configured. Set MONGODB_URI in the Vercel project environment variables and redeploy.'));
  }
});
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' });
});
app.use('/api/resumes', resumeRoutes);
app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use(errorHandler);
export default app;
