import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password-otp', authController.resetPasswordWithOTP);
router.get('/me', authenticateToken, authController.getMe);

export default router;
