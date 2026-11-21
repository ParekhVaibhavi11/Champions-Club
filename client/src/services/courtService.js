import api from './api';

export const courtService = {
  getSports: async () => {
    return await api.get('/sports');
  },
  getCourts: async (sportId = null) => {
    return await api.get(`/courts${sportId ? `?sport_id=${sportId}` : ''}`);
  },
  getCourtById: async (courtId) => {
    return await api.get(`/courts/${courtId}`);
  },
  getCourtAvailability: async (courtId, dateStr) => {
    return await api.get(`/courts/availability?court_id=${courtId}&date=${dateStr}`);
  },
};
