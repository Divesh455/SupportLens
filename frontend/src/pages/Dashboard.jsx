import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  CheckCircle2,
  MessageSquare,
  Brain,
  Users,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI, ticketAPI, historyAPI } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { getErrorMessage } from '../utils/formatters';

function DistributionBar({ items, colors }) {
  const total = items.reduce((sum, i) => sum + i.value, 0) || 1;
  return (
    <div className="space-y-3">
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
        {items.map((item, idx) => (
          item.value > 0 && (
            <div
              key={item.name}
              className={`${colors[idx % colors.length]} transition-all duration-500`}
              style={{ width: `${(item.value / total) * 100}%` }}
              title={`${item.name}: ${item.value}`}
            />
          )
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
            <span className="text-slate-600">{item.name}</span>
            <span className="ml-auto font-semibold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        if (isAdmin) {
          const { data } = await dashboardAPI.getStats();
          setStats({ type: 'admin', ...data });
        } else {
          const [ticketsRes, historyRes] = await Promise.all([
            ticketAPI.getByUser(user.id),
            historyAPI.getUserHistory(user.id),
          ]);
          const tickets = ticketsRes.data;
          const history = historyRes.data;
          setStats({
            type: 'user',
            tickets,
            memories: history.memories?.length || 0,
            conversations: history.conversations?.length || 0,
            sentiment: history.sentiment_history || {},
            open: tickets.filter((t) => t.status === 'Open').length,
            resolved: tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
            inProgress: tickets.filter((t) => t.status === 'In Progress').length,
          });
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user, isAdmin]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard…" className="py-24" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-purple p-6 lg:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-2xl lg:text-3xl font-bold">{user?.name}</h1>
          <p className="text-white/70 mt-2 max-w-lg">
            {isAdmin
              ? 'Monitor support operations, track tickets, and analyze customer sentiment across your organization.'
              : 'Your AI support assistant remembers every conversation. Ask anything — we already know your history.'}
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-sm font-medium transition-colors"
          >
            Start AI Chat <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Stats cards */}
      {stats?.type === 'admin' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Total Customers" value={stats.cards.total_customers} icon={Users} color="indigo" />
            <StatCard title="Total Tickets" value={stats.cards.total_tickets} icon={Ticket} color="purple" />
            <StatCard title="Open Tickets" value={stats.cards.open_tickets} icon={AlertTriangle} color="amber" />
            <StatCard title="Resolved" value={stats.cards.resolved_tickets} icon={CheckCircle2} color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Ticket Status</h3>
              <DistributionBar
                items={stats.charts.ticket_status}
                colors={['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-slate-400']}
              />
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Priority Distribution</h3>
              <DistributionBar
                items={stats.charts.ticket_priority}
                colors={['bg-slate-400', 'bg-blue-500', 'bg-orange-500', 'bg-red-500']}
              />
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Customer Sentiment</h3>
              <DistributionBar
                items={stats.charts.customer_sentiment}
                colors={['bg-emerald-500', 'bg-slate-400', 'bg-red-500']}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Open Tickets" value={stats?.open} icon={Ticket} color="amber" />
            <StatCard title="In Progress" value={stats?.inProgress} icon={AlertTriangle} color="purple" />
            <StatCard title="Resolved" value={stats?.resolved} icon={CheckCircle2} color="emerald" />
            <StatCard title="AI Memories" value={stats?.memories} icon={Brain} color="cyan" subtitle="Persistent recall" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Sentiment Overview</h3>
              <DistributionBar
                items={[
                  { name: 'Positive', value: stats?.sentiment?.Positive || 0 },
                  { name: 'Neutral', value: stats?.sentiment?.Neutral || 0 },
                  { name: 'Negative', value: stats?.sentiment?.Negative || 0 },
                ]}
                colors={['bg-emerald-500', 'bg-slate-400', 'bg-red-500']}
              />
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { to: '/chat', icon: MessageSquare, label: 'AI Chat', desc: 'Ask support questions' },
                  { to: '/tickets', icon: Ticket, label: 'My Tickets', desc: 'View all issues' },
                  { to: '/history', icon: Brain, label: 'Memory', desc: 'Past interactions' },
                  { to: '/profile', icon: Users, label: 'Profile', desc: 'Account settings' },
                ].map(({ to, icon: Icon, label, desc }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                      <Icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
