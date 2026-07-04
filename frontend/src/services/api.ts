import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token to all requests if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hrms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired JWT or unauthorized responses by logging out the user
api.interceptors.response.use(
  resp => resp,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hrms_token');
      localStorage.removeItem('hrms_user');
      localStorage.removeItem('auth');
      if (!window.location.pathname.endsWith('/login') && !window.location.pathname.endsWith('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
