import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  createTheme,
  ThemeProvider,
  InputAdornment,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Crea il tema dark
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64B5F6',
    },
    secondary: {
      main: '#81C784',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function MagazzinoContent() {
  const [movimenti, setMovimenti] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchSku, setSearchSku] = useState('');
  const [searchDescrizione, setSearchDescrizione] = useState('');
  const [currentPageParent, setCurrentPageParent] = useState(1);
  const [currentPageChild, setCurrentPageChild] = useState({});
  const rowsPerPage = 10;
  const articoliPerPage = 5;

  // Carica i movimenti magazzino al montaggio
  useEffect(() => {
    fetchMovimenti();
  }, []);

  const fetchMovimenti = async (sku = '', desc = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/magazzino?limit=500';
      
      if (sku.trim()) {
        // Filtra per Articolo se fornito
        url += `&articolo=${encodeURIComponent(sku.trim())}`;
      } else if (desc.trim()) {
        // Filtra per Descrizione se fornito
        url += `&descrizione=${encodeURIComponent(desc.trim())}`;
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPageParent(1);
    setCurrentPageChild({});
    fetchMovimenti(searchSku, searchDescrizione);
  };

  const handleReset = () => {
    setSearchSku('');
    setSearchDescrizione('');
    setCurrentPageParent(1);
    setCurrentPageChild({});
    fetchMovimenti('', '');
  };

  // Calcola il segno della quantità basato su causale
  const getQuantitaConSegno = (movimento) => {
    const quantita = parseFloat(movimento.quantita) || 0;
    const causale = movimento.causale || '';
    
    // Se causale è 2 = uscito dal magazzino (positivo)
    // Se causale è 3 = aggiunto a magazzino (negativo)
    if (causale === '2' || causale === 2) {
      return Math.abs(quantita);
    }
    return -Math.abs(quantita);
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
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold', color: '#64B5F6' }}>
            📦 Movimenti Magazzino
      </Typography>

      {/* Barra di Ricerca */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#1e1e1e', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Ricerca per Articolo"
            variant="outlined"
            size="small"
            value={searchSku}
            onChange={(e) => setSearchSku(e.target.value)}
            placeholder="Es: ARTICOLO123"
            sx={{ 
              flex: 1,
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: '#64B5F6',
                },
                '&:hover fieldset': {
                  borderColor: '#81C784',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#90caf9',
                opacity: 0.7,
              },
            }}
          />
          <TextField
            label="Ricerca per Descrizione"
            variant="outlined"
            size="small"
            value={searchDescrizione}
            onChange={(e) => setSearchDescrizione(e.target.value)}
            placeholder="Es: componente"
            sx={{ 
              flex: 1,
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: '#64B5F6',
                },
                '&:hover fieldset': {
                  borderColor: '#81C784',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#90caf9',
                opacity: 0.7,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{
              backgroundColor: '#64B5F6',
              color: '#000',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#81C784',
              },
            }}
          >
            Cerca
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              borderColor: '#64B5F6',
              color: '#64B5F6',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'rgba(100, 181, 246, 0.1)',
                borderColor: '#81C784',
              },
            }}
          >
            Ripristina
          </Button>
        </Box>
        {searchSku && (
          <Typography variant="body2" sx={{ color: '#81C784', fontStyle: 'italic' }}>
            ✓ Filtro attivo: Articolo contiene "<strong>{searchSku}</strong>"
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
        <>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#90caf9', fontWeight: 'bold' }}>
            📋 Trovati {movimenti.length} movimenti
          </Typography>

          {movimenti.length > 0 ? (
            <>
              {getArticoliPaginati().map(([articolo, movimentiArticolo]) => {
                const totaleArticolo = getTotalePerArticolo(movimentiArticolo);
                const descrizione = movimentiArticolo[0]?.descrizione || '-';
                return (
                  <Accordion 
                    key={articolo} 
                    sx={{ 
                      mb: 2, 
                      backgroundColor: '#1e1e1e',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                      '&:before': {
                        display: 'none',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        backgroundColor: '#2a2a2a',
                        fontWeight: 'bold',
                        borderBottom: '1px solid #3a3a3a',
                        '&:hover': {
                          backgroundColor: '#333333',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 'bold', color: '#64B5F6', width: '180px' }}>
                          📦 {articolo}
                        </Typography>
                        <Typography sx={{ color: '#b0bec5', width: '300px', fontSize: '0.95rem' }}>
                          {descrizione}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px' }}>
                          <Typography sx={{ fontWeight: 'bold', color: '#64B5F6', fontSize: '18px' }}>
                            {totaleArticolo > 0 ? '+' : ''}{Math.round(totaleArticolo)} pz
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#90caf9', width: '80px', textAlign: 'right' }}>
                          ({movimentiArticolo.length} mov.)
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer sx={{ backgroundColor: '#1e1e1e' }}>
                        <Table sx={{ minWidth: 650 }}>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#2a2a2a', borderBottom: '2px solid #3a3a3a' }}>
                              <TableCell sx={{ fontWeight: 'bold', color: '#64B5F6', width: '10%' }}>ID</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold', color: '#64B5F6', width: '20%' }}>Quantità</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold', color: '#64B5F6', width: '30%' }}>Causale</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold', color: '#64B5F6', width: '40%' }}>Data</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPaginatedMovimenti(movimentiArticolo, articolo).map((movimento, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  backgroundColor: '#1e1e1e',
                                  borderBottom: '1px solid #3a3a3a',
                                  '&:nth-of-type(odd)': { backgroundColor: '#252525' },
                                  '&:hover': { backgroundColor: '#2f2f2f' },
                                  color: '#fff',
                                }}
                              >
                                <TableCell sx={{ color: '#b0bec5', width: '10%' }}>{movimento.id || '-'}</TableCell>
                                <TableCell align="center" sx={{ color: '#b0bec5', width: '20%' }}>
                                  <span style={{ fontWeight: 'bold', color: getQuantitaConSegno(movimento) < 0 ? '#ff6b6b' : '#81C784' }}>
                                    {getQuantitaConSegno(movimento) > 0 ? '+' : ''}{Math.round(getQuantitaConSegno(movimento))}
                                  </span>
                                </TableCell>
                                <TableCell align="center" sx={{ width: '30%' }}>
                                  <span style={{ fontWeight: 'bold', backgroundColor: '#2a2a2a', color: '#fff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #3a3a3a', display: 'inline-block' }}>
                                    {movimento.causale === '2' || movimento.causale === 2 ? '✓ Ingresso' : movimento.causale === '3' || movimento.causale === 3 ? '✗ Uscita' : movimento.causale || '-'}
                                  </span>
                                </TableCell>
                                <TableCell align="center" sx={{ color: '#b0bec5', width: '40%' }}>{movimento.data || movimento.date ? new Date(movimento.data || movimento.date).toLocaleDateString('it-IT') : '-'}</TableCell>
                              </TableRow>
                            ))}
                            {/* Riga di Totale per Articolo */}
                            <TableRow sx={{ backgroundColor: '#2a2a2a', borderTop: '2px solid #3a3a3a', fontWeight: 'bold' }}>
                              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', color: '#64B5F6', width: '10%' }}>
                                TOTALE:
                              </TableCell>
                              <TableCell align="center">
                                <span style={{ fontWeight: 'bold', color: totaleArticolo < 0 ? '#ff6b6b' : '#81C784', fontSize: '15px' }}>
                                  {totaleArticolo > 0 ? '+' : ''}{Math.round(totaleArticolo)} pz
                                </span>
                              </TableCell>
                              <TableCell colSpan="2" />
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
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
                                color: '#64B5F6',
                                borderColor: '#64B5F6',
                              },
                              '& .MuiPaginationItem-page.Mui-selected': {
                                backgroundColor: '#64B5F6',
                                color: '#000',
                              },
                              '& .MuiPaginationItem-page:hover': {
                                backgroundColor: 'rgba(100, 181, 246, 0.1)',
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
                        color: '#64B5F6',
                        borderColor: '#64B5F6',
                      },
                      '& .MuiPaginationItem-page.Mui-selected': {
                        backgroundColor: '#64B5F6',
                        color: '#000',
                      },
                      '& .MuiPaginationItem-page:hover': {
                        backgroundColor: 'rgba(100, 181, 246, 0.1)',
                      },
                    }}
                  />
                </Box>
              )}

              {/* Riga di Riepilogo Generale */}
              <Paper sx={{ p: 3, backgroundColor: '#2a2a2a', mt: 3, boxShadow: '0 6px 24px rgba(100, 181, 246, 0.2)', border: '2px solid #64B5F6' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '18px', color: '#64B5F6' }}>
                    💰 TOTALE GENERALE:
                  </Typography>
                  <span style={{ fontWeight: 'bold', color: getTotaleQuantita() < 0 ? '#ff6b6b' : '#81C784', fontSize: '22px' }}>
                    {getTotaleQuantita() > 0 ? '+' : ''}{Math.round(getTotaleQuantita())} pz
                  </span>
                </Box>
              </Paper>
            </>
          ) : (
            <Alert severity="info" sx={{ backgroundColor: 'rgba(25, 118, 210, 0.2)', color: '#64B5F6', borderColor: '#64B5F6' }}>
              ℹ️ Nessun movimento trovato
            </Alert>
          )}
        </>
      )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default MagazzinoContent;
