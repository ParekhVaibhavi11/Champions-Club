import * as repo from './admin.repository.js';
import * as membershipRepo from '../memberships/memberships.repository.js';

export const getSummary = () => repo.getDashboardSummary();

export const getMembershipPlans = () => membershipRepo.getAllPlansForAdmin();

const normalizeMembershipPlan = (input = {}) => {
  const name = String(input.name || '').trim();
  const tier = String(input.tier || '').trim().toUpperCase().replace(/\s+/g, '_');
  const monthlyFee = Number(input.monthly_fee);
  const courtDiscount = Number(input.court_discount_pct);
  const shopDiscount = Number(input.shop_discount_pct);
  const cafeDiscount = Number(input.cafe_discount_pct);
  const freeHours = Number(input.free_court_hours_per_month);
  const maxDailySessions = Number(input.max_daily_sessions);
  if (!name || name.length > 100 || !/^[A-Z][A-Z0-9_]{1,31}$/.test(tier)) {
    const error = new Error('Plan name and a tier code (2–32 letters, numbers, or underscores) are required.');
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isFinite(monthlyFee) || monthlyFee <= 0 || monthlyFee > 99999999.99
    || [courtDiscount, shopDiscount, cafeDiscount].some((value) => !Number.isFinite(value) || value < 0 || value > 100)
    || !Number.isInteger(freeHours) || freeHours < 0 || freeHours > 2147483647
    || !Number.isInteger(maxDailySessions) || maxDailySessions < 1 || maxDailySessions > 2147483647) {
    const error = new Error('Enter a positive monthly price, discounts from 0 to 100, whole free hours, and at least one daily session.');
    error.statusCode = 400;
    throw error;
  }
  return {
    name,
    tier,
    monthly_fee: monthlyFee,
    court_discount_pct: courtDiscount,
    shop_discount_pct: shopDiscount,
    cafe_discount_pct: cafeDiscount,
    free_court_hours_per_month: freeHours,
    max_daily_sessions: maxDailySessions,
    description: String(input.description || '').trim() || null,
    is_active: input.is_active !== false,
  };
};

export const createMembershipPlan = async (input) => {
  try {
    return await membershipRepo.createMembershipPlan(normalizeMembershipPlan(input));
  } catch (error) {
    if (error.code === '23505') {
      error.message = 'A membership plan with this tier code already exists.';
      error.statusCode = 409;
    }
    throw error;
  }
};

export const updateMembershipPlan = async (planId, input) => {
  const normalizedId = Number(planId);
  if (!Number.isInteger(normalizedId) || normalizedId < 1) {
    const error = new Error('A valid membership plan ID is required.');
    error.statusCode = 400;
    throw error;
  }
  try {
    const updated = await membershipRepo.updateMembershipPlan(normalizedId, normalizeMembershipPlan(input));
    if (!updated) {
      const error = new Error('Membership plan not found.');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  } catch (error) {
    if (error.code === '23505') {
      error.message = 'A membership plan with this tier code already exists.';
      error.statusCode = 409;
    }
    throw error;
  }
};

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
