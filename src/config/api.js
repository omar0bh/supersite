// API endpoints - API key is now secured on the backend
// DO NOT put API keys in frontend code!

// API Configuration
// In production, set REACT_APP_API_URL to your backend URL
// Default matches server.js port (3003) for development
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

// API endpoints
export const API_ENDPOINTS = {
  AI_ESTIMATE: `${API_BASE_URL}/ai/estimate`,
  AI_COPY: `${API_BASE_URL}/ai/copy`,
  AI_CHAT: `${API_BASE_URL}/ai/chat`,
  SAVE_OFFER: `${API_BASE_URL}/save-offer`,
  GET_OFFERS: `${API_BASE_URL}/get-offers`,
  DELETE_OFFER: `${API_BASE_URL}/delete-offer`,
};