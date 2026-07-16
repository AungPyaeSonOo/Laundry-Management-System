// api/user.api.js

import axios from './axios.config';

export const userApi = {
  getAll: (params) => axios.get('/users', { params }),
  
  getAvailableForEmployee: () => axios.get('/users/available-for-employee'),
  
  create: (data) => axios.post('/users', data),
  update: (id, data) => axios.put(`/users/${id}`, data),
  delete: (id) => axios.delete(`/users/${id}`),
  
  // ✅ Change password
  changePassword: (id, data) => axios.put(`/users/${id}/change-password`, data),
};

export default userApi;