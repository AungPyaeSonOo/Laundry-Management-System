import axios from './axios.config';

export const inventoryApi = {
  getAll: (params) => axios.get('/inventory', { params }),
  getById: (id) => axios.get(`/inventory/${id}`),
  getTransactions: (id, params) => axios.get(`/inventory/${id}/transactions`, { params }),
  create: (data) => axios.post('/inventory', data),
  update: (id, data) => axios.put(`/inventory/${id}`, data),
  adjust: (id, data) => axios.patch(`/inventory/${id}/adjust`, data),
  delete: (id) => axios.delete(`/inventory/${id}`),
};

export default inventoryApi;