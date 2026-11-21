import { Router } from 'express';
import * as bookingsController from './bookings.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/rbac.js';

const router = Router();

// Friday Social Sessions (Public & Members)
router.get('/social-sessions', bookingsController.getSocialSessions);
router.post('/social-sessions/:id/register', authenticateToken, bookingsController.registerSocialSession);

// Private Bookings
router.post('/bookings', authenticateToken, bookingsController.createBooking);
router.get('/bookings', authenticateToken, bookingsController.getBookings);
router.patch('/bookings/:id/cancel', authenticateToken, bookingsController.cancelBooking);
router.patch('/bookings/:id/check-in', authenticateToken, authorizeRole(['front_desk', 'admin']), bookingsController.checkInBooking);

export default router;
