const mysql = require('mysql2/promise');
require('dotenv').config();

// Database pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
    res.status(200).json({});
    return true;
  }
  return false;
};

// Error handler
const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: error.message });
};

module.exports = {
  pool,
  corsHeaders,
  handleCors,
  handleError
};
