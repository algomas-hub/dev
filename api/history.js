const { poolRiparazioni, corsHeaders, handleCors, handleError } = require('./utils');

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
    const { cognome } = req.query;

    if (!cognome) {
      return res.status(400).json({ error: 'cognome parameter is required' });
    }

    const connection = await poolRiparazioni.getConnection();
    // Trova tutte le riparazioni con lo stesso cognome, ordinate per data_checkin desc
    const [storico] = await connection.query(
      'SELECT id, data_checkin as data, stato_riparazione as stato, problema_riscontrato, modello FROM riparazioni WHERE cognome = ? ORDER BY data_checkin DESC',
      [cognome]
    );
    connection.release();
    
    // Format dates
    const formattedData = storico.map(row => {
      if (row.data instanceof Date) {
        row.data = row.data.toISOString().split('T')[0];
      }
      return row;
    });
    
    res.json({ 
      success: true, 
      data: formattedData
    });
  } catch (error) {
    handleError(res, error);
  }
};
