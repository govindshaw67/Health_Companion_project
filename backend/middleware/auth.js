import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  console.log('🔍 [AUTH] Checking authentication...');
  
  const authHeader = req.header("Authorization");
  console.log('🔍 [AUTH] Authorization header:', authHeader);
  
  const token = authHeader?.replace("Bearer ", "");
  console.log('🔍 [AUTH] Token extracted:', token ? `Exists (${token.substring(0, 20)}...)` : 'MISSING');

  if (!token) {
    console.log('🔍 [AUTH] No token provided');
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    console.log('🔍 [AUTH] JWT Secret exists:', !!process.env.JWT_SECRET);
    console.log('🔍 [AUTH] Verifying token...');
    
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 [AUTH] Token verified successfully:', verified);
    
    // Get user from database
    const user = await User.findById(verified.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error('🔍 [AUTH] JWT Verification Error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: "Invalid Token" });
    } else {
      return res.status(400).json({ message: "Token verification failed" });
    }
  }
};

export default auth;