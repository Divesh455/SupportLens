import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, Ticket as TicketIcon, BrainCircuit } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/history/${user.id}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  if (loading) return <div className="p-8">Loading history...</div>;
  if (!history) return <div className="p-8 text-red-500">Failed to load history</div>;

  const allEvents = [
    ...history.tickets.map(t => ({ ...t, type: 'ticket', date: new Date(t.created_at) })),
    ...history.conversations.map(c => ({ ...c, type: 'conversation', date: new Date(c.created_at) })),
    ...history.memories.map(m => ({ ...m, type: 'memory', date: new Date(m.created_at) }))
  ].sort((a, b) => b.date - a.date);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer History Timeline</h1>
        <p className="text-gray-500 mt-1">A complete record of all your interactions and the memories we've formed.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-4 mb-8">
          <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
            <span className="text-sm text-indigo-600 font-medium block">Total Interactions</span>
            <span className="text-2xl font-bold text-indigo-900">{history.conversations.length}</span>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
            <span className="text-sm text-green-600 font-medium block">Total Tickets</span>
            <span className="text-2xl font-bold text-green-900">{history.tickets.length}</span>
          </div>
          <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
            <span className="text-sm text-purple-600 font-medium block">Memories Stored</span>
            <span className="text-2xl font-bold text-purple-900">{history.memories.length}</span>
          </div>
        </div>

        <div className="relative border-l border-gray-200 ml-3 space-y-8 pb-4">
          {allEvents.length === 0 ? (
            <p className="pl-6 text-gray-500">No history found yet.</p>
          ) : (
            allEvents.map((event, idx) => (
              <div key={`${event.type}-${event.id}-${idx}`} className="relative pl-8">
                <div className={`absolute -left-[1.3rem] top-1 p-1.5 rounded-full border border-white flex items-center justify-center
                  ${event.type === 'ticket' ? 'bg-green-100 text-green-600' :
                    event.type === 'conversation' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'}`}
                >
                  {event.type === 'ticket' && <TicketIcon size={16} />}
                  {event.type === 'conversation' && <MessageSquare size={16} />}
                  {event.type === 'memory' && <BrainCircuit size={16} />}
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {event.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {event.date.toLocaleString()}
                    </span>
                  </div>

                  {event.type === 'ticket' && (
                    <div>
                      <h4 className="font-medium text-gray-900">Ticket #{event.id}: {event.issue}</h4>
                      <p className="text-sm text-gray-600 mt-1">Status: {event.status} | Priority: {event.priority}</p>
                    </div>
                  )}

                  {event.type === 'conversation' && (
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <span className="text-xs font-bold text-gray-400 block mb-1">USER</span>
                        <p className="text-sm text-gray-800">{event.question}</p>
                      </div>
                      <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
                        <span className="text-xs font-bold text-indigo-400 block mb-1">AI</span>
                        <p className="text-sm text-indigo-900">{event.answer}</p>
                      </div>
                      <span className="text-xs text-gray-400 inline-block mt-1">Sentiment: {event.sentiment}</span>
                    </div>
                  )}

                  {event.type === 'memory' && (
                    <div>
                      <p className="text-sm font-medium text-purple-900 italic">"{event.memory_text}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
