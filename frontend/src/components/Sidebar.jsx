import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Ticket, History } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", adminOnly: true },
    { to: "/chat", icon: <MessageSquare size={20} />, label: "Support Chat" },
    { to: "/tickets", icon: <Ticket size={20} />, label: "Tickets" },
    { to: "/history", icon: <History size={20} />, label: "History" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg group transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <span className="opacity-75">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
