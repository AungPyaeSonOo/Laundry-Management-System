import axios from './axios.config';

export const orderApi = {
  getAll: (params) => axios.get('/orders', { params }),
  getById: (id) => axios.get(`/orders/${id}`),
  create: (data) => axios.post('/orders', data),
  update: (id, data) => axios.put(`/orders/${id}`, data),
  updateStatus: (id, data) => axios.patch(`/orders/${id}/status`, data),
  updatePayment: (id, data) => axios.patch(`/orders/${id}/payment`, data),
  delete: (id) => axios.delete(`/orders/${id}`),
  
  getNextStatus: (id) => {
    console.log('📡 orderApi.getNextStatus called with ID:', id);
    return axios.get(`/orders/${id}/next-status`);
  },
  
  completeNext: (id, data) => axios.post(`/orders/${id}/complete-next`, data || {}),
  
  // ✅ Confirm Payment (Admin/Manager/Accountant)
  confirmPayment: (id, data) => axios.post(`/orders/${id}/confirm-payment`, data),
  
  updateLocation: (id, data) => axios.patch(`/orders/${id}/location`, data),
  getActiveDeliveries: () => axios.get('/orders/active-deliveries'),
};

export default orderApi;