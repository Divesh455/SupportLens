import { Menu, Bell, Search } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/chat': 'AI Support Chat',
  '/tickets': 'Support Tickets',
  '/history': 'Customer Memory',
  '/profile': 'Profile',
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith('/tickets/')) return 'Ticket Details';
    return pageTitles[location.pathname] || 'SupportLens';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{getTitle()}</h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-powered support with persistent memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search…"
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-40"
              readOnly
            />
          </div>
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors relative">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
          <Link
            to="/chat"
            className="hidden sm:inline-flex btn-primary text-sm py-2 px-4"
          >
            New Chat
          </Link>
        </div>
      </div>
    </header>
  );
}
