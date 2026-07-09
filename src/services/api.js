import axios from 'axios';
import toast from 'react-hot-toast';

// Create an Axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

// Request Interceptor: Automatically attach Authorization token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g. 401 Unauthorized, Network errors)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // If the API returned a 401 Unauthorized response
      if (error.response.status === 401) {
        localStorage.removeItem('crm-token');
        localStorage.removeItem('crm_user');
        // Redirect to login page if we are not already there
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // If there was no response received (Network error)
      toast.error('Cannot connect to server. Check your connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
