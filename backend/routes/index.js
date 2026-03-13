
const express = require('express');
const router = express.Router();
const { pool, poolRiparazioni } = require('../config/db');

// GET - Cronostoria riparazioni per cliente (basata su cognome)
// Uso: GET /api/riparazioni/history?cognome=ROSSI
router.get('/riparazioni/history', async (req, res) => {
  try {
    const { cognome } = req.query;
    if (!cognome) {
      return res.status(400).json({ error: 'cognome is required' });
    }
    const connection = await poolRiparazioni.getConnection();
    // Trova tutte le riparazioni con lo stesso cognome, ordinate per data_checkin desc
    const [storico] = await connection.query(
      'SELECT id, data_checkin as data, stato_riparazione as stato, problema_riscontrato, modello FROM riparazioni WHERE cognome = ? ORDER BY data_checkin DESC',
      [cognome]
    );
    connection.release();
    res.json({ success: true, data: storico });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Funzione per estrarre marca, colore e taglia dalla descrizione
// Formato: [marca] nome [colore] [taglia]
const estraiDatiDescrizione = (descrizione) => {
  if (!descrizione) return { marca: null, colore: null, taglia: null };
  
  const matches = descrizione.match(/\[([^\]]+)\]/g);
  if (!matches || matches.length === 0) {
    return { marca: null, colore: null, taglia: null };
  }
  
  const marca = matches.length > 0 ? matches[0].slice(1, -1) : null; // Prima parentesi
  const colore = matches.length > 1 ? matches[1].slice(1, -1) : null; // Seconda parentesi
  const taglia = matches.length > 2 ? matches[2].slice(1, -1) : null; // Terza parentesi
  
  return { marca, colore, taglia };
};

// GET - Recupera dati da una tabella
// Uso: GET /api/select?table=nome_tabella&limit=10
router.get('/select', async (req, res) => {
  try {
    const { table, limit = 100, offset = 0, where } = req.query;
    
    if (!table) {
      return res.status(400).json({ error: 'Table name is required' });
    }

    const connection = await pool.getConnection();
    let query = `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`;
    let params = [parseInt(limit), parseInt(offset)];

    if (where) {
      query = `SELECT * FROM \`${table}\` WHERE ${where} LIMIT ? OFFSET ?`;
    }

    const [rows] = await connection.query(query, params);
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Recupera un singolo record
// Uso: GET /api/select/:table/:id
router.get('/select/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      `SELECT * FROM \`${table}\` WHERE id = ?`,
      [id]
    );
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Inserisci nuovi dati
// Uso: POST /api/insert con body: { table: "nome_tabella", data: { col1: "val1", col2: "val2" } }
router.post('/insert', async (req, res) => {
  try {
    const { table, data } = req.body;

    if (!table || !data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Table name and data are required' });
    }

    const connection = await pool.getConnection();
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(',');
    
    const query = `INSERT INTO \`${table}\` (${columns.map(c => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
    
    const [result] = await connection.query(query, values);
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Data inserted successfully',
      insertId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Aggiorna dati
// Uso: PUT /api/update con body: { table: "nome_tabella", id: 1, data: { col1: "nuovo_valore" } }
router.put('/update', async (req, res) => {
  try {
    const { table, id, data } = req.body;

    if (!table || !id || !data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Table name, id, and data are required' });
    }

    const connection = await pool.getConnection();
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = columns.map(c => `\`${c}\` = ?`).join(',');
    const query = `UPDATE \`${table}\` SET ${setClause} WHERE id = ?`;
    
    const [result] = await connection.query(query, [...values, id]);
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Data updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Cancella dati
// Uso: DELETE /api/delete?table=nome_tabella&id=1
router.delete('/delete', async (req, res) => {
  try {
    const { table, id } = req.query;

    if (!table || !id) {
      return res.status(400).json({ error: 'Table name and id are required' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `DELETE FROM \`${table}\` WHERE id = ?`,
      [id]
    );
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Data deleted successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Informazioni sui databases e tabelle
router.get('/databases', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [databases] = await connection.query('SHOW DATABASES');
    connection.release();
    res.json({ success: true, data: databases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Tabelle di un database
router.get('/tables/:database', async (req, res) => {
  try {
    const { database } = req.params;
    const connection = await pool.getConnection();
    const [tables] = await connection.query(
      'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
      [database]
    );
    connection.release();
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Schema di una tabella
router.get('/schema/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const connection = await pool.getConnection();
    const [schema] = await connection.query(`DESCRIBE \`${table}\``);
    connection.release();
    res.json({ success: true, data: schema });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET - Movimenti Magazzino con JOIN Articoli
// Uso: GET /api/magazzino?articolo=EH19AR-ETS&limit=500
// Uso: GET /api/magazzino?descrizione=componente&limit=500
// Ricerca in: codice articolo E descrizione
router.get('/magazzino', async (req, res) => {
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

    res.json({ success: true, data: rowsConDati });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Ricerca articoli per codice, descrizione e codice_fornitore
// Uso: GET /api/articoli/search?termine=ABC123
// Cerca in: codice, descrizione (originale con parentesi), codice_fornitore (1-6) e ritorna quantità disponibile
router.get('/articoli/search', async (req, res) => {
  try {
    const { termine } = req.query;

    if (!termine || termine.trim().length < 3) {
      return res.status(400).json({ error: 'termine must be at least 3 characters' });
    }

    const connection = await pool.getConnection();
    const fullTerm = `%${termine.trim()}%`;

    // Ricerca diretta e precisa su tutte le colonne rilevanti
    const searchQuery = `
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
      GROUP BY a.codice, a.descrizione, a.colore, a.dimensioni, a.codice_fornitore, a.codice_fornitore2, a.codice_fornitore3, a.codice_fornitore4, a.codice_fornitore5, a.codice_fornitore6, ap.articolo, ap.listino, ap.prezzo, ap.sconto1, ap.sconto2
      LIMIT 150
    `;

    const [rows] = await connection.query(searchQuery, [fullTerm, fullTerm, fullTerm, fullTerm, fullTerm, fullTerm, fullTerm, fullTerm, fullTerm]);
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

    res.json({ success: true, data: rowsConDati });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Registra movimento magazzino
// Uso: POST /api/movimenti/registra con body: { articolo: "ABC123", quantita: 5, causale: 2, deposito: 2, note: "..." }
router.post('/movimenti/registra', async (req, res) => {
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
    res.json({ success: true, message: 'Movimenti registrati con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Prodotti più venduti (articoli EXE- con quantità vendute)
// Usa: GET /api/top-products?limit=10
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const connection = await pool.getConnection();

    const query = `
      SELECT 
        m.articolo as codice,
        a.descrizione,
        a.colore,
        a.dimensioni,
        SUM(m.quantita) as quantita_vendute,
        COALESCE(ap.prezzo, 0) as prezzo_originale,
        COALESCE(ap.sconto1, 0) as sconto1,
        COALESCE(ap.sconto2, 0) as sconto2,
        CASE 
          WHEN COALESCE(ap.prezzo, 0) > 0 THEN ROUND(COALESCE(ap.prezzo, 0) * (1 - COALESCE(ap.sconto1, 0) / 100) * (1 - COALESCE(ap.sconto2, 0) / 100), 2)
          ELSE 0
        END as prezzo_scontato
      FROM movimenti_magazzino m
      LEFT JOIN articoli a ON m.articolo = a.codice
      LEFT JOIN articoli_prezzi ap ON m.articolo = ap.articolo AND ap.listino = 'BASE'
      WHERE m.note = 'aggiornamento da preventivo - scarico' AND YEAR(m.data) = YEAR(CURDATE())
      GROUP BY m.articolo, a.descrizione, a.colore, a.dimensioni, ap.articolo, ap.listino, ap.prezzo, ap.sconto1, ap.sconto2
      ORDER BY quantita_vendute DESC
      LIMIT ?
    `;

    const [rows] = await connection.query(query, [parseInt(limit)]);
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

    res.json({ success: true, data: rowsConDati });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RIPARAZIONI DATABASE ====================

// GET - Recupera dati da una tabella del database riparazioni
// Uso: GET /api/riparazioni/select?table=nome_tabella&limit=10
router.get('/riparazioni/select', async (req, res) => {
  try {
    const { table, limit = 100, offset = 0, where } = req.query;
    
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
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Recupera un singolo record dal database riparazioni
// Uso: GET /api/riparazioni/select/:table/:id
router.get('/riparazioni/select/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const connection = await poolRiparazioni.getConnection();
    
    const [rows] = await connection.query(
      `SELECT * FROM \`${table}\` WHERE id = ?`,
      [id]
    );
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Inserisci nuovi dati nel database riparazioni
// Uso: POST /api/riparazioni/insert con body: { table: "nome_tabella", data: { col1: "val1", col2: "val2" } }
router.post('/riparazioni/insert', async (req, res) => {
  try {
    const { table, data } = req.body;

    if (!table || !data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Table name and data are required' });
    }

    const connection = await poolRiparazioni.getConnection();
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(',');
    
    const query = `INSERT INTO \`${table}\` (${columns.map(c => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
    
    const [result] = await connection.query(query, values);
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Data inserted successfully',
      insertId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Aggiorna dati nel database riparazioni
// Uso: PUT /api/riparazioni/update con body: { table: "nome_tabella", id: 1, data: { col1: "nuovo_valore" } }
router.put('/riparazioni/update', async (req, res) => {
  try {
    const { table, id, data } = req.body;

    if (!table || !id || !data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Table name, id, and data are required' });
    }

    const connection = await poolRiparazioni.getConnection();
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = columns.map(c => `\`${c}\` = ?`).join(',');
    const query = `UPDATE \`${table}\` SET ${setClause} WHERE id = ?`;
    
    const [result] = await connection.query(query, [...values, id]);
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Data updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Cancella dati dal database riparazioni
// Uso: DELETE /api/riparazioni/delete?table=nome_tabella&id=1
router.delete('/riparazioni/delete', async (req, res) => {
  try {
    const { table, id } = req.query;

    if (!table || !id) {
      return res.status(400).json({ error: 'Table name and id are required' });
    }

    const connection = await poolRiparazioni.getConnection();
    const [result] = await connection.query(
      `DELETE FROM \`${table}\` WHERE id = ?`,
      [id]
    );
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Data deleted successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Recupera tabelle del database riparazioni
router.get('/riparazioni/tables', async (req, res) => {
  try {
    const connection = await poolRiparazioni.getConnection();
    const [tables] = await connection.query(
      'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
      ['vq3qudhp_riparazioni']
    );
    connection.release();
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Schema di una tabella nel database riparazioni
// Uso: GET /api/riparazioni/schema/:table
router.get('/riparazioni/schema/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const connection = await poolRiparazioni.getConnection();
    const [schema] = await connection.query(`DESCRIBE \`${table}\``);
    connection.release();
    res.json({ success: true, data: schema });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Valori unici di uno specifico campo
// Uso: GET /api/riparazioni/distinct?table=riparazioni&field=stato_riparazione
router.get('/riparazioni/distinct', async (req, res) => {
  try {
    const { table, field } = req.query;

    if (!table || !field) {
      return res.status(400).json({ error: 'Table and field are required' });
    }

    const connection = await poolRiparazioni.getConnection();
    const [results] = await connection.query(
      `SELECT DISTINCT \`${field}\` FROM \`${table}\` WHERE \`${field}\` IS NOT NULL AND \`${field}\` != '' ORDER BY \`${field}\` ASC`
    );
    connection.release();

    const values = results.map(row => row[field]).filter(val => val && String(val).trim() !== '');
    res.json({ success: true, data: values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
