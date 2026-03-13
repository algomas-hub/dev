const { poolRiparazioni, corsHeaders, handleCors, handleError } = require('../utils');

module.exports = async (req, res) => {
  Object.entries(corsHeaders).forEach(([key, val]) => {
    res.setHeader(key, val);
  });
  
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { table, id } = req.body;

    if (!table || !id) {
      return res.status(400).json({ error: 'Table name and id are required' });
    }

    const connection = await poolRiparazioni.getConnection();
    const query = `DELETE FROM \`${table}\` WHERE id = ?`;
    
    const [result] = await connection.query(query, [id]);
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Data deleted successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    handleError(res, error);
  }
};
