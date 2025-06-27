import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

import geojsonRoutes from './routes/cultRoutes.js';
import userVisitRoutes from './routes/userVisitRoutes.js';
import districtRoutes from './routes/districtRoutes.js';
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to database
connectDB();

app.use(cookieParser());
// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL - must be specific, not *
  credentials: true,               // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/admin', geojsonRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/progress', userVisitRoutes);
app.use('/api/districts', districtRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));