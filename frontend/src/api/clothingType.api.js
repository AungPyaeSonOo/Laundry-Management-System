import axios from './axios.config';

export const clothingTypeApi = {
  getAll: () => axios.get('/clothing-types'),
  getById: (id) => axios.get(`/clothing-types/${id}`),
  create: (data) => axios.post('/clothing-types', data),
  update: (id, data) => axios.put(`/clothing-types/${id}`, data),
  delete: (id) => axios.delete(`/clothing-types/${id}`),
};

export default clothingTypeApi;