import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  filename: { type: String, required: true },
  jobDescription: { type: String, required: true },
  score: { type: Number, default: null },
  presentSkills: [String], missingSkills: [String], requiredSkills: [String],
  summary: String,
  method: { type: String, default: 'labd-ai' }
}, { timestamps: true });
export default mongoose.model('Analysis', schema);
