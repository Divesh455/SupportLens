import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

export const ConnectionStatus = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
};

class WebSocketService {
  constructor() {
    this.ws = null;
    this.userId = null;
    this.roomUserId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.intentionalClose = false;
    this.status = ConnectionStatus.DISCONNECTED;
  }

  connect(roomUserId) {
    this.roomUserId = roomUserId;
    this.intentionalClose = false;
    this._connect();
  }

  _connect() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !this.roomUserId) return;

    this._setStatus(
      this.reconnectAttempts > 0 ? ConnectionStatus.RECONNECTING : ConnectionStatus.CONNECTING
    );

    const url = `${WS_BASE_URL}/ws/chat/${this.roomUserId}?token=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this._setStatus(ConnectionStatus.CONNECTED);
      this._startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this._emit(data.type, data);
        this._emit('message', data);
      } catch {
        // ignore malformed payloads
      }
    };

    this.ws.onclose = () => {
      this._stopPing();
      this._setStatus(ConnectionStatus.DISCONNECTED);
      if (!this.intentionalClose) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this._setStatus(ConnectionStatus.DISCONNECTED);
    };
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    clearTimeout(this.reconnectTimer);
    const delay = Math.min(this.reconnectDelay * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this._connect(), delay);
  }

  _startPing() {
    this._stopPing();
    this.pingTimer = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  _stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  _setStatus(status) {
    this.status = status;
    this._emit('status', { status });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
    this.listeners.get('*')?.forEach((cb) => cb(event, data));
  }

  send(payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  sendMessage(content) {
    this.send({ type: 'message', content });
  }

  sendTyping(isTyping) {
    this.send({ type: 'typing', is_typing: isTyping });
  }

  sendPrivateMessage(targetUserId, content) {
    this.send({ type: 'private_message', target_user_id: targetUserId, content });
  }

  disconnect() {
    this.intentionalClose = true;
    clearTimeout(this.reconnectTimer);
    this._stopPing();
    this.ws?.close();
    this.ws = null;
    this._setStatus(ConnectionStatus.DISCONNECTED);
  }

  getStatus() {
    return this.status;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
