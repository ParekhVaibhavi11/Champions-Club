import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import membershipRoutes from './modules/memberships/memberships.routes.js';
import courtRoutes from './modules/courts/courts.routes.js';
import bookingRoutes from './modules/bookings/bookings.routes.js';
import trialsRoutes from './modules/trials/trials.routes.js';
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
app.use('/api/v1', membershipRoutes); // /api/v1/plans, /api/v1/members, /api/v1/memberships
app.use('/api/v1', courtRoutes);      // /api/v1/sports, /api/v1/courts, /api/v1/courts/availability
app.use('/api/v1', bookingRoutes);    // /api/v1/bookings, /api/v1/social-sessions
app.use('/api/v1', trialsRoutes);     // /api/v1/trials, /api/v1/leads

// Central Error Handler
app.use(errorHandler);

export default app;
