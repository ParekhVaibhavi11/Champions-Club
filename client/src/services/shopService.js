import api from './api';

export const shopService = {
  getProducts: () => api.get('/products'),
  getInventory: () => api.get('/inventory'),
  getMovements: () => api.get('/inventory/movements'),
  adjustInventory: (product_id, change_qty, notes) => api.post('/inventory/adjustments', { product_id, change_qty, notes }),
  createOrder: (payload) => api.post('/shop/orders', payload),
  getOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/shop/orders${q ? `?${q}` : ''}`);
  },
  getMyOrders: () => api.get('/shop/orders/my-orders'),
};
