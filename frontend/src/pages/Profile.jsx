import { useAuth } from '../hooks/useAuth';
import { formatDateTime } from '../utils/formatters';
import { User, Mail, Building2, Shield, Calendar, Sparkles } from 'lucide-react';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-brand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Profile header */}
      <div className="glass-card p-6 lg:p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-brand-500/30 mb-4">
          {initials}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
        <p className="text-slate-500 mt-1">{user.email}</p>
        {user.role === 'admin' && (
          <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium">
            <Shield className="w-3.5 h-3.5" />
            Administrator
          </span>
        )}
      </div>

      {/* Account details */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Account Details</h2>
        </div>
        <div className="divide-y divide-slate-50">
          <InfoRow icon={User} label="Full Name" value={user.name} />
          <InfoRow icon={Mail} label="Email Address" value={user.email} />
          <InfoRow icon={Building2} label="Company" value={user.company} />
          <InfoRow icon={Shield} label="Role" value={user.role} />
          <InfoRow icon={Calendar} label="Member Since" value={formatDateTime(user.created_at)} />
        </div>
      </div>

      {/* About SupportLens */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <h3 className="font-semibold text-slate-800">About SupportLens</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          SupportLens uses persistent AI memory to remember your past support interactions.
          Every conversation, ticket, and resolution is stored so you never have to repeat yourself.
          Our AI retrieves relevant context before generating personalized responses.
        </p>
      </div>
    </div>
  );
}
