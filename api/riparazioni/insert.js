const { poolRiparazioni, corsHeaders, handleCors, handleError } = require('../utils');

module.exports = async (req, res) => {
  Object.entries(corsHeaders).forEach(([key, val]) => {
    res.setHeader(key, val);
  });
  
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { table, data } = req.body;

    if (!table || !data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Table name and data are required' });
    }

    const connection = await poolRiparazioni.getConnection();
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(',');
    
    const query = `INSERT INTO \`${table}\` (${columns.map(c => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
    
    const [result] = await connection.query(query, values);
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Data inserted successfully',
      insertId: result.insertId
    });
  } catch (error) {
    handleError(res, error);
  }
};
