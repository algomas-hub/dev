const { pool, poolRiparazioni, corsHeaders, handleCors, handleError } = require('./utils');

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

    // Determine which database pool to use
    const isRiparazioni = ['riparazioni', 'cronostoria'].includes(table);
    const selectedPool = isRiparazioni ? poolRiparazioni : pool;

    const connection = await selectedPool.getConnection();
    const setClause = Object.keys(data).map(col => `\`${col}\` = ?`).join(', ');
    // Converti stringhe vuote a NULL per i campi data in riparazioni
    const dataValues = isRiparazioni ? Object.entries(data).map(([key, value]) => {
      if ((key === 'data_checkout' || key === 'data_checkin') && (value === '' || value === null)) {
        return null;
      }
      return value;
    }) : Object.values(data);
    const values = [...dataValues, id];
    
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
