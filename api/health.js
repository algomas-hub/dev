const { pool, corsHeaders, handleCors, handleError } = require('./utils');

module.exports = async (req, res) => {
  Object.entries(corsHeaders).forEach(([key, val]) => {
    res.setHeader(key, val);
  });
  
  if (handleCors(req, res)) {
    return;
  }

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.status(200).json({ 
      status: 'Database connected successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(res, error);
  }
};
