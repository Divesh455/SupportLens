import { Bot, User } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';
import { SENTIMENT_COLORS } from '../utils/constants';

export default function MessageBubble({ message, isUser, sentiment }) {
  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-brand-500 to-brand-600'
            : 'bg-gradient-to-br from-accent-purple to-brand-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-tr-md'
              : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-md'
          }`}
        >
          {message}
        </div>
        <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-slate-400">{formatRelativeTime(message.created_at)}</span>
          {!isUser && sentiment && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.Neutral}`}>
              {sentiment}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper for chat messages with text + metadata
export function ChatMessagePair({ question, answer, sentiment, created_at }) {
  return (
    <div className="space-y-4">
      <MessageBubble message={{ text: question, created_at }} isUser />
      <MessageBubble message={{ text: answer, created_at }} isUser={false} sentiment={sentiment} />
    </div>
  );
}

// Fix MessageBubble to accept text properly
export function UserBubble({ text, created_at }) {
  return (
    <div className="flex gap-3 flex-row-reverse animate-slide-up">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col items-end max-w-[75%]">
        <div className="px-4 py-3 rounded-2xl rounded-tr-md text-sm leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-brand-600 to-brand-500 text-white">
          {text}
        </div>
        {created_at && <span className="text-xs text-slate-400 mt-1.5">{formatRelativeTime(created_at)}</span>}
      </div>
    </div>
  );
}

export function AIBubble({ text, sentiment, created_at, isTyping }) {
  return (
    <div className="flex gap-3 animate-slide-up">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-accent-purple to-brand-600 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col items-start max-w-[75%]">
        <div className="px-4 py-3 rounded-2xl rounded-tl-md text-sm leading-relaxed whitespace-pre-wrap bg-white border border-slate-100 text-slate-800 shadow-sm">
          {isTyping ? (
            <span className="flex gap-1 items-center">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          ) : (
            text
          )}
        </div>
        {!isTyping && (
          <div className="flex items-center gap-2 mt-1.5">
            {created_at && <span className="text-xs text-slate-400">{formatRelativeTime(created_at)}</span>}
            {sentiment && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.Neutral}`}>
                {sentiment}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
