// Configurazione API
// In produzione (Vercel): usa gli endpoint relativi
// In sviluppo locale: usa localhost
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.REACT_APP_ENV;
const API_BASE_URL = isDevelopment
  ? process.env.REACT_APP_API_URL || 'http://localhost:5000'
  : '/api';

export default API_BASE_URL;
