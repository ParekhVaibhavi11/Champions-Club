import api from './api';

export const adminService = {
  getSummary: () => api.get('/admin/dashboard/summary'),
  getRevenue: (from, to) => api.get(`/admin/reports/revenue?from=${from}&to=${to}`),
  getLedger: (from, to) => api.get(`/admin/finance/ledger?from=${from}&to=${to}`),
  getHrOverview: () => api.get('/admin/hr/overview'),
  reviewLeave: (id, status) => api.patch(`/admin/hr/leave-requests/${id}`, { status }),
};
