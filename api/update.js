const { pool, corsHeaders, handleCors, handleError } = require('./utils');

module.exports = async (req, res) => {
  // Handle CORS
  Object.entries(corsHeaders).forEach(([key, val]) => {
    res.setHeader(key, val);
  });
  
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { table, id, data } = req.body;

    if (!table || !id || !data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Table name, id, and data are required' });
    }

    const connection = await pool.getConnection();
    const setClause = Object.keys(data).map(col => `\`${col}\` = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    const query = `UPDATE \`${table}\` SET ${setClause} WHERE id = ?`;
    
    const [result] = await connection.query(query, values);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Data updated successfully',
      changedRows: result.changedRows
    });
  } catch (error) {
    handleError(res, error);
  }
};
