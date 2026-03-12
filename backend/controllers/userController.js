import User from '../models/User.js';

// ✅ Converted to ES6 exports
export const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select('-password').populate('latestPlan');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ NEW: Update user BPM
export const updateUserBPM = async (req, res) => {
  try {
    const { bpm } = req.body;
    const userId = req.user.id;

    // Validate BPM
    if (!bpm || bpm < 40 || bpm > 200) {
      return res.status(400).json({ 
        message: 'Please provide a valid BPM between 40 and 200' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { bpm },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'BPM updated successfully',
      user 
    });
  } catch (err) {
    console.error('🔍 [UPDATE BPM] Error:', err);
    res.status(500).json({ message: 'Server error updating BPM' });
  }
};

// ✅ NEW: Get user dashboard with BPM data
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('latestPlan');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        age: user.age,
        weight: user.weight,
        height: user.height,
        activity: user.activity,
        bpm: user.bpm,  // ✅ Include BPM in response
        latestPlan: user.latestPlan
      }
    });
  } catch (err) {
    console.error('🔍 [DASHBOARD] Error:', err);
    res.status(500).json({ message: 'Server error loading dashboard' });
  }
};