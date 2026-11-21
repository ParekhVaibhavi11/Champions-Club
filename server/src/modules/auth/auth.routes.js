import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../config/db.js';
import { authenticateToken } from '../../middleware/auth.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

const router = Router();

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.is_active,
              p.member_code, m.plan_id, pl.name as plan_name, pl.discount_shop_pct, pl.discount_cafe_pct
       FROM users u
       LEFT JOIN member_profiles p ON u.id = p.user_id
       LEFT JOIN memberships m ON u.id = m.user_id AND m.status = 'ACTIVE'
       LEFT JOIN membership_plans pl ON m.plan_id = pl.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const user = userResult.rows[0];
    if (!user.is_active) {
      return errorResponse(res, 'Account is deactivated. Contact Front Desk.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'champions_club_super_secure_jwt_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    delete user.password_hash;
    return successResponse(res, { token, user }, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
});

// Current User Profile
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.role, u.phone,
              p.member_code, p.preferred_sport,
              m.plan_id, pl.name as plan_name, pl.discount_shop_pct, pl.discount_cafe_pct
       FROM users u
       LEFT JOIN member_profiles p ON u.id = p.user_id
       LEFT JOIN memberships m ON u.id = m.user_id AND m.status = 'ACTIVE'
       LEFT JOIN membership_plans pl ON m.plan_id = pl.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, userResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
