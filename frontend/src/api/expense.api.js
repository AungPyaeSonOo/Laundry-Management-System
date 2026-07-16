import axios from './axios.config';

export const expenseApi = {
  getAll: (params) => axios.get('/expenses', { params }),
  getById: (id) => axios.get(`/expenses/${id}`),
  getCategories: () => axios.get('/expenses/categories'),
  getSummary: (params) => axios.get('/expenses/summary', { params }),
  create: (data) => axios.post('/expenses', data),
  update: (id, data) => axios.put(`/expenses/${id}`, data),
  delete: (id) => axios.delete(`/expenses/${id}`),
};

export default expenseApi;