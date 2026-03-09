const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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
router.get('/magazzino', async (req, res) => {
  try {
    const { articolo, descrizione, limit = 500, offset = 0 } = req.query;
    const connection = await pool.getConnection();

    let query = `
      SELECT 
        m.id,
        m.articolo,
        a.descrizione,
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
      query = `
        SELECT 
          m.id,
          m.articolo,
          a.descrizione,
          m.quantita,
          m.causale,
          m.data
        FROM movimenti_magazzino m
        LEFT JOIN articoli a ON m.articolo = a.codice
        WHERE m.articolo = ?
        ORDER BY m.data ASC
        LIMIT ? OFFSET ?
      `;
      params = [articolo.trim(), parseInt(limit), parseInt(offset)];
    } else if (descrizione && descrizione.trim()) {
      query = `
        SELECT 
          m.id,
          m.articolo,
          a.descrizione,
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
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
