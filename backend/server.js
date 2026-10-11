import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });
if (!process.env.VERCEL) {
try {
  await connectDB();
  const server = app.listen(process.env.PORT || 5000, '127.0.0.1', () => console.log(`API ready on http://localhost:${process.env.PORT || 5000}`));
  async function shutdown() { server.close(async () => { await mongoose.disconnect(); process.exit(0); }); }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) { console.error(`Startup failed: ${error.message}`); process.exit(1); }
}
export default app;
