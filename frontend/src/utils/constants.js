export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const TOKEN_KEY = 'supportlens_token';
export const USER_KEY = 'supportlens_user';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPPORT_AGENT: 'support_agent',
};

export const ROLE_LABELS = {
  user: 'Customer',
  admin: 'Admin',
  support_agent: 'Support Agent',
};

export const TICKET_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const PRIORITY_COLORS = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

export const SENTIMENT_COLORS = {
  Positive: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  Negative: 'bg-red-100 text-red-700 border-red-200',
};

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/chat', label: 'AI Chat', icon: 'MessageSquare' },
  { path: '/tickets', label: 'Tickets', icon: 'Ticket' },
  { path: '/history', label: 'Memory', icon: 'Brain' },
  { path: '/profile', label: 'Profile', icon: 'User' },
];
