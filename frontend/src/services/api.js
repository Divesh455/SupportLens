import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('supportlens_user');

      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const chatAPI = {
  sendMessage: (message) =>
    api.post('/chat/', { message }),

  getConversations: (userId) =>
    api.get(`/chat/conversation/${userId}`),

  getMessages: (userId) =>
    api.get(`/chat/messages/${userId}`),
};

export const ticketAPI = {
  getAll: () => api.get('/tickets/'),

  create: (data) => api.post('/tickets/', data),

  getAssignedTickets: () =>
    api.get('/tickets/assigned/me'),

  getUserTickets: (userId) =>
    api.get(`/tickets/${userId}`),

  update: (ticketId, data) =>
    api.patch(`/tickets/${ticketId}`, data),
};

export const historyAPI = {
  getUserHistory: (userId) =>
    api.get(`/history/${userId}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),

  updateUser: (userId, data) =>
    api.patch(`/admin/users/${userId}`, data),

  deleteUser: (userId) =>
    api.delete(`/admin/users/${userId}`),

  getAgents: () => api.get('/admin/agents'),

  createAgent: (data) =>
    api.post('/admin/agents', data),

  getConfig: () => api.get('/admin/config'),

  updateConfig: (data) =>
    api.put('/admin/config', data),
};

export default api;