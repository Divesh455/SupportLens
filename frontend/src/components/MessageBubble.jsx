export default function MessageBubble({ message }) {
  const isUser = message.isUser;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-indigo-600 font-bold text-xs">AI</span>
        </div>
      )}

      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-none'
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <div className={`text-[10px] mt-1 text-right ${isUser ? 'text-indigo-200' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0">
          <span className="text-gray-600 font-bold text-xs">U</span>
        </div>
      )}
    </div>
  );
}
