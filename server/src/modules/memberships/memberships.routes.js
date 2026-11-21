import { Router } from 'express';
import * as membershipController from './memberships.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/rbac.js';

const router = Router();

// Public: Browse membership tiers & pricing
router.get('/plans', membershipController.getPlans);

// Protected: Front Desk & Admin Directory Operations
router.get('/members', authenticateToken, authorizeRole(['front_desk', 'admin']), membershipController.getMembers);
router.post('/members', authenticateToken, authorizeRole(['front_desk', 'admin']), membershipController.createMember);
router.get('/members/:id', authenticateToken, membershipController.getMemberById);
router.post('/memberships/:id/renew', authenticateToken, authorizeRole(['front_desk', 'admin', 'member']), membershipController.renewMembership);

export default router;
