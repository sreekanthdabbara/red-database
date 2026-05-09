import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('red_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('red_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
