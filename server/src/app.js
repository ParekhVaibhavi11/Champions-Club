import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import pool from './config/db.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: 'Server is running',
      database: 'Connected',
      time: result.rows[0].current_time,
    });
  } catch (err) {
    res.status(500).json({
      status: 'Server is running',
      database: 'Connection failed',
      error: err.message,
    });
  }
});

// Mount V1 API Routes
app.use('/api/v1/auth', authRoutes);

// Central Error Handler
app.use(errorHandler);

export default app;
