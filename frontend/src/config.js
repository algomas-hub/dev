// Configurazione API
// Detect environment based on hostname
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment
  ? 'http://localhost:5001'  // Development: backend on localhost:5001
  : '/api';                  // Production: serverless functions on Vercel

export default API_BASE_URL;
