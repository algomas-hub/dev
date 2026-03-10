import { styled } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import HomeIcon from '@mui/icons-material/Home';
import LinkIcon from '@mui/icons-material/Link';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Button from '@mui/material/Button';

const drawerWidth = 200;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { label: 'Cassa', path: '/cassa', icon: <ShoppingCartIcon /> },
    { label: 'Magazzino', path: '/magazzino', icon: <InventoryIcon /> },
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Link', path: '/link', icon: <LinkIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
          backgroundImage: 'none',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          22
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          AIRSOFT
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<LogoutRoundedIcon />}
          onClick={onLogout}
          sx={{
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 0,
            py: 1,
            '&:hover': {
              background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
            },
          }}
        >
          Logout
        </Button>
        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
          © 2026 Airsoft 22
        </Typography>
      </Box>
    </Drawer>
  );
}
