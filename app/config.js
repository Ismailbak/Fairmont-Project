// Configuration for the Fairmont mobile app
export const CONFIG = {
  // Backend API configuration
  API: {
    BASE_URL: 'http://10.16.21.177:9000', // Use port 9000
    ENDPOINTS: {
      CHAT: '/api/chat',
      HEALTH: '/api/health',
    }
  },
  
  // App settings
  APP: {
    NAME: 'Fairmont',
    VERSION: '1.0.0',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${CONFIG.API.BASE_URL}${endpoint}`;
}; 