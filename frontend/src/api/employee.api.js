// api/employee.api.js

import axios from './axios.config';

export const employeeApi = {
  getAll: (params) => axios.get('/employees', { params }),
  getById: (id) => axios.get(`/employees/${id}`),
  getStats: () => axios.get('/employees/stats'),
  create: (data) => axios.post('/employees', data),
  update: (id, data) => axios.put(`/employees/${id}`, data),
  delete: (id) => axios.delete(`/employees/${id}`),
};

export default employeeApi;