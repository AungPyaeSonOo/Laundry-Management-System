import axios from './axios.config';

export const customerApi = {
  getAll: (params) => axios.get('/customers', { params }),
  getById: (id) => axios.get(`/customers/${id}`),
  getOrders: (id, params) => axios.get(`/customers/${id}/orders`, { params }),
  create: (data) => axios.post('/customers', data),
  update: (id, data) => axios.put(`/customers/${id}`, data),
  delete: (id) => axios.delete(`/customers/${id}`),
};

export default customerApi;