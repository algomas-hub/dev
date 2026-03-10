import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Nav from './Nav/Nav';
import SideMenu from './components/SideMenu';
import DashboardContent from './Contents/DashboardContent';
import LinkContent from './Contents/LinkContent';
import MagazzinoContent from './Contents/MagazzinoContent';
import CassaContent from './Contents/CassaContent';
import LoginPage from './pages/LoginPage';

// Tema moderno minimalista with light palette
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF9800',
    },
    secondary: {
      main: '#00BCD4',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    divider: '#e0e0e0',
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(255, 152, 0, 0.08)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          color: '#1A1A1A',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          borderRight: '1px solid #e0e0e0',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e0e0e0',
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: 6,
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: '#d0d0d0',
            },
            '&:hover fieldset': {
              borderColor: '#999999',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF9800',
              borderWidth: 1,
            },
            '&::after': {
              display: 'none !important',
              border: 'none !important',
            },
            '&::before': {
              display: 'none !important',
              border: 'none !important',
            },
          },
          '& .MuiInputBase-input': {
            color: '#1A1A1A',
            '&::placeholder': {
              color: 'rgba(0, 0, 0, 0.4)',
              opacity: 1,
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 14px',
            borderBottom: 'none !important',
          },
          '& .MuiInputAdornment-positionEnd': {
            marginRight: '8px',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d0d0d0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#999999',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FF9800',
            borderWidth: 1,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#1A1A1A',
        },
        input: {
          color: '#1A1A1A',
          '&::placeholder': {
            color: 'rgba(0, 0, 0, 0.4)',
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(0, 0, 0, 0.6)',
          '&.Mui-focused': {
            color: '#FF9800',
          },
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Controlla se l'utente è già autenticato (al montaggio)
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Gestisci il logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  // Se in caricamento, mostra nulla
  if (loading) {
    return null;
  }

  // Se non autenticato, mostra la pagina di login
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      </ThemeProvider>
    );
  }

  // Se autenticato, mostra l'app
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex' }}>
          <SideMenu onLogout={handleLogout} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <Nav onLogout={handleLogout} />
          {/* Main content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: 'background.default',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              md: { display: 'block', pt: '64px' },
            }}
          >
            <Box sx={{ display: { xs: 'block', md: 'none' }, pt: 8 }} />
            <Routes>
              <Route path="/" exact element={<DashboardContent />} />
              <Route path="/link" exact element={<LinkContent />} />
              <Route path="/magazzino" exact element={<MagazzinoContent />} />
              <Route path="/cassa" exact element={<CassaContent />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
