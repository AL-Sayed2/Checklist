import mongoose from 'mongoose';

const checklistSchema = new mongoose.Schema({
  week: { type: String, required: true, unique: true }, // format: '2026-W13'
  data: { type: Object, required: true },
  notes: { type: String, default: '' },
  compliance: { type: Number, required: true },
  totalPass: { type: Number, required: true },
  totalFail: { type: Number, required: true },
  totalNA: { type: Number, required: true },
  savedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Checklist', checklistSchema);
