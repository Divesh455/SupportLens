import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('supportlens_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getProfile: () => api.get('/profile'),
};

// ─── Chat ────────────────────────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (message) => api.post('/chat', { message }),
  getConversations: (userId) => api.get(`/conversation/${userId}`),
};

// ─── Tickets ─────────────────────────────────────────────────────────────────
export const ticketAPI = {
  create: (data) => api.post('/ticket', data),
  getAll: () => api.get('/tickets'),
  getByUser: () => api.get('/tickets'),
  update: (ticketId, data) => api.patch(`/ticket/${ticketId}`, data),
};

// ─── History ─────────────────────────────────────────────────────────────────
export const historyAPI = {
  getUserHistory: (userId) => api.get(`/history/${userId}`),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
