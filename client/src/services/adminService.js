import api from './api';

export const adminService = {
  getSummary: () => api.get('/admin/dashboard/summary'),
  getRevenue: (from, to) => api.get(`/admin/reports/revenue?from=${from}&to=${to}`),
  getLedger: (from, to) => api.get(`/admin/finance/ledger?from=${from}&to=${to}`),
  getMembershipPlans: () => api.get('/admin/membership-plans'),
  createMembershipPlan: (plan) => api.post('/admin/membership-plans', plan),
  updateMembershipPlan: (id, plan) => api.put(`/admin/membership-plans/${id}`, plan),
  getHrOverview: () => api.get('/admin/hr/overview'),
  createStaff: (payload) => api.post('/admin/hr/staff', payload),
  reviewLeave: (id, status) => api.patch(`/admin/hr/leave-requests/${id}`, { status }),
};
