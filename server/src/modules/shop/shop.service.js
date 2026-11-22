import * as repo from './shop.repository.js';
import { sendGearShopReceipt } from '../../utils/emailService.js';

export const listProducts = () => repo.listProducts();
export const getInventory = () => repo.getInventory();
export const getStockMovements = () => repo.getStockMovements();

export const verifyMembershipDiscount = async (email) => {
  const normalizedEmail = String(email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    const error = new Error('Enter a valid customer email address to check membership benefits.');
    error.statusCode = 400;
    throw error;
  }
  const membership = await repo.findActiveMembershipByEmail(normalizedEmail);
  if (!membership) {
    return { has_active_plan: false, discount_pct: 0 };
  }
  return {
    has_active_plan: true,
    user_id: membership.user_id,
    full_name: membership.full_name,
    email: membership.email,
    membership_id: membership.membership_id,
    plan_name: membership.plan_name,
    plan_tier: membership.plan_tier,
    discount_pct: Number(membership.shop_discount_pct || 0),
  };
};

export const adjustInventory = async ({ productId, changeQty, userId, notes }) => {
  const id = Number(productId);
  const change = Number(changeQty);
  if (!Number.isInteger(id) || !Number.isInteger(change) || change === 0) {
    const error = new Error('product_id and a non-zero integer change_qty are required.');
    error.statusCode = 400;
    throw error;
  }
  return repo.adjustInventory({ productId: id, changeQty: change, userId, notes });
};

export const createOrder = async ({ customerId, customerName, customerEmail, cashierId, paymentMethod, items }) => {
  const normalizedName = String(customerName || '').trim();
  const normalizedEmail = String(customerEmail || '').trim();
  if (!normalizedName || normalizedName.length > 150) {
    const error = new Error('A customer name of 1 to 150 characters is required.');
    error.statusCode = 400;
    throw error;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    const error = new Error('A valid customer email address is required.');
    error.statusCode = 400;
    throw error;
  }
  const methods = ['CASH', 'CARD', 'UPI'];
  if (!methods.includes(paymentMethod)) {
    const error = new Error('payment_method must be CASH, CARD, or UPI.');
    error.statusCode = 400;
    throw error;
  }
  if (!Array.isArray(items) || items.length === 0 || items.some((item) => !Number.isInteger(Number(item.product_id)) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)) {
    const error = new Error('Add at least one item with a valid product_id and positive integer quantity.');
    error.statusCode = 400;
    throw error;
  }
  const order = await repo.createShopOrder({
    customerId: customerId ? Number(customerId) : null,
    customerName: normalizedName,
    customerEmail: normalizedEmail,
    cashierId,
    paymentMethod,
    items: items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
  });

  let emailStatus = 'FAILED';
  let emailError = null;
  try {
    const emailResult = await sendGearShopReceipt(normalizedEmail, normalizedName, order);
    emailStatus = emailResult.mode === 'smtp' ? 'SENT' : 'SIMULATED';
  } catch (err) {
    emailError = err.message;
    console.error(`Failed to email Gear Shop receipt ${order.receipt_no}:`, err);
  }

  try {
    const emailUpdate = await repo.updateReceiptEmailStatus(order.id, emailStatus);
    return { ...order, ...emailUpdate, email_error: emailError };
  } catch (err) {
    console.error(`Failed to save email status for Gear Shop receipt ${order.receipt_no}:`, err);
    return { ...order, receipt_email_status: emailStatus, email_error: emailError };
  }
};

export const listOrders = () => repo.listShopOrders();
