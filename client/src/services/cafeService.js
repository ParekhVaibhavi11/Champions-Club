import api from './api';

export const cafeService = {
  getMenu: () => api.get('/cafe/menu'),
  getTables: () => api.get('/cafe/tables'),
  createOrder: (payload) => api.post('/cafe/orders', payload),
  addItems: (id, items) => api.post(`/cafe/orders/${id}/items`, { items }),
  settle: (id, payment_method) => api.post(`/cafe/orders/${id}/settle`, { payment_method }),
  getKitchenQueue: () => api.get('/cafe/kitchen-queue'),
  setKitchenStatus: (id, status) => api.patch(`/cafe/orders/${id}/kitchen-status`, { status }),
  getMyOrders: () => api.get('/cafe/orders/my-orders'),
  getOrderHistory: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/cafe/orders/history${q ? `?${q}` : ''}`);
  },
};
