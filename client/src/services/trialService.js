import api from './api';

export const trialService = {
  // Public trial request with payment
  requestTrial: async (payload) => {
    return await api.post('/trials/request', payload);
  },

  // Public status lookup by reference code
  getTrialStatus: async (referenceCode, phone = '') => {
    let url = `/trials/status/${referenceCode}`;
    if (phone) url += `?phone=${encodeURIComponent(phone)}`;
    return await api.get(url);
  },

  // Public invoice details
  getInvoice: async (referenceCode) => {
    return await api.get(`/trials/invoice/${referenceCode}`);
  },

  // Front desk CRM queries
  getAllLeads: async ({ status = 'ALL', sport = 'ALL', search = '' } = {}) => {
    const params = [];
    if (status && status !== 'ALL') params.push(`status=${status}`);
    if (sport && sport !== 'ALL') params.push(`sport=${encodeURIComponent(sport)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    const qs = params.length > 0 ? `?${params.join('&')}` : '';
    return await api.get(`/leads${qs}`);
  },

  // Front desk confirm trial
  confirmTrial: async (payload) => {
    return await api.post('/leads/confirm-trial', payload);
  },

  // Front desk update lead status
  updateLeadStatus: async (leadId, status, notes = '') => {
    return await api.patch(`/leads/${leadId}/status`, { status, notes });
  },

  // Front desk convert lead to active member
  convertLeadToMember: async (leadId, planId, password = 'Welcome@123') => {
    return await api.post(`/leads/${leadId}/convert`, { plan_id: planId, password });
  },
};
