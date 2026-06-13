import { useAuth } from '../hooks/useAuth';
import ChatBox from '../components/ChatBox';

export default function Chat() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Support Chat</h1>
        <p className="text-gray-500 mt-1">Talk to our AI agent. It remembers your previous conversations!</p>
        <p className="text-indigo-600 font-medium mt-2 text-sm">
           Memory retrieval from past conversations, tickets, and sentiment is displayed inline above.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatBox userId={user.id} />
      </div>
    </div>
  );
}
