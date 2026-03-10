import { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Verifica credenziali (in produzione, faresti una richiesta al backend)
    if (username === 'admin' && password === 'QuelliBravi22!') {
      // Salva il token nel localStorage
      localStorage.setItem('authToken', 'authenticated');
      localStorage.setItem('username', username);
      setLoading(false);
      onLoginSuccess();
    } else {
      setError('Credenziali non valide');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            borderRadius: 2,
            backgroundColor: '#1b1b1b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header con logo e titolo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#FF9800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <LockIcon sx={{ fontSize: '32px', color: '#000' }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: '#FFF',
                  mb: 1,
                }}
              >
                Accedi
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Inserisci le tue credenziali per continuare
              </Typography>
            </Box>

            {/* Messaggio di errore */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Form di login */}
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                variant="outlined"
                placeholder="admin"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF9800',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)',
                    opacity: 1,
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#FF9800',
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                variant="outlined"
                placeholder="••••••••"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF9800',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)',
                    opacity: 1,
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#FF9800',
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
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
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    boxShadow: 'none',
                    transform: 'none',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Accedi'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default LoginPage;
