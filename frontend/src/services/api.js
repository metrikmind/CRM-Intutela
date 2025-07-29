// src/services/api.js - VERSIONE CORRETTA PER dashboard.intutela.it

import axios from 'axios';

// Create axios instance with correct config
const api = axios.create({
  baseURL: 'https://dashboard.intutela.it/backend',  // URL CORRETTO
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/admin/login';
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden');
    } else if (error.response?.status >= 500) {
      // Server errors
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Authentication
  auth: {
    adminLogin: '/api/auth/admin-login',
    clientLogin: '/api/auth/client-login',
    logout: '/api/auth/logout',
  },
  
  // Admin endpoints
  admin: {
    dashboard: '/api/admin/dashboard',
    clients: '/api/admin/clients',
    practices: '/api/admin/practices',
    documents: '/api/admin/documents',
    importCsv: '/api/admin/import-csv',
  },
  
  // Client endpoints
  client: {
    dashboard: '/api/client/dashboard',
    practices: '/api/client/practices',
    documents: '/api/client/documents',
  },
  
  // Shared endpoints
  shared: {
    banks: '/api/shared/banks',
    states: '/api/shared/states',
  },
};

// Generic API methods
export const apiMethods = {
  // GET request
  get: async (url, params = {}) => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST request
  post: async (url, data = {}) => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // PUT request
  put: async (url, data = {}) => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // DELETE request
  delete: async (url) => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // File upload
  upload: async (url, formData, onUploadProgress = null) => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // File download
  download: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Authentication helpers
export const authHelpers = {
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('auth_token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth_token');
    }
  },

  getAuthToken: () => {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  clearAuth: () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
};

// Error helper
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Errore del server',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Errore di connessione al server',
      status: 0,
      data: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'Errore sconosciuto',
      status: 0,
      data: null,
    };
  }
};

export default api;