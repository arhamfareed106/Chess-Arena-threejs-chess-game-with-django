import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,  // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Enable cookies for session management
});

// Request interceptor to add auth tokens
api.interceptors.request.use(
  (config) => {
    const playerToken = localStorage.getItem('playerToken');
    if (playerToken) {
      config.headers['Player-Token'] = playerToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout - server may be slow');
      error.message = 'Request timeout. Please try again.';
    } else if (error.code === 'ERR_NETWORK') {
      console.warn('Network error - server may be unavailable');
      error.message = 'Unable to connect to server. Please check your connection.';
    } else if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('playerToken');
      localStorage.removeItem('playerId');
      error.message = 'Session expired. Please refresh the page.';
    } else if (error.response?.status === 404) {
      error.message = 'Resource not found.';
    } else if (error.response?.status === 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

export default api;