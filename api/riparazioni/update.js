const { poolRiparazioni, corsHeaders, handleCors, handleError } = require('../utils');

module.exports = async (req, res) => {
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

    const connection = await poolRiparazioni.getConnection();
    const columns = Object.keys(data);
    // Converti stringhe vuote a NULL per i campi data
    const values = Object.entries(data).map(([key, value]) => {
      if ((key === 'data_checkout' || key === 'data_checkin') && (value === '' || value === null)) {
        return null;
      }
      return value;
    });
    
    const setClause = columns.map(c => `\`${c}\` = ?`).join(',');
    const query = `UPDATE \`${table}\` SET ${setClause} WHERE id = ?`;
    
    const [result] = await connection.query(query, [...values, id]);
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Data updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    handleError(res, error);
  }
};
