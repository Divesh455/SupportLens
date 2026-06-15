import { useEffect, useRef, useState } from 'react';
import { Send, Brain, Sparkles, RotateCcw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chatAPI } from '../services/api';
import { UserBubble, AIBubble } from '../components/MessageBubble';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import { getErrorMessage } from '../utils/formatters';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await chatAPI.getConversations(user.id);
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
        setMessages(formatted);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setInitialLoading(false);
      }
    };
    if (user) loadHistory();
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { type: 'user', text, id: `temp-u-${Date.now()}`, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const { data } = await chatAPI.sendMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: data.answer,
          sentiment: data.sentiment,
          created_at: data.created_at,
          ticket_id: data.ticket_id,
          id: `a-${data.id}`,
        },
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(text);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  if (initialLoading) {
    return <LoadingSpinner size="lg" text="Loading conversation history…" className="py-24" />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-7rem)] -m-4 lg:-m-6">
      {/* Memory banner */}
      <div className="mx-4 lg:mx-6 mt-4 lg:mt-6 mb-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              Memory-enabled AI Support
            </p>
            <p className="text-xs text-slate-500 truncate">
              I remember your past issues and solutions for personalized responses
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="shrink-0 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-white/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear view
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 lg:mx-6 mb-3">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-6">
        {messages.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Start a conversation"
            description="Ask me anything about your account, past issues, or get help with a new problem. I'll remember our conversation."
            action={
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'I need help with my account',
                  'What was my last issue?',
                  'How do I reset my password?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-sm px-3 py-1.5 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            }
          />
        ) : (
          messages.map((msg) =>
            msg.type === 'user' ? (
              <UserBubble key={msg.id} text={msg.text} created_at={msg.created_at} />
            ) : (
              <div key={msg.id}>
                <AIBubble text={msg.text} sentiment={msg.sentiment} created_at={msg.created_at} />
                {msg.ticket_id && (
                  <p className="text-xs text-slate-400 ml-11 mt-1">
                    Ticket #{msg.ticket_id} created automatically
                  </p>
                )}
              </div>
            )
          )
        )}

        {loading && <AIBubble isTyping text="" />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 bg-white/80 backdrop-blur-xl px-4 lg:px-6 py-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 p-2 rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message SupportLens AI…"
              rows={1}
              className="flex-1 resize-none px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent max-h-32"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-white flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:shadow-brand-500/30 transition-all"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
