import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as authRepo from './auth.repository.js';
import { registerAccount } from '../memberships/memberships.service.js';
import { sendPasswordResetOTP } from '../../utils/emailService.js';

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

  // Format token payload
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
  const { password_hash, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
};

export const register = async ({ fullName, email, password, phone }) => {
  if (!fullName || !email || !password) {
    const error = new Error('Full name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  await registerAccount({
    fullName,
    email,
    phone,
    password,
  });

  return await login(email, password);
};

export const forgotPassword = async (email) => {
  if (!email) {
    const error = new Error('Please provide your email address');
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepo.findUserByEmail(email);
  if (!user) {
    return { message: 'If an account exists with this email, a 6-digit verification code has been dispatched.' };
  }

  // Generate 6-digit numeric OTP code (e.g. 482915)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetToken = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

  await authRepo.savePasswordResetOTP(user.id, otpCode, resetToken, expiresAt);

  // Send real email via SMTP
  await sendPasswordResetOTP(user.email, otpCode);

  return {
    message: 'A 6-digit verification code has been sent to your email inbox.',
  };
};

export const resetPasswordWithOTP = async (email, otpCode, newPassword) => {
  if (!email || !otpCode || !newPassword) {
    const error = new Error('Email, 6-digit code, and new password are required');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters long');
    error.statusCode = 400;
    throw error;
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await authRepo.resetPasswordWithOTP(email.trim(), otpCode.trim(), newPasswordHash);

  return { message: 'Your password has been successfully reset! You can now log in.' };
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
