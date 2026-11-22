import api from './api';

export const authService = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },
  resetPasswordWithOTP: async (email, otpCode, newPassword) => {
    return await api.post('/auth/reset-password-otp', { email, otpCode, newPassword });
  },
  getMe: async () => {
    return await api.get('/auth/me');
  },
};
