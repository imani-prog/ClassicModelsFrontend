import axios from 'axios';
import TokenManager from './tokenManager';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8081', // Your backend URL
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding Bearer token to request:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('⚠️ No auth token found in localStorage');
    }
    
    // Log the request for debugging
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common response scenarios
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`📥 ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const { response, config } = error;
    
    // Log error responses
    console.error(`❌ ${response?.status || 'Network Error'} ${config?.url}`, {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      message: error.message,
    });
    
    // Handle 401 Unauthorized - redirect to login
    if (response?.status === 401) {
      console.warn('🔒 Unauthorized access - redirecting to login');
      TokenManager.clearToken();
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    
    // Handle 403 Forbidden
    if (response?.status === 403) {
      console.warn('🚫 Access forbidden');
      return Promise.reject(new Error('Access denied. You do not have permission to access this resource.'));
    }
    
    // Handle 404 Not Found
    if (response?.status === 404) {
      console.warn('🔍 Resource not found');
      return Promise.reject(new Error('Requested resource not found.'));
    }
    
    // Handle 500 Internal Server Error
    if (response?.status === 500) {
      console.error('🚨 Server error');
      return Promise.reject(new Error('Internal server error. Please try again later.'));
    }
    
    // Handle network errors
    if (!response) {
      console.error('🌐 Network error - backend might be down');
      return Promise.reject(new Error('Network error. Please check your connection and ensure the backend is running.'));
    }
    
    // Handle other errors
    const errorMessage = response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// Utility functions for common API operations
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  checkEmail: (email) => api.post('/api/auth/check-email', email),
  logout: () => {
    TokenManager.clearToken();
  },
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getEntityDistribution: () => api.get('/api/dashboard/entity-distribution'),
  getRevenueSummary: () => api.get('/api/dashboard/revenue-summary'),
};

export const dataAPI = {
  getOrders: () => api.get('/orders'),
  getCustomers: () => api.get('/customers'),
  getProducts: () => api.get('/products'),
  getEmployees: () => api.get('/employees'),
  getOffices: () => api.get('/offices'),
  getPayments: () => api.get('/payments'),
};

// Export the configured axios instance as default
export default api;
