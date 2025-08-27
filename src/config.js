
import { Platform } from 'react-native';

// API configuration and utilities
export const CONFIG = {
	API: {
		BASE_URL: Platform.select({
			ios: 'http://10.16.16.64:8080',     // iOS simulator/device
			android: 'http://10.0.2.2:8080',    // Android emulator
			default: 'http://localhost:8080',    // Web/development
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
