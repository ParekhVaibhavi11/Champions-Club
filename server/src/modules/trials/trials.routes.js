import { Router } from 'express';
import { trialsController } from './trials.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/rbac.js';

const router = Router();

// Public guest demo booking, live tracking & tax invoice
router.post('/trials/request', trialsController.requestTrial);
router.get('/trials/status/:referenceCode', trialsController.getTrialStatus);
router.get('/trials/invoice/:referenceCode', trialsController.getInvoice);

// Front Desk & Admin CRM lead pipeline
router.get('/leads', authenticateToken, authorizeRole(['front_desk', 'admin']), trialsController.getAllLeads);
router.post('/leads/confirm-trial', authenticateToken, authorizeRole(['front_desk', 'admin']), trialsController.confirmTrial);
router.patch('/leads/:id/status', authenticateToken, authorizeRole(['front_desk', 'admin']), trialsController.updateLeadStatus);
router.post('/leads/:id/convert', authenticateToken, authorizeRole(['front_desk', 'admin']), trialsController.convertLead);

export default router;
