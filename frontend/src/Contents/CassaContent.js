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

  // Effetto per svuotare la tabella di ricerca quando il campo è vuoto
  useEffect(() => {
    if (searchCodice.trim().length === 0) {
      setArticoliRicerca([]);
    }
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
    } else if (column === 'magazzino' || column === 'quantita_disponibile') {
      return item.quantita_disponibile || 0;
    } else if (column === 'prezzo_scontato') {
      return parseFloat(item.prezzo_scontato) || 0;
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
              '&.Mui-checked': { color: '#FF9800' },
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
      <Box sx={{ p: 1, overflow: 'hidden', width: '100%', pr: { xs: 0, md: 3 }, backgroundColor: 'transparent' }}>
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
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)', borderRadius: 3 }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0.75, pb: 0.75 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, mt: 1, justifyContent: 'center' }}>
                  <TextField
                    ref={searchInputRef}
                    label="Ricerca articoli"
                    value={searchCodice}
                    onChange={(e) => setSearchCodice(e.target.value)}
                    placeholder="Codice, descrizione..."
                    disabled={loading}
                    variant="standard"
                    size="small"
                    sx={{
                      width: '500px',
                      '& .MuiInput-input': {
                        color: '#FFFFFF',
                        fontSize: '1.1rem',
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
                        borderBottomColor: '#FF9800',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#FF9800',
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
                {/* Risultati ricerca */}
                {articoliRicerca.length > 0 ? (
                  <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <AssignmentRoundedIcon sx={{ fontSize: '1.2rem', color: '#FF9800' }} />
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: '0.85rem', m: 0 }}>
                                    Risultati Ricerca ({articoliRicerca.length})
                                  </Typography>
                                </Box>
                                <Box sx={{ borderRadius: 1, border: '1px solid #333333', width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 80px)', backgroundColor: '#1E1E1E' }}>
                                  <TableContainer sx={{ overflow: 'auto', width: '100%' }}>
                                    <Table stickyHeader sx={{ minWidth: '600px', width: '100%' }}>
                                      <TableHead>
                                        <TableRow sx={{ backgroundColor: '#252525', height: '40px' }}>
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
                                            {renderHeaderWithCheckbox('codice', 'CODICE', sortCriteria, setSortCriteria, handleSort)}
                                          </TableCell>
                                          <TableCell sx={{ 
                                            fontWeight: '600', 
                                            fontSize: '0.7rem', 
                                            color: '#FF9800',
                                            padding: '4px 6px',
                                            letterSpacing: '0px',
                                            width: '200px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
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
                                            color: '#FF9800',
                                            padding: '4px 6px',
                                            letterSpacing: '0px',
                                            width: '60px',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            textAlign: 'center',
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
                                            width: '50px',
                                            textAlign: 'center',
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
                                            width: '50px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            '&:hover': {
                                              backgroundColor: '#2A2A2A',
                                            }
                                          }}>
                                            {renderHeaderWithCheckbox('quantita_disponibile', 'MAGAZZINO', sortCriteria, setSortCriteria, handleSort)}
                                          </TableCell>
                                          <TableCell sx={{ 
                                            fontWeight: '600', 
                                            fontSize: '0.7rem', 
                                            color: '#E0E0E0',
                                            padding: '4px 6px',
                                            letterSpacing: '0px',
                                            width: '70px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            '&:hover': {
                                              backgroundColor: '#2A2A2A',
                                            }
                                          }}>
                                            {renderHeaderWithCheckbox('prezzo_scontato', 'PREZZO', sortCriteria, setSortCriteria, handleSort)}
                                          </TableCell>
                                          <TableCell sx={{ 
                                            fontWeight: '600', 
                                            fontSize: '0.7rem', 
                                            color: '#E0E0E0',
                                            padding: '4px 6px',
                                            letterSpacing: '0px',
                                            width: '50px',
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
                                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: '600', color: '#FFFFFF', padding: '8px', textAlign: 'center', width: '60px' }}>
                                              {articolo.codice}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.65rem', color: '#FFFFFF', padding: '8px', width: '200px' }}>
                                              {(() => {
                                                let coloreName = (articolo.colore_estratto || articolo.colore || '—').toString().toUpperCase().trim();
                                                let tagliaName = (articolo.taglia_estratta || articolo.dimensioni || articolo.taglia || '').toString().toUpperCase().trim();
                                                if (coloreName === 'MULTICAM' && tagliaName === 'BLACK') {
                                                  coloreName = 'MULTICAM BLACK';
                                                }
                                                return (
                                                  <Tooltip title={`${articolo.descrizione.replace(/\[.*?\]/g, '').trim().toUpperCase()} - ${coloreName}`} arrow>
                                                    <Box sx={{
                                                      whiteSpace: {
                                                        xs: 'normal',
                                                        sm: 'normal',
                                                        md: 'nowrap',
                                                        '@media (max-width:920px)': 'normal'
                                                      },
                                                      overflow: {
                                                        xs: 'visible',
                                                        sm: 'visible',
                                                        md: 'hidden',
                                                        '@media (max-width:920px)': 'visible'
                                                      },
                                                      textOverflow: {
                                                        xs: 'clip',
                                                        sm: 'clip',
                                                        md: 'ellipsis',
                                                        '@media (max-width:920px)': 'clip'
                                                      },
                                                      wordBreak: {
                                                        xs: 'break-word',
                                                        sm: 'break-word',
                                                        md: 'keep-all',
                                                        '@media (max-width:920px)': 'break-word'
                                                      },
                                                      maxWidth: { xs: '60vw', sm: '60vw', md: '320px', lg: '480px', '@media (max-width:920px)': '60vw' },
                                                      minWidth: { xs: '120px', sm: '160px', md: '220px', lg: '320px', '@media (max-width:920px)': '120px' },
                                                      lineHeight: '1.4',
                                                      fontSize: '0.8rem',
                                                      display: 'block'
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
                                            <TableCell sx={{ fontSize: '0.75rem', color: '#FFFFFF', padding: '8px', fontWeight: '500', width: '60px', textAlign: 'center' }}>
                                              {(() => {
                                                let coloreName = (articolo.colore_estratto || articolo.colore || '—').toString().toUpperCase().trim();
                                                
                                                const colorMap = {
                                                  'OD': '#747b4f',
                                                  'FOLIAGE GREEN': '#506054',
                                                  'DESERT': '#e5d8b0',
                                                  'DARK EARTH': '#455948',
                                                  'KANGAROO': '#81613c',
                                                  'TAN': '#bfb198',
                                                  'BROWN GREY': '#554D41',
                                                  'STEEL GRAY': '#686f82',
                                                  'NAVY': '#4c5e87',
                                                  'NAVY BLUE': '#4c5e87',
                                                  'BLUE': '#4c5e87',
                                                  'BLU': '#4c5e87',
                                                  'COYOTE': '#b38b6d',
                                                  'NERO': '#000000',
                                                  'BLACK': '#000000',
                                                  'BIANCO': '#FFFFFF',
                                                  'WHITE': '#FFFFFF',
                                                  'RED': '#D32F2F',
                                                  'ROSSO': '#D32F2F',
                                                  'GREEN': '#388E3C',
                                                  'VERDE': '#388E3C',
                                                  'YELLOW': '#FBC02D',
                                                  'GIALLO': '#FBC02D',
                                                  'GRAY': '#757575',
                                                  'GRIGIO': '#757575',
                                                  'GREY': '#757575',
                                                  'VEGETATO': '#556B2F',
                                                  'WOODLAND': '#3D3D1F',
                                                  'MULTICAM BLACK': '#8B7355',
                                                };
                                                
                                                // Non mostrare il quadrato se colore mancante o non valido
                                                if (!coloreName || coloreName === '-' || coloreName === '—' || coloreName === 'NULL' || coloreName === 'UNDEFINED') {
                                                  return null;
                                                }
                                                
                                                // Pattern speciali
                                                if (coloreName === 'MULTICAM') {
                                                  return (
                                                    <Tooltip title={coloreName} arrow>
                                                      <Box sx={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FFFFFF', cursor: 'pointer', backgroundColor: '#bfb198', backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="%23bfb198"/><ellipse cx="8" cy="8" rx="6" ry="4" fill="%2381613c"/><ellipse cx="16" cy="16" rx="7" ry="5" fill="%23554D41"/><ellipse cx="14" cy="7" rx="4" ry="2" fill="%23b38b6d"/><ellipse cx="7" cy="17" rx="5" ry="3" fill="%23bfb198"/><ellipse cx="18" cy="10" rx="3" ry="2" fill="%2381613c"/></svg>')`, backgroundSize: 'cover' }} />
                                                    </Tooltip>
                                                  );
                                                }
                                                
                                                if (coloreName === 'MULTICAM BLACK') {
                                                  return (
                                                    <Tooltip title={coloreName} arrow>
                                                      <Box sx={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FFFFFF', cursor: 'pointer', backgroundColor: '#3D3D3D', backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="%233D3D3D"/><ellipse cx="8" cy="8" rx="6" ry="4" fill="%23000000"/><ellipse cx="16" cy="16" rx="7" ry="5" fill="%23262626"/><ellipse cx="14" cy="7" rx="4" ry="2" fill="%23595959"/><ellipse cx="7" cy="17" rx="5" ry="3" fill="%23595959"/><ellipse cx="18" cy="10" rx="3" ry="2" fill="%23262626"/></svg>')`, backgroundSize: 'cover' }} />
                                                    </Tooltip>
                                                  );
                                                }
                                                
                                                if (coloreName === 'WOODLAND') {
                                                  return (
                                                    <Tooltip title={coloreName} arrow>
                                                      <Box sx={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FFFFFF', cursor: 'pointer', backgroundColor: '#2D2D15', backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="%232D2D15"/><rect x="0" y="0" width="6" height="6" fill="%23556B2F"/><rect x="6" y="2" width="6" height="6" fill="%234A5B2A"/><rect x="12" y="4" width="6" height="6" fill="%23556B2F"/><rect x="18" y="1" width="6" height="6" fill="%234A5B2A"/><rect x="2" y="8" width="6" height="6" fill="%234A5B2A"/><rect x="8" y="10" width="6" height="6" fill="%23556B2F"/><rect x="14" y="8" width="6" height="6" fill="%234A5B2A"/><rect x="20" y="12" width="4" height="4" fill="%23556B2F"/><rect x="4" y="16" width="6" height="6" fill="%23556B2F"/><rect x="12" y="14" width="6" height="6" fill="%234A5B2A"/><rect x="18" y="16" width="6" height="6" fill="%23556B2F"/><rect x="0" y="12" width="4" height="6" fill="%234A5B2A"/></svg>')`, backgroundSize: 'cover' }} />
                                                    </Tooltip>
                                                  );
                                                }
                                                
                                                if (coloreName === 'VEGETATO') {
                                                  return (
                                                    <Tooltip title={coloreName} arrow>
                                                      <Box sx={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FFFFFF', cursor: 'pointer', backgroundColor: '#6B7D3A', backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="%236B7D3A"/><rect x="1" y="2" width="5" height="5" fill="%234A5B2A"/><rect x="8" y="1" width="5" height="5" fill="%235A6B32"/><rect x="15" y="3" width="5" height="5" fill="%234A5B2A"/><rect x="3" y="10" width="5" height="5" fill="%235A6B32"/><rect x="11" y="9" width="5" height="5" fill="%234A5B2A"/><rect x="18" y="10" width="5" height="5" fill="%235A6B32"/><rect x="2" y="17" width="5" height="5" fill="%234A5B2A"/><rect x="9" y="16" width="5" height="5" fill="%235A6B32"/><rect x="16" y="17" width="5" height="5" fill="%234A5B2A"/></svg>')`, backgroundSize: 'cover' }} />
                                                    </Tooltip>
                                                  );
                                                }
                                                
                                                // Prova a trovare una corrispondenza exacta prima
                                                let colorCode = colorMap[coloreName];
                                                
                                                // Se non trovato, default grigio
                                                if (!colorCode) {
                                                  colorCode = '#CCCCCC';
                                                }
                                                
                                                return (
                                                  <Tooltip title={coloreName} arrow>
                                                    <Box sx={{ width: '24px', height: '24px', backgroundColor: colorCode, borderRadius: '4px', border: '1px solid #FFFFFF', cursor: 'pointer' }} />
                                                  </Tooltip>
                                                );
                                              })()}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.9rem', color: '#FFFFFF', padding: '8px', fontWeight: '600', width: '50px', textAlign: 'center' }}>
                                              {(() => {
                                                let tagliaName = (articolo.taglia_estratta || articolo.dimensioni || articolo.taglia || '').toString().toUpperCase().trim();
                                                if (tagliaName === 'BLACK' && (articolo.colore_estratto || articolo.colore || '').toString().toUpperCase().trim() === 'MULTICAM') {
                                                  tagliaName = '';
                                                }
                                                return tagliaName;
                                              })()}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.9rem', color: '#FFFFFF', padding: '8px', fontWeight: '700', width: '50px', textAlign: 'center' }}>
                                              {Math.floor(articolo.quantita_disponibile || 0)}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.9rem', padding: '8px', width: '70px', textAlign: 'center' }}>
                                              {articolo.prezzo_originale && parseFloat(articolo.prezzo_originale) > 0 && (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                                                  <span style={{ color: '#FFFFFF', textDecoration: 'line-through', fontSize: '0.75rem', opacity: 0.7 }}>
                                                    {parseFloat(articolo.prezzo_originale).toFixed(2)} €
                                                  </span>
                                                  <span style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '0.95rem' }}>
                                                    {articolo.prezzo_scontato ? parseFloat(articolo.prezzo_scontato).toFixed(2) : 'N/A'} €
                                                  </span>
                                                </Box>
                                              )}
                                              {(!articolo.prezzo_originale || (parseFloat(articolo.prezzo_originale) <= 0)) && (
                                                <span style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '0.95rem' }}>
                                                  {articolo.prezzo_scontato ? parseFloat(articolo.prezzo_scontato).toFixed(2) : 'N/A'} €
                                                </span>
                                              )}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.65rem', color: '#FFFFFF', padding: '8px', fontWeight: '500', width: '50px', minWidth: '50px', maxWidth: '50px', textAlign: 'center' }}>
                                              <IconButton size="small" onClick={() => handleAggiungi(articolo)} sx={{ color: '#FF9800', '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.1)' }, padding: '2px' }}>
                                                <AddShoppingCartRoundedIcon fontSize="small" />
                                              </IconButton>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Box>
                              </>
                            ) : (
                              <Box sx={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', py: 2 }}>
                                Nessun risultato
                              </Box>
                            )}
                          </CardContent>
                        </Card>
            </Grid>

            {/* Colonna destra: Articoli selezionati */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)', borderRadius: 3 }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 0.5, p: 0.75 }}>
                  {/* TOTALE DA PAGARE IN ALTO */}
                  <Box sx={{ 
                    p: 1.5,
                    mb: 1,
                    border: '3px solid #FFFFFF',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    backgroundColor: 'rgba(115, 255, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: 'none'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MonetizationOnRoundedIcon sx={{ fontSize: '1.2rem', color: '#FFFFFF' }} />
                      <Typography sx={{ 
                        fontSize: '0.9rem', 
                        color: '#FFFFFF', 
                        fontWeight: 'bold'
                      }}>
                        TOTALE DA PAGARE
                      </Typography>
                    </Box>
                    <Typography sx={{ 
                      fontSize: '1.9rem', 
                      color: '#FFFFFF', 
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
                      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                      color: '#000',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: 'none',
                      mb: 0.5,
                      letterSpacing: '0.04em',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
                        boxShadow: 'none',
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
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ShoppingBagRoundedIcon sx={{ fontSize: '1.4rem', color: '#FFFFFF' }} /> Articoli nel Carrello
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
                                gap: 0.3,
                                height: '130px',
                                position: 'relative',
                                '&:hover': {
                                  backgroundColor: '#252525',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                  transition: 'all 0.2s ease',
                                }
                              }}>
                                {/* Riga 1: Codice */}
                                <Box sx={{ fontSize: '0.65rem', fontWeight: '500', color: '#FFFFFF' }}>
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
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: '1.2rem', color: '#FFFFFF' }} />
                                </IconButton>
                                
                                {/* Riga 2: Descrizione con Colore e Taglia */}
                                <Box sx={{ fontSize: '0.75rem', color: '#FFFFFF', lineHeight: '1.1', whiteSpace: 'normal', flex: 1 }}>
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
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.3, marginTop: 'auto', marginBottom: '0.5rem' }}>
                                  <ButtonGroup size="medium" variant="outlined" sx={{
                                    '& .MuiButton-root': {
                                      borderRadius: 0,
                                      border: '1px solid #FF9800',
                                      color: '#FF9800',
                                      transition: 'all 0.3s ease',
                                      fontSize: '0.55rem',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                        borderColor: '#F57C00',
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
                                        border: '1px solid #FF9800',
                                        borderRadius: 0,
                                        '&.Mui-disabled': {
                                          color: '#E0E0E0',
                                          borderColor: '#FF9800',
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
                                  border: '1px solid rgba(76, 175, 80, 0.2)',
                                  marginTop: 'auto'
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
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            elevation: 0
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
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            borderRadius: 3,
            elevation: 0
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
