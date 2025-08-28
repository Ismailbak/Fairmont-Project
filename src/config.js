
import { Platform } from 'react-native';

// API configuration and utilities
export const CONFIG = {
	API: {
		   BASE_URL: Platform.select({
			   ios: 'http://192.168.1.108:8080',     // Updated to your actual local IP and backend port
			   android: 'http://192.168.1.108:8080',
			   default: 'http://192.168.1.108:8080',
		   }),
		ENDPOINTS: {
			// Authentication endpoints
			SIGNUP: '/api/auth/signup',
			SIGNIN: '/api/auth/signin',
			RESET_PASSWORD: '/api/auth/reset-password',
			// Protected endpoints
			CHAT: '/chat',         // Now requires JWT token
			// Monitoring endpoints
			USER_ACTIVITIES: '/api/admin/user-activities',
			USER_STATS: '/api/admin/user-stats',
			MY_ACTIVITIES: '/api/admin/my-activities',
			// Health check
			HEALTH: '/health',
		}
	},
	APP: {
		NAME: 'Fairmont',
		VERSION: '1.0.0',
	}
};

export const getApiUrl = (endpoint) => {
	return `${CONFIG.API.BASE_URL}${endpoint}`;
};
