const { pool, poolRiparazioni, corsHeaders, handleCors, handleError } = require('./utils');

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
    const { table, field } = req.query;

    if (!table || !field) {
      return res.status(400).json({ error: 'Table name and field are required' });
    }

    // Determine which database pool to use
    const isRiparazioni = ['riparazioni', 'cronostoria'].includes(table);
    const selectedPool = isRiparazioni ? poolRiparazioni : pool;

    const connection = await selectedPool.getConnection();
    const query = `SELECT DISTINCT \`${field}\` FROM \`${table}\` ORDER BY \`${field}\``;
    
    const [rows] = await connection.query(query);
    connection.release();
    
    res.json({ 
      success: true, 
      data: rows.map(row => row[field])
    });
  } catch (error) {
    handleError(res, error);
  }
};
