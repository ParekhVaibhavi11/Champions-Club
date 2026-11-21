import * as bookingsService from './bookings.service.js';
import { successResponse } from '../../utils/apiResponse.js';

export const createBooking = async (req, res, next) => {
  try {
    const { court_id, start_time, guest_name, guest_phone, notes } = req.body;
    const isStaff = req.user?.role === 'front_desk' || req.user?.role === 'admin';

    // If staff is booking for a guest or specific member
    const memberId = isStaff ? (req.body.member_id || null) : req.user.id;
    const staffUserId = isStaff ? req.user.id : null;

    const result = await bookingsService.createBooking({
      courtId: parseInt(court_id, 10),
      startTime: start_time,
      memberId,
      guestName: guest_name || null,
      guestPhone: guest_phone || null,
      staffUserId,
      notes,
    });

    return successResponse(res, result, 'Court session booked successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const sportId = req.query.sport_id ? parseInt(req.query.sport_id, 10) : null;
    const bookings = await bookingsService.listBookings(dateStr, sportId, req.user);
    return successResponse(res, bookings, 'Bookings retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getMyBookingHistory = async (req, res, next) => {
  try {
    const bookings = await bookingsService.listMyBookingHistory(req.user.id);
    return successResponse(res, bookings, 'Your booking history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const result = await bookingsService.cancelBooking(bookingId, req.user);
    return successResponse(res, result, 'Booking cancelled and court allocation released');
  } catch (err) {
    next(err);
  }
};

export const checkInBooking = async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const result = await bookingsService.checkInBooking(bookingId);
    return successResponse(res, result, 'Athlete checked in successfully');
  } catch (err) {
    next(err);
  }
};

export const getSocialSessions = async (req, res, next) => {
  try {
    const sessions = await bookingsService.listSocialSessions();
    return successResponse(res, sessions, 'Friday social sessions retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const registerSocialSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id, 10);
    const result = await bookingsService.joinSocialSession(sessionId, req.user.id);
    return successResponse(res, result, 'Registered for Friday Social Play successfully', 201);
  } catch (err) {
    next(err);
  }
};
