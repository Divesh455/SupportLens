import { useState } from 'react';
import api from '../services/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async (userId) => {
    try {
      const res = await api.get(`/chat/conversation/${userId}`);
      const formatted = res.data.flatMap(interaction => [
        { id: `q-${interaction.id}`, text: interaction.question, isUser: true, timestamp: interaction.created_at },
        { id: `a-${interaction.id}`, text: interaction.answer, isUser: false, timestamp: interaction.created_at }
      ]);
      setMessages(formatted);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  const sendMessage = async (text) => {
    const tempId = Date.now().toString();
    const newUserMsg = { id: tempId, text, isUser: true, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const res = await api.post('/chat/', { message: text });
      const newAiMsg = {
        id: `a-${res.data.id}`,
        text: res.data.answer,
        isUser: false,
        timestamp: res.data.created_at
      };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage, fetchConversations };
}
