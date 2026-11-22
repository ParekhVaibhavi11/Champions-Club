import api from './api';

export const shopService = {
  getProducts: () => api.get('/products'),
  getInventory: () => api.get('/inventory'),
  getMovements: () => api.get('/inventory/movements'),
  adjustInventory: (product_id, change_qty, notes) => api.post('/inventory/adjustments', { product_id, change_qty, notes }),
  createOrder: (payload) => api.post('/shop/orders', payload),
<<<<<<< HEAD
  getOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/shop/orders${q ? `?${q}` : ''}`);
  },
  getMyOrders: () => api.get('/shop/orders/my-orders'),
=======
  verifyMembershipDiscount: (customer_email) => api.post('/shop/discount/verify', { customer_email }),
  getOrders: () => api.get('/shop/orders'),
>>>>>>> faef837912454fd631d3d9887bf30e8d6046b8c5
};
