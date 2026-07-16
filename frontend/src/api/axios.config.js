import axios from 'axios';

// ✅ Dynamic API URL based on environment
const API_URL = import.meta.env.PROD 
    ? '/api'  // Production: proxy via backend
    : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');

console.log('🔗 API URL:', API_URL);
console.log('🔧 Environment:', import.meta.env.PROD ? 'Production' : 'Development');

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    console.log('📤 Full URL:', `${API_URL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:');
    console.error('  - Status:', error.response?.status);
    console.error('  - URL:', error.config?.url);
    console.error('  - Message:', error.message);
    console.error('  - Response:', error.response?.data);
    
    if (error.code === 'ECONNABORTED') {
      console.error('  - Request timeout');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;