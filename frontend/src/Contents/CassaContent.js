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
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

// Tema gestito in App.js


function CassaContent() {
  const searchInputRef = useRef(null);
  
  // Funzioni di inizializzazione per leggere da sessionStorage subito
  const initCassaData = () => {
    const savedData = sessionStorage.getItem('cassaData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Errore nel ripristinare i dati:', e);
      }
    }
    return { searchCodice: '', articoliRicerca: [], articoliSelezionati: [], sortCriteria: [{ column: 'codice', order: 'asc' }] };
  };

  const initialData = initCassaData();
  const [searchCodice, setSearchCodice] = useState(initialData.searchCodice);
  const [articoliRicerca, setArticoliRicerca] = useState(initialData.articoliRicerca);
  const [articoliSelezionati, setArticoliSelezionati] = useState(initialData.articoliSelezionati);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  // Ordinamento multiplo: array di {column, order}
  const [sortCriteria, setSortCriteria] = useState(initialData.sortCriteria);
  const [sortCriteriaSelected] = useState([{ column: 'codice', order: 'asc' }]);

  // Salva dati su sessionStorage ogni volta che cambiano
  useEffect(() => {
    const dataToSave = {
      searchCodice,
      articoliRicerca,
      articoliSelezionati,
      sortCriteria
    };
    sessionStorage.setItem('cassaData', JSON.stringify(dataToSave));
  }, [searchCodice, articoliRicerca, articoliSelezionati, sortCriteria]);

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
        `${API_BASE_URL}/articoli/search?termine=${encodeURIComponent(termine)}`
      );

      if (!response.ok) {
        throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
      }

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
        </Box>
        <TableSortLabel
          active={isChecked}
          direction={direction}
          onClick={(e) => {
            handleSort(column, e);
          }}
          sx={{
            '& .MuiTableSortLabel-icon': {
              color: '#4CAF50 !important',
              width: '14px',
              height: '14px',
            },
            '&.Mui-active': {
              color: '#4CAF50',
            },
            color: '#4CAF50',
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

      const response = await fetch(`${API_BASE_URL}/movimenti/registra`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articoli: movimenti }),
      });

      if (!response.ok) {
        throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setArticoliSelezionati([]);
        // setArticoliRicerca([]);  // Mantieni i risultati di ricerca visibili
        setSearchCodice('');
        setSortCriteria([]);
        sessionStorage.removeItem('cassaData');
        setToastMessage('Registrazione vendita avvenuta');
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
      <Box sx={{ p: 1, overflow: 'hidden', width: '100%' }}>
        <Stack spacing={2}>
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
          <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Card>
              <CardContent sx={{ p: 0.75, pb: 0.75 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, mt: -0.5 }}>
                  <TextField
                    ref={searchInputRef}
                    fullWidth
                    label="Ricerca articoli"
                    value={searchCodice}
                    onChange={(e) => setSearchCodice(e.target.value)}
                    placeholder="Codice, descrizione..."
                    disabled={loading}
                    variant="standard"
                    size="small"
                    sx={{
                      '& .MuiInput-input': {
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                        py: '3px',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                      '& .MuiInput-underline:before': {
                        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '& .MuiInput-underline:hover:before': {
                        borderBottomColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '& .MuiInput-underline:after': {
                        borderBottomColor: '#4CAF50',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4CAF50',
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SearchRoundedIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                  </Box>
                </CardContent>
              </Card>

              {/* Risultati ricerca */}
              <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 0.25, p: 0.25, pt: 0.25 }}>
                  {articoliRicerca.length > 0 ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <AssignmentRoundedIcon sx={{ fontSize: '1.2rem', color: '#4CAF50' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: '0.85rem', m: 0 }}>
                          Risultati Ricerca ({articoliRicerca.length})
                        </Typography>
                      </Box>
                    <Box sx={{ borderRadius: 1, border: '1px solid #333333', flex: 1, overflow: 'auto', maxHeight: 'calc(100vh - 80px)', backgroundColor: '#1E1E1E' }}>
                      <TableContainer sx={{ minWidth: '100%' }}>
                        <Table stickyHeader>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#252525', height: '40px' }}>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#4CAF50',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '70px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              }
                            }}>
                              {renderHeaderWithCheckbox('codice', 'CODICE', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#E0E0E0',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              flex: 1,
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: '#2A2A2A',
                              }
                            }}>
                              {renderHeaderWithCheckbox('descrizione', 'DESCRIZIONE', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#4CAF50',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '70px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              }
                            }}>
                              {renderHeaderWithCheckbox('colore', 'COLORE', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#E0E0E0',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '60px',
                              minWidth: '60px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: '#2A2A2A',
                              }
                            }}>
                              {renderHeaderWithCheckbox('taglia', 'TAGLIA', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#E0E0E0',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '70px',
                              minWidth: '70px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': {
                                backgroundColor: '#2A2A2A',
                              }
                            }}>
                              {renderHeaderWithCheckbox('magazzino', 'MAGAZZINO', sortCriteria, setSortCriteria, handleSort)}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#E0E0E0',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '80px',
                              minWidth: '80px',
                              textAlign: 'center'
                            }}>PREZZO</TableCell>
                            <TableCell sx={{ 
                              fontWeight: '600', 
                              fontSize: '0.7rem', 
                              color: '#E0E0E0',
                              padding: '4px 6px',
                              letterSpacing: '0px',
                              width: '60px',
                              minWidth: '60px',
                              textAlign: 'center'
                            }}>AZIONE</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {articoliOrdinati.map((articolo, index) => (
                            <TableRow 
                              key={articolo.codice}
                              sx={{ 
                                backgroundColor: index % 2 === 0 ? '#1E1E1E' : '#252525',
                                '&:hover': {
                                  backgroundColor: '#2A2A2A',
                                },
                                borderBottom: '1px solid #333333',
                                height: 'auto',
                                minHeight: '40px'
                              }}
                            >
                              <TableCell sx={{ fontSize: '0.7rem', fontWeight: '600', color: '#FFFFFF', padding: '8px', textAlign: 'left' }}>
                                {articolo.codice}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.65rem', color: '#FFFFFF', padding: '8px' }}>
                                {(() => {
                                  let coloreName = (articolo.colore_estratto || articolo.colore || '—').toString().toUpperCase().trim();
                                  let tagliaName = (articolo.taglia_estratta || articolo.dimensioni || articolo.taglia || '').toString().toUpperCase().trim();
                                  if (coloreName === 'MULTICAM' && tagliaName === 'BLACK') {
                                    coloreName = 'MULTICAM BLACK';
                                  }
                                  return (
                                    <Tooltip title={`${articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase()} - ${coloreName}`} arrow>
                                      <Box sx={{ 
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        maxWidth: '280px',
                                        lineHeight: '1.4',
                                        fontSize: '0.8rem'
                                      }}>
                                        {articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase()}
                                        <span style={{ color: '#B0BEC5', fontSize: '0.75rem', marginLeft: '4px' }}>
                                          {' - ' + coloreName}
                                        </span>
                                      </Box>
                                    </Tooltip>
                                  );
                                })()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.85rem', color: '#FFFFFF', padding: '8px', fontWeight: '500' }}>
                                {(() => {
                                  let coloreName = (articolo.colore_estratto || articolo.colore || '—').toString().toUpperCase().trim();
                                  let tagliaName = (articolo.taglia_estratta || articolo.dimensioni || articolo.taglia || '').toString().toUpperCase().trim();
                                  // Se colore è MULTICAM e taglia è BLACK, mostra come colore 'MULTICAM BLACK' e taglia vuota
                                  if (coloreName === 'MULTICAM' && tagliaName === 'BLACK') {
                                    coloreName = 'MULTICAM BLACK';
                                    tagliaName = '';
                                  }
                                  
                                  // Database colori RAL + CSS standard basato su riferimenti online
                                  const colorMap = {
                                                                                                                                                                                                                                                                                                                                                                                                            'OD': '#747b4f',
                                                                                                                                                                                                                                                                                                                                                                        'FOLIAGE GREEN': '#506054',
                                                                                                                                                                                                                                                                                                                                    'DESERT': '#e5d8b0',
                                                                                                                                                                                                                                                                                                'DARK EARTH': '#455948',
                                                                                                                                                                                                                                                            'KANGAROO': '#81613c',
                                                                                                                                                                                                                        'TAN': '#bfb198',
                                                                                                                                                                                    'BROWN GREY': '#554D41',
                                                                                                                                                'STEEL GRAY': '#686f82',
                                                                                                            'NAVY BLUE': '#19284c',
                                                                        'COYOTE': '#b38b6d',
                                    // Colori RAL standard (riferimento internazionale)
                                    'BROWN GRAY': '#554D41',
                                    'BROWN-GRAY': '#3A3C36',
                                    'RAL 7013': '#3A3C36',
                                    'GRIGIO MARRONE': '#3A3C36',
                                    'GRIGIO-MARRONE': '#3A3C36',
                                    'BRAUNGRAU': '#3A3C36',
                                    'ROSSO RAL 3000': '#AF2B1E',
                                    'ROSSO RAL 3001': '#A71930',
                                    'ROSSO RAL 3002': '#A6292E',
                                    'ROSSO RAL 3003': '#9B111E',
                                    'ROSSO RAL 3004': '#75151E',
                                    'ROSSO RAL 3005': '#5E2028',
                                    'ROSSO RAL 3009': '#642424',
                                    'ROSSO RAL 3012': '#C1504C',
                                    'ROSSO RAL 3013': '#A4554F',
                                    'ROSSO RAL 3014': '#D4999B',
                                    'ROSSO RAL 3015': '#D8B8BB',
                                    'ROSSO RAL 3016': '#B7323C',
                                    'ROSSO RAL 3017': '#B32621',
                                    'ROSSO RAL 3018': '#CE2029',
                                    'ROSSO RAL 3020': '#CC0605',
                                    'ROSSO RAL 3022': '#D5534F',
                                    'ROSSO RAL 3024': '#F50830',
                                    'ROSSO RAL 3026': '#FF0000',
                                    'ROSSO RAL 3027': '#C1444C',
                                    'ROSSO RAL 3028': '#D2115F',
                                    'ROSSO RAL 3031': '#B32428',
                                    
                                    // Colori italiani comuni + varianti
                                    'ROSSO': '#FF0000',
                                    'RED': '#FF0000',
                                    'BLU': '#0000FF',
                                    'BLUE': '#43608a',
                                    'AZZURRO': '#0087BE',
                                    'LIGHT BLUE': '#87CEEB',
                                    'VERDE': '#556b2f',
                                    'GREEN': '#556b2f',
                                    'VERDE SCURO': '#006400',
                                    'VERDE RAL 6000': '#27613B',
                                    'VERDE RAL 6001': '#287233',
                                    'VERDE RAL 6002': '#2D5016',
                                    'VERDE RAL 6003': '#424632',
                                    'VERDE RAL 6005': '#115740',
                                    'VERDE RAL 6009': '#26382B',
                                    'VERDE RAL 6010': '#1E4620',
                                    'VERDE RAL 6011': '#587246',
                                    'VERDE RAL 6012': '#343A2B',
                                    'VERDE RAL 6014': '#37342B',
                                    'VERDE RAL 6015': '#2B4B4D',
                                    'VERDE RAL 6016': '#004225',
                                    'VERDE RAL 6017': '#4C8C42',
                                    'VERDE RAL 6018': '#9FD356',
                                    'VERDE RAL 6019': '#BDECB6',
                                    'VERDE RAL 6020': '#2E3932',
                                    'VERDE RAL 6021': '#89AC76',
                                    'VERDE RAL 6022': '#25221E',
                                    'VERDE RAL 6024': '#308653',
                                    'VERDE RAL 6025': '#50623A',
                                    'VERDE RAL 6026': '#003F1A',
                                    'VERDE RAL 6027': '#84C59C',
                                    'VERDE RAL 6028': '#283C2D',
                                    'VERDE RAL 6029': '#20603D',
                                    'VERDE RAL 6032': '#317B3A',
                                    'VERDE RAL 6033': '#529B7E',
                                    'VERDE RAL 6034': '#7FB5A5',
                                    'VERDE RAL 6035': '#1B5E20',
                                    'VERDE RAL 6036': '#193737',
                                    'VERDE RAL 6037': '#008000',
                                    'VERDE RAL 6038': '#00B050',
                                    'VERDE RAL 6039': '#6BA539',
                                    
                                    'GIALLO': '#FFFF00',
                                    'YELLOW': '#FFFF00',
                                    'GIALLO RAL 1000': '#B19137',
                                    'GIALLO RAL 1001': '#8E7B5B',
                                    'GIALLO RAL 1002': '#C4A000',
                                    'GIALLO RAL 1003': '#FBBB15',
                                    'GIALLO RAL 1004': '#C7A700',
                                    'GIALLO RAL 1005': '#8D7D1F',
                                    'GIALLO RAL 1006': '#D5A501',
                                    'GIALLO RAL 1007': '#B0921F',
                                    'GIALLO RAL 1009': '#6B5C24',
                                    'GIALLO RAL 1010': '#B5A900',
                                    'GIALLO RAL 1011': '#8D6E08',
                                    'GIALLO RAL 1012': '#F0D000',
                                    'GIALLO RAL 1013': '#FFFBEA',
                                    'GIALLO RAL 1014': '#F4E4B0',
                                    'GIALLO RAL 1015': '#FFFEFF',
                                    'GIALLO RAL 1016': '#FFFA00',
                                    'GIALLO RAL 1017': '#DDBF00',
                                    'GIALLO RAL 1018': '#F1E500',
                                    'GIALLO RAL 1019': '#2E2B28',
                                    'GIALLO RAL 1020': '#8E7B3B',
                                    'GIALLO RAL 1021': '#ECBE1D',
                                    'GIALLO RAL 1023': '#E6B81C',
                                    'GIALLO RAL 1024': '#B5A200',
                                    'GIALLO RAL 1026': '#FFFE00',
                                    'GIALLO RAL 1027': '#A49A0C',
                                    'GIALLO RAL 1028': '#D39E00',
                                    'GIALLO RAL 1032': '#B5A900',
                                    'GIALLO RAL 1033': '#CBB537',
                                    'GIALLO RAL 1034': '#8E7B3B',
                                    'GIALLO RAL 1035': '#6E6B4A',
                                    'GIALLO RAL 1036': '#79691C',
                                    'GIALLO RAL 1037': '#8D7900',
                                    
                                    'NERO': '#000000',
                                    'BLACK': '#000000',
                                    'NERO RAL 9000': '#4C4C4C',
                                    'NERO RAL 9001': '#8C8C8C',
                                    'NERO RAL 9002': '#A8A8A8',
                                    'NERO RAL 9003': '#F4F4F4',
                                    'NERO RAL 9004': '#202020',
                                    'NERO RAL 9005': '#0A0E27',
                                    
                                    'BIANCO': '#FFFFFF',
                                    'WHITE': '#FFFFFF',
                                    'BIANCO RAL 9010': '#FAFAFA',
                                    
                                    'ARANCIONE': '#FF9500',
                                    'ORANGE': '#FF9500',
                                    'ARANCIONE RAL 2000': '#ED760E',
                                    'ARANCIONE RAL 2001': '#D5841B',
                                    'ARANCIONE RAL 2002': '#CB3817',
                                    'ARANCIONE RAL 2003': '#FF7514',
                                    'ARANCIONE RAL 2004': '#F4A460',
                                    'ARANCIONE RAL 2005': '#FF6600',
                                    'ARANCIONE RAL 2008': '#D2691E',
                                    'ARANCIONE RAL 2009': '#DF6601',
                                    'ARANCIONE RAL 2010': '#FD7100',
                                    'ARANCIONE RAL 2011': '#EC7C26',
                                    'ARANCIONE RAL 2012': '#FFA500',
                                    
                                    'VIOLA': '#800080',
                                    'PURPLE': '#800080',
                                    'GRIGIO': '#808080',
                                    'GRAY': '#808080',
                                    'GREY': '#808080',
                                    'ROSA': '#FFC0CB',
                                    'PINK': '#FFC0CB',
                                    'BEIGE': '#F5F5DC',
                                    'BORDEAUX': '#8B0000',
                                    'BURGUNDY': '#8B0000',
                                    'CAKI': '#9B8B5C',
                                    'KHAKI': '#9B8B5C',
                                    'MARRONE': '#8B4513',
                                    'BROWN': '#8B4513',
                                    'MARRONE RAL 8000': '#5A4D3B',
                                    'MARRONE RAL 8001': '#9C5C38',
                                    'MARRONE RAL 8002': '#6C4831',
                                    'MARRONE RAL 8003': '#704214',
                                    'MARRONE RAL 8004': '#8B3A1F',
                                    'MARRONE RAL 8007': '#3E2723',
                                    'MARRONE RAL 8008': '#5C4033',
                                    'MARRONE RAL 8011': '#47423A',
                                    'MARRONE RAL 8012': '#4C2C1F',
                                    'MARRONE RAL 8014': '#473F35',
                                    'MARRONE RAL 8015': '#532618',
                                    'MARRONE RAL 8016': '#2C1810',
                                    'MARRONE RAL 8017': '#45322E',
                                    'MARRONE RAL 8019': '#3E2723',
                                  };
                                  
                                  // Non mostrare il quadrato se colore mancante o non valido
                                  if (!coloreName || coloreName === '-' || coloreName === '—' || coloreName === 'NULL' || coloreName === 'UNDEFINED') {
                                    return null;
                                  }

                                  // Gestione speciale per MULTICAM: pattern SVG camo stilizzato
                                                                    // Gestione speciale per VEGETATO: pattern SVG camo vegetato italiano stilizzato
                                                                                                      // Gestione speciale per WOODLAND: pattern SVG woodland stilizzato
                                                                                                                                        // Gestione speciale per MTP: pattern SVG Multi-Terrain Pattern stilizzato
                                                                                                                                                                          // Gestione speciale per MULTICAM BLACK: pattern SVG Multicam Black stilizzato
                                                                                                                                                                          // Mostra Multicam Black se:
                                                                                                                                                                          // - il colore contiene 'MULTICAM BLACK'
                                                                                                                                                                          // - oppure il colore contiene 'MULTICAM' e la taglia contiene 'BLACK'
                                                                                                                                                                          if (
                                                                                                                                                                            coloreName.includes('MULTICAM BLACK') ||
                                                                                                                                                                            (coloreName === 'MULTICAM BLACK')
                                                                                                                                                                          ) {
                                                                                                                                                                            return (
                                                                                                                                                                              <Tooltip title={coloreName} arrow>
                                                                                                                                                                                <Box
                                                                                                                                                                                  sx={{
                                                                                                                                                                                    width: '24px',
                                                                                                                                                                                    height: '24px',
                                                                                                                                                                                    borderRadius: '4px',
                                                                                                                                                                                    border: '1px solid #FFFFFF',
                                                                                                                                                                                    cursor: 'pointer',
                                                                                                                                                                                    backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="%230a0e27"/><ellipse cx="7" cy="7" rx="6" ry="3" fill="%23333333"/><ellipse cx="18" cy="16" rx="5" ry="2.5" fill="%23505050"/><ellipse cx="12" cy="12" rx="5" ry="2.5" fill="%23666666"/><ellipse cx="16" cy="6" rx="3" ry="1.5" fill="%23444444"/><ellipse cx="8" cy="18" rx="4" ry="2" fill="%23888888"/><ellipse cx="18" cy="10" rx="2" ry="1" fill="%23444444"/></svg>')`,
                                                                                                                                                                                    backgroundSize: 'cover',
                                                                                                                                                                                    backgroundColor: 'transparent',
                                                                                                                                                                                  }}
                                                                                                                                                                                />
                                                                                                                                                                              </Tooltip>
                                                                                                                                                                            );
                                                                                                                                                                          }
                                                                                                                                        if (coloreName.includes('MTP')) {
                                                                                                                                          return (
                                                                                                                                            <Tooltip title={coloreName} arrow>
                                                                                                                                              <Box
                                                                                                                                                sx={{
                                                                                                                                                  width: '24px',
                                                                                                                                                  height: '24px',
                                                                                                                                                  borderRadius: '4px',
                                                                                                                                                  border: '1px solid #FFFFFF',
                                                                                                                                                  cursor: 'pointer',
                                                                                                                                                  backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="%23bfb198"/><ellipse cx="7" cy="7" rx="6" ry="3" fill="%2381613c"/><ellipse cx="18" cy="16" rx="5" ry="2.5" fill="%23554D41"/><ellipse cx="12" cy="12" rx="5" ry="2.5" fill="%235e6b3a"/><ellipse cx="16" cy="6" rx="3" ry="1.5" fill="%23747b4f"/><ellipse cx="8" cy="18" rx="4" ry="2" fill="%23e5d8b0"/><ellipse cx="18" cy="10" rx="2" ry="1" fill="%23bfb198"/></svg>')`,
                                                                                                                                                  backgroundSize: 'cover',
                                                                                                                                                  backgroundColor: 'transparent',
                                                                                                                                                }}
                                                                                                                                              />
                                                                                                                                            </Tooltip>
                                                                                                                                          );
                                                                                                                                        }
                                                                                                      if (coloreName.includes('WOODLAND')) {
                                                                                                        return (
                                                                                                          <Tooltip title={coloreName} arrow>
                                                                                                            <Box
                                                                                                              sx={{
                                                                                                                width: '24px',
                                                                                                                height: '24px',
                                                                                                                borderRadius: '4px',
                                                                                                                border: '1px solid #FFFFFF',
                                                                                                                cursor: 'pointer',
                                                                                                                backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="%234a5d23"/><ellipse cx="7" cy="7" rx="6" ry="3" fill="%2381613c"/><ellipse cx="18" cy="16" rx="5" ry="2.5" fill="%233a2d19"/><ellipse cx="12" cy="12" rx="5" ry="2.5" fill="%23bfb198"/><ellipse cx="16" cy="6" rx="3" ry="1.5" fill="%23000000"/><ellipse cx="8" cy="18" rx="4" ry="2" fill="%2381613c"/><ellipse cx="18" cy="10" rx="2" ry="1" fill="%23bfb198"/></svg>')`,
                                                                                                                backgroundSize: 'cover',
                                                                                                                backgroundColor: 'transparent',
                                                                                                              }}
                                                                                                            />
                                                                                                          </Tooltip>
                                                                                                        );
                                                                                                      }
                                                                    if (coloreName === 'VEGETATO') {
                                                                      // Pattern vegetato italiano ispirato al riferimento: fondo verde oliva, macchie sabbia, marrone scuro, verde scuro, rosso mattone, forme irregolari
                                                                      return (
                                                                        <Tooltip title={coloreName} arrow>
                                                                          <Box
                                                                            sx={{
                                                                              width: '24px',
                                                                              height: '24px',
                                                                              borderRadius: '4px',
                                                                              border: '1px solid #FFFFFF',
                                                                              cursor: 'pointer',
                                                                              backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="%235e6b3a"/><path d="M2,20 Q6,18 8,22 Q12,20 10,16 Q8,12 2,14 Z" fill="%23e5d8b0"/><ellipse cx="18" cy="16" rx="4" ry="2.5" fill="%2381613c"/><ellipse cx="7" cy="8" rx="5" ry="2.5" fill="%23bfb198"/><ellipse cx="16" cy="6" rx="3" ry="1.5" fill="%23747b4f"/><ellipse cx="12" cy="13" rx="4" ry="2" fill="%23455948"/><ellipse cx="19" cy="8" rx="2" ry="1" fill="%23a13c2f"/><ellipse cx="6" cy="16" rx="2.5" ry="1.2" fill="%23a13c2f"/></svg>')`,
                                                                              backgroundSize: 'cover',
                                                                              backgroundColor: 'transparent',
                                                                            }}
                                                                          />
                                                                        </Tooltip>
                                                                      );
                                                                    }
                                  if (coloreName === 'MULTICAM') {
                                    return (
                                      <Tooltip title={coloreName} arrow>
                                        <Box
                                          sx={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '4px',
                                            border: '1px solid #FFFFFF',
                                            cursor: 'pointer',
                                            backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="%23bfb198"/><ellipse cx="8" cy="8" rx="6" ry="4" fill="%2381613c"/><ellipse cx="16" cy="16" rx="7" ry="5" fill="%23554D41"/><ellipse cx="14" cy="7" rx="4" ry="2" fill="%23b38b6d"/><ellipse cx="7" cy="17" rx="5" ry="3" fill="%23bfb198"/><ellipse cx="18" cy="10" rx="3" ry="2" fill="%2381613c"/></svg>')`,
                                            backgroundSize: 'cover',
                                            backgroundColor: 'transparent',
                                          }}
                                        />
                                      </Tooltip>
                                    );
                                  }

                                  // Prova a trovare una corrispondenza exacta prima
                                  let colorCode = colorMap[coloreName];

                                  // Se non trovato, cerca parzialmente
                                  if (!colorCode) {
                                    for (const [key, value] of Object.entries(colorMap)) {
                                      if (coloreName.includes(key) || key.includes(coloreName)) {
                                        colorCode = value;
                                        break;
                                      }
                                    }
                                  }

                                  // Se ancora non trovato, default grigio
                                  if (!colorCode) {
                                    colorCode = '#CCCCCC';
                                  }

                                  return (
                                    <Tooltip title={coloreName} arrow>
                                      <Box sx={{
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: colorCode,
                                        borderRadius: '4px',
                                        border: '1px solid #FFFFFF',
                                        cursor: 'pointer'
                                      }} />
                                    </Tooltip>
                                  );
                                })()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.85rem', color: '#FFFFFF', padding: '8px', fontWeight: '500' }}>
                                {(() => {
                                  let coloreName = (articolo.colore_estratto || articolo.colore || '—').toString().toUpperCase().trim();
                                  let tagliaName = (articolo.taglia_estratta || articolo.dimensioni || articolo.taglia || '').toString().toUpperCase().trim();
                                  if (coloreName === 'MULTICAM' && tagliaName === 'BLACK') {
                                    coloreName = 'MULTICAM BLACK';
                                    tagliaName = '';
                                  }
                                  return tagliaName || '—';
                                })()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#FFFFFF', padding: '8px', textAlign: 'center' }}>
                                {(() => {
                                  const qtaFloor = Math.floor(articolo.quantita_disponibile);
                                  return (
                                    <Chip 
                                      label={qtaFloor}
                                      size="small"
                                      sx={{
                                        backgroundColor: qtaFloor > 0 ? '#2E7D32' : qtaFloor === 0 ? '#D84315' : '#7B1717',
                                        color: '#FFFFFF',
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem',
                                        borderRadius: '4px',
                                        height: '24px',
                                        padding: '0 8px',
                                        border: qtaFloor > 0 ? '1px solid #66BB6A' : qtaFloor === 0 ? '1px solid #FB8C00' : '1px solid #EF5350',
                                        '& .MuiChip-label': {
                                          padding: '0'
                                        }
                                      }}
                                    />
                                  );
                                })()}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.9rem', color: '#FFFFFF', padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                  {articolo.prezzo_originale && articolo.prezzo_originale > 0 ? (
                                    (articolo.sconto1 > 0 || articolo.sconto2 > 0) && articolo.prezzo_scontato && articolo.prezzo_scontato < articolo.prezzo_originale ? (
                                      <>
                                        <Box sx={{ textDecoration: 'line-through', color: '#888888', fontSize: '0.75rem' }}>
                                          €{parseFloat(articolo.prezzo_originale).toFixed(2)}
                                        </Box>
                                        <Box sx={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '0.95rem' }}>
                                          €{parseFloat(articolo.prezzo_scontato).toFixed(2)}
                                        </Box>
                                      </>
                                    ) : (
                                      <Box sx={{ fontSize: '0.95rem' }}>€{parseFloat(articolo.prezzo_originale).toFixed(2)}</Box>
                                    )
                                  ) : (
                                    <Box sx={{ color: '#888888', fontSize: '0.75rem' }}>—</Box>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ padding: '6px 4px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    boxShadow: '0 3px 10px rgba(76, 175, 80, 0.3)',
                                    '&:hover': {
                                      transform: 'scale(1.15)',
                                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.5)'
                                    },
                                    '&:active': {
                                      transform: 'scale(0.88) translateY(1px)',
                                      boxShadow: '0 1px 3px rgba(76, 175, 80, 0.3)'
                                    }
                                  }}
                                >
                                  <AddShoppingCartRoundedIcon sx={{ fontSize: '1rem', color: '#FFFFFF' }} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      </TableContainer>
                    </Box>
                    </>
                  ) : (
                    <Box sx={{ padding: 2, textAlign: 'center', color: '#999999', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Nessun risultato
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Colonna destra: Articoli selezionati */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 0.5, p: 0.75 }}>
                  {/* TOTALE DA PAGARE IN ALTO */}
                  <Box sx={{ 
                    p: 1.5,
                    mb: 1,
                    border: '3px solid #4CAF50',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    backgroundColor: '#A5D6A7',
                    borderRadius: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MonetizationOnRoundedIcon sx={{ fontSize: '1.2rem', color: '#000000' }} />
                      <Typography sx={{ 
                        fontSize: '0.9rem', 
                        color: '#000000', 
                        fontWeight: 'bold'
                      }}>
                        TOTALE DA PAGARE
                      </Typography>
                    </Box>
                    <Typography sx={{ 
                      fontSize: '1.9rem', 
                      color: '#000000', 
                      fontWeight: '900',
                      letterSpacing: '0.5px'
                    }}>
                      €{articoliSelezionatiOrdinati.reduce((total, articolo) => {
                        const prezzo = articolo.prezzo_scontato ? parseFloat(articolo.prezzo_scontato) : parseFloat(articolo.prezzo_originale || 0);
                        return total + (prezzo * articolo.quantita);
                      }, 0).toFixed(2)}
                    </Typography>
                  </Box>

                  {/* PULSANTE CONFERMA SUBITO DOPO TOTALE */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={handleAggiorna}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.15rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: 1.5,
                      minHeight: '52px',
                      background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                      color: '#000',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                      mb: 0.5,
                      letterSpacing: '0.04em',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #388E3C 0%, #2E7D32 100%)',
                        boxShadow: '0 10px 30px rgba(76, 175, 80, 0.6)',
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

                  {/* HEADER ARTICOLI E CHIP */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ShoppingBagRoundedIcon sx={{ fontSize: '1.4rem' }} /> Articoli nel Carrello
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
                          borderRadius: 0,
                        }}
                      />
                    </Box>
                    {articoliSelezionati.length > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => setArticoliSelezionati([])}
                        sx={{
                          color: '#FF9800',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                          }
                        }}
                      >
                        <DeleteSweepRoundedIcon sx={{ fontSize: '1.5rem' }} />
                      </IconButton>
                    )}
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
                      <Box sx={{ mb: 0.5, borderRadius: 1, border: '1px solid #333333', flex: 1, overflow: 'auto' }}>
                        <Grid container spacing={0.5} sx={{ p: 0.5 }}>
                          {articoliSelezionatiOrdinati.map((articolo) => (
                            <Grid item xs={12} sm={6} md={6} key={articolo.codice}>
                              <Box sx={{
                                backgroundColor: '#2A2A2A',
                                border: '2px solid #444444',
                                borderRadius: 0.5,
                                p: 0.75,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: 0.5,
                                minHeight: '68px',
                                position: 'relative',
                                '&:hover': {
                                  backgroundColor: '#252525',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                  transition: 'all 0.2s ease',
                                }
                              }}>
                                {/* Riga 1: Codice */}
                                <Box sx={{ fontSize: '0.65rem', fontWeight: '500', color: '#4CAF50' }}>
                                  {articolo.codice}
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRimuovi(articolo.codice)}
                                  sx={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    p: '2px',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                    }
                                  }}
                                >
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: '1.2rem', color: '#FF9800' }} />
                                </IconButton>
                                
                                {/* Riga 2: Descrizione con Colore e Taglia */}
                                <Box sx={{ fontSize: '0.75rem', color: '#E0E0E0', lineHeight: '1.3', whiteSpace: 'normal', flex: 1 }}>
                                  {(() => {
                                    let coloreName = (articolo.colore_estratto || articolo.colore || '—').toString().toUpperCase().trim();
                                    let tagliaName = (articolo.taglia_estratta || articolo.dimensioni || articolo.taglia || '').toString().toUpperCase().trim();
                                    let descrizione = articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase();
                                    // Se colore è MULTICAM e taglia è BLACK, la descrizione colore diventa MULTICAM BLACK
                                    if (coloreName === 'MULTICAM' && tagliaName === 'BLACK') {
                                      coloreName = 'MULTICAM BLACK';
                                      tagliaName = '';
                                      descrizione = descrizione.replace(/\bMULTICAM\b/g, 'MULTICAM BLACK');
                                    }
                                    return `${descrizione} ${coloreName} ${tagliaName}`.replace(/\s+/g, ' ').trim();
                                  })()}
                                </Box>
                                
                                {/* Riga 3: Qtà */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.3 }}>
                                  <ButtonGroup size="medium" variant="outlined" sx={{
                                    '& .MuiButton-root': {
                                      borderRadius: 0,
                                      border: '1px solid #4CAF50',
                                      color: '#4CAF50',
                                      transition: 'all 0.3s ease',
                                      fontSize: '0.55rem',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                        borderColor: '#388E3C',
                                      }
                                    }
                                  }}>
                                    <Button
                                      size="medium"
                                      onClick={() => {
                                        const nuovaQuantita = articolo.quantita - 1;
                                        handleUpdateQuantita(
                                          articolo.codice,
                                          nuovaQuantita === 0 ? -1 : nuovaQuantita
                                        );
                                      }}
                                      sx={{ minWidth: '32px', p: '4px' }}
                                    >
                                      <RemoveCircleRoundedIcon sx={{ fontSize: '0.9rem' }} />
                                    </Button>
                                    <Button
                                      disabled
                                      sx={{
                                        minWidth: '36px',
                                        fontSize: '0.8rem !important',
                                        fontWeight: 'bold',
                                        color: '#E0E0E0',
                                        py: '1px',
                                        px: '8px',
                                        border: '1px solid #4CAF50',
                                        borderRadius: 0,
                                        '&.Mui-disabled': {
                                          color: '#E0E0E0',
                                          borderColor: '#4CAF50',
                                        }
                                      }}
                                    >
                                      {articolo.quantita}
                                    </Button>
                                    <Button
                                      size="medium"
                                      onClick={() => {
                                        const nuovaQuantita = articolo.quantita + 1;
                                        handleUpdateQuantita(
                                          articolo.codice,
                                          nuovaQuantita === 0 ? 1 : nuovaQuantita
                                        );
                                      }}
                                      sx={{ minWidth: '32px', p: '4px' }}
                                    >
                                      <AddCircleRoundedIcon sx={{ fontSize: '0.9rem' }} />
                                    </Button>
                                  </ButtonGroup>
                                </Box>
                                
                                {/* Riga 4: Prezzo - Centrato e Evidente */}
                                <Box sx={{ 
                                  width: '100%',
                                  textAlign: 'center',
                                  padding: '0.1rem 0',
                                  backgroundColor: 'rgba(76, 175, 80, 0.15)',
                                  borderRadius: 0.5,
                                  border: '1px solid rgba(76, 175, 80, 0.2)'
                                }}>
                                  <Box sx={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                    {articolo.prezzo_scontato && articolo.prezzo_scontato < articolo.prezzo_originale ? (
                                      `€${(parseFloat(articolo.prezzo_scontato) * articolo.quantita).toFixed(2)}`
                                    ) : (
                                      `€${(parseFloat(articolo.prezzo_originale || 0) * articolo.quantita).toFixed(2)}`
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
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
                    <Typography sx={{ color: '#4CAF50', fontWeight: '700', fontSize: '0.9rem', minWidth: '50px', textAlign: 'right' }}>
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
              <Typography sx={{ fontSize: '2rem', fontWeight: '800', color: '#4CAF50' }}>
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
              background: '#4CAF50',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'none',
              px: 3.5,
              py: 0.9,
              borderRadius: 0.5,
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
              '&:hover': {
                background: '#388E3C',
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
      
      <Dialog
        open={openToast}
        onClose={() => setOpenToast(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: toastSeverity === 'success' ? '#C8E6C9' : '#FFCDD2',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: toastSeverity === 'success' ? '#2E7D32' : '#C62828' }}>
          {toastSeverity === 'success' ? '✓ Successo!' : '✗ Errore'}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography sx={{ color: toastSeverity === 'success' ? '#2E7D32' : '#C62828', fontSize: '1.1rem' }}>
            {toastMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => {
              setOpenToast(false);
              if (toastSeverity === 'success') {
                setArticoliRicerca([]);
                setTimeout(() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }, 100);
              }
            }}
            variant="contained"
            sx={{ 
              backgroundColor: toastSeverity === 'success' ? '#4CAF50' : '#f44336',
              color: '#FFF'
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CassaContent;
