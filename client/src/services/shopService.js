import api from './api';

export const shopService = {
  getProducts: () => api.get('/products'),
  getInventory: () => api.get('/inventory'),
  getMovements: () => api.get('/inventory/movements'),
  adjustInventory: (product_id, change_qty, notes) => api.post('/inventory/adjustments', { product_id, change_qty, notes }),
  createOrder: (payload) => api.post('/shop/orders', payload),
  verifyMembershipDiscount: (customer_email) => api.post('/shop/discount/verify', { customer_email }),
  getOrders: () => api.get('/shop/orders'),
};
