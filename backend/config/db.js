import mongoose from 'mongoose';
let connectionPromise;
export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in backend/.env before starting the server.');
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .catch(error => { connectionPromise = undefined; throw error; });
  }
  await connectionPromise;
}
