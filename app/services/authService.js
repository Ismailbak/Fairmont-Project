// app/services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG, getApiUrl } from '../config';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export class AuthService {
  // Sign up new user
  static async signup(userData) {
    try {
      const response = await fetch(getApiUrl(CONFIG.API.ENDPOINTS.SIGNUP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Response is not JSON, probably HTML error page
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      // Store tokens and user data
      await this.storeTokens(data.access_token, data.refresh_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify({
        id: data.user_id,
        email: userData.email,
        full_name: userData.full_name
      }));

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Sign in existing user
  static async signin(email, password) {
    try {
      const response = await fetch(getApiUrl(CONFIG.API.ENDPOINTS.SIGNIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store tokens and user data
      await this.storeTokens(data.access_token, data.refresh_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify({
        id: data.user_id,
        email: email
      }));

      return data;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  // Store authentication tokens
  static async storeTokens(accessToken, refreshToken) {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  // Get stored access token
  static async getToken() {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  // Get stored user data
  static async getUser() {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  // Sign out user
  static async signout() {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  }

  // Reset password
  static async resetPassword(email, newPassword) {
    try {
      const response = await fetch(getApiUrl(CONFIG.API.ENDPOINTS.RESET_PASSWORD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, new_password: newPassword }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Password reset failed');
      }

      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Make authenticated API calls
  static async authenticatedFetch(url, options = {}) {
    const token = await this.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Send chat message (protected endpoint)
  static async sendChatMessage(message) {
    try {
      const response = await this.authenticatedFetch(getApiUrl(CONFIG.API.ENDPOINTS.CHAT), {
        method: 'POST',
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Chat request failed');
      }

      return data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }



  // Get user activities
  static async getUserActivities(limit = 20) {
    try {
      const response = await this.authenticatedFetch(`${CONFIG.API_BASE_URL}/api/admin/user-activities?limit=${limit}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Get user activities error:', error);
      return [];
    }
  }

  // Get user activities (monitoring)
  static async getUserActivitiesMonitoring(limit = 20) {
    try {
      const response = await this.authenticatedFetch(
        `${getApiUrl(CONFIG.API.ENDPOINTS.MY_ACTIVITIES)}?limit=${limit}`
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch activities');
      }

      return data;
    } catch (error) {
      console.error('Get activities error:', error);
      throw error;
    }
  }
}
