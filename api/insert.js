const { pool, poolRiparazioni, corsHeaders, handleCors, handleError } = require('./utils');

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

    // Determine which database pool to use
    const isRiparazioni = ['riparazioni', 'cronostoria'].includes(table);
    const selectedPool = isRiparazioni ? poolRiparazioni : pool;

    const connection = await selectedPool.getConnection();
    const columns = Object.keys(data);
    // Converti stringhe vuote a NULL per i campi data in riparazioni
    const values = isRiparazioni ? Object.entries(data).map(([key, value]) => {
      if ((key === 'data_checkout' || key === 'data_checkin') && (value === '' || value === null)) {
        return null;
      }
      return value;
    }) : Object.values(data);
    const placeholders = columns.map(() => '?').join(',');
    
    const query = `INSERT INTO \`${table}\` (${columns.map(c => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
    
    const [result] = await connection.query(query, values);
    connection.release();
    
    res.status(201).json({ 
      success: true, 
      message: 'Data inserted successfully',
      insertId: result.insertId
    });
  } catch (error) {
    handleError(res, error);
  }
};
