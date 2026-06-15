import { useEffect, useRef, useState, useCallback } from 'react';
import websocketService, { ConnectionStatus } from '../services/websocket';

export function useWebSocketChat(roomUserId) {
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeouts = useRef({});

  useEffect(() => {
    if (!roomUserId) return undefined;

    websocketService.connect(roomUserId);

    const unsubs = [
      websocketService.on('status', ({ status }) => setConnectionStatus(status)),
      websocketService.on('online_users', ({ users }) => setOnlineUsers(users || [])),
      websocketService.on('presence', (data) => {
        setOnlineUsers((prev) => {
          const filtered = prev.filter((u) => u.user_id !== data.user_id);
          if (data.online) {
            return [...filtered, { user_id: data.user_id, name: data.name, role: data.role, online: true }];
          }
          return filtered;
        });
      }),
      websocketService.on('typing', (data) => {
        if (data.role === 'ai' && data.user_id === 0) {
          setTypingUsers((prev) => ({
            ...prev,
            ai: data.is_typing ? { name: 'SupportLens AI', role: 'ai' } : undefined,
          }));
          return;
        }
        const key = data.user_id;
        if (data.is_typing) {
          setTypingUsers((prev) => ({ ...prev, [key]: { name: data.name, role: data.role } }));
          clearTimeout(typingTimeouts.current[key]);
          typingTimeouts.current[key] = setTimeout(() => {
            setTypingUsers((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
          }, 3000);
        } else {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        }
      }),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      websocketService.disconnect();
    };
  }, [roomUserId]);

  const sendMessage = useCallback((content) => {
    websocketService.sendMessage(content);
  }, []);

  const sendTyping = useCallback((isTyping) => {
    websocketService.sendTyping(isTyping);
  }, []);

  const onMessage = useCallback((callback) => websocketService.on('message', callback), []);

  return {
    connectionStatus,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTyping,
    onMessage,
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
  };
}

export { ConnectionStatus };
