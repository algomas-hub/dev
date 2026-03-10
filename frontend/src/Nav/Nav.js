import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

function Nav() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileAnchor, setMobileAnchor] = useState(null);

  const handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchor(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: 'auto', md: 'none' },
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>

          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button component={RouterLink} to="/cassa" size="small">
              Cassa
            </Button>
            <Button component={RouterLink} to="/magazzino" size="small">
              Magazzino
            </Button>
          </Stack>

          <TextField
            size="small"
            placeholder="Search"
            variant="outlined"
            sx={{
              display: { xs: 'none', md: 'block' },
              width: 200,
            }}
          />

          <IconButton color="inherit" onClick={handleMobileMenuOpen} sx={{ display: { xs: 'block', md: 'none' } }}>
            <MenuRoundedIcon />
          </IconButton>

          <Menu
            anchorEl={mobileAnchor}
            open={Boolean(mobileAnchor)}
            onClose={handleMobileMenuClose}
          >
            <MenuItem component={RouterLink} to="/cassa" onClick={handleMobileMenuClose}>
              Cassa
            </MenuItem>
            <MenuItem component={RouterLink} to="/magazzino" onClick={handleMobileMenuClose}>
              Magazzino
            </MenuItem>
            <MenuItem component={RouterLink} to="/" onClick={handleMobileMenuClose}>
              Home
            </MenuItem>
            <MenuItem component={RouterLink} to="/link" onClick={handleMobileMenuClose}>
              Link
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Nav;