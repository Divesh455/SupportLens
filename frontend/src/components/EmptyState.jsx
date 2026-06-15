import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-brand-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
