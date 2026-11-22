import * as repo from './shop.repository.js';

export const listProducts = () => repo.listProducts();
export const getInventory = () => repo.getInventory();
export const getStockMovements = () => repo.getStockMovements();

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

export const createOrder = async ({ customerId, cashierId, paymentMethod, items }) => {
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
  return repo.createShopOrder({ customerId: customerId ? Number(customerId) : null, cashierId, paymentMethod, items: items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })) });
};

export const listOrders = (filters) => repo.listShopOrders(filters);
export const getMyOrders = (customerId) => repo.listShopOrders({ customerId });
