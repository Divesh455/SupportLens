import { TrendingUp, TrendingDown } from 'lucide-react';

const iconColors = {
  indigo: 'from-brand-500 to-brand-600',
  purple: 'from-accent-purple to-violet-600',
  cyan: 'from-accent-cyan to-teal-500',
  emerald: 'from-emerald-500 to-green-600',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-red-500',
};

export default function StatCard({ title, value, icon: Icon, color = 'indigo', trend, subtitle }) {
  return (
    <div className="glass-card p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(trend)}% vs last week
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconColors[color]} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
      </div>
    </div>
  );
}
