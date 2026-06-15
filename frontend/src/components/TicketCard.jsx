import { Link } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import { formatDate, truncate } from '../utils/formatters';
import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

export default function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="glass-card p-5 block hover:shadow-lg hover:border-brand-200 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-400">#{ticket.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[ticket.status] || STATUS_COLORS.Open}`}>
              {ticket.status}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.Medium}`}>
              {ticket.priority}
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-2">
            {truncate(ticket.issue, 100)}
          </h3>
          {ticket.category && (
            <p className="text-xs text-slate-400 mt-1">{ticket.category}</p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 shrink-0 transition-colors" />
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        {formatDate(ticket.created_at)}
      </div>
    </Link>
  );
}
