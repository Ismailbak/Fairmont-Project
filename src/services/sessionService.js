import { getApiUrl } from '../config';
import { AuthService } from './authService';

export const SessionService = {
  async createSession(title) {
    const token = await AuthService.getToken();
    const res = await fetch(getApiUrl('/api/session/new'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error('Failed to create session');
    return await res.json();
  },
  async listSessions() {
    const token = await AuthService.getToken();
    const res = await fetch(getApiUrl('/api/session/list'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return await res.json();
  },
  async getSessionMessages(sessionId) {
    const token = await AuthService.getToken();
    const res = await fetch(getApiUrl(`/api/chat/session/${sessionId}`), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  },
  async sendMessage(sessionId, message, sender) {
    const token = await AuthService.getToken();
    const res = await fetch(getApiUrl('/api/chat/message'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId, message, sender })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return await res.json();
  }
};
