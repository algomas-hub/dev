const express = require('express');
const { corsHeaders, handleCors } = require('./api/utils');

const app = express();

// Middleware
app.use(express.json());

// Strip /api prefix if present (for Vercel routing)
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.slice(4); // Remove /api prefix
  } else if (req.url === '/api') {
    req.url = '';
  }
  
  // CORS headers
  Object.entries(corsHeaders).forEach(([key, val]) => {
    res.setHeader(key, val);
  });
  
  if (handleCors(req, res)) {
    return;
  }
  
  next();
});

// Import handlers
const healthHandler = require('./api/health');
const selectHandler = require('./api/select');
const insertHandler = require('./api/insert');
const updateHandler = require('./api/update');
const deleteHandler = require('./api/delete');
const magazzinoHandler = require('./api/magazzino');
const articoliSearchHandler = require('./api/articoli/search');
const movimentiRegistraHandler = require('./api/movimenti/registra');

// Register routes
app.get('/health', healthHandler);
app.get('/select', selectHandler);
app.post('/insert', insertHandler);
app.put('/update', updateHandler);
app.delete('/delete', deleteHandler);
app.get('/magazzino', magazzinoHandler);
app.get('/articoli/search', articoliSearchHandler);
app.post('/movimenti/registra', movimentiRegistraHandler);

// Catch-all 404
app.use((req, res) => {
  res.status(404).setHeader('Content-Type', 'application/json').end(
    JSON.stringify({ error: 'Not Found', message: `Route ${req.method} ${req.path} not found` })
  );
});

// Export as serverless handler for Vercel
module.exports = (req, res) => {
  return app(req, res);
};
