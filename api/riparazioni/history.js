const { poolRiparazioni, corsHeaders, handleCors, handleError } = require('../utils');

module.exports = async (req, res) => {
  Object.entries(corsHeaders).forEach(([key, val]) => {
    res.setHeader(key, val);
  });
  
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { id_riparazione } = req.query;

    if (!id_riparazione) {
      return res.status(400).json({ error: 'id_riparazione parameter is required' });
    }

    const connection = await poolRiparazioni.getConnection();
    const query = `SELECT * FROM cronostoria WHERE id_riparazione = ? ORDER BY data DESC`;
    
    const [rows] = await connection.query(query, [id_riparazione]);
    connection.release();
    
    res.json({ 
      success: true, 
      data: rows
    });
  } catch (error) {
    handleError(res, error);
  }
};
