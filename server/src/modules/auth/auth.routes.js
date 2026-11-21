import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);

export default router;
