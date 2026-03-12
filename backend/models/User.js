import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"] 
  },
  phone: { 
    type: String, 
    required: [true, "Phone is required"],
    unique: true 
  },
  email: { 
    type: String, 
    sparse: true  // Allows null/undefined but ensures uniqueness when present
  },
  password: { 
    type: String, 
    required: [true, "Password is required"] 
  },
  age: Number,
  weight: Number,
  height: Number,
  activity: String,
  fitnessGoal: String,
  conditions: [String],
  bpm: {  // ✅ NEW: Added BPM field
    type: Number,
    min: [40, 'BPM too low'],
    max: [200, 'BPM too high']
  },
  latestPlan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Plan" 
  }
}, {
  timestamps: true  // ✅ Adds createdAt and updatedAt automatically
});

const User = mongoose.model("User", userSchema);
export default User;