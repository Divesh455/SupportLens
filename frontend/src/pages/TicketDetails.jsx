import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ticketAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/formatters';
import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

export default function TicketDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: tickets } = isAdmin
          ? await ticketAPI.getAll()
          : await ticketAPI.getByUser(user.id);

        const found = tickets.find((t) => t.id === parseInt(id, 10));
        if (!found) {
          setError('Ticket not found.');
        } else {
          setTicket(found);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (user && id) fetchTicket();
  }, [user, id, isAdmin]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading ticket…" className="py-24" />;
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => navigate('/tickets')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </button>
        <ErrorAlert message={error || 'Ticket not found.'} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <button onClick={() => navigate('/tickets')} className="btn-secondary">
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </button>

      <div className="glass-card p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-mono text-slate-400">Ticket #{ticket.id}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[ticket.status]}`}>
            {ticket.status}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
            {ticket.priority} Priority
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">{ticket.issue}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Created</p>
              <p className="text-sm font-medium text-slate-700">{formatDateTime(ticket.created_at)}</p>
            </div>
          </div>
          {ticket.category && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <Tag className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Category</p>
                <p className="text-sm font-medium text-slate-700">{ticket.category}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">User ID</p>
              <p className="text-sm font-medium text-slate-700">{ticket.user_id}</p>
            </div>
          </div>
        </div>

        {ticket.summary && (
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-brand-500" />
              <h3 className="font-semibold text-slate-800">AI Summary</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed bg-brand-50/50 rounded-xl p-4 border border-brand-100">
              {ticket.summary}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link to="/chat" className="btn-primary">
          Discuss in AI Chat
        </Link>
        <Link to="/history" className="btn-secondary">
          View Memory History
        </Link>
      </div>
    </div>
  );
}
