import { useEffect, useState } from 'react';
import { Plus, Filter, Ticket as TicketIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ticketAPI } from '../services/api';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import { getErrorMessage } from '../utils/formatters';
import { TICKET_STATUSES } from '../utils/constants';

export default function Tickets() {
  const { user, isAdmin, isAgent } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isStaff = isAdmin || isAgent;

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = isStaff
        ? await ticketAPI.getAll()
        : await ticketAPI.getByUser(user.id);
      setTickets(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTickets();
  }, [user, isStaff]);

  const handleCreate = async (formData) => {
    setCreating(true);
    try {
      await ticketAPI.create(formData);
      await fetchTickets();
    } finally {
      setCreating(false);
    }
  };

  const filtered = statusFilter === 'All'
    ? tickets
    : tickets.filter((t) => t.status === statusFilter);

  const counts = TICKET_STATUSES.reduce((acc, s) => {
    acc[s] = tickets.filter((t) => t.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAdmin ? 'All Support Tickets' : isAgent ? 'Assigned Tickets' : 'My Tickets'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {tickets.length} total · {counts.Open || 0} open
          </p>
        </div>
        {!isStaff && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        )}
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Status filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {['All', ...TICKET_STATUSES].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === status
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-200'
            }`}
          >
            {status}
            {status !== 'All' && counts[status] > 0 && (
              <span className="ml-1.5 opacity-70">({counts[status]})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading tickets…" className="py-16" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title={statusFilter === 'All' ? 'No tickets yet' : `No ${statusFilter.toLowerCase()} tickets`}
          description="Create a ticket manually or let the AI create one during a chat conversation."
          action={
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Ticket
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      <CreateTicketModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
      />
    </div>
  );
}
