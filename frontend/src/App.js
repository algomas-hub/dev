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

// Tema moderno come Material-UI Dashboard Template
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00BCD4',
    },
    secondary: {
      main: '#FF9800',
    },
    background: {
      default: '#0D0D0D',
      paper: '#1A1A1A',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
    text: {
      primary: '#FFFFFF',
      secondary: '#BDBDBD',
    },
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(0, 188, 212, 0.1)',
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
          backgroundColor: '#1A1A1A',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1A1A',
          backgroundImage: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
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
          backgroundColor: '#1A1A1A',
          backgroundImage: 'none',
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#262626',
            borderRadius: 6,
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFFFFF',
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
            color: '#FFFFFF',
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.5)',
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
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFFFFF',
            borderWidth: 1,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
        input: {
          color: '#FFFFFF',
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-focused': {
            color: '#FFFFFF',
          },
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
          <SideMenu onLogout={handleLogout} />
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
