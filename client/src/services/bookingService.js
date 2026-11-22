import api from './api';

export const bookingService = {
  createBooking: async (payload) => {
    return await api.post('/bookings', payload);
  },
  getBookings: async (dateStr, sportId = null) => {
    let url = `/bookings?date=${dateStr}`;
    if (sportId) url += `&sport_id=${sportId}`;
    return await api.get(url);
  },
  getMyBookingHistory: async () => {
    return await api.get('/bookings/mine');
  },
  cancelBooking: async (bookingId) => {
    return await api.patch(`/bookings/${bookingId}/cancel`);
  },
  checkInBooking: async (bookingId) => {
    return await api.patch(`/bookings/${bookingId}/check-in`);
  },
  getSocialSessions: async () => {
    return await api.get('/social-sessions');
  },
  registerSocialSession: async (sessionId) => {
    return await api.post(`/social-sessions/${sessionId}/register`);
  },
};
