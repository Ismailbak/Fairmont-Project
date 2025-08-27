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
    try {
      const token = await AuthService.getToken();
      console.log("List sessions - Token exists:", !!token);
      console.log("Token (first 10 chars):", token ? token.substring(0, 10) + "..." : "None");
      
      if (!token) {
        console.error('No authentication token found');
        throw new Error('No authentication token found');
      }
      
      console.log("Fetching sessions from:", getApiUrl('/api/session/list'));
      const res = await fetch(getApiUrl('/api/session/list'), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Server error: ${res.status}`, errorText);
        throw new Error(`Failed to fetch sessions: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Sessions fetched successfully:", data.length || 0, "sessions");
      return data;
    } catch (error) {
      console.error("Error listing sessions:", error.message);
      throw error;
    }
  },
  async getSessionMessages(sessionId) {
    try {
      if (!sessionId || isNaN(parseInt(sessionId))) {
        console.error('Invalid session ID');
        return [];
      }
      
      const token = await AuthService.getToken();
      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required');
      }
      
      // Add timeout for better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
      try {
        const res = await fetch(getApiUrl(`/api/chat/session/${sessionId}`), {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });
        
        // Clear timeout since request completed
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          console.error(`Failed to fetch messages: ${res.status}`);
          throw new Error('Failed to fetch messages');
        }
        
        return await res.json();
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out while fetching messages');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("Error getting session messages:", error.message);
      throw error;
    }
  },
  async sendMessage(sessionId, message, sender) {
    try {
      if (!sessionId || isNaN(parseInt(sessionId))) {
        throw new Error('Invalid session ID');
      }
      
      const token = await AuthService.getToken();
      console.log("Token exists:", !!token);
      console.log("Token (first 10 chars):", token ? token.substring(0, 10) + "..." : "None");
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Add timeout for better error handling - significantly increased timeout for LLM responses
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2-minute timeout
      
      try {
        const res = await fetch(getApiUrl('/api/chat/message'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId, message, sender }),
          signal: controller.signal
        });
        
        // Clear timeout since request completed
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.log(`Server error: ${res.status}`, errorText);
          throw new Error(`Failed to send message: ${res.status}`);
        }
        
        return await res.json();
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 2 minutes. The AI service might be busy.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.log("Error sending message:", error.message);
      throw error;
    }
  }
};
