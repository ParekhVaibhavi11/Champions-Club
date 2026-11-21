import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route modules
import authRoutes from './modules/auth/auth.routes.js';
import courtRoutes from './modules/courts/courts.routes.js';
import shopRoutes from './modules/shop/shop.routes.js';
import cafeRoutes from './modules/cafe/cafe.routes.js';
import leadsRoutes from './modules/crm/leads.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';

import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Champions Club API is healthy & operational',
    timestamp: new Date().toISOString()
  });
});

// Mount Granular API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courts', courtRoutes);
app.use('/api/v1/shop', shopRoutes);
app.use('/api/v1/cafe', cafeRoutes);
app.use('/api/v1/leads', leadsRoutes);
app.use('/api/v1/reports', reportsRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
