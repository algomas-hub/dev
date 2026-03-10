import { useState, useEffect, useRef } from 'react';
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
  TableSortLabel,
  Paper,
  CircularProgress,
  Alert,
  Typography,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  IconButton,
  Snackbar,
  Chip,
  ButtonGroup,
  Stack,
  Checkbox,
  Tooltip,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';

// Tema gestito in App.js


function CassaContent() {
  const searchInputRef = useRef(null);
  const [searchCodice, setSearchCodice] = useState('');
  const [articoliRicerca, setArticoliRicerca] = useState([]);
  const [articoliSelezionati, setArticoliSelezionati] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  // Ordinamento multiplo: array di {column, order}
  const [sortCriteria, setSortCriteria] = useState([{ column: 'codice', order: 'asc' }]);
  const [sortCriteriaSelected, setSortCriteriaSelected] = useState([{ column: 'codice', order: 'asc' }]);

  // Focus su ricerca articoli al mount e dopo ogni modifica
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [articoliSelezionati]);

  // Effetto per ricerca automatica
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchCodice.trim().length >= 3) {
        handleRicerca(searchCodice);
      }
    }, 2000); // Debounce di 2 secondi

    return () => clearTimeout(timer);
  }, [searchCodice]);

  // Ricerca articoli
  const handleRicerca = async (termine) => {
    if (!termine || termine.trim().length < 3) {
      setError('Inserisci almeno 3 caratteri');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/articoli/search?termine=${encodeURIComponent(termine)}`
      );

      const data = await response.json();

      if (data.success) {
        setArticoliRicerca(data.data);
        if (data.data.length === 0) {
          setError('Nessun articolo trovato');
        }
      } else {
        setError(data.error || 'Errore nella ricerca');
      }
    } catch (err) {
      setError(`Errore: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Gestisci ordinamento multiplo tabella ricerca
  const handleSort = (column, event) => {
    if (event && event.shiftKey) {
      // Shift+click: aggiungi o rimuovi colonna dai criteri
      setSortCriteria(prev => {
        const existing = prev.find(c => c.column === column);
        if (existing) {
          // Se esiste, togli
          return prev.filter(c => c.column !== column);
        } else {
          // Se non esiste, aggiungi
          return [...prev, { column, order: 'asc' }];
        }
      });
    } else {
      // Senza Shift: questa diventa l'unico criterio
      const existing = sortCriteria.find(c => c.column === column);
      if (existing && sortCriteria.length === 1) {
        // Se è già l'unico criterio, inverti l'ordine
        setSortCriteria([{ column, order: existing.order === 'asc' ? 'desc' : 'asc' }]);
      } else {
        // Altrimenti fai diventare l'unico criterio
        setSortCriteria([{ column, order: 'asc' }]);
      }
    }
  };

  // Funzione helper per ottenere il valore da ordinare
  const getSortValue = (item, column) => {
    if (column === 'colore') {
      return (item.colore_estratto || item.colore || '');
    } else if (column === 'taglia') {
      return (item.taglia_estratta || item.dimensioni || '');
    } else if (column === 'magazzino') {
      return item.quantita_disponibile || 0;
    }
    return item[column];
  };

  // Funzione helper per renderizzare header con checkbox
  const renderHeaderWithCheckbox = (column, label, sortCriteria, setSortCriteria, handleSort) => {
    const isChecked = sortCriteria.some(c => c.column === column);
    const direction = sortCriteria.find(c => c.column === column)?.order || 'asc';
    const priority = sortCriteria.findIndex(c => c.column === column) + 1; // 1, 2, 3...
    
    const toggleCheckbox = (e) => {
      e.stopPropagation();
      if (isChecked) {
        // Togli dai criteri
        setSortCriteria(prev => prev.filter(c => c.column !== column));
      } else {
        // Aggiungi ai criteri
        setSortCriteria(prev => [...prev, { column, order: 'asc' }]);
      }
    };
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <Box sx={{ position: 'relative', width: '20px', height: '20px' }}>
          <Checkbox
            size="small"
            checked={isChecked}
            onChange={toggleCheckbox}
            sx={{
              color: '#fff',
              '&.Mui-checked': { color: '#81C784' },
              padding: '2px',
              width: '20px',
              height: '20px',
            }}
          />
          {isChecked && (
            <Box sx={{
              position: 'absolute',
              top: '0px',
              right: '-2px',
              backgroundColor: '#81C784',
              color: '#000',
              borderRadius: '50%',
              width: '14px',
              height: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
            }}>
              {priority}
            </Box>
          )}
        </Box>
        <TableSortLabel
          active={isChecked}
          direction={direction}
          onClick={(e) => {
            handleSort(column, e);
          }}
          sx={{
            '& .MuiTableSortLabel-icon': {
              color: '#fff !important',
              width: '14px',
              height: '14px',
            },
            '&.Mui-active': {
              color: '#fff',
            },
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: '#fff',
            },
            whiteSpace: 'nowrap',
            fontSize: '0.7rem',
          }}
        >
          {label}
        </TableSortLabel>
      </Box>
    );
  };

  // Ordina l'array articoliRicerca in base a sortCriteria
  const articoliOrdinati = [...articoliRicerca].sort((a, b) => {
    for (let criterion of sortCriteria) {
      const valueA = getSortValue(a, criterion.column);
      const valueB = getSortValue(b, criterion.column);

      let comparison = 0;

      // Se sono numeri, confronta numericamente
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      } else {
        // Se sono stringhe, confronta testualmente (case-insensitive)
        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        comparison = strA.localeCompare(strB);
      }

      // Se sono diversi, ritorna basandoti sull'ordine
      if (comparison !== 0) {
        return criterion.order === 'asc' ? comparison : -comparison;
      }
    }
    return 0; // Se tutti i criteri sono uguali, mantieni l'ordine
  });

  // Ordina gli articoli selezionati in base a sortCriteriaSelected
  const articoliSelezionatiOrdinati = [...articoliSelezionati].sort((a, b) => {
    for (let criterion of sortCriteriaSelected) {
      const valueA = getSortValue(a, criterion.column);
      const valueB = getSortValue(b, criterion.column);

      let comparison = 0;

      // Se sono numeri, confronta numericamente
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      } else {
        // Se sono stringhe, confronta testualmente (case-insensitive)
        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        comparison = strA.localeCompare(strB);
      }

      // Se sono diversi, ritorna basandoti sull'ordine
      if (comparison !== 0) {
        return criterion.order === 'asc' ? comparison : -comparison;
      }
    }
    return 0; // Se tutti i criteri sono uguali, mantieni l'ordine
  });

  // Gestisci ordinamento multiplo tabella selezionati
  const handleSortSelected = (column, event) => {
    if (event && event.shiftKey) {
      // Shift+click: aggiungi o rimuovi colonna dai criteri
      setSortCriteriaSelected(prev => {
        const existing = prev.find(c => c.column === column);
        if (existing) {
          // Se esiste, togli
          return prev.filter(c => c.column !== column);
        } else {
          // Se non esiste, aggiungi
          return [...prev, { column, order: 'asc' }];
        }
      });
    } else {
      // Senza Shift: questa diventa l'unico criterio
      const existing = sortCriteriaSelected.find(c => c.column === column);
      if (existing && sortCriteriaSelected.length === 1) {
        // Se è già l'unico criterio, inverti l'ordine
        setSortCriteriaSelected([{ column, order: existing.order === 'asc' ? 'desc' : 'asc' }]);
      } else {
        // Altrimenti fai diventare l'unico criterio
        setSortCriteriaSelected([{ column, order: 'asc' }]);
      }
    }
  };

  // Aggiungi articolo alla lista selezionati
  const handleAggiungi = (articolo) => {
    const giàPresente = articoliSelezionati.some(
      (item) => item.codice === articolo.codice
    );

    if (giàPresente) {
      setToastMessage('Articolo già aggiunto');
      setToastSeverity('warning');
      setOpenToast(true);
      return;
    }

    setArticoliSelezionati([
      ...articoliSelezionati,
      { ...articolo, quantita: 1 },
    ]);
    setError(null);
    setSearchCodice('');
    
    // Metti il focus su ricerca articoli dopo l'aggiunta
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.querySelector('input').focus();
      }
    }, 0);
  };

  // Aggiorna quantità
  const handleUpdateQuantita = (codice, quantita) => {
    setArticoliSelezionati(
      articoliSelezionati.map((item) =>
        item.codice === codice ? { ...item, quantita: parseInt(quantita) || 0 } : item
      )
    );
  };

  // Rimuovi articolo
  const handleRimuovi = (codice) => {
    setArticoliSelezionati(
      articoliSelezionati.filter((item) => item.codice !== codice)
    );
  };

  // Registra movimenti
  const handleAggiorna = async () => {
    if (articoliSelezionati.length === 0) {
      setError('Aggiungi almeno un articolo');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const movimenti = articoliSelezionati.map((item) => ({
        articolo: item.codice,
        quantita: Math.abs(item.quantita),
        causale: item.quantita < 0 ? 2 : 3,
        deposito: 2,
        note: item.quantita < 0 ? 'aggiornamento da preventivo - carico' : 'aggiornamento da preventivo - scarico',
      }));

      const response = await fetch('/api/movimenti/registra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articoli: movimenti }),
      });

      const data = await response.json();

      if (data.success) {
        setArticoliSelezionati([]);
        setArticoliRicerca([]);
        setSearchCodice('');
        setToastMessage(`✓ ${articoliSelezionati.length} movimenti registrati con successo!`);
        setToastSeverity('success');
        setOpenToast(true);
      } else {
        setToastMessage(data.error || 'Errore nella registrazione');
        setToastSeverity('error');
        setOpenToast(true);
      }
    } catch (err) {
      setToastMessage(`Errore: ${err.message}`);
      setToastSeverity('error');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Cassa
          </Typography>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success">
              {success}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ flex: 1 }}>
          {/* Colonna sinistra: Ricerca */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '0.95rem', fontWeight: 600 }}>
                  📋 Ricerca Articoli
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    ref={searchInputRef}
                    fullWidth
                    label="Codice, Descrizione o Fornitore"
                    value={searchCodice}
                    onChange={(e) => setSearchCodice(e.target.value)}
                    placeholder="Digita almeno 3 caratteri..."
                    disabled={loading}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SearchRoundedIcon color="action" />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                  </Box>
                </CardContent>
              </Card>

              {/* Risultati ricerca */}
              {articoliRicerca.length > 0 && (
                <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 1, p: 1 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#64B5F6', fontSize: '0.85rem' }}>
                      📋 Risultati Ricerca ({articoliRicerca.length})
                    </Typography>
                    <TableContainer sx={{ borderRadius: 1, border: '1px solid rgba(255, 255, 255, 0.1)', flex: 1, overflow: 'auto', maxHeight: 'calc(100vh - 80px)', backgroundColor: '#1A1A1A' }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#262626', height: '40px' }}>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#FF9800',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '70px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              }
                            }}>
                              {renderHeaderWithCheckbox('codice', 'Cod', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#fff',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              flex: 1,
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              }
                            }}>
                              {renderHeaderWithCheckbox('descrizione', 'Desc', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#FF9800',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '70px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              }
                            }}>
                              {renderHeaderWithCheckbox('colore', 'Col', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#FF9800',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '60px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              }
                            }}>
                              {renderHeaderWithCheckbox('taglia', 'Tag', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#fff',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '70px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              }
                            }}>
                              {renderHeaderWithCheckbox('magazzino', 'Mag', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#fff',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '80px',
                              textAlign: 'right'
                            }}>Prezzo</TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#fff',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '60px',
                              textAlign: 'center'
                            }}>Act</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {articoliOrdinati.map((articolo, index) => (
                            <TableRow 
                              key={articolo.codice}
                              sx={{ 
                                backgroundColor: index % 2 === 0 ? '#1e1e1e' : '#252525',
                                '&:hover': {
                                  backgroundColor: '#2a2a3e',
                                },
                                borderBottom: '1px solid #333333',
                                height: 'auto',
                                minHeight: '50px'
                              }}
                            >
                              <TableCell sx={{ fontSize: '0.8rem', fontWeight: '600', color: '#FF9800', padding: '12px', textAlign: 'left' }}>
                                {articolo.codice}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: '#e0e0e0', padding: '12px' }}>
                                <Tooltip title={articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase()} arrow>
                                  <Box sx={{ 
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '200px'
                                  }}>
                                    {articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase()}
                                  </Box>
                                </Tooltip>
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', color: '#FF9800', padding: '12px', fontWeight: '500' }}>
                                {(articolo.colore_estratto || articolo.colore || '—').toUpperCase()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', color: '#FF9800', padding: '12px', fontWeight: '500' }}>
                                {(articolo.taglia_estratta || articolo.dimensioni || '—').toUpperCase()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#81C784', padding: '12px', textAlign: 'center' }}>
                                {articolo.quantita_disponibile}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: '#FFD54F', padding: '8px 4px', textAlign: 'right' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {articolo.prezzo_originale && articolo.prezzo_originale > 0 ? (
                                    (articolo.sconto1 > 0 || articolo.sconto2 > 0) && articolo.prezzo_scontato && articolo.prezzo_scontato < articolo.prezzo_originale ? (
                                      <>
                                        <Box sx={{ textDecoration: 'line-through', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                                          €{parseFloat(articolo.prezzo_originale).toFixed(2)}
                                        </Box>
                                        <Box sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                          €{parseFloat(articolo.prezzo_scontato).toFixed(2)}
                                        </Box>
                                      </>
                                    ) : (
                                      <Box>€{parseFloat(articolo.prezzo_originale).toFixed(2)}</Box>
                                    )
                                  ) : (
                                    <Box sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>—</Box>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ padding: '8px 4px', textAlign: 'center' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="secondary"
                                  startIcon={<AddCircleRoundedIcon />}
                                  onClick={() => handleAggiungi(articolo)}
                                  sx={{ 
                                    textTransform: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.7rem',
                                    padding: '6px 12px',
                                    borderRadius: 0,
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 8px 20px rgba(76, 175, 80, 0.5)'
                                    },
                                    '&:active': {
                                      transform: 'translateY(0)'
                                    }
                                  }}
                                >
                                  Aggiungi
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Colonna destra: Articoli selezionati */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 1, p: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#81C784', fontSize: '0.85rem' }}>
                      🛒 Articoli da Vendere
                    </Typography>
                    <Chip
                      label={articoliSelezionati.length}
                      size="small"
                      sx={{
                        backgroundColor: '#81C784',
                        color: '#fff',
                        fontWeight: 'bold',
                        height: '24px',
                      }}
                    />
                  </Box>

                  {articoliSelezionati.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: '#666',
                      fontSize: '0.85rem'
                    }}>
                      Seleziona articoli dalla ricerca →
                    </Box>
                  ) : (
                    <>
                      <TableContainer sx={{ mb: 1, borderRadius: 1, border: '1px solid #333333', overflow: 'visible' }}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a3a1a' }}>
                              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.7rem', color: '#81C784', borderBottom: '2px solid #2e7d32', padding: '3px 4px' }}>
                                Cod
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.7rem', color: '#81C784', borderBottom: '2px solid #2e7d32', padding: '3px 4px', flex: 1 }}>
                                Desc
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.7rem', color: '#81C784', borderBottom: '2px solid #2e7d32', padding: '3px 4px', width: '60px', textAlign: 'center' }}>
                                Col
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.7rem', color: '#81C784', borderBottom: '2px solid #2e7d32', padding: '3px 4px', width: '50px', textAlign: 'center' }}>
                                Tag
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.7rem', color: '#81C784', borderBottom: '2px solid #2e7d32', padding: '3px 4px', width: '50px', textAlign: 'center' }}>
                                Qtà
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.7rem', color: '#81C784', borderBottom: '2px solid #2e7d32', padding: '3px 4px', width: '80px', textAlign: 'right' }}>
                                Prezzo
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.7rem', color: '#81C784', borderBottom: '2px solid #2e7d32', padding: '3px 4px', width: '40px', textAlign: 'center' }}>
                                ❌
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {articoliSelezionatiOrdinati.map((articolo, index) => (
                              <TableRow 
                                key={articolo.codice}
                                sx={{ 
                                  backgroundColor: index % 2 === 0 ? '#1e1e1e' : '#252525',
                                  '&:hover': {
                                    backgroundColor: '#2a3a2a',
                                    transition: 'all 0.2s ease',
                                  },
                                  borderBottom: '1px solid #333333',
                                  height: '35px'
                                }}
                              >
                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: '500', color: '#81C784', padding: '8px 12px' }}>
                                  {articolo.codice}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.75rem', color: '#e0e0e0', padding: '8px 12px', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.3' }}>
                                  {articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase()}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.75rem', color: '#90caf9', padding: '8px 12px', textAlign: 'center' }}>
                                  {(articolo.colore_estratto || articolo.colore || '—').toUpperCase()}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.75rem', color: '#90caf9', padding: '8px 12px', textAlign: 'center' }}>
                                  {(articolo.taglia_estratta || articolo.dimensioni || '—').toUpperCase()}
                                </TableCell>
                                <TableCell align="center" sx={{ padding: '8px' }}>
                                  <ButtonGroup size="small" variant="outlined" sx={{
                                    '& .MuiButton-root': {
                                      borderRadius: 0,
                                      border: '1.5px solid #00BCD4',
                                      color: '#00BCD4',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        backgroundColor: 'rgba(0, 188, 212, 0.1)',
                                        borderColor: '#00ACC1',
                                        boxShadow: '0 4px 12px rgba(0, 188, 212, 0.2)'
                                      }
                                    }
                                  }}>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        const nuovaQuantita = articolo.quantita - 1;
                                        handleUpdateQuantita(
                                          articolo.codice,
                                          nuovaQuantita === 0 ? -1 : nuovaQuantita
                                        );
                                      }}
                                      sx={{ minWidth: '32px', p: '4px' }}
                                    >
                                      <RemoveCircleRoundedIcon sx={{ fontSize: '1rem' }} />
                                    </Button>
                                    <Button
                                      disabled
                                      size="small"
                                      sx={{
                                        minWidth: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        '&.Mui-disabled': {
                                          color: '#fff',
                                        }
                                      }}
                                    >
                                      {articolo.quantita}
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        const nuovaQuantita = articolo.quantita + 1;
                                        handleUpdateQuantita(
                                          articolo.codice,
                                          nuovaQuantita === 0 ? 1 : nuovaQuantita
                                        );
                                      }}
                                      sx={{ minWidth: '32px', p: '4px' }}
                                    >
                                      <AddCircleRoundedIcon sx={{ fontSize: '1rem' }} />
                                    </Button>
                                  </ButtonGroup>
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.75rem', color: '#FFD54F', padding: '8px 4px', textAlign: 'right' }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                                    {articolo.prezzo_originale && articolo.prezzo_originale > 0 ? (
                                      (articolo.sconto1 > 0 || articolo.sconto2 > 0) && articolo.prezzo_scontato && articolo.prezzo_scontato < articolo.prezzo_originale ? (
                                        <>
                                          <Box sx={{ textDecoration: 'line-through', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                                            €{(parseFloat(articolo.prezzo_originale) * articolo.quantita).toFixed(2)}
                                          </Box>
                                          <Box sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                            €{(parseFloat(articolo.prezzo_scontato) * articolo.quantita).toFixed(2)}
                                          </Box>
                                        </>
                                      ) : (
                                        <Box>€{(parseFloat(articolo.prezzo_originale) * articolo.quantita).toFixed(2)}</Box>
                                      )
                                    ) : (
                                      <Box sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>—</Box>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell align="center" sx={{ padding: '8px' }}>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleRimuovi(articolo.codice)
                                    }
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                      }
                                    }}
                                  >
                                    <DeleteRoundedIcon sx={{ fontSize: '1.2rem' }} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Box sx={{ 
                        p: 2.5,
                        mb: 2,
                        border: '3px solid #4CAF50',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MonetizationOnRoundedIcon sx={{ fontSize: '1.5rem', color: '#FFD54F' }} />
                          <Typography sx={{ 
                            fontSize: '1rem', 
                            color: '#FFD54F', 
                            fontWeight: 'bold'
                          }}>
                            TOTALE DA PAGARE
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: '2.2rem', 
                          color: '#4CAF50', 
                          fontWeight: '900',
                          letterSpacing: '1px'
                        }}>
                          €{articoliSelezionatiOrdinati.reduce((total, articolo) => {
                            const prezzo = articolo.prezzo_scontato ? parseFloat(articolo.prezzo_scontato) : parseFloat(articolo.prezzo_originale || 0);
                            return total + (prezzo * articolo.quantita);
                          }, 0).toFixed(2)}
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={handleAggiorna}
                        disabled={loading}
                        sx={{
                          py: 1.2,
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          borderRadius: 0,
                          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                          color: '#000',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
                            boxShadow: '0 10px 30px rgba(255, 152, 0, 0.6)',
                            transform: 'translateY(-2px)'
                          },
                          '&:active': {
                            transform: 'translateY(0)'
                          },
                          '&:disabled': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.5)',
                            boxShadow: 'none',
                            transform: 'none'
                          }
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          '✓ Conferma Vendita'
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Box>
      
      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        onClose={() => setOpenToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenToast(false)} 
          severity={toastSeverity}
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CassaContent;
