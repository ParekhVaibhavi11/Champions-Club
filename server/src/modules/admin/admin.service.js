import * as repo from './admin.repository.js';

export const getSummary = () => repo.getDashboardSummary();

export const getRevenue = (from, to) => {
  const today = new Date().toISOString().slice(0, 10);
  const start = from || today;
  const end = to || today;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end) {
    const error = new Error('from and to must be valid dates (YYYY-MM-DD), and from must not follow to.');
    error.statusCode = 400;
    throw error;
  }
  return repo.getRevenueByDepartment(start, end);
};

export const getLedger = async (from, to) => {
  const today = new Date().toISOString().slice(0, 10);
  const start = from || today;
  const end = to || today;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end) {
    const error = new Error('from and to must be valid dates (YYYY-MM-DD), and from must not follow to.');
    error.statusCode = 400;
    throw error;
  }
  return repo.getPaymentLedger(start, end);
};
