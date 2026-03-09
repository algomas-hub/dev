import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

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
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit', mr: 3 }}>
          Navbar
        </Typography>
        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, flex: 1 }}>
          <Button component={RouterLink} to="/" color="inherit">
            Home
          </Button>
          <Button component={RouterLink} to="/link" color="inherit">
            Link
          </Button>
          <Button color="inherit" onClick={handleDropdownOpen}>
            Dropdown
          </Button>
          <Button color="inherit" disabled>
            Disabled
          </Button>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleDropdownClose}
        >
          <MenuItem onClick={handleDropdownClose}>Action</MenuItem>
          <MenuItem onClick={handleDropdownClose}>Another action</MenuItem>
          <MenuItem onClick={handleDropdownClose}>Something else here</MenuItem>
        </Menu>

        <TextField
          size="small"
          placeholder="Search"
          variant="outlined"
          sx={{ ml: 2, display: { xs: 'none', md: 'block' } }}
        />
        <Button color="inherit" sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
          Search
        </Button>

        <IconButton
          color="inherit"
          onClick={handleMobileMenuOpen}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={mobileAnchor}
          open={Boolean(mobileAnchor)}
          onClose={handleMobileMenuClose}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuItem component={RouterLink} to="/" onClick={handleMobileMenuClose}>
            Home
          </MenuItem>
          <MenuItem component={RouterLink} to="/link" onClick={handleMobileMenuClose}>
            Link
          </MenuItem>
          <MenuItem onClick={handleDropdownOpen}>Dropdown</MenuItem>
          <MenuItem disabled>Disabled</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Nav;