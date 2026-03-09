# Backend API

Backend Node.js con Express per connettersi al database MySQL.

## Setup

1. Installa dipendenze:
```bash
npm install
```

2. Configura le variabili d'ambiente in `.env` (già fatto)

3. Avvia il server:
```bash
npm start
```

Per lo sviluppo con auto-reload:
```bash
npm run dev
```

## Endpoints

### Health Check
- `GET /health` - Verifica connessione database

### SELECT (Lettura dati)
- `GET /api/select?table=nome_tabella&limit=10&offset=0`
  - Recupera dati da una tabella
  - `table` (required): nome della tabella
  - `limit` (optional, default 100): numero di record
  - `offset` (optional, default 0): skip di record
  - `where` (optional): condizione WHERE
  
- `GET /api/select/:table/:id`
  - Recupera un singolo record per ID

### INSERT (Creazione dati)
- `POST /api/insert`
  ```json
  {
    "table": "nome_tabella",
    "data": {
      "colonna1": "valore1",
      "colonna2": "valore2"
    }
  }
  ```

### UPDATE (Modifica dati)
- `PUT /api/update`
  ```json
  {
    "table": "nome_tabella",
    "id": 1,
    "data": {
      "colonna1": "nuovo_valore"
    }
  }
  ```

### DELETE (Cancellazione dati)
- `DELETE /api/delete?table=nome_tabella&id=1`

### Utilità
- `GET /api/databases` - Elenca tutti i database
- `GET /api/tables/:database` - Elenca tabelle di un database
- `GET /api/schema/:table` - Visualizza struttura di una tabella

## Uso nel Frontend React

```javascript
// GET - Recupera dati
fetch('/api/select?table=users&limit=10')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// POST - Inserisci
fetch('/api/insert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    table: 'users',
    data: { name: 'John', email: 'john@example.com' }
  })
})
  .then(res => res.json())
  .then(data => console.log(data));

// PUT - Aggiorna
fetch('/api/update', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    table: 'users',
    id: 1,
    data: { name: 'Jane' }
  })
})
  .then(res => res.json())
  .then(data => console.log(data));

// DELETE - Cancella
fetch('/api/delete?table=users&id=1', { method: 'DELETE' })
  .then(res => res.json())
  .then(data => console.log(data));
```

## Configurazione

Le credenziali database sono in `.env`:
```
DB_HOST=lhcp3040.webapps.net
DB_USER=vq3qudhp_22qb
DB_PASSWORD=S36X2p]62@
DB_NAME=vq3qudhp_inv_qbsrls
PORT=5001
```

Il frontend è configurato con proxy `http://localhost:5001` in `frontend/package.json`
