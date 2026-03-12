import express from 'express';
import { getUser, updateUserBPM, getUserDashboard } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ✅ Protected routes - require authentication
router.get('/profile', auth, (req, res) => {
  res.json({ 
    message: 'User profile endpoint',
    user: req.user 
  });
});

// ✅ NEW: Get user dashboard with BPM data
router.get('/dashboard', auth, getUserDashboard);

// ✅ NEW: Update user BPM
router.put('/bpm', auth, updateUserBPM);

// ✅ Get user by ID (protected)
router.get('/:id', auth, getUser);

export default router;