import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authRepo from './auth.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'champions_club_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const login = async (email, password) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepo.findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Format user profile payload
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    staff_profile: user.role === 'staff' || user.role === 'front_desk' ? {
      department: user.staff_department,
      can_access_pos: user.can_access_pos,
      can_access_kitchen: user.can_access_kitchen,
    } : null,
    membership: user.membership_tier ? {
      tier: user.membership_tier,
      court_discount_pct: user.court_discount_pct,
      shop_discount_pct: user.shop_discount_pct,
      cafe_discount_pct: user.cafe_discount_pct,
    } : null,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Clean sensitive properties before returning
  const { password_hash, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
};

export const getMe = async (userId) => {
  const user = await authRepo.findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};
