import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const authData = JSON.parse(token);
      if (authData?.state?.token) {
        config.headers.Authorization = `Bearer ${authData.state.token}`;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  return config;
});

export default api;

