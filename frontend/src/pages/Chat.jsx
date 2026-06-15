import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Brain, Sparkles, RotateCcw, Wifi, WifiOff, Users, Headphones, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chatAPI, ticketAPI } from '../services/api';
import { useWebSocketChat, ConnectionStatus } from '../hooks/useWebSocketChat';
import { UserBubble, AIBubble } from '../components/MessageBubble';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import { getErrorMessage, formatRelativeTime } from '../utils/formatters';

function AgentBubble({ text, created_at, name }) {
  return (
    <div className="flex gap-3 animate-slide-up">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
        <Headphones className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col items-start max-w-[75%]">
        <span className="text-xs font-medium text-emerald-600 mb-1">{name || 'Support Agent'}</span>
        <div className="px-4 py-3 rounded-2xl rounded-tl-md text-sm leading-relaxed whitespace-pre-wrap bg-emerald-50 border border-emerald-100 text-slate-800 shadow-sm">
          {text}
        </div>
        {created_at && <span className="text-xs text-slate-400 mt-1.5">{formatRelativeTime(created_at)}</span>}
      </div>
    </div>
  );
}

function ConnectionBadge({ status }) {
  const config = {
    [ConnectionStatus.CONNECTED]: { icon: Wifi, label: 'Connected', className: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    [ConnectionStatus.CONNECTING]: { icon: Wifi, label: 'Connecting…', className: 'text-amber-600 bg-amber-50 border-amber-200' },
    [ConnectionStatus.RECONNECTING]: { icon: WifiOff, label: 'Reconnecting…', className: 'text-amber-600 bg-amber-50 border-amber-200' },
    [ConnectionStatus.DISCONNECTED]: { icon: WifiOff, label: 'Offline', className: 'text-red-600 bg-red-50 border-red-200' },
  };
  const { icon: Icon, label, className } = config[status] || config[ConnectionStatus.DISCONNECTED];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function Chat() {
  const { customerId } = useParams();
  const { user, isAgent, isAdmin, isStaff } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedTickets, setAssignedTickets] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const chatRoomId = user?.role === 'user'
    ? user.id
    : customerId
      ? parseInt(customerId, 10)
      : null;

  const { connectionStatus, onlineUsers, typingUsers, sendMessage, sendTyping, onMessage, isConnected } =
    useWebSocketChat(chatRoomId);

  useEffect(() => {
    if (isStaff && !customerId) {
      ticketAPI.getAll()
        .then(({ data }) => setAssignedTickets(data))
        .catch(() => {});
    }
  }, [isStaff, customerId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  useEffect(() => {
    if (!chatRoomId) {
      setInitialLoading(false);
      return;
    }
    const loadHistory = async () => {
      try {
        const { data } = await chatAPI.getConversations(chatRoomId);
        const formatted = [];
        data.forEach((conv) => {
          formatted.push({ type: 'user', text: conv.question, created_at: conv.created_at, id: `q-${conv.id}` });
          formatted.push({
            type: 'ai',
            text: conv.answer,
            sentiment: conv.sentiment,
            created_at: conv.created_at,
            ticket_id: conv.ticket_id,
            id: `a-${conv.id}`,
          });
        });
        try {
          const { data: agentMsgs } = await chatAPI.getMessages(chatRoomId);
          agentMsgs.forEach((m) => {
            formatted.push({
              type: m.sender_role === 'support_agent' || m.sender_role === 'admin' ? 'agent' : m.message_type,
              text: m.content,
              created_at: m.created_at,
              id: `ws-${m.id}`,
              sender_role: m.sender_role,
            });
          });
        } catch {
          // optional
        }
        formatted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setMessages(formatted);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setInitialLoading(false);
      }
    };
    loadHistory();
  }, [chatRoomId]);

  useEffect(() => {
    const unsub = onMessage((data) => {
      if (data.type === 'message') {
        const msgType =
          data.sender_role === 'ai'
            ? 'ai'
            : data.sender_role === 'support_agent' || data.sender_role === 'admin'
              ? 'agent'
              : 'user';
        appendMessage({
          id: data.id ? `ws-${data.id}` : `temp-${Date.now()}`,
          type: msgType,
          text: data.content,
          sentiment: data.sentiment,
          ticket_id: data.ticket_id,
          created_at: data.created_at,
          sender_role: data.sender_role,
        });
      }
    });
    return unsub;
  }, [onMessage, appendMessage]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !isConnected) return;

    if (user.role === 'user') {
      appendMessage({ type: 'user', text, id: `temp-u-${Date.now()}`, created_at: new Date().toISOString() });
    }
    sendMessage(text);
    setInput('');
    sendTyping(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => sendTyping(false), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (isStaff && !chatRoomId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-xl font-bold text-slate-900">Customer Chat</h1>
        <p className="text-sm text-slate-500">Select a customer from your assigned tickets to start a real-time chat.</p>
        {assignedTickets.length === 0 ? (
          <EmptyState title="No assigned tickets" description="Tickets assigned to you will appear here." />
        ) : (
          <div className="grid gap-3">
            {[...new Map(assignedTickets.map((t) => [t.user_id, t])).values()].map((ticket) => (
              <Link
                key={ticket.user_id}
                to={`/chat/${ticket.user_id}`}
                className="card p-4 hover:border-brand-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-800">Customer #{ticket.user_id}</p>
                  <p className="text-sm text-slate-500 truncate">{ticket.issue}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700">Open chat</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (initialLoading) {
    return <LoadingSpinner size="lg" text="Loading conversation history…" className="py-24" />;
  }

  const activeTyping = Object.entries(typingUsers).filter(([, v]) => v);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-7rem)] -m-4 lg:-m-6">
      <div className="mx-4 lg:mx-6 mt-4 lg:mt-6 mb-3 space-y-2">
        {isStaff && (
          <Link to="/chat" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to customers
          </Link>
        )}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 flex items-center gap-2 flex-wrap">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              {isStaff ? `Chat with Customer #${chatRoomId}` : 'Real-Time AI Support'}
              <ConnectionBadge status={connectionStatus} />
            </p>
            <p className="text-xs text-slate-500 truncate">WebSocket-powered · instant delivery</p>
          </div>
        </div>

        {onlineUsers.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-xs text-slate-600 flex-wrap">
            <Users className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-medium">Online:</span>
            {onlineUsers.map((u) => (
              <span key={u.user_id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {u.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 lg:mx-6 mb-3">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-6">
        {messages.length === 0 ? (
          <EmptyState icon={Sparkles} title="No messages yet" description="Start the conversation below." />
        ) : (
          messages.map((msg) => {
            if (msg.type === 'user') return <UserBubble key={msg.id} text={msg.text} created_at={msg.created_at} />;
            if (msg.type === 'agent') {
              return (
                <AgentBubble
                  key={msg.id}
                  text={msg.text}
                  created_at={msg.created_at}
                  name={msg.sender_role === 'admin' ? 'Admin' : 'Support Agent'}
                />
              );
            }
            return (
              <div key={msg.id}>
                <AIBubble text={msg.text} sentiment={msg.sentiment} created_at={msg.created_at} />
                {msg.ticket_id && (
                  <p className="text-xs text-slate-400 ml-11 mt-1">Ticket #{msg.ticket_id} created automatically</p>
                )}
              </div>
            );
          })
        )}

        {activeTyping.map(([key, info]) =>
          info?.role === 'ai' ? (
            <AIBubble key={key} isTyping text="" />
          ) : info ? (
            <p key={key} className="text-xs text-slate-400 ml-11">{info.name} is typing…</p>
          ) : null
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 bg-white/80 backdrop-blur-xl px-4 lg:px-6 py-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 p-2 rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? (isStaff ? 'Reply to customer…' : 'Message SupportLens…') : 'Connecting…'}
              rows={1}
              className="flex-1 resize-none px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent max-h-32"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!input.trim() || !isConnected}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-white flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:shadow-brand-500/30 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
