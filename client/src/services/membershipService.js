import api from './api';

export const membershipService = {
  getPlans: async () => {
    return await api.get('/plans');
  },
  getMembers: async (search = '') => {
    return await api.get(`/members${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  },
  getMemberById: async (id) => {
    return await api.get(`/members/${id}`);
  },
  registerMember: async (memberData) => {
    return await api.post('/members', memberData);
  },
  changeMemberPlan: async (userId, planData) => {
    return await api.post(`/members/${userId}/plan`, planData);
  },
  renewMembership: async (membershipId, months = 1) => {
    return await api.post(`/memberships/${membershipId}/renew`, { months });
  },
};
