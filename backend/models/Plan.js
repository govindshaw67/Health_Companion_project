import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: Object,
  dietPlan: String,
  exercisePlan: String,
  aiMeta: Object,
  notes: String,
  // ✅ NEW: Store BPM with plan for historical tracking
  bpm: {
    type: Number,
    min: [40, 'BPM too low'],
    max: [200, 'BPM too high']
  }
}, {
  timestamps: true  // ✅ Add timestamps for tracking
});

const Plan = mongoose.model("Plan", planSchema);
export default Plan;