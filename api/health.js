const { pool, corsHeaders, handleCors, handleError } = require('./utils');

module.exports = async (req, res) => {
  Object.entries(corsHeaders).forEach(([key, val]) => {
    res.setHeader(key, val);
  });
  
  if (handleCors(req, res)) {
    return;
  }

  try {
    // Check environment variables
    const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingEnv = requiredEnv.filter(env => !process.env[env]);
    
    if (missingEnv.length > 0) {
      return res.status(400).setHeader('Content-Type', 'application/json').end(JSON.stringify({
        success: false,
        status: 'Missing environment variables',
        missing: missingEnv
      }));
    }

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify({ 
      success: true,
      status: 'Database connected successfully',
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    handleError(res, error);
  }
};
