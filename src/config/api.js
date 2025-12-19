// API endpoints - API key is now secured on the backend
// DO NOT put API keys in frontend code!

// API Configuration
// Automatically detect development vs production
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const defaultUrl = isDevelopment ? 'http://localhost:3003' : 'https://supersite-b36dcfb401af.herokuapp.com';
const baseUrl = process.env.REACT_APP_API_URL || defaultUrl;
// Remove trailing slash to prevent double slashes
export const API_BASE_URL = baseUrl.replace(/\/+$/, '');

// Debug: Log API URL in development
if (isDevelopment) {
  console.log('🔧 API Configuration:', {
    hostname: window.location.hostname,
    envVar: process.env.REACT_APP_API_URL || 'not set',
    using: API_BASE_URL,
    isDevelopment
  });
}

// API endpoints
export const API_ENDPOINTS = {
  AI_ESTIMATE: `${API_BASE_URL}/api/ai/estimate`,
  AI_COPY: `${API_BASE_URL}/api/ai/copy`,
  AI_CHAT: `${API_BASE_URL}/api/ai/chat`,
  SAVE_OFFER: `${API_BASE_URL}/api/save-offer`,
  GET_OFFERS: `${API_BASE_URL}/api/get-offers`,
  DELETE_OFFER: `${API_BASE_URL}/api/delete-offer`,
  SAVE_FEEDBACK: `${API_BASE_URL}/api/save-feedback`,
};