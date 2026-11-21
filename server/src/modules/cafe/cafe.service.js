import * as repo from './cafe.repository.js';

export const getMenu = () => repo.getMenu();
export const getTables = () => repo.getTables();
export const listOpenOrders = () => repo.listOpenOrders();

export const createTab = async ({ table_id, member_id, guest_name, staffId, items }) => {
  const tableId = Number(table_id);
  if (!Number.isInteger(tableId) || !Array.isArray(items) || !items.length || items.some((item) => !Number.isInteger(Number(item.menu_item_id)) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)) {
    const error = new Error('table_id and at least one valid menu item with positive quantity are required.');
    error.statusCode = 400;
    throw error;
  }
  return repo.createTab({ tableId, memberId: member_id ? Number(member_id) : null, guestName, staffId, items: items.map((item) => ({ ...item, menu_item_id: Number(item.menu_item_id), quantity: Number(item.quantity) })) });
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
  return repo.settleTab({ orderId: Number(orderId), staffId, paymentMethod });
};
