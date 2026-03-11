const { pool, corsHeaders, handleCors, handleError } = require('./utils');

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

    const connection = await pool.getConnection();
    const query = `DELETE FROM \`${table}\` WHERE id = ?`;
    
    const [result] = await connection.query(query, [id]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Data deleted successfully'
    });
  } catch (error) {
    handleError(res, error);
  }
};
