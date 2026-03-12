import { Box, Paper } from '@mui/material';

function DashboardContent() {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: 2,
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)'
    }}>
      <Paper sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 4,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        maxWidth: '900px'
      }}>
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Box sx={{
            fontSize: '56px',
            fontWeight: 900,
            color: '#ffffff',
            textAlign: 'left',
            fontFamily: "'Roboto', sans-serif",
            letterSpacing: '-1px',
            lineHeight: 1.2,
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Morris AI
          </Box>
          <Box sx={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#FFFFFF',
            textAlign: 'left',
            fontFamily: "'Roboto', sans-serif",
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            c'hai le ssiga?
          </Box>
        </Box>
        <Box sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <Box sx={{
            width: '280px',
            height: '280px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            backgroundImage: 'linear-gradient(45deg, #2a2a2a 25%, #1a1a1a 25%, #1a1a1a 50%, #2a2a2a 50%, #2a2a2a 75%, #1a1a1a 75%, #1a1a1a)'
          }}>
            <img 
              src="/kala.png" 
              alt="Home" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default DashboardContent;