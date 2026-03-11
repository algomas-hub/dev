const { pool, corsHeaders, handleCors, handleError } = require('../utils');

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
    const { termine } = req.query;

    if (!termine || termine.trim().length < 3) {
      return res.status(400).json({ error: 'termine must be at least 3 characters' });
    }

    const connection = await pool.getConnection();
    const firstTerm = `%${termine.trim().split(/\s+/)[0]}%`;
    
    const searchQuery = `
      SELECT DISTINCT a.codice 
      FROM articoli a
      WHERE 
        a.codice LIKE ? OR
        a.descrizione LIKE ? OR
        a.codice_a_barre LIKE ? OR
        a.codice_fornitore LIKE ? OR
        a.codice_fornitore2 LIKE ? OR
        a.codice_fornitore3 LIKE ? OR
        a.codice_fornitore4 LIKE ? OR
        a.codice_fornitore5 LIKE ? OR
        a.codice_fornitore6 LIKE ?
      LIMIT 150
    `;

    const [searchResults] = await connection.query(searchQuery, [firstTerm, firstTerm, firstTerm, firstTerm, firstTerm, firstTerm, firstTerm, firstTerm, firstTerm]);
    
    if (searchResults.length === 0) {
      connection.release();
      return res.json({ success: true, data: [] });
    }

    const codici = searchResults.map(r => r.codice);
    
    const detailsQuery = `
      SELECT 
        a.codice,
        a.descrizione,
        a.colore,
        a.dimensioni,
        a.codice_fornitore,
        a.codice_fornitore2,
        a.codice_fornitore3,
        a.codice_fornitore4,
        a.codice_fornitore5,
        a.codice_fornitore6,
        COALESCE(SUM(CASE WHEN m.causale = 3 THEN -m.quantita ELSE m.quantita END), 0) as quantita_disponibile,
        COALESCE(ap.prezzo, 0) as prezzo_originale,
        COALESCE(ap.sconto1, 0) as sconto1,
        COALESCE(ap.sconto2, 0) as sconto2,
        CASE 
          WHEN COALESCE(ap.prezzo, 0) > 0 THEN ROUND(COALESCE(ap.prezzo, 0) * (1 - COALESCE(ap.sconto1, 0) / 100) * (1 - COALESCE(ap.sconto2, 0) / 100), 2)
          ELSE 0
        END as prezzo_scontato
      FROM articoli a
      LEFT JOIN movimenti_magazzino m ON a.codice = m.articolo
      LEFT JOIN articoli_prezzi ap ON a.codice = ap.articolo AND ap.listino = 'BASE'
      WHERE a.codice IN (${codici.map(() => '?').join(',')})
      GROUP BY a.codice, a.descrizione, a.colore, a.dimensioni, a.codice_fornitore, a.codice_fornitore2, a.codice_fornitore3, a.codice_fornitore4, a.codice_fornitore5, a.codice_fornitore6, ap.articolo, ap.listino, ap.prezzo, ap.sconto1, ap.sconto2
    `;

    const [rows] = await connection.query(detailsQuery, codici);
    connection.release();

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
