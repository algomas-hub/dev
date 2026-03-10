import { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config';
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Alert,
  Typography,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  IconButton,
  Snackbar,
  ButtonGroup,
  Stack,
  Checkbox,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  // Ordinamento multiplo: array di {column, order}
  const [sortCriteria, setSortCriteria] = useState([{ column: 'codice', order: 'asc' }]);
  const [sortCriteriaSelected] = useState([{ column: 'codice', order: 'asc' }]);

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
        `${API_BASE_URL}/api/articoli/search?termine=${encodeURIComponent(termine)}`
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
              color: '#FF9800 !important',
              width: '14px',
              height: '14px',
            },
            '&.Mui-active': {
              color: '#FF9800',
            },
            color: '#FF9800',
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
  const handleAggiorna = () => {
    if (articoliSelezionati.length === 0) {
      setError('Aggiungi almeno un articolo');
      return;
    }
    // Mostra il dialog di conferma
    setOpenConfirmDialog(true);
  };

  const handleConfirmVendita = async () => {
    setOpenConfirmDialog(false);
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

      const response = await fetch(`${API_BASE_URL}/api/movimenti/registra`, {
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
                    <Box sx={{ borderRadius: 1, border: '1px solid #e0e0e0', flex: 1, overflow: 'auto', maxHeight: 'calc(100vh - 80px)', backgroundColor: '#FFFFFF', overflowX: 'auto' }}>
                      <TableContainer sx={{ minWidth: 'max-content' }}>
                        <Table stickyHeader>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5', height: '40px' }}>
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
                              color: '#333333',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              flex: 1,
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: '#eeeeee',
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
                              color: '#333333',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '60px',
                              minWidth: '60px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: '#eeeeee',
                              }
                            }}>
                              {renderHeaderWithCheckbox('taglia', 'Tag', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#333333',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '70px',
                              minWidth: '70px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: '#eeeeee',
                              }
                            }}>
                              {renderHeaderWithCheckbox('magazzino', 'Mag', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#333333',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '80px',
                              minWidth: '80px',
                              textAlign: 'right'
                            }}>Prezzo</TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#333333',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '60px',
                              minWidth: '60px',
                              textAlign: 'center'
                            }}>Act</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {articoliOrdinati.map((articolo, index) => (
                            <TableRow 
                              key={articolo.codice}
                              sx={{ 
                                backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#f9f9f9',
                                '&:hover': {
                                  backgroundColor: '#f0f0f0',
                                },
                                borderBottom: '1px solid #e0e0e0',
                                height: 'auto',
                                minHeight: '40px'
                              }}
                            >
                              <TableCell sx={{ fontSize: '0.7rem', fontWeight: '600', color: '#333333', padding: '8px', textAlign: 'left' }}>
                                {articolo.codice}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.65rem', color: '#333333', padding: '8px' }}>
                                <Tooltip title={articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase()} arrow>
                                  <Box sx={{ 
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '220px'
                                  }}>
                                    {articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase()}
                                  </Box>
                                </Tooltip>
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.7rem', color: '#FF9800', padding: '8px', fontWeight: '500' }}>
                                {(articolo.colore_estratto || articolo.colore || '—').toUpperCase()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.7rem', color: '#FF9800', padding: '8px', fontWeight: '500' }}>
                                {(articolo.taglia_estratta || articolo.dimensioni || '—').toUpperCase()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#81C784', padding: '8px', textAlign: 'center' }}>
                                {articolo.quantita_disponibile}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.65rem', color: '#FF9800', padding: '6px 4px', textAlign: 'right' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                  {articolo.prezzo_originale && articolo.prezzo_originale > 0 ? (
                                    (articolo.sconto1 > 0 || articolo.sconto2 > 0) && articolo.prezzo_scontato && articolo.prezzo_scontato < articolo.prezzo_originale ? (
                                      <>
                                        <Box sx={{ textDecoration: 'line-through', color: '#999999', fontSize: '0.6rem' }}>
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
                                    <Box sx={{ color: '#999999', fontSize: '0.6rem' }}>—</Box>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ padding: '6px 4px', textAlign: 'center' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="secondary"
                                  onClick={() => handleAggiungi(articolo)}
                                  sx={{ 
                                    textTransform: 'none',
                                    fontWeight: '600',
                                    padding: '5px',
                                    minWidth: '32px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 3px 10px rgba(255, 152, 0, 0.3)',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 5px 15px rgba(255, 152, 0, 0.4)'
                                    },
                                    '&:active': {
                                      transform: 'translateY(0)'
                                    }
                                  }}
                                >
                                  <AddCircleRoundedIcon sx={{ fontSize: '1rem' }} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      </TableContainer>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Colonna destra: Articoli selezionati */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 0.5, p: 0.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800', fontSize: '0.8rem' }}>
                      🛒 Articoli da Vendere
                    </Typography>
                    <Chip
                      label={articoliSelezionati.length}
                      size="small"
                      sx={{
                        backgroundColor: '#FF9800',
                        color: '#000',
                        fontWeight: 'bold',
                        height: '20px',
                        minWidth: '28px',
                      }}
                    />
                  </Box>

                  {articoliSelezionati.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 2,
                      color: '#666',
                      fontSize: '0.75rem'
                    }}>
                      Seleziona articoli dalla ricerca →
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ mb: 0.5, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Grid container spacing={0.5} sx={{ p: 0.5 }}>
                          {articoliSelezionatiOrdinati.map((articolo) => (
                            <Grid item xs={12} sm={6} md={4} key={articolo.codice}>
                              <Box sx={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #e0e0e0',
                                borderRadius: 0.5,
                                p: 0.75,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                minHeight: '68px',
                                '&:hover': {
                                  backgroundColor: '#f9f9f9',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                  transition: 'all 0.2s ease',
                                }
                              }}>
                                {/* Riga 1: Codice e Delete */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ fontSize: '0.65rem', fontWeight: '500', color: '#FF9800' }}>
                                    {articolo.codice}
                                  </Box>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRimuovi(articolo.codice)}
                                    sx={{
                                      p: '2px',
                                      '&:hover': {
                                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                      }
                                    }}
                                  >
                                    <DeleteRoundedIcon sx={{ fontSize: '0.9rem' }} />
                                  </IconButton>
                                </Box>
                                
                                {/* Riga 2: Descrizione */}
                                <Box sx={{ fontSize: '0.75rem', color: '#333333', lineHeight: '1.3', whiteSpace: 'normal', flex: 1 }}>
                                  {articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase()}
                                </Box>
                                
                                {/* Riga 3: Colore, Qtà, Prezzo */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.4 }}>
                                  <Box sx={{ fontSize: '0.6rem', color: '#555555', minWidth: '40px' }}>
                                    {(articolo.colore_estratto || articolo.colore || '—').toUpperCase()}
                                  </Box>
                                  
                                  <ButtonGroup size="small" variant="outlined" sx={{
                                    '& .MuiButton-root': {
                                      borderRadius: 0,
                                      border: '1px solid #FF9800',
                                      color: '#FF9800',
                                      transition: 'all 0.3s ease',
                                      fontSize: '0.65rem',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                        borderColor: '#F57C00',
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
                                      sx={{ minWidth: '24px', p: '1px' }}
                                    >
                                      <RemoveCircleRoundedIcon sx={{ fontSize: '0.7rem' }} />
                                    </Button>
                                    <Button
                                      disabled
                                      size="small"
                                      sx={{
                                        minWidth: '28px',
                                        fontSize: '0.55rem',
                                        fontWeight: 'bold',
                                        color: '#333333',
                                        py: '1px',
                                        '&.Mui-disabled': {
                                          color: '#333333',
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
                                      sx={{ minWidth: '24px', p: '1px' }}
                                    >
                                      <AddCircleRoundedIcon sx={{ fontSize: '0.7rem' }} />
                                    </Button>
                                  </ButtonGroup>
                                  
                                  <Box sx={{ minWidth: '55px', fontSize: '0.6rem', color: '#FF9800', textAlign: 'right', fontWeight: 'bold' }}>
                                    {articolo.prezzo_scontato && articolo.prezzo_scontato < articolo.prezzo_originale ? (
                                      <Box>€{(parseFloat(articolo.prezzo_scontato) * articolo.quantita).toFixed(2)}</Box>
                                    ) : (
                                      <Box>€{(parseFloat(articolo.prezzo_originale || 0) * articolo.quantita).toFixed(2)}</Box>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>

                      <Box sx={{ 
                        p: 1.5,
                        mb: 1,
                        border: '3px solid #FF9800',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: '#FFF8F0',
                        borderRadius: 1
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MonetizationOnRoundedIcon sx={{ fontSize: '1.2rem', color: '#FF9800' }} />
                          <Typography sx={{ 
                            fontSize: '0.9rem', 
                            color: '#FF9800', 
                            fontWeight: 'bold'
                          }}>
                            TOTALE DA PAGARE
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: '1.9rem', 
                          color: '#FF9800', 
                          fontWeight: '900',
                          letterSpacing: '0.5px'
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
                          py: 0.8,
                          fontSize: '0.8rem',
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
                            background: '#e0e0e0',
                            color: '#999999',
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
      
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            backgroundColor: '#FFFFFF',
            border: 'none',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1A1A1A',
          textAlign: 'center',
          py: 2,
          borderBottom: '1px solid #e0e0e0',
        }}>
          Conferma Vendita
        </DialogTitle>
        <DialogContent sx={{ py: 2.5, px: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{
              backgroundColor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: '600', color: '#666', mb: 1.5 }}>
                Dettaglio articoli ({articoliSelezionati.length})
              </Typography>
              <Box sx={{ maxHeight: '180px', overflowY: 'auto' }}>
                {articoliSelezionati.map((item) => (
                  <Box key={item.codice} sx={{ 
                    mb: 1, 
                    pb: 1, 
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:last-child': { borderBottom: 'none' }
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '0.9rem', mb: 0.2 }}>
                        {item.codice}
                      </Typography>
                      <Typography sx={{ color: '#666', fontSize: '0.75rem' }}>
                        {item.descrizione?.replace(/\[.*?\]/g, '').trim().substring(0, 40)}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#FF9800', fontWeight: '700', fontSize: '0.9rem', minWidth: '50px', textAlign: 'right' }}>
                      ×{item.quantita}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{
              backgroundColor: '#FFF3E0',
              p: 2,
              borderRadius: 1,
              border: '1px solid #FFB74D',
              textAlign: 'center',
            }}>
              <Typography sx={{ color: '#666', fontSize: '0.85rem', mb: 0.8, fontWeight: '500' }}>
                Importo totale
              </Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: '800', color: '#FF9800' }}>
                €{articoliSelezionati.reduce((total, articolo) => {
                  const prezzo = articolo.prezzo_scontato ? parseFloat(articolo.prezzo_scontato) : parseFloat(articolo.prezzo_originale || 0);
                  return total + (prezzo * articolo.quantita);
                }, 0).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          gap: 1.5,
          borderTop: '1px solid #e0e0e0',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
            sx={{
              color: '#666',
              borderColor: '#d0d0d0',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'none',
              px: 3.5,
              py: 0.9,
              borderRadius: 0.5,
              border: '1px solid #d0d0d0',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#999'
              }
            }}
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirmVendita}
            variant="contained"
            disabled={loading}
            sx={{
              background: '#FF9800',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'none',
              px: 3.5,
              py: 0.9,
              borderRadius: 0.5,
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
              '&:hover': {
                background: '#F57C00',
                boxShadow: '0 6px 16px rgba(255, 152, 0, 0.4)',
              },
              '&:disabled': {
                background: '#ccc',
                color: '#999'
              }
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Conferma'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
