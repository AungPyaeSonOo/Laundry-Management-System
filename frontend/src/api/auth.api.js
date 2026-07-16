import axios from './axios.config';

export const authApi = {
  login: (data) => axios.post('/auth/login', data),
  register: (data) => axios.post('/auth/register', data),
  getCurrentUser: () => axios.get('/auth/me'),
  
  // ✅ Update profile
  updateProfile: (data) => axios.put('/auth/profile', data),
  
  // ✅ Change password
  changePassword: (data) => axios.post('/auth/change-password', data),
  
  logout: async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

export default authApi;