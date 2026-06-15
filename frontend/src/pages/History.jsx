import { useEffect, useState } from 'react';
import {
  Brain,
  MessageSquare,
  Ticket,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { historyAPI } from '../services/api';
import MemoryCard from '../components/MemoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import { formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/formatters';
import { SENTIMENT_COLORS, STATUS_COLORS } from '../utils/constants';

function TimelineItem({ icon: Icon, color, title, subtitle, children }) {
  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className={`absolute left-0 top-0 w-6 h-6 rounded-full ${color} flex items-center justify-center ring-4 ring-white`}>
        <Icon className="w-3 h-3 text-white" />
      </div>
      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200 last:hidden" />
      <div className="glass-card p-4 animate-slide-up">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
          {subtitle && <span className="text-xs text-slate-400 shrink-0">{subtitle}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await historyAPI.getUserHistory(user.id);
        setHistory(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading memory history…" className="py-24" />;
  }

  const tabs = [
    { id: 'all', label: 'All', count: (history?.tickets?.length || 0) + (history?.conversations?.length || 0) + (history?.memories?.length || 0) },
    { id: 'memories', label: 'Memories', count: history?.memories?.length || 0 },
    { id: 'conversations', label: 'Conversations', count: history?.conversations?.length || 0 },
    { id: 'tickets', label: 'Tickets', count: history?.tickets?.length || 0 },
  ];

  const sentiment = history?.sentiment_history || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-purple/10 via-brand-50 to-accent-cyan/10 border border-brand-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Customer Memory
              <Sparkles className="w-5 h-5 text-brand-500" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Persistent memory of your issues, solutions, and interactions — powering personalized AI support.
            </p>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Sentiment cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Positive', value: sentiment.Positive || 0, icon: ThumbsUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: 'Neutral', value: sentiment.Neutral || 0, icon: Minus, color: 'text-slate-600 bg-slate-50 border-slate-200' },
          { label: 'Negative', value: sentiment.Negative || 0, icon: ThumbsDown, color: 'text-red-600 bg-red-50 border-red-200' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
            <Icon className="w-5 h-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-200'
            }`}
          >
            {label}
            <span className="ml-1.5 opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {!history || (
        (activeTab === 'all' && !history.memories?.length && !history.conversations?.length && !history.tickets?.length) ||
        (activeTab === 'memories' && !history.memories?.length) ||
        (activeTab === 'conversations' && !history.conversations?.length) ||
        (activeTab === 'tickets' && !history.tickets?.length)
      ) ? (
        <EmptyState
          icon={Brain}
          title="No history yet"
          description="Start a chat conversation or create a ticket. SupportLens will remember everything for future interactions."
        />
      ) : (
        <div className="space-y-6">
          {/* Memories section */}
          {(activeTab === 'all' || activeTab === 'memories') && history.memories?.length > 0 && (
            <section>
              {activeTab === 'all' && (
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Stored Memories
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {history.memories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            </section>
          )}

          {/* Conversations timeline */}
          {(activeTab === 'all' || activeTab === 'conversations') && history.conversations?.length > 0 && (
            <section>
              {activeTab === 'all' && (
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Past Conversations
                </h2>
              )}
              <div>
                {history.conversations.map((conv) => (
                  <TimelineItem
                    key={conv.id}
                    icon={MessageSquare}
                    color="bg-brand-500"
                    title={conv.question}
                    subtitle={formatDateTime(conv.created_at)}
                  >
                    <p className="text-sm text-slate-600 leading-relaxed mb-2">{conv.answer}</p>
                    {conv.sentiment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${SENTIMENT_COLORS[conv.sentiment]}`}>
                        {conv.sentiment}
                      </span>
                    )}
                  </TimelineItem>
                ))}
              </div>
            </section>
          )}

          {/* Tickets timeline */}
          {(activeTab === 'all' || activeTab === 'tickets') && history.tickets?.length > 0 && (
            <section>
              {activeTab === 'all' && (
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4" /> Past Tickets
                </h2>
              )}
              <div>
                {history.tickets.map((ticket) => (
                  <TimelineItem
                    key={ticket.id}
                    icon={Ticket}
                    color="bg-accent-purple"
                    title={`#${ticket.id} — ${ticket.issue}`}
                    subtitle={formatDateTime(ticket.created_at)}
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {ticket.priority}
                      </span>
                    </div>
                  </TimelineItem>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
