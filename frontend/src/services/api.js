import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
<<<<<<< HEAD
=======
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
      if (!window.location.pathname.startsWith('/auth/login') && !window.location.pathname.startsWith('/auth/register')) {
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
<<<<<<< HEAD
=======
  sendMessage: (message) => api.post('/chat', { message }),
  getConversations: (userId) => api.get(`/conversation/${userId}`),
>>>>>>> 9d95fbf88b2e28cf2a0a9d13db6a5776291b9da8
  sendMessage: (message) => api.post('/chat/', { message }),
  getConversations: (userId) => api.get(`/chat/conversation/${userId}`),
  getMessages: (userId) => api.get(`/chat/messages/${userId}`),
};

// ─── Tickets ─────────────────────────────────────────────────────────────────
export const ticketAPI = {
<<<<<<< HEAD
  create: (data) => api.post('/tickets/', data),
  getAll: () => api.get('/tickets/'),
  getAssignedToMe: () => api.get('/tickets/assigned/me'),
  getByUser: (userId) => api.get(`/tickets/${userId}`),
  update: (ticketId, data) => api.patch(`/tickets/${ticketId}`, data),
=======
  create: (data) => api.post('/tickets', data),
  getAll: () => api.get('/tickets'),
  getByUser: () => api.get('/tickets/assin'),
  update: (ticketId, data) => api.patch(`/ticket/${ticketId}`, data),
>>>>>>> 9d95fbf88b2e28cf2a0a9d13db6a5776291b9da8
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
import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
>>>>>>> 43cac6c94fc145cea51a09401c8378b825b974db
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