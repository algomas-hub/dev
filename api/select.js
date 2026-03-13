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
    const { table, limit = 999999, offset = 0, where, id } = req.query;

    if (!table) {
      return res.status(400).json({ error: 'Table name is required' });
    }

    // Determine which database pool to use
    const isRiparazioni = ['riparazioni', 'cronostoria'].includes(table);
    const selectedPool = isRiparazioni ? poolRiparazioni : pool;

    const connection = await selectedPool.getConnection();
    let query;
    let params;

    if (id) {
      query = `SELECT * FROM \`${table}\` WHERE id = ?`;
      params = [id];
    } else if (where) {
      query = `SELECT * FROM \`${table}\` WHERE ${where} LIMIT ? OFFSET ?`;
      params = [parseInt(limit), parseInt(offset)];
    } else {
      query = `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`;
      params = [parseInt(limit), parseInt(offset)];
    }

    const [rows] = await connection.query(query, params);
    connection.release();

    if (id && rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Format dates for riparazioni table
    let formattedRows = rows;
    if (isRiparazioni && table === 'riparazioni') {
      formattedRows = rows.map(row => {
        if (row.data_checkin instanceof Date) {
          row.data_checkin = row.data_checkin.toISOString().split('T')[0];
        }
        if (row.data_checkout instanceof Date) {
          row.data_checkout = row.data_checkout.toISOString().split('T')[0];
        }
        return row;
      });
    }

    res.status(200).json({ 
      success: true, 
      data: id ? formattedRows[0] : formattedRows,
      count: formattedRows.length
    });
  } catch (error) {
    handleError(res, error);
  }
};
