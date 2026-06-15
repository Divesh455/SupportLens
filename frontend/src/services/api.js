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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// ─── Chat ────────────────────────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (message) => api.post('/chat/', { message }),
  getConversations: (userId) => api.get(`/chat/conversation/${userId}`),
};

// ─── Tickets ─────────────────────────────────────────────────────────────────
export const ticketAPI = {
  create: (data) => api.post('/tickets/', data),
  getAll: () => api.get('/tickets/'),
  getByUser: (userId) => api.get(`/tickets/${userId}`),
  update: (ticketId, data) => api.patch(`/tickets/${ticketId}`, data),
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
