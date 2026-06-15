import {
  LayoutDashboard,
  MessageSquare,
  Ticket,
  Brain,
  User,
  LogOut,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const iconMap = {
  LayoutDashboard,
  MessageSquare,
  Ticket,
  Brain,
  User,
};

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/chat', label: 'AI Chat', icon: 'MessageSquare' },
  { path: '/tickets', label: 'Tickets', icon: 'Ticket' },
  { path: '/history', label: 'Memory', icon: 'Brain' },
  { path: '/profile', label: 'Profile', icon: 'User' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">SupportLens</h1>
            <p className="text-xs text-slate-400">AI Support Memory</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon }) => {
          const Icon = iconMap[icon];
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            {user.role === 'admin' && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">
                Admin
              </span>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col relative bg-white border-r border-slate-200 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors hidden lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-3.5 h-3.5 text-slate-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
