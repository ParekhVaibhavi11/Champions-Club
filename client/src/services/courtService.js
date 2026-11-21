import api from './api';

export const courtService = {
  getSports: async () => {
    return await api.get('/sports');
  },
  getCourts: async (sportId = null) => {
    return await api.get(`/courts${sportId ? `?sport_id=${sportId}` : ''}`);
  },
  getManageCourts: () => api.get('/courts/manage'),
  getCourtById: async (courtId) => {
    return await api.get(`/courts/${courtId}`);
  },
  getCourtAvailability: async (courtId, dateStr) => {
    return await api.get(`/courts/availability?court_id=${courtId}&date=${dateStr}`);
  },
  createCourt: (payload) => api.post('/courts', payload),
  updateCourt: (id, payload) => api.put(`/courts/${id}`, payload),
  addMaintenanceBlock: (id, payload) => api.post(`/courts/${id}/maintenance`, payload),
};
