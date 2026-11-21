import { Router } from 'express';
import * as courtsController from './courts.controller.js';

const router = Router();

// Public routes for courts and availability
router.get('/sports', courtsController.getSports);
router.get('/courts', courtsController.getCourts);
router.get('/courts/availability', courtsController.getAvailability);
router.get('/courts/:id', courtsController.getCourtById);

export default router;
