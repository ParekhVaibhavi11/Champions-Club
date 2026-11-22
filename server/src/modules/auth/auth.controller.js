import * as authService from './auth.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, result, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return successResponse(res, result, result.message);
  } catch (err) {
    next(err);
  }
};

export const resetPasswordWithOTP = async (req, res, next) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    const result = await authService.resetPasswordWithOTP(email, otpCode, newPassword);
    return successResponse(res, result, result.message);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, user, 'User profile fetched successfully');
  } catch (err) {
    next(err);
  }
};
