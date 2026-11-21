import { Router } from 'express';
import { query } from '../../config/db.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/rbac.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

const router = Router();

// Public: Submit trial request or membership inquiry
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, interested_sport, preferred_plan, notes } = req.body;
    if (!name || !phone) {
      return errorResponse(res, 'Name and phone number are required', 400);
    }

    const result = await query(
      `INSERT INTO leads (name, email, phone, interested_sport, preferred_plan, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'NEW')
       RETURNING *`,
      [name, email || null, phone, interested_sport || null, preferred_plan || null, notes || null]
    );

    return successResponse(res, result.rows[0], 'Inquiry submitted successfully! Our team will contact you shortly.', 201);
  } catch (err) {
    next(err);
  }
});

// Front Desk / Admin: List all leads
router.get('/', authenticateToken, authorizeRole(['admin', 'front_desk']), async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM leads ORDER BY created_at DESC');
    return successResponse(res, result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
