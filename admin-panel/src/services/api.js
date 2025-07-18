import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        type: 'network',
      });
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    // Return error response
    return Promise.reject(error.response.data || error.response);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  verifyToken: () => 
    apiClient.get('/auth/verify'),
  
  refreshToken: () => 
    apiClient.post('/auth/refresh'),
  
  getProfile: () => 
    apiClient.get('/auth/profile'),
  
  updateProfile: (data) => 
    apiClient.put('/auth/profile', data),
  
  changePassword: (currentPassword, newPassword) => 
    apiClient.put('/auth/password', { currentPassword, newPassword }),
};

// Applications API
export const applicationsAPI = {
  getAll: (params = {}) => 
    apiClient.get('/applications', { params }),
  
  getById: (id) => 
    apiClient.get(`/applications/${id}`),
  
  create: (data) => 
    apiClient.post('/applications', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id, data) => 
    apiClient.put(`/applications/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  delete: (id) => 
    apiClient.delete(`/applications/${id}`),
  
  reorder: (applicationIds) => 
    apiClient.post('/applications/reorder', { applicationIds }),
  
  getCategories: () => 
    apiClient.get('/applications/meta/categories'),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => 
    apiClient.get('/users', { params }),
  
  getById: (id) => 
    apiClient.get(`/users/${id}`),
  
  create: (data) => 
    apiClient.post('/users', data),
  
  update: (id, data) => 
    apiClient.put(`/users/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/users/${id}`),
};

// Audit API
export const auditAPI = {
  getAll: (params = {}) => 
    apiClient.get('/audit', { params }),
  
  getByUser: (userId, params = {}) => 
    apiClient.get(`/audit/user/${userId}`, { params }),
  
  getByApplication: (applicationId, params = {}) => 
    apiClient.get(`/audit/application/${applicationId}`, { params }),
  
  getStats: (params = {}) => 
    apiClient.get('/audit/stats', { params }),
  
  getFilters: () => 
    apiClient.get('/audit/filters'),
};

// Health check
export const healthAPI = {
  check: () => 
    axios.get(`${API_BASE_URL.replace('/api', '')}/health`),
};

// File upload utility
export const uploadFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Export default API client for custom requests
export default apiClient;
