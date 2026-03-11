// Configurazione API
// Detect environment based on hostname
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment
  ? 'http://localhost:5001'  // Development: backend locale
  : process.env.REACT_APP_API_URL || 'http://localhost:5001';  // Production: set in Vercel env vars

export default API_BASE_URL;
