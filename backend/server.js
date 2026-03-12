import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import planRoutes from './routes/plan.js';
import userRoutes from './routes/user.js';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// 🔍 DEBUG: Check environment variables
console.log('🔍 [SERVER] Environment Variables Check:');
console.log('🔍 [SERVER] JWT_SECRET:', process.env.JWT_SECRET ? '✓ Loaded' : '✗ MISSING');
console.log('🔍 [SERVER] MONGODB_URI:', process.env.MONGODB_URI ? '✓ Loaded' : '✗ MISSING');
console.log('🔍 [SERVER] PORT:', process.env.PORT || 5000);
console.log('🔍 [SERVER] NODE_ENV:', process.env.NODE_ENV || 'development');

const app = express();
connectDB();

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(cors({ 
  origin: process.env.FRONTEND_URL || true,
  credentials: true 
}));
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`🔍 [REQUEST] ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ 
  ok: true, 
  ts: Date.now(),
  message: 'Health Companion API is running!',
  env: {
    jwtSecret: !!process.env.JWT_SECRET,
    mongoUri: !!process.env.MONGODB_URI,
    openRouterKey: !!process.env.OPENROUTER_API_KEY
  }
}));

// Serve frontend (frontend folder inside backend)
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// API 404 handler
app.use('/api/*', (req, res) => {
  console.log(`🔍 [404] API endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'API endpoint not found' });
});

// Catch-all for SPA (after APIs)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend served from: ${frontendPath}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});