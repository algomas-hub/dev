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
    const { table, limit = 10000, offset = 0, where } = req.query;
    
    if (!table) {
      return res.status(400).json({ error: 'Table name is required' });
    }

    const connection = await poolRiparazioni.getConnection();
    let query = `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`;
    let params = [parseInt(limit), parseInt(offset)];

    if (where) {
      query = `SELECT * FROM \`${table}\` WHERE ${where} LIMIT ? OFFSET ?`;
    }

    const [rows] = await connection.query(query, params);
    connection.release();
    
    // Formatta le date al formato YYYY-MM-DD per il date picker
    const formattedRows = rows.map(row => {
      const formattedRow = { ...row };
      if (formattedRow.data_checkin && typeof formattedRow.data_checkin === 'object') {
        formattedRow.data_checkin = formattedRow.data_checkin.toISOString().split('T')[0];
      }
      if (formattedRow.data_checkout && typeof formattedRow.data_checkout === 'object') {
        formattedRow.data_checkout = formattedRow.data_checkout.toISOString().split('T')[0];
      }
      return formattedRow;
    });
    
    res.json({ success: true, data: formattedRows });
  } catch (error) {
    handleError(res, error);
  }
};
