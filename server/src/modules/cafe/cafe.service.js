import * as repo from './cafe.repository.js';
import { sendCafeReceiptEmail } from '../../utils/emailService.js';

export const getMenu = () => repo.getMenu();
export const getTables = () => repo.getTables();
export const listOpenOrders = () => repo.listOpenOrders();

export const verifyMembershipDiscount = async (email) => {
  const normalizedEmail = String(email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    const error = new Error('Enter a valid customer email address to check membership benefits.');
    error.statusCode = 400;
    throw error;
  }
  const membership = await repo.findActiveMembershipByEmail(normalizedEmail);
  if (!membership) return { has_active_plan: false, cafe_discount_pct: 0 };
  return {
    has_active_plan: true,
    user_id: membership.user_id,
    full_name: membership.full_name,
    email: membership.email,
    membership_id: membership.membership_id,
    plan_name: membership.plan_name,
    plan_tier: membership.plan_tier,
    cafe_discount_pct: Number(membership.cafe_discount_pct || 0),
  };
};

export const createTab = async ({ table_id, member_id, guest_name, guest_email, guestName, staffId, items }) => {
  const tableId = Number(table_id);
  if (!Number.isInteger(tableId) || !Array.isArray(items) || !items.length || items.some((item) => !Number.isInteger(Number(item.menu_item_id)) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)) {
    const error = new Error('table_id and at least one valid menu item with positive quantity are required.');
    error.statusCode = 400;
    throw error;
  }
  const normalizedName = String(guest_name || guestName || '').trim();
  const normalizedEmail = String(guest_email || '').trim();
  if (!normalizedName || normalizedName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    const error = new Error('A customer name and valid email address are required to place a café order.');
    error.statusCode = 400;
    throw error;
  }
  return repo.createTab({
    tableId,
    memberId: member_id ? Number(member_id) : null,
    guestName: normalizedName,
    guestEmail: normalizedEmail,
    staffId,
    items: items.map((item) => ({ ...item, menu_item_id: Number(item.menu_item_id), quantity: Number(item.quantity) }))
  });
};

export const appendItems = async (orderId, items) => {
  if (!Array.isArray(items) || !items.length || items.some((item) => !Number.isInteger(Number(item.menu_item_id)) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)) {
    const error = new Error('Add at least one valid menu item with a positive integer quantity.');
    error.statusCode = 400;
    throw error;
  }
  return repo.appendItems({ orderId: Number(orderId), items: items.map((item) => ({ ...item, menu_item_id: Number(item.menu_item_id), quantity: Number(item.quantity) })) });
};

export const updateKitchenStatus = async (orderId, status) => {
  const transitions = { PENDING: ['PREPARING'], PREPARING: ['READY'], READY: ['SERVED'], SERVED: [] };
  if (!Object.keys(transitions).includes(status)) {
    const error = new Error('Invalid kitchen status.');
    error.statusCode = 400;
    throw error;
  }
  const orders = await repo.listOpenOrders();
  const current = orders.find((order) => order.id === Number(orderId));
  if (!current) {
    const error = new Error('Open cafe order not found.');
    error.statusCode = 404;
    throw error;
  }
  if (!transitions[current.kitchen_status].includes(status)) {
    const error = new Error(`Cannot move kitchen order from ${current.kitchen_status} to ${status}.`);
    error.statusCode = 409;
    throw error;
  }
  return repo.setKitchenStatus(Number(orderId), status);
};

export const settleTab = async ({ orderId, staffId, paymentMethod }) => {
  if (!['CASH', 'CARD', 'UPI'].includes(paymentMethod)) {
    const error = new Error('payment_method must be CASH, CARD, or UPI.');
    error.statusCode = 400;
    throw error;
  }
  const receipt = await repo.settleTab({ orderId: Number(orderId), staffId, paymentMethod });
  if (!receipt.customer_email) {
    return { ...receipt, receipt_email_status: 'SKIPPED' };
  }

  let status = 'FAILED';
  let emailError = null;
  try {
    const emailResult = await sendCafeReceiptEmail(receipt.customer_email, receipt.customer_name, receipt);
    status = emailResult.mode === 'smtp' ? 'SENT' : 'SIMULATED';
  } catch (err) {
    emailError = err.message;
    console.error(`Failed to email Café receipt ${receipt.order_no}:`, err);
  }

  try {
    const emailUpdate = await repo.updateReceiptEmailStatus(receipt.id, status);
    return { ...receipt, ...emailUpdate, email_error: emailError };
  } catch (err) {
    console.error(`Failed to save email status for Café receipt ${receipt.order_no}:`, err);
    return { ...receipt, receipt_email_status: status, email_error: emailError };
  }
};
