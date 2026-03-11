const { pool, corsHeaders, handleCors, handleError } = require('../utils');

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
    const { articoli } = req.body;

    if (!articoli || !Array.isArray(articoli) || articoli.length === 0) {
      return res.status(400).json({ error: 'articoli array is required' });
    }

    const connection = await pool.getConnection();
    
    for (const item of articoli) {
      const { articolo, quantita, causale = 2, deposito = 2, note = 'aggiornamento da preventivo - scarico' } = item;
      
      if (!articolo || !quantita) {
        connection.release();
        return res.status(400).json({ error: 'articolo and quantita are required for each item' });
      }

      const query = `
        INSERT INTO movimenti_magazzino (articolo, quantita, causale, note, deposito, data)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      await connection.query(query, [articolo, quantita, causale, note, deposito]);
    }

    connection.release();
    res.status(201).json({ success: true, message: 'Movimenti registrati con successo' });
  } catch (error) {
    handleError(res, error);
  }
};
