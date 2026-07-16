import axios from 'axios';

// ✅ Railway Backend URL - Fallback ထည့်ပါ
const API_URL = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_URL || 'https://laundry-management-system-production-327a.up.railway.app/api')
    : 'http://localhost:5001/api';

console.log('🔗 API URL:', API_URL);

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 60000,
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
    (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('📥 Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.config?.url);
        console.error('Error details:', error.response?.data);
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;