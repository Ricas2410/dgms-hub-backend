import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api' // Android emulator localhost
  : 'https://your-production-api.com/api';

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
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
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
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        type: 'network',
      });
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await AsyncStorage.removeItem('auth_token');
        // You might want to redirect to login screen here
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK' }]
        );
      } catch (storageError) {
        console.error('Error removing auth token:', storageError);
      }
    }

    // Handle other HTTP errors
    const errorMessage = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    
    return Promise.reject({
      message: errorMessage,
      status: error.response.status,
      type: 'api',
    });
  }
);

// API Methods
export const api = {
  // Applications
  getApplications: async (params = {}) => {
    try {
      const response = await apiClient.get('/applications', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getApplication: async (id) => {
    try {
      const response = await apiClient.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('/applications/meta/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Utility functions
export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Cache utilities
export const cache = {
  set: async (key, data, expirationMinutes = 60) => {
    try {
      const expirationTime = new Date().getTime() + (expirationMinutes * 60 * 1000);
      const cacheData = {
        data,
        expiration: expirationTime,
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  get: async (key) => {
    try {
      const cachedData = await AsyncStorage.getItem(`cache_${key}`);
      if (!cachedData) return null;

      const parsedData = JSON.parse(cachedData);
      const currentTime = new Date().getTime();

      if (currentTime > parsedData.expiration) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return parsedData.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },

  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  },

  clear: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};

export default api;
