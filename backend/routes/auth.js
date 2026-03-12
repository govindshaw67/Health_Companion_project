import express from 'express';
import { signup, login, forgotPassword, verifyResetCode, resetPassword } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Add token verification route
router.get('/verify', auth, (req, res) => {
  console.log('🔍 [AUTH VERIFY] Token is valid, user:', req.user);
  res.json({ 
    valid: true, 
    user: {
      id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      age: req.user.age,
      height: req.user.height,
      weight: req.user.weight,
      activity: req.user.activity
    }
  });
});

export default router;