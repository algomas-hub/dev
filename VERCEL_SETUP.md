# 🚀 Deploy su Vercel - ISTRUZIONI IMPORTANTI

## Errore: JSON.parse error in production?

Se ricevi: `JSON.parse: unexpected character at line 1 column 1 of the JSON data`

**La causa è:** Le variabili d'ambiente del database NON sono impostate su Vercel!

## ✅ SOLUZIONE - Aggiungi le variabili in Vercel

### Step 1: Vai al Dashboard
https://vercel.com/dashboard

### Step 2: Clicca sul tuo progetto "dev"

### Step 3: Vai a Settings → Environment Variables

### Step 4: Aggiungi queste variabili:

| Variabile | Valore |
|-----------|--------|
| `DB_HOST` | `lhcp3040.webapps.net` |
| `DB_USER` | `vq3qudhp_22qb` |
| `DB_PASSWORD` | `S36X2p]62@` |
| `DB_NAME` | `vq3qudhp_inv_qbsrls` |

### Step 5: Clicca "Save"

Vercel farà **automaticamente il redeploy** ✨

### Step 6: Verifica il deploy

1. Vai a **Deployments**
2. Aspetta che finisca (0 status dovrebbe essere ✅)
3. Clicca sul tuo progetto per testare
4. Vai a `https://tuo-dominio.vercel.app/api/health`
5. Dovresti vedere:
   ```json
   {
     "success": true,
     "status": "Database connected successfully",
     "timestamp": "2026-03-11T..."
   }
   ```

## 🔍 Debugging

Se ancora non funziona:

1. Vai su Vercel → Deployments
2. Clicca sull'ultimo deploy
3. Scorri a "Logs"
4. Cerca eventuali errori
5. If database connection fails: verifica che il server MySQL sia online

## 📝 Note

- Le variabili di ambiente sono **case-sensitive** (DB_HOST, non db_host)
- Dopo il salvataggio, il deploy è automatico
- Il deploy impiega qualche minuto
- Le variabili sono disponibili solo nelle funzioni serverless, non nel frontend

## Endpoint disponibili

Una volta configurato, questi URL funzioneranno:

```
GET  https://tuo-dominio.vercel.app/api/health                    - Test connessione
GET  https://tuo-dominio.vercel.app/api/select?table=...          - GET dati
GET  https://tuo-dominio.vercel.app/api/articoli/search?termine=... - Cerca articoli
POST https://tuo-dominio.vercel.app/api/insert                     - Inserisci dati
PUT  https://tuo-dominio.vercel.app/api/update                     - Aggiorna dati
DELETE https://tuo-dominio.vercel.app/api/delete                   - Cancella dati
```
