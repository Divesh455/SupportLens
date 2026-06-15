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
<<<<<<< HEAD
  sendMessage: (message) => api.post('/chat', { message }),
  getConversations: (userId) => api.get(`/conversation/${userId}`),
=======
  sendMessage: (message) => api.post('/chat/', { message }),
  getConversations: (userId) => api.get(`/chat/conversation/${userId}`),
  getMessages: (userId) => api.get(`/chat/messages/${userId}`),
>>>>>>> 07df7e2161e27754c581fbb311e68c13e176eceb
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

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (userId, data) => api.patch(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAgents: () => api.get('/admin/agents'),
  createAgent: (data) => api.post('/admin/agents', data),
  getConfig: () => api.get('/admin/config'),
  updateConfig: (data) => api.put('/admin/config', data),
};

export default api;
