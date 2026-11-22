import { Router } from 'express';
import * as controller from './admin.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/rbac.js';

const router = Router();
router.use(authenticateToken, authorizeRole(['admin']));
router.get('/dashboard/summary', controller.summary);
router.get('/reports/revenue', controller.revenue);
router.get('/finance/ledger', controller.ledger);
router.get('/hr/overview', controller.hrOverview);
router.post('/hr/staff', controller.createStaff);
router.patch('/hr/leave-requests/:id', controller.reviewLeave);
export default router;
