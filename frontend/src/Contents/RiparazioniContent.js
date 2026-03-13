import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import API_BASE_URL from '../config';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
  TableSortLabel,
  Dialog,
  Paper,
  MenuItem,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AirIcon from '@mui/icons-material/Air';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import BuildCircleIcon from '@mui/icons-material/BuildCircleOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAllOutlined';

const TABLE_NAME = 'riparazioni';
const LIST_COLUMNS = ['history_action', 'data_checkin', 'data_checkout', 'cognome', 'stato_riparazione', 'cliente_avvisato', 'hpa'];

export default function RiparazioniContent() {
  const theme = useTheme();
  const [openHistory, setOpenHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [riparazioni, setRiparazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  // Stato per il dialog di dettaglio cronostoria
  const [openHistoryDetail, setOpenHistoryDetail] = useState(false);
  const [historyDetailRow, setHistoryDetailRow] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [columns, setColumns] = useState([]);
  const [statoFilter, setStatoFilter] = useState('');
  const [statoOptions, setStatoOptions] = useState([]);
  const [viewAll, setViewAll] = useState(false);
  const [orderBy, setOrderBy] = useState('data_checkin');
  const [orderDirection, setOrderDirection] = useState('desc');
  const [statoCount, setStatoCount] = useState({});
  const [openNewRepair, setOpenNewRepair] = useState(false);
  const [newRepairData, setNewRepairData] = useState({
    data_checkin: new Date().toISOString().split('T')[0],
    cognome: '',
    garanzia: false,
    acconto: '',
    problema_riscontrato: '',
    accessori: ''
  });
  const [confirmSaveDialog, setConfirmSaveDialog] = useState(false);
  // Funzione per aprire il dialog e caricare la cronostoria
  const handleOpenHistory = async (row) => {
    setOpenHistory(true);
    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryData([]);
    try {
      // Chiamata tramite cognome
      const response = await fetch(`${API_BASE_URL}/riparazioni/history?cognome=${encodeURIComponent(row.cognome)}`);
      const data = await response.json();
      if (data.success) {
        setHistoryData(data.data);
      } else {
        setHistoryError(data.error || 'Errore nel caricamento della cronostoria');
      }
    } catch (err) {
      setHistoryError('Errore: ' + err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (err) {
      return dateString;
    }
  };

  const handleSort = (column) => {
    if (orderBy === column) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDirection('asc');
    }
  };

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let valA = a[orderBy];
      let valB = b[orderBy];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return orderDirection === 'asc' ? -1 : 1;
      if (valA > valB) return orderDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getColumnLabel = (column) => {
    const labels = {
      'data_checkin': 'CHECKIN',
      'data_checkout': 'CHECKOUT',
      'cognome': 'COGNOME',
      'stato_riparazione': 'STATO',
      'cliente_avvisato': 'AVVISATO',
      'hpa': 'HPA',
    };
    return labels[column] || column.toUpperCase();
  };

  const getRowBackgroundColor = (stato) => {
    switch (stato) {
      case 'ORDINE RICAMBI':
        return '#FFFF00'; // Giallo
      case 'RIPARAZIONE NON ESEGUITA':
        return '#000000'; // Nero
      case 'PRONTO':
        return '#4CAF50'; // Verde scuro
      case 'IN ATTESA DI RIPARAZIONE':
        return '#FF0000'; // Rosso
      case 'IN RIPARAZIONE':
        return '#FFA500'; // Arancione
      case 'CONSEGNATO':
        return '#2196F3'; // Blu
      case 'NON RIPARABILE':
        return '#9C27B0'; // Viola
      case 'RESO AL CLIENTE':
        return '#757575'; // Grigio
      default:
        return 'inherit';
    }
  };

  const getRowTextColor = (stato) => {
    switch (stato) {
      case 'ORDINE RICAMBI':
        return '#000000'; // Testo nero su giallo
      case 'RIPARAZIONE NON ESEGUITA':
        return '#FFFFFF'; // Testo bianco su nero
      case 'PRONTO':
        return '#FFFFFF'; // Testo bianco su verde scuro
      case 'IN ATTESA DI RIPARAZIONE':
        return '#FFFFFF'; // Testo bianco su rosso
      case 'IN RIPARAZIONE':
        return '#000000'; // Testo nero su arancione
      case 'CONSEGNATO':
        return '#FFFFFF'; // Testo bianco su blu
      case 'NON RIPARABILE':
        return '#FFFFFF'; // Testo bianco su viola
      case 'RESO AL CLIENTE':
        return '#FFFFFF'; // Testo bianco su grigio
      default:
        return 'text.primary';
    }
  };

  useEffect(() => {
    fetchRiparazioni();
    fetchStatoOptions();
  }, []);

  const fetchStatoOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/riparazioni/distinct?table=${TABLE_NAME}&field=stato_riparazione`);
      const data = await response.json();
      if (data.success) {
        setStatoOptions(data.data);
      }
    } catch (err) {
      console.error('Errore nel caricamento degli stati:', err);
    }
  };

  const fetchRiparazioni = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/riparazioni/select?table=${TABLE_NAME}`);
      const data = await response.json();
      
      if (data.success) {
        setRiparazioni(data.data);
        if (data.data.length > 0) {
          setColumns(Object.keys(data.data[0]));
          
          // Calcola il count per ogni stato
          const counts = {};
          data.data.forEach(row => {
            const stato = row.stato_riparazione || 'N/D';
            counts[stato] = (counts[stato] || 0) + 1;
          });
          setStatoCount(counts);
        }
      } else {
        setError(data.error || 'Errore nel caricamento dei dati');
      }
    } catch (err) {
      setError('Errore: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (row) => {
    setSelectedRow(row);
    setFormData(row);
    setEditingId(null);
  };

  const handleOpenEdit = () => {
    if (selectedRow && !editingId) {
      setEditingId(selectedRow.id);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const response = await fetch(`${API_BASE_URL}/riparazioni/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: TABLE_NAME,
            id: editingId,
            data: formData
          })
        });
        const data = await response.json();
        if (data.success) {
          fetchRiparazioni();
          setSelectedRow(null);
          setEditingId(null);
        } else {
          setError(data.error);
        }
      }
    } catch (err) {
      setError('Errore: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo record?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/riparazioni/delete?table=${TABLE_NAME}&id=${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          fetchRiparazioni();
          setSelectedRow(null);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Errore: ' + err.message);
      }
    }
  };

  const handleSaveNewRepair = async () => {
    if (!newRepairData.cognome.trim()) {
      setError('Il cognome è obbligatorio');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/riparazioni/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: TABLE_NAME,
          data: newRepairData
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchRiparazioni();
        setOpenNewRepair(false);
        setNewRepairData({
          data_checkin: new Date().toISOString().split('T')[0],
          cognome: '',
          garanzia: false,
          acconto: '',
          problema_riscontrato: '',
          accessori: ''
        });
        setConfirmSaveDialog(false);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Errore: ' + err.message);
    }
  };

  const computeFormFields = () => {
    const otherFields = columns.filter(col => col !== 'problema_riscontrato' && col !== 'foto' && col !== 'hpa' && col !== 'wraithhpa' && col !== 'accessori' && col !== 'cliente_avvisato' && col !== 'data_checkout' && col !== 'garanzia' && col !== 'camo' && col !== 'camp' && col !== 'id');
    const sostituiteIdx = otherFields.indexOf('sostituite');
    let fieldsOrder = [...otherFields];
    if (sostituiteIdx !== -1) {
      let insertIdx = sostituiteIdx + 1;
      if (columns.includes('camo')) fieldsOrder.splice(insertIdx++, 0, 'camo');
      if (columns.includes('accessori')) fieldsOrder.splice(insertIdx++, 0, 'accessori');
      if (columns.includes('garanzia')) fieldsOrder.splice(insertIdx++, 0, 'garanzia');
      let garCli = [];
      if (columns.includes('cliente_avvisato')) garCli.push('cliente_avvisato');
      if (columns.includes('data_checkout')) garCli.push('data_checkout');
      if (garCli.length > 0) fieldsOrder.splice(insertIdx++, 0, garCli);
      if (columns.includes('hpa')) fieldsOrder.splice(insertIdx++, 0, 'hpa');
      if (columns.includes('wraithhpa')) fieldsOrder.splice(insertIdx++, 0, 'wraithhpa');
    } else {
      if (columns.includes('accessori')) fieldsOrder.push('accessori');
      if (columns.includes('garanzia')) fieldsOrder.push('garanzia');
      if (columns.includes('camo')) fieldsOrder.push('camo');
      let garCli = [];
      if (columns.includes('cliente_avvisato')) garCli.push('cliente_avvisato');
      if (columns.includes('data_checkout')) garCli.push('data_checkout');
      if (garCli.length > 0) fieldsOrder.push(garCli);
      if (columns.includes('hpa')) fieldsOrder.push('hpa');
      if (columns.includes('wraithhpa')) fieldsOrder.push('wraithhpa');
    }
    const hpaFields = fieldsOrder.filter(col => typeof col === 'string' && col.toLowerCase().includes('hpa'));
    const otherFieldsNoHpa = fieldsOrder.filter(col => !(typeof col === 'string' && col.toLowerCase().includes('hpa')));

    const renderField = (column, idx) => {
      if (column === 'configurazionehpa') {
        return (
          <Grid item xs={12} sm={6} md={3} key={column} sx={{ mb: 0.2 }}>
            <TextField
              select
              label={column}
              value={formData[column] ?? ''}
              onChange={e => setFormData({ ...formData, [column]: e.target.value })}
              fullWidth
              size="small"
              disabled={!editingId}
              inputProps={{ style: { fontSize: '0.7rem' } }}
              InputLabelProps={{ style: { color: 'grey' } }}
              sx={{
                mb: 0.2,
                '& .MuiOutlinedInput-input.Mui-disabled': {
                  color: 'white',
                  WebkitTextFillColor: 'white !important'
                }
              }}
            >
              <MenuItem value=""><em>-- Seleziona --</em></MenuItem>
              <MenuItem value="DMR">DMR</MenuItem>
              <MenuItem value="CQB">CQB</MenuItem>
              <MenuItem value="SMG">SMG</MenuItem>
            </TextField>
          </Grid>
        );
      } else if (column === 'aperturahpa') {
        return (
          <Grid item xs={12} sm={6} md={3} key={column} sx={{ mb: 0.2 }}>
            <TextField
              select
              label={column}
              value={formData[column] ?? ''}
              onChange={e => setFormData({ ...formData, [column]: e.target.value })}
              fullWidth
              size="small"
              disabled={!editingId}
              inputProps={{ style: { fontSize: '0.7rem' } }}
              InputLabelProps={{ style: { color: 'grey' } }}
              sx={{
                mb: 0.2,
                '& .MuiOutlinedInput-input.Mui-disabled': {
                  color: 'white',
                  WebkitTextFillColor: 'white !important'
                }
              }}
            >
              <MenuItem value=""><em>-- Seleziona --</em></MenuItem>
              <MenuItem value="OPEN">OPEN</MenuItem>
              <MenuItem value="CLOSE">CLOSE</MenuItem>
            </TextField>
          </Grid>
        );
      }

      if (Array.isArray(column)) {
        return (
          <Grid container spacing={0.7} key="garCli">
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ mb: 0.2 }}>
              <FormControlLabel control={<Checkbox checked={!!formData['garanzia']} onChange={e => editingId && setFormData({ ...formData, garanzia: e.target.checked ? 1 : 0 })} disabled={!editingId} sx={{ color: 'orange' }} />} label={<span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'grey' }}>garanzia</span>} sx={{ ml: 0.5, mb: 0.2 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ mb: 0.2 }}>
              <FormControlLabel control={<Checkbox checked={!!formData['cliente_avvisato']} onChange={e => editingId && setFormData({ ...formData, cliente_avvisato: e.target.checked ? 1 : 0 })} disabled={!editingId} sx={{ color: 'orange' }} />} label={<span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'grey' }}>cliente avvisato</span>} sx={{ ml: 0.5, mb: 0.2 }} />
            </Grid>
            {column.includes('data_checkout') && (
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ mb: 0.2 }}>
                {(() => {
                  const dateValue = formData['data_checkout'] ?? '';
                  const formattedValue = dateValue ? (dateValue.includes('-') ? dateValue : dateValue.split('/').reverse().join('-')) : '';
                  return (
                    <TextField type="date" label="data_checkout" value={formattedValue} onChange={e => setFormData({ ...formData, data_checkout: e.target.value })} fullWidth size="small" disabled={!editingId} inputProps={{ style: { fontSize: '0.7rem' } }} InputLabelProps={{ shrink: true, style: { color: 'grey' } }} sx={{ mb: 0.2, '& .MuiOutlinedInput-input.Mui-disabled': { color: 'white', WebkitTextFillColor: 'white !important' } }} />
                  );
                })()}
              </Grid>
            )}
          </Grid>
        );
      }

      if (column === 'sostituite') {
        return (
          <Grid item xs={12} sm={12} md={6} lg={6} xl={6} key="sostituite" sx={{ mb: 0.2 }}>
            <TextField label="sostituite" value={formData.sostituite ?? ''} onChange={(e) => setFormData({ ...formData, sostituite: e.target.value })} fullWidth size="small" disabled={!editingId} inputProps={{ style: { fontSize: '0.9rem' } }} InputLabelProps={{ style: { color: 'grey' } }} sx={{ mb: 0.2, '& .MuiOutlinedInput-input.Mui-disabled': { color: 'white', WebkitTextFillColor: 'white !important' } }} />
          </Grid>
        );
      }

      if (column === 'accessori') {
        return (
          <Grid item xs={12} key="accessori" sx={{ mb: 2 }}>
            <TextField label="accessori" value={formData.accessori ?? ''} onChange={(e) => setFormData({ ...formData, accessori: e.target.value })} fullWidth size="small" disabled={!editingId} inputProps={{ style: { fontSize: '0.9rem' } }} InputLabelProps={{ style: { color: 'grey' } }} sx={{ mb: 0.2, '& .MuiOutlinedInput-input.Mui-disabled': { color: 'white', WebkitTextFillColor: 'white !important' } }} />
          </Grid>
        );
      }

      if (column === 'garanzia') return null;
      if (column === 'cliente_avvisato') {
        return (
          <Grid item xs={12} sm={6} md={3} key="cliente_avvisato" sx={{ mb: 0.2 }}>
            <FormControlLabel control={<Checkbox checked={!!formData['cliente_avvisato']} onChange={e => editingId && setFormData({ ...formData, cliente_avvisato: e.target.checked ? 1 : 0 })} disabled={!editingId} sx={{ color: 'orange' }} />} label={<span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'grey' }}>cliente avvisato</span>} sx={{ ml: 0.5, mb: 0.2 }} />
          </Grid>
        );
      }

      if (column === 'data_checkout') {
        const dateValue = formData['data_checkout'] ?? '';
        const formattedValue = dateValue ? (dateValue.includes('-') ? dateValue : dateValue.split('/').reverse().join('-')) : '';
        const statoRiparazione = formData['stato_riparazione'] ?? '';
        const isAutoFilled = ['CONSEGNATO', 'RESO AL CLIENTE', 'RIPARAZIONE NON ESEGUITA'].includes(statoRiparazione) && dateValue;
        const isReadOnly = isAutoFilled || !editingId;
        return (
          <Grid item xs={12} sm={6} md={3} key="data_checkout" sx={{ mb: 0.2 }}>
            <TextField type="date" label="data_checkout" value={formattedValue} onChange={e => !isReadOnly && setFormData({ ...formData, data_checkout: e.target.value })} fullWidth size="small" disabled={isReadOnly} InputLabelProps={{ shrink: true, style: { color: 'grey' } }} sx={{ mb: 0.2, '& .MuiOutlinedInput-input.Mui-disabled': { color: 'white', WebkitTextFillColor: 'white !important' } }} />
          </Grid>
        );
      }

      if (column === 'stato_riparazione') {
        return (
          <Grid item xs={12} sm={6} md={3} key="stato_riparazione" sx={{ mb: 0.2 }}>
            <TextField select label="stato_riparazione" value={formData['stato_riparazione'] ?? ''} onChange={e => {
              const newStato = e.target.value;
              const updatedFormData = { ...formData, stato_riparazione: newStato };
              if (['CONSEGNATO', 'RESO AL CLIENTE', 'RIPARAZIONE NON ESEGUITA'].includes(newStato) && !formData['data_checkout']) {
                const today = new Date().toISOString().split('T')[0];
                updatedFormData.data_checkout = today;
              } else if (!['CONSEGNATO', 'RESO AL CLIENTE', 'RIPARAZIONE NON ESEGUITA'].includes(newStato)) {
                updatedFormData.data_checkout = '';
              }
              setFormData(updatedFormData);
            }} fullWidth size="small" disabled={!editingId} inputProps={{ style: { fontSize: '0.7rem' } }} InputLabelProps={{ style: { color: 'grey' } }} sx={{ mb: 0.2, '& .MuiOutlinedInput-input.Mui-disabled': { color: 'white', WebkitTextFillColor: 'white !important' } }}>
              <MenuItem value=""><em>-- Seleziona --</em></MenuItem>
              {statoOptions.map(option => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
            </TextField>
          </Grid>
        );
      }

      if (column === 'camo') {
        return (
          <Grid item xs={12} sm={6} md={3} key="camo" sx={{ mb: 0.2 }}>
            <FormControlLabel control={<Checkbox checked={!!formData['camo']} onChange={e => editingId && setFormData({ ...formData, camo: e.target.checked ? 1 : 0 })} disabled={!editingId} sx={{ color: 'orange' }} />} label={<span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'grey' }}>camo</span>} sx={{ ml: 0.5, mb: 0.2 }} />
          </Grid>
        );
      }

      if (column === 'statohpa') {
        return (
          <Grid item xs={12} sm={6} md={3} key={column} sx={{ mb: 0.2 }}>
            <TextField select label={column} value={formData[column] ?? ''} onChange={e => setFormData({ ...formData, [column]: e.target.value })} fullWidth size="small" disabled={!editingId} inputProps={{ style: { fontSize: '0.9rem' } }} InputLabelProps={{ style: { color: 'grey' } }} sx={{ mb: 0.2, '& .MuiOutlinedInput-input.Mui-disabled': { color: 'white', WebkitTextFillColor: 'white !important' } }}>
              <MenuItem value=""><em>-- Seleziona --</em></MenuItem>
              <MenuItem value="VENDUTO">VENDUTO</MenuItem>
              <MenuItem value="CASA">CASA</MenuItem>
            </TextField>
          </Grid>
        );
      }

      if (column === 'enginehpa') {
        return (
          <Grid item xs={12} sm={6} md={3} key={column} sx={{ mb: 0.2 }}>
            <TextField select label={column} value={formData[column] ?? ''} onChange={e => setFormData({ ...formData, [column]: e.target.value })} fullWidth size="small" disabled={!editingId} inputProps={{ style: { fontSize: '0.9rem' } }} InputLabelProps={{ style: { color: 'grey' } }} sx={{ mb: 0.2, '& .MuiOutlinedInput-input.Mui-disabled': { color: 'white', WebkitTextFillColor: 'white !important' } }}>
              <MenuItem value=""><em>-- Seleziona --</em></MenuItem>
              <MenuItem value="INFERNO">INFERNO</MenuItem>
              <MenuItem value="AAP01">AAP01</MenuItem>
              <MenuItem value="POLASTAR">POLASTAR</MenuItem>
              <MenuItem value="PULSAR">PULSAR</MenuItem>
              <MenuItem value="ALTRO">ALTRO</MenuItem>
            </TextField>
          </Grid>
        );
      }

      if (column === 'hpa') {
        return (
          <Grid item xs={12} sm={6} md={3} key="hpa" sx={{ mb: 0.2 }}>
            <FormControlLabel control={<Checkbox checked={!!formData['hpa']} onChange={e => editingId && setFormData({ ...formData, hpa: e.target.checked ? 1 : 0 })} disabled={!editingId} sx={{ color: 'orange' }} />} label={<span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'grey' }}>hpa</span>} sx={{ ml: 0.5, mb: 0.2 }} />
          </Grid>
        );
      }

      if (column === 'wraithhpa') {
        return (
          <Grid item xs={12} sm={6} md={3} key="wraithhpa" sx={{ mb: 0.2 }}>
            <FormControlLabel control={<Checkbox checked={!!formData['wraithhpa']} onChange={e => editingId && setFormData({ ...formData, wraithhpa: e.target.checked ? 1 : 0 })} disabled={!editingId} sx={{ color: 'orange' }} />} label={<span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'grey' }}>wraithhpa</span>} sx={{ ml: 0.5, mb: 0.2 }} />
          </Grid>
        );
      }

      return (
        <Grid item xs={12} sm={6} md={3} key={column} sx={{ mb: 0.2 }}>
          <TextField label={column} value={formData[column] ?? ''} onChange={(e) => setFormData({ ...formData, [column]: e.target.value })} fullWidth size="small" disabled={!editingId} inputProps={{ style: { fontSize: '0.8rem' } }} InputLabelProps={{ style: { color: 'grey' } }} sx={{ mb: 0.2, '& .MuiOutlinedInput-input.Mui-disabled': { color: 'white', WebkitTextFillColor: 'white !important' } }} />
        </Grid>
      );
    };

    const renderedFields = otherFieldsNoHpa.map(renderField);
    let renderedHpaFields = null;
    if (hpaFields.length > 0) {
      renderedHpaFields = (
        <Grid item xs={12} md={12} lg={12} xl={12} sx={{ mb: 1.5, mt: 0.5 }}>
          <Box sx={{ border: '2px solid orange', borderRadius: 2, p: 1, width: '100%', overflow: 'visible', position: 'relative', zIndex: 10 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'orange', mb: 1, fontSize: '1.01rem' }}>HPA</Typography>
            <Grid container spacing={0.7} sx={{ overflow: 'visible', position: 'relative' }}>
              {hpaFields.map((col, idx) => renderField(col, idx))}
            </Grid>
          </Box>
        </Grid>
      );
    }

    return [
      ...renderedFields,
      renderedHpaFields
    ];
  };

  return (
    <Paper elevation={8} sx={{
      p: 2.5,
      backgroundColor: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      borderRadius: 3,
      m: { xs: 0.5, md: 2 },
      flex: 1,
      minHeight: 0,
      height: '90vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Card filtro stato e Nuova Riparazione in linea */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Card TUTTI TRANNE CONSEGNATI */}
          <Card
            onClick={() => setStatoFilter('')}
            sx={{
              p: 0.3,
              cursor: 'pointer',
              bgcolor: statoFilter === '' ? '#FF9800' : 'background.paper',
              color: 'white',
              minWidth: 70,
              maxWidth: 130,
              width: 130,
              height: 48,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              borderRadius: '10px',
              boxShadow: 'none',
              border: '1.5px solid #222',
              '&:hover': {
                boxShadow: 'none',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.62rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>TUTTI (NO CONS.)</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.78rem', mt: 0.2 }}>
              {riparazioni.length - (statoCount['CONSEGNATO'] || 0)}
            </Typography>
          </Card>

          {/* Card per ogni stato */}
          {['CONSEGNATO', 'IN ATTESA DI RIPARAZIONE', 'IN RIPARAZIONE', 'PRONTO', 'NON RIPARABILE', 'ORDINE RICAMBI', 'RESO AL CLIENTE', 'RIPARAZIONE NON ESEGUITA'].map((stato) => {
            // Funzione per scurire il colore di background
            const darkenColor = (color, amount = 0.25) => {
              // Solo per colori HEX a 6 cifre
              if (!color || color[0] !== '#' || color.length !== 7) return color;
              let r = parseInt(color.slice(1, 3), 16);
              let g = parseInt(color.slice(3, 5), 16);
              let b = parseInt(color.slice(5, 7), 16);
              r = Math.floor(r * (1 - amount));
              g = Math.floor(g * (1 - amount));
              b = Math.floor(b * (1 - amount));
              return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            };
            const baseBg = getRowBackgroundColor(stato);
            const darkBg = darkenColor(baseBg, 0.55);
            return (
              <Card
                key={stato}
                onClick={() => setStatoFilter(stato)}
                sx={{
                  p: 0.3,
                  cursor: 'pointer',
                  bgcolor: darkBg,
                  color: 'white',
                  minWidth: 70,
                  maxWidth: 90,
                  width: 90,
                  height: 48,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  borderRadius: '10px',
                  boxShadow: 'none',
                  border: '1.5px solid #222',
                  '&:hover': {
                    boxShadow: 'none',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.62rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{stato}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.78rem', mt: 0.2 }}>
                  {statoCount[stato] || 0}
                </Typography>
              </Card>
            );
          })}
        </Box>
        {/* Il pulsante Nuova Riparazione ora si trova accanto a 'Elenco Riparazioni' */}
      </Box>
      {!loading && riparazioni.length === 0 && (
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Nessuna riparazione registrata
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && riparazioni.length > 0 && (
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, height: '100%' }}>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0 }}>
                Elenco Riparazioni
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} disabled={loading} onClick={() => setOpenNewRepair(true)}>
                Nuova Riparazione
              </Button>
            </Box>
            <TableContainer component={Card} sx={{ flex: 1, minHeight: 0, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#252525', height: '40px', position: 'sticky', top: 0, zIndex: 2 }}>
                    <TableCell key="history_action" sx={{ width: 40, fontWeight: 600, color: '#FF9800', borderBottom: '2px solid #333', fontSize: '0.7rem', textAlign: 'center', bgcolor: '#252525', padding: '4px 6px' }}>
                      {/* Vuoto, solo icona */}
                    </TableCell>
                    {LIST_COLUMNS.filter(c => c !== 'history_action').map((column) => (
                      <TableCell
                        key={column}
                        onClick={() => handleSort(column)}
                        sx={{
                          fontWeight: 600,
                          color: '#FF9800',
                          borderBottom: '2px solid #333',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          userSelect: 'none',
                          padding: '4px 6px',
                          backgroundColor: '#252525',
                          letterSpacing: '0px',
                          '&:hover': {
                            backgroundColor: '#2A2A2A',
                          },
                        }}
                      >
                        <TableSortLabel
                          active={orderBy === column}
                          direction={orderBy === column ? orderDirection : 'asc'}
                          sx={{ color: '#FF9800', '& .MuiTableSortLabel-icon': { color: '#FF9800 !important' } }}
                        >
                          {getColumnLabel(column)}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortData(riparazioni
                    .filter(row => {
                      // Filtro per stato_riparazione
                      if (statoFilter && row.stato_riparazione !== statoFilter) {
                        return false;
                      }
                      // Nascondi CONSEGNATO solo se NON c'è un filtro attivo E viewAll è false
                      if (!statoFilter && !viewAll && row.stato_riparazione === 'CONSEGNATO') {
                        return false;
                      }
                      return true;
                    })
                  ).map((row, rowIndex) => (
                    <TableRow
                      key={row.id}
                      id={`row-riparazione-${row.id}`}
                      hover
                      onClick={() => handleSelectRow(row)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: selectedRow?.id === row.id ? '#252525' : (rowIndex % 2 === 0 ? '#1E1E1E' : '#252525'),
                        '&:hover': { backgroundColor: '#2A2A2A' },
                        borderBottom: '1px solid #333333',
                        minHeight: 32,
                        height: 32,
                      }}
                    >
                      {/* Colonna azione cronostoria */}
                      <TableCell key="history_action" sx={{ textAlign: 'center', minHeight: 16, height: 16, padding: '4px', color: '#fff', fontSize: '0.75rem', borderBottom: '1px solid #333333', backgroundColor: 'inherit' }}>
                        <Button onClick={e => { e.stopPropagation(); handleOpenHistory(row); }} size="small" variant="text" color="primary" sx={{ minWidth: 0, p: 0.5 }}>
                          <HistoryIcon fontSize="small" />
                        </Button>
                      </TableCell>
                      {LIST_COLUMNS.filter(c => c !== 'history_action').map((column) => (
                        <TableCell 
                          key={column} 
                          sx={{ 
                            bgcolor: column === 'stato_riparazione' ? getRowBackgroundColor(row.stato_riparazione) : 'inherit',
                            color: column === 'stato_riparazione' ? getRowTextColor(row.stato_riparazione) : '#fff',
                            fontSize: '0.75rem', 
                            fontWeight: column === 'stato_riparazione' ? 600 : 400,
                            minHeight: 16,
                            height: 16,
                            padding: '4px',
                            borderBottom: '1px solid #333333',
                            backgroundColor: column === 'stato_riparazione' ? getRowBackgroundColor(row.stato_riparazione) : 'inherit',
                            color: column === 'stato_riparazione' ? getRowTextColor(row.stato_riparazione) : '#fff',
                          }}>
                          {column === 'cliente_avvisato' ? (
                            row[column] === 1 ? (
                              <ThumbUpIcon sx={{ color: '#4CAF50', fontSize: '1.2rem' }} />
                            ) : row[column] === 0 ? (
                              <ThumbDownIcon sx={{ color: '#F44336', fontSize: '1.2rem' }} />
                            ) : (
                              '-'
                            )
                          ) : column === 'hpa' ? (
                            row[column] ? (
                              <AirIcon sx={{ color: '#2196F3', fontSize: '1.2rem' }} title={`HPA: ${row[column]}`} />
                            ) : (
                              '-'
                            )
                          ) : column === 'data_checkin' && row[column] ? (
                            formatDate(row[column])
                          ) : column === 'data_checkout' && row[column] ? (
                            formatDate(row[column])
                          ) : row[column] !== null && row[column] !== undefined ? (
                            String(row[column]).substring(0, 30)
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      ))}
                          {/* Dialog cronostoria */}
                          <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="sm" fullWidth>
                            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, minHeight: 700, display: 'flex', flexDirection: 'column', height: 700 }}>
                              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', fontSize: '1.05rem' }}>Cronostoria Riparazione</Typography>
                              {historyLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                  <CircularProgress />
                                </Box>
                              ) : historyError ? (
                                <Alert severity="error">{historyError}</Alert>
                              ) : historyData.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">Nessuna cronostoria disponibile.</Typography>
                              ) : (
                                <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {historyData.map((item, idx) => (
                                    <Card
                                      key={idx}
                                      variant="outlined"
                                      sx={{
                                        width: '92%',
                                        minWidth: 260,
                                        maxWidth: '92%',
                                        minHeight: 160,
                                        mx: 'auto',
                                        mb: 1.2,
                                        pb: 1.5,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(255,255,255,0.13)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1.5px solid rgba(255,255,255,0.22)',
                                        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                                        cursor: 'pointer',
                                        transition: 'box-shadow 0.18s, border-color 0.18s',
                                        '&:hover': {
                                          boxShadow: '0 12px 36px 0 rgba(31,38,135,0.22)',
                                          borderColor: 'rgba(0,0,0,0.18)',
                                          backgroundColor: 'rgba(255,255,255,0.18)',
                                        },
                                        p: 0,
                                      }}
                                      onClick={() => {
                                        setTimeout(() => {
                                          const row = riparazioni.find(r => r.id === item.id);
                                          if (row) {
                                            setHistoryDetailRow(row);
                                            setOpenHistoryDetail(true);
                                          }
                                        }, 100);
                                      }}
                                    >
                                      <CardContent sx={{ py: 1, px: 1.5, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 2 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48, mr: 1, flexShrink: 0 }}>
                                          {item.stato === 'CONSEGNATO' ? (
                                            <DoneAllIcon sx={{ color: 'success.main', fontSize: 32 }} />
                                          ) : item.stato === 'IN RIPARAZIONE' ? (
                                            <BuildCircleIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                                          ) : (
                                            <AssignmentIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                                          )}
                                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.78rem', mt: 0.5 }}>
                                            ID: {item.id}
                                          </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.93rem', letterSpacing: 0.2, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                              {item.data ? formatDate(item.data) : ''}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
                                            <Box sx={{ bgcolor: 'secondary.main', color: 'white', px: 1, py: 0.2, borderRadius: 1, fontSize: '0.74rem', fontWeight: 700, letterSpacing: 0.3 }}>
                                              {item.stato}
                                            </Box>
                                          </Box>
                                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.81rem', wordBreak: 'break-word', whiteSpace: 'pre-line', mb: 0.2 }}>
                                            <span style={{ fontWeight: 700, color: theme.palette.info.dark, fontSize: '0.81rem' }}>Modello:</span> {item.modello ? item.modello : 'Non specificato'}
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.74rem', wordBreak: 'break-word', whiteSpace: 'pre-line', mb: 0, width: '100%' }}>
                                            <span style={{ fontWeight: 700, color: '#FF9800', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.81rem' }}>PROBLEMA:</span> {item.problema_riscontrato ? item.problema_riscontrato.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : 'Non specificato'}
                                          </Typography>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 2 }}>
                                <Button onClick={() => setOpenHistory(false)} variant="outlined" color="primary">Chiudi</Button>
                              </Box>
                            </Box>
                          </Dialog>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Dettagli Riparazione
            </Typography>
            {selectedRow ? (
              <Card sx={{ bgcolor: 'background.paper', flex: '0 1 800px', maxHeight: 800, minHeight: 0, boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', p: 1.2, overflow: 'hidden' }}>
                  <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, overflowX: 'visible' }}>
                    <Grid container spacing={0.7} sx={{ pt: 2 }}>
                      {/* Altri campi tranne problema_riscontrato e foto */}
                      {computeFormFields()} 
                      {columns.includes('foto') && columns.includes('problema_riscontrato') && (
                        <Grid item xs={12} key="foto" sx={{ mb: 0.2 }}>
                          <TextField
                            label="foto"
                            value={formData['foto'] ?? ''}
                            onChange={(e) => setFormData({ ...formData, ['foto']: e.target.value })}
                            fullWidth
                            size="small"
                            disabled={!editingId}
                            InputLabelProps={{
                              style: {
                                fontSize: '0.91rem',
                                fontWeight: 700,
                                letterSpacing: 0.2,
                                color: 'grey',
                                textShadow: '0 1px 3px #000, 0 0px 1px #222',
                                WebkitTextStroke: '0.2px #222'
                              }
                            }}
                            inputProps={{
                              style: {
                                fontSize: '0.81rem',
                                padding: '10px 9px 4px 9px',
                                color: 'white',
                                '::placeholder': { color: 'orange', opacity: 1 }
                              }
                            }}
                            sx={{ mb: 0.2 }}
                          />
                        </Grid>
                      )}
                      {/* Campo problema_riscontrato in fondo, largo 4 colonne */}
                      {columns.includes('problema_riscontrato') && (
                        <Grid item xs={12} key="problema_riscontrato" sx={{ mb: 0.2 }}>
                          <TextField
                            label="problema_riscontrato"
                            value={formData['problema_riscontrato'] ?? ''}
                            onChange={(e) => setFormData({ ...formData, ['problema_riscontrato']: e.target.value })}
                            fullWidth
                            size="small"
                            disabled={!editingId}
                            multiline
                            minRows={2}
                            InputLabelProps={{
                              style: {
                                fontSize: '0.91rem',
                                fontWeight: 700,
                                letterSpacing: 0.2,
                                color: 'grey',
                                textShadow: '0 1px 3px #000, 0 0px 1px #222',
                                WebkitTextStroke: '0.2px #222'
                              }
                            }}
                            inputProps={{
                              style: {
                                fontSize: '0.97rem',
                                padding: '11px 9px 4px 9px',
                                color: 'white',
                                '::placeholder': { color: 'orange', opacity: 1 }
                              }
                            }}
                            sx={{ mb: 0.2 }}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.7, pt: 1 }}>
                    {!editingId ? (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={handleOpenEdit}
                          fullWidth
                          sx={{ fontSize: '0.85rem', py: 0.6, minWidth: 0 }}
                        >
                          Modifica
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(selectedRow.id)}
                          fullWidth
                          sx={{ fontSize: '0.85rem', py: 0.6, minWidth: 0 }}
                        >
                          Elimina
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setFormData(selectedRow);
                            setEditingId(null);
                          }}
                          fullWidth
                          sx={{ fontSize: '0.85rem', py: 0.6, minWidth: 0 }}
                        >
                          Annulla
                        </Button>
                        <Button variant="contained" onClick={handleSave} fullWidth sx={{ fontSize: '0.85rem', py: 0.6, minWidth: 0 }}>
                          Salva
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    Seleziona una riga dalla tabella a sinistra per visualizzare i dettagli
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}
      {/* Dialog Dettaglio Cronostoria (sola lettura) */}
      <Dialog
        open={openHistoryDetail}
        onClose={() => setOpenHistoryDetail(false)}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxWidth: '98vw',
            width: '98vw',
            margin: 0,
          }
        }}
      >
        <Box sx={{
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: 2,
          mx: 'auto',
        }}>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700, color: 'primary.main', textAlign: 'center', fontSize: '1.13rem', letterSpacing: 0.5 }}>
            Dettaglio Riparazione (ID: {historyDetailRow?.id})
          </Typography>
          {historyDetailRow ? (
            (() => {
              const entries = Object.entries(historyDetailRow);
              // Calcola il numero di colonne in base all'altezza della finestra e al numero di campi
              const rowHeight = 56; // px, altezza stimata di ogni voce
              const maxRows = Math.floor((window.innerHeight - 180) / rowHeight); // 180px margine per titolo/bottoni
              let columns = Math.ceil(entries.length / maxRows);
              if (columns < 1) columns = 1;
              if (columns > 6) columns = 6;
              return (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: 1,
                    alignItems: 'stretch',
                  }}
                >
                  {entries.map(([key, value]) => (
                    <Box
                      key={key}
                      sx={{
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        p: 0.2,
                        mb: 0.3,
                        boxShadow: 0,
                        minHeight: 32,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.74rem', textAlign: 'left', letterSpacing: 0.2, width: '100%' }}>
                          {key.toUpperCase()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, wordBreak: 'break-word', fontSize: '0.93rem', lineHeight: 1.2, textAlign: 'left', width: '100%' }}>
                          {value === null || value === undefined || value === '' ? '-' : (key.includes('data') ? formatDate(value) : String(value))}
                        </Typography>
                    </Box>
                  ))}
                </Box>
              );
            })()
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Nessun dato disponibile.</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
            <Button onClick={() => setOpenHistoryDetail(false)} variant="contained" color="primary" size="small">Chiudi</Button>
          </Box>
        </Box>
      </Dialog>

      {/* Dialog Nuova Riparazione */}
      <Dialog open={openNewRepair} onClose={() => setOpenNewRepair(false)} fullWidth maxWidth="sm">
        <Box sx={{ bgcolor: '#1E1E1E', borderBottom: '2px solid #FF9800', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF9800' }}>
            Nuova Riparazione
          </Typography>
        </Box>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="data_checkin"
            type="date"
            value={newRepairData.data_checkin}
            onChange={(e) => setNewRepairData({ ...newRepairData, data_checkin: e.target.value })}
            InputLabelProps={{ shrink: true, style: { color: 'grey' } }}
            fullWidth
            size="small"
            sx={{ 
              '& .MuiOutlinedInput-input': { color: 'white', fontSize: '0.9rem' },
              '& .MuiOutlinedInput-root': { color: 'white' }
            }}
          />
          <TextField
            label="cognome"
            value={newRepairData.cognome}
            onChange={(e) => setNewRepairData({ ...newRepairData, cognome: e.target.value })}
            fullWidth
            size="small"
            required
            error={newRepairData.cognome === ''}
            helperText={newRepairData.cognome === '' ? 'Campo obbligatorio' : ''}
            InputLabelProps={{ style: { color: 'grey' } }}
            sx={{ 
              '& .MuiOutlinedInput-input': { color: 'white', fontSize: '0.9rem' }
            }}
            autoComplete="off"
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newRepairData.garanzia}
                  onChange={(e) => setNewRepairData({ ...newRepairData, garanzia: e.target.checked })}
                  sx={{ color: 'orange' }}
                />
              }
              label={<span style={{ fontSize: '0.9rem', color: 'grey', fontWeight: 600 }}>garanzia</span>}
            />
          </Box>
          <TextField
            label="acconto"
            type="text"
            value={newRepairData.acconto}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || !isNaN(parseFloat(value))) {
                setNewRepairData({ ...newRepairData, acconto: value });
              }
            }
            }
            fullWidth
            size="small"
            InputLabelProps={{ style: { color: 'grey' } }}
            sx={{ 
              '& .MuiOutlinedInput-input': { color: 'white', fontSize: '0.9rem' }
            }}
            placeholder="0.00"
          />
          <TextField
            label="problema_riscontrato"
            value={newRepairData.problema_riscontrato}
            onChange={(e) => setNewRepairData({ ...newRepairData, problema_riscontrato: e.target.value })}
            fullWidth
            multiline
            rows={3}
            size="small"
            InputLabelProps={{ style: { color: 'grey' } }}
            sx={{ 
              '& .MuiOutlinedInput-input': { color: 'white', fontSize: '0.9rem' }
            }}
          />
          <TextField
            label="accessori"
            value={newRepairData.accessori}
            onChange={(e) => setNewRepairData({ ...newRepairData, accessori: e.target.value })}
            fullWidth
            multiline
            rows={3}
            size="small"
            InputLabelProps={{ style: { color: 'grey' } }}
            sx={{ 
              '& .MuiOutlinedInput-input': { color: 'white', fontSize: '0.9rem' }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, p: 2, justifyContent: 'flex-end', bgcolor: '#1E1E1E', borderTop: '1px solid #333' }}>
          <Button 
            variant="outlined" 
            onClick={() => setOpenNewRepair(false)}
            sx={{ color: '#FF9800', borderColor: '#FF9800' }}
          >
            Annulla
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setConfirmSaveDialog(true)}
            sx={{ bgcolor: '#FF9800', color: '#000' }}
          >
            Salva
          </Button>
        </Box>
      </Dialog>

      {/* Dialog Conferma Salvataggio */}
      <Dialog open={confirmSaveDialog} onClose={() => setConfirmSaveDialog(false)}>
        <Box sx={{ bgcolor: '#1E1E1E', p: 2 }}>
          <Typography sx={{ color: 'white', mb: 3 }}>
            Sei sicuro di voler salvare la nuova riparazione?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => setConfirmSaveDialog(false)}
              sx={{ color: '#FF9800', borderColor: '#FF9800' }}
            >
              No
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveNewRepair}
              sx={{ bgcolor: '#FF9800', color: '#000' }}
            >
              Sì
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Paper>
  );
}
