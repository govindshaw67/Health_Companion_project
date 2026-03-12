import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Simple in-memory store for reset codes (use Redis in production)
const resetCodes = new Map();

const signToken = (userId) => jwt.sign({ userId: userId }, process.env.JWT_SECRET, { 
  expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
});

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ message: 'name, phone, password required' });

    let existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone already registered. Try login.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, password: hashed });
    
    const token = signToken(user._id);
    
    console.log('🔍 [AUTH SIGNUP] Generated token payload:', { userId: user._id });
    
    res.json({ 
      token,
      user: { 
        id: user._id,
        name: user.name, 
        phone: user.phone 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on signup' });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'phone and password required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    
    console.log('🔍 [AUTH LOGIN] Generated token payload:', { userId: user._id });
    
    res.json({ 
      token,
      user: { 
        id: user._id,
        name: user.name, 
        phone: user.phone 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on login' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const user = await User.findOne({ phone });
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return res.json({ 
        message: 'If an account with this phone exists, a reset code has been sent.',
        codeSent: true 
      });
    }

    // Generate reset code
    const resetCode = generateResetCode();
    
    // Store code with expiration (10 minutes)
    resetCodes.set(phone, {
      code: resetCode,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    console.log(`🔍 [FORGOT PASSWORD] Reset code for ${phone}: ${resetCode}`);
    
    // In a real app, you would send this via SMS/Email
    // For demo, we'll return it in the response
    res.json({
      message: 'Reset code generated successfully.',
      codeSent: true,
      demoCode: resetCode, // Remove this in production
      note: 'In production, this code would be sent via SMS'
    });

  } catch (err) {
    console.error('🔍 [FORGOT PASSWORD] Error:', err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'Phone and code are required' });

    const resetData = resetCodes.get(phone);
    
    if (!resetData) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    if (Date.now() > resetData.expiresAt) {
      resetCodes.delete(phone);
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    if (resetData.code !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Code is valid
    resetData.verified = true;
    resetCodes.set(phone, resetData);

    res.json({ 
      message: 'Code verified successfully',
      verified: true 
    });

  } catch (err) {
    console.error('🔍 [VERIFY CODE] Error:', err);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body;
    if (!phone || !code || !newPassword) {
      return res.status(400).json({ message: 'Phone, code, and new password are required' });
    }

    const resetData = resetCodes.get(phone);
    
    if (!resetData || !resetData.verified) {
      return res.status(400).json({ message: 'Invalid or unverified reset code' });
    }

    if (resetData.code !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Find user and update password
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear the reset code
    resetCodes.delete(phone);

    res.json({ 
      message: 'Password reset successfully',
      success: true 
    });

  } catch (err) {
    console.error('🔍 [RESET PASSWORD] Error:', err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};