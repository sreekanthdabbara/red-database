import axios from 'axios';

// Relative by default: in production the API serves this site, and in
// development the "proxy" in package.json forwards /api to localhost:3001.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
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
