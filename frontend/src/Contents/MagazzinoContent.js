import { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config';
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Typography,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  Stack,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Tema gestito in App.js


function MagazzinoContent() {
  const [movimenti, setMovimenti] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTermine, setSearchTermine] = useState('');
  const [currentPageParent, setCurrentPageParent] = useState(1);
  const [currentPageChild, setCurrentPageChild] = useState({});

  const searchInputRef = useRef(null);
  const rowsPerPage = 10;
  const articoliPerPage = 5;

  // Carica i movimenti magazzino al montaggio
  useEffect(() => {
    fetchMovimenti('');
  }, []);

  // Mantieni il focus sul campo ricerca
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  // Effetto per ricerca automatica
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPageParent(1);
      setCurrentPageChild({});
      if (searchTermine.trim().length >= 3) {
        fetchMovimenti(searchTermine);
      } else if (searchTermine.trim().length === 0) {
        fetchMovimenti('');
      }
    }, 2000); // Debounce di 2 secondi

    return () => clearTimeout(timer);
  }, [searchTermine]);

  const fetchMovimenti = async (termine = '') => {
    setLoading(true);
    setError(null);
    try {
      // Se c'è un filtro, usa limit 500. Senza filtro, carica più dati per avere tutti gli articoli
      const limit = termine.trim() ? 500 : 5000;
      let url = `${API_BASE_URL}/api/magazzino?limit=${limit}`;
      
      if (termine.trim()) {
        // Ricerca nel codice articolo
        url += `&articolo=${encodeURIComponent(termine.trim())}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Errore: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Ordina per data crescente
        const movimentiOrdinati = data.data.sort((a, b) => {
          const dataA = new Date(a.data || a.date || 0);
          const dataB = new Date(b.data || b.date || 0);
          return dataA - dataB;
        });
        setMovimenti(movimentiOrdinati);
      } else {
        setError(data.error || 'Errore nel caricamento dei dati');
      }
    } catch (err) {
      setError(err.message || 'Errore nella connessione al server');
    } finally {
      setLoading(false);
    }
  };

  // Calcola il segno della quantità basato su causale
  const getQuantitaConSegno = (movimento) => {
    const quantita = parseFloat(movimento.quantita) || 0;
    const causale = movimento.causale || '';
    
    // Logica corretta:
    // Causale 2 = aggiunge quantità (positivo)
    // Causale 3 = toglie quantità (negativo)
    if (causale === '2' || causale === 2) {
      return quantita;
    } else if (causale === '3' || causale === 3) {
      return -quantita;
    }
    return quantita; // Default positivo
  };

  // Calcola il totale delle quantità
  const getTotaleQuantita = () => {
    if (movimenti.length === 0) return 0;
    return movimenti.reduce((total, movimento) => {
      return total + getQuantitaConSegno(movimento);
    }, 0);
  };

  // Raggruppa i movimenti per articolo
  const getMovimentiPerArticolo = () => {
    const articoli = {};
    
    movimenti.forEach(movimento => {
      const articolo = movimento.articolo || 'N/A';
      if (!articoli[articolo]) {
        articoli[articolo] = [];
      }
      articoli[articolo].push(movimento);
    });
    
    return articoli;
  };

  // Calcola il totale per articolo
  const getTotalePerArticolo = (movimentiArticolo) => {
    return movimentiArticolo.reduce((total, movimento) => {
      return total + getQuantitaConSegno(movimento);
    }, 0);
  };

  // Calcola numero di pagine per articolo
  const getPageCount = (movimentiArticolo) => {
    return Math.ceil(movimentiArticolo.length / rowsPerPage);
  };

  // Ottiene i movimenti paginati per un articolo
  const getPaginatedMovimenti = (movimentiArticolo, articolo) => {
    const page = currentPageChild[articolo] || 1;
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return movimentiArticolo.slice(startIdx, endIdx);
  };

  // Paginazione per articoli
  const getArticoliPaginati = () => {
    const articoli = Object.entries(getMovimentiPerArticolo());
    const startIdx = (currentPageParent - 1) * articoliPerPage;
    const endIdx = startIdx + articoliPerPage;
    return articoli.slice(startIdx, endIdx);
  };

  // Numero di pagine per articoli
  const getTotalArticoliPages = () => {
    return Math.ceil(Object.keys(getMovimentiPerArticolo()).length / articoliPerPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          📦 Movimenti Magazzino
        </Typography>

        {/* Barra di Ricerca */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              ref={searchInputRef}
              fullWidth
              label="Ricerca Articoli"
              variant="outlined"
              size="small"
              value={searchTermine}
              onChange={(e) => setSearchTermine(e.target.value)}
              placeholder="Digita almeno 3 caratteri..."
              disabled={loading}
              autoFocus={true}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SearchIcon color="action" />
                    )}
                  </InputAdornment>
                ),
              }}
            />
        </Box>
        {searchTermine && (
          <Typography variant="body2" sx={{ color: '#FF9800', fontStyle: 'italic' }}>
            ✓ Ricerca attiva: "<strong>{searchTermine}</strong>"
          </Typography>
        )}
      </Paper>

      {/* Messaggi di Errore */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabella Movimenti */}
      {!loading && !error && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#FF9800', fontWeight: 'bold' }}>
            📋 Trovati {movimenti.length} movimenti
          </Typography>

          {movimenti.length > 0 ? (
            <Box sx={{ flex: 1, overflow: 'auto' }}>
          {getArticoliPaginati().map(([articolo, movimentiArticolo]) => {
                const totaleArticolo = getTotalePerArticolo(movimentiArticolo);
                const descrizione = (movimentiArticolo[0]?.descrizione || '-').replace(/\[.*?\]/g, '').trim().toUpperCase();
                const marca = String(movimentiArticolo[0]?.marca_estratto || movimentiArticolo[0]?.fornitore || '-');
                const colore = String(movimentiArticolo[0]?.colore_estratto || movimentiArticolo[0]?.colore || '-');
                const taglia = String(movimentiArticolo[0]?.taglia_estratta || movimentiArticolo[0]?.dimensioni || '-');
                return (
                  <Accordion 
                    key={articolo} 
                    sx={{ 
                      mb: 2, 
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      '&:before': {
                        display: 'none',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                        borderBottom: '1px solid #e0e0e0',
                        '&:hover': {
                          backgroundColor: '#eeeeee',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', justifyContent: 'space-between', flexWrap: 'nowrap', overflowX: 'auto' }}>
                        <Typography sx={{ fontWeight: 'bold', color: '#FF9800', minWidth: '100px', whiteSpace: 'nowrap' }}>
                          📦 {articolo}
                        </Typography>
                        <Typography sx={{ 
                          color: '#666666', 
                          fontSize: '0.85rem',
                          maxWidth: '350px',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                          lineHeight: '1.3',
                          flex: '0 1 auto'
                        }}>
                          {descrizione}
                        </Typography>
                        <Typography sx={{ color: '#FF9800', minWidth: '110px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                          Marca: {marca.toUpperCase()}
                        </Typography>
                        <Typography sx={{ color: '#FF9800', minWidth: '120px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                          Colore: {colore.toUpperCase()}
                        </Typography>
                        <Typography sx={{ color: '#FF9800', minWidth: '80px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                          Taglia: {taglia.toUpperCase()}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '110px', whiteSpace: 'nowrap' }}>
                          <Typography sx={{ fontWeight: 'bold', color: '#FF9800', fontSize: '18px' }}
                            >
                            {totaleArticolo > 0 ? '+' : ''}{Math.round(totaleArticolo)} pz
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#FF9800', minWidth: '80px', textAlign: 'right' }}>
                          ({movimentiArticolo.length} mov.)
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <Box sx={{ backgroundColor: '#FFFFFF', maxHeight: '500px', border: '1px solid #e0e0e0', borderRadius: '8px', overflowX: 'auto' }}>
                        <TableContainer sx={{ minWidth: 'max-content' }}>
                          <Table stickyHeader sx={{ tableLayout: 'auto' }}>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5', height: '50px' }}>
                              <TableCell sx={{ 
                                fontWeight: '600', 
                                color: '#333333',
                                borderBottom: 'none',
                                width: '80px',
                                minWidth: '80px',
                                padding: '16px 12px',
                                textAlign: 'left',
                                fontSize: '0.9rem',
                                letterSpacing: '0.5px'
                              }}>ID</TableCell>
                              <TableCell sx={{ 
                                fontWeight: '600', 
                                color: '#333333',
                                borderBottom: 'none',
                                width: '130px',
                                minWidth: '130px',
                                padding: '16px 12px',
                                textAlign: 'center',
                                fontSize: '0.9rem',
                                letterSpacing: '0.5px'
                              }}>Quantità</TableCell>
                              <TableCell sx={{ 
                                fontWeight: '600', 
                                color: '#333333',
                                borderBottom: 'none',
                                width: '150px',
                                minWidth: '150px',
                                padding: '16px 12px',
                                textAlign: 'center',
                                fontSize: '0.9rem',
                                letterSpacing: '0.5px'
                              }}>Causale</TableCell>
                              <TableCell sx={{ 
                                fontWeight: '600', 
                                color: '#333333',
                                borderBottom: 'none',
                                width: '140px',
                                minWidth: '140px',
                                padding: '16px 12px',
                                textAlign: 'center',
                                fontSize: '0.9rem',
                                letterSpacing: '0.5px'
                              }}>Data</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPaginatedMovimenti(movimentiArticolo, articolo).map((movimento, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#f9f9f9',
                                  borderBottom: '1px solid #e0e0e0',
                                  '&:hover': { backgroundColor: '#f0f0f0' },
                                  height: '55px'
                                }}
                              >
                                <TableCell sx={{ 
                                  color: '#FF9800', 
                                  fontWeight: '500', 
                                  padding: '12px',
                                  fontSize: '0.9rem',
                                  width: '80px',
                                  minWidth: '80px',
                                  textAlign: 'left',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {movimento.id || '—'}
                                </TableCell>
                                <TableCell sx={{ 
                                  padding: '12px',
                                  width: '130px',
                                  minWidth: '130px',
                                  textAlign: 'center'
                                }}>
                                  <span style={{ 
                                    fontWeight: 'bold', 
                                    color: getQuantitaConSegno(movimento) < 0 ? '#ff6b6b' : '#81C784',
                                    fontSize: '0.95rem'
                                  }}>
                                    {getQuantitaConSegno(movimento) > 0 ? '+' : ''}{Math.round(getQuantitaConSegno(movimento))}
                                  </span>
                                </TableCell>
                                <TableCell sx={{ 
                                  padding: '12px',
                                  width: '150px',
                                  minWidth: '150px',
                                  textAlign: 'center'
                                }}>
                                  <span style={{ 
                                    fontWeight: '600', 
                                    backgroundColor: movimento.causale === '2' || movimento.causale === 2 ? '#1B5E20' : '#B71C1C',
                                    color: '#fff', 
                                    padding: '6px 10px', 
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    display: 'inline-block',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {movimento.causale === '2' || movimento.causale === 2 ? '✓ Ingresso' : movimento.causale === '3' || movimento.causale === 3 ? '✗ Uscita' : movimento.causale || '—'}
                                  </span>
                                </TableCell>
                                <TableCell sx={{ 
                                  color: '#b0bec5', 
                                  padding: '12px', 
                                  fontSize: '0.9rem',
                                  width: '140px',
                                  minWidth: '140px',
                                  textAlign: 'center'
                                }}>
                                  {movimento.data || movimento.date ? new Date(movimento.data || movimento.date).toLocaleDateString('it-IT') : '—'}
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Riga di Totale per Articolo */}
                            <TableRow sx={{ 
                              backgroundColor: '#FFF8F0', 
                              borderTop: '2px solid #FF9800',
                              fontWeight: 'bold',
                              height: '55px'
                            }}>
                              <TableCell sx={{ 
                                fontWeight: 'bold', 
                                color: '#FF9800',
                                padding: '12px',
                                fontSize: '0.95rem',
                                width: '80px',
                                textAlign: 'left'
                              }}>
                                TOTALE
                              </TableCell>
                              <TableCell sx={{ 
                                padding: '12px',
                                width: '130px',
                                textAlign: 'center'
                              }}>
                                <span style={{ 
                                  fontWeight: 'bold', 
                                  color: totaleArticolo < 0 ? '#d32f2f' : '#FF9800', 
                                  fontSize: '1rem'
                                }}>
                                  {totaleArticolo > 0 ? '+' : ''}{Math.round(totaleArticolo)} pz
                                </span>
                              </TableCell>
                              <TableCell sx={{ width: '150px' }} />
                              <TableCell sx={{ width: '140px' }} />
                            </TableRow>
                          </TableBody>
                        </Table>
                        </TableContainer>
                      </Box>
                      {/* Paginazione */}
                      {getPageCount(movimentiArticolo) > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, py: 2 }}>
                          <Pagination
                            count={getPageCount(movimentiArticolo)}
                            page={currentPageChild[articolo] || 1}
                            onChange={(e, page) => setCurrentPageChild({ ...currentPageChild, [articolo]: page })}
                            color="primary"
                            sx={{
                              '& .MuiPaginationItem-root': {
                                color: '#FF9800',
                                borderColor: '#FF9800',
                              },
                              '& .MuiPaginationItem-page.Mui-selected': {
                                backgroundColor: '#FF9800',
                                color: '#fff',
                              },
                              '& .MuiPaginationItem-page:hover': {
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                              },
                            }}
                          />
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}

              {/* Paginazione Articoli */}
              {getTotalArticoliPages() > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <Pagination
                    count={getTotalArticoliPages()}
                    page={currentPageParent}
                    onChange={(e, page) => setCurrentPageParent(page)}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#FF9800',
                        borderColor: '#FF9800',
                      },
                      '& .MuiPaginationItem-page.Mui-selected': {
                        backgroundColor: '#FF9800',
                        color: '#fff',
                      },
                      '& .MuiPaginationItem-page:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      },
                    }}
                  />
                </Box>
              )}

              {/* Riga di Riepilogo Generale */}
              <Paper sx={{ p: 3, backgroundColor: '#FFF8F0', mt: 3, boxShadow: '0 2px 8px rgba(255, 152, 0, 0.15)', border: '2px solid #FF9800' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '18px', color: '#FF9800' }}>
                    💰 TOTALE GENERALE:
                  </Typography>
                  <span style={{ fontWeight: 'bold', color: getTotaleQuantita() < 0 ? '#d32f2f' : '#FF9800', fontSize: '22px' }}>
                    {getTotaleQuantita() > 0 ? '+' : ''}{Math.round(getTotaleQuantita())} pz
                  </span>
                </Box>
              </Paper>
            </Box>
          ) : (
            <Alert severity="info" sx={{ backgroundColor: 'rgba(25, 118, 210, 0.2)', color: '#64B5F6', borderColor: '#64B5F6' }}>
              ℹ️ Nessun movimento trovato
            </Alert>
          )}
        </Box>
      )}
      </Stack>
    </Box>
  );
}

export default MagazzinoContent;
