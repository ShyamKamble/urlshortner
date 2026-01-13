// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  LOGIN: `${API_BASE_URL}/login`,
  SIGNUP: `${API_BASE_URL}/signup`,
  SHORTEN: `${API_BASE_URL}/shorten`,
  USER_URLS: (userId) => `${API_BASE_URL}/user/${userId}/urls`,
  HEALTH: `${API_BASE_URL}/health`,
  TEST: `${API_BASE_URL}/api/test`
};

export default API_ENDPOINTS;