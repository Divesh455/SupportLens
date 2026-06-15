import { Brain, Sparkles } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export default function MemoryCard({ memory }) {
  const typeColors = {
    preference: 'from-accent-cyan/20 to-teal-50 border-cyan-200',
    issue: 'from-amber-50 to-orange-50 border-amber-200',
    solution: 'from-emerald-50 to-green-50 border-emerald-200',
    default: 'from-brand-50 to-indigo-50 border-brand-200',
  };

  const colorClass = typeColors[memory.memory_type?.toLowerCase()] || typeColors.default;

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${colorClass} animate-slide-up`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
          {memory.memory_type === 'solution' ? (
            <Sparkles className="w-4 h-4 text-emerald-600" />
          ) : (
            <Brain className="w-4 h-4 text-brand-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {memory.memory_type && (
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
              {memory.memory_type}
            </span>
          )}
          <p className="text-sm text-slate-700 leading-relaxed">{memory.memory_text}</p>
          <p className="text-xs text-slate-400 mt-2">{formatDateTime(memory.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
