const mysql = require('mysql2/promise');
require('dotenv').config();

// Check if environment variables are set
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnv.join(', ')}`);
  console.warn('Database operations may fail. Set these in Vercel Environment Variables.');
}

// Database pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Handle CORS preflight
const handleCors = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({}));
    return true;
  }
  return false;
};

// Error handler - Always return valid JSON
const handleError = (res, error) => {
  console.error('API Error:', error);
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.setHeader('Content-Type', 'application/json');
  res.status(statusCode).end(JSON.stringify({ 
    success: false,
    error: message,
    code: error.code || 'INTERNAL_ERROR'
  }));
};

module.exports = {
  pool,
  corsHeaders,
  handleCors,
  handleError
};
