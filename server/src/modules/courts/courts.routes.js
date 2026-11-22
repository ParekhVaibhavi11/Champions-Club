import { Router } from 'express';
import * as courtsController from './courts.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/rbac.js';

const router = Router();

// Public routes for courts and availability
router.get('/sports', courtsController.getSports);
router.get('/courts', courtsController.getCourts);
router.get('/courts/availability', courtsController.getAvailability);
router.get('/courts/manage', authenticateToken, authorizeRole(['admin']), courtsController.getManageCourts);
router.get('/courts/:id', courtsController.getCourtById);
router.post('/courts', authenticateToken, authorizeRole(['admin']), courtsController.createCourt);
router.put('/courts/:id', authenticateToken, authorizeRole(['admin']), courtsController.updateCourt);
router.post('/courts/:id/maintenance', authenticateToken, authorizeRole(['admin']), courtsController.createMaintenanceBlock);

export default router;
