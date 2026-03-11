const { pool, corsHeaders, handleCors, handleError } = require('../utils');

// Estrai marca, colore e taglia dalla descrizione
const estraiDatiDescrizione = (descrizione) => {
  if (!descrizione) return { marca: null, colore: null, taglia: null };
  
  const matches = descrizione.match(/\[([^\]]+)\]/g);
  if (!matches || matches.length === 0) {
    return { marca: null, colore: null, taglia: null };
  }
  
  const marca = matches.length > 0 ? matches[0].slice(1, -1) : null;
  const colore = matches.length > 1 ? matches[1].slice(1, -1) : null;
  const taglia = matches.length > 2 ? matches[2].slice(1, -1) : null;
  
  return { marca, colore, taglia };
};

module.exports = async (req, res) => {
  // Handle CORS
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
    const { articolo, descrizione, limit = 500, offset = 0 } = req.query;
    const connection = await pool.getConnection();

    let query = `
      SELECT 
        m.id,
        m.articolo,
        a.descrizione,
        a.fornitore,
        a.colore,
        a.dimensioni,
        m.quantita,
        m.causale,
        m.data
      FROM movimenti_magazzino m
      LEFT JOIN articoli a ON m.articolo = a.codice
      ORDER BY m.data ASC
      LIMIT ? OFFSET ?
    `;
    let params = [parseInt(limit), parseInt(offset)];

    if (articolo && articolo.trim()) {
      // Ricerca sia nel codice articolo che nella descrizione
      query = `
        SELECT 
          m.id,
          m.articolo,
          a.descrizione,
          a.fornitore,
          a.colore,
          a.dimensioni,
          m.quantita,
          m.causale,
          m.data
        FROM movimenti_magazzino m
        LEFT JOIN articoli a ON m.articolo = a.codice
        WHERE m.articolo LIKE ? OR a.descrizione LIKE ?
        ORDER BY m.data ASC
        LIMIT ? OFFSET ?
      `;
      const searchTerm = `%${articolo.trim()}%`;
      params = [searchTerm, searchTerm, parseInt(limit), parseInt(offset)];
    } else if (descrizione && descrizione.trim()) {
      query = `
        SELECT 
          m.id,
          m.articolo,
          a.descrizione,
          a.fornitore,
          a.colore,
          a.dimensioni,
          m.quantita,
          m.causale,
          m.data
        FROM movimenti_magazzino m
        LEFT JOIN articoli a ON m.articolo = a.codice
        WHERE a.descrizione LIKE ?
        ORDER BY m.data ASC
        LIMIT ? OFFSET ?
      `;
      params = [`%${descrizione.trim()}%`, parseInt(limit), parseInt(offset)];
    }

    const [rows] = await connection.query(query, params);
    connection.release();

    // Estrai marca, colore e taglia dalla descrizione
    const rowsConDati = rows.map(row => {
      const { marca, colore, taglia } = estraiDatiDescrizione(row.descrizione);
      return {
        ...row,
        marca_estratto: marca,
        colore_estratto: colore,
        taglia_estratta: taglia
      };
    });

    res.status(200).json({ success: true, data: rowsConDati });
  } catch (error) {
    handleError(res, error);
  }
};
