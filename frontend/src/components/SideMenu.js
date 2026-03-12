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
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

const drawerWidthOpen = 200;
const drawerWidthClosed = 64;

const Drawer = styled(MuiDrawer)(({ open }) => ({
  width: open ? drawerWidthOpen : drawerWidthClosed,
  flexShrink: 0,
  boxSizing: 'border-box',
  transition: 'width 0.3s ease',
  [`& .${drawerClasses.paper}`]: {
    width: open ? drawerWidthOpen : drawerWidthClosed,
    boxSizing: 'border-box',
    transition: 'width 0.3s ease',
    overflow: 'hidden',
  },
}));

export default function SideMenu({ onLogout, collapsed = false, onToggleCollapse }) {
  const location = useLocation();

  const menuItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Cassa', path: '/cassa', icon: <ShoppingCartIcon /> },
    { label: 'Magazzino', path: '/magazzino', icon: <InventoryIcon /> },
    { label: 'Link', path: '/link', icon: <LinkIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      open={!collapsed}
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
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
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
                flexShrink: 0,
              }}
            >
              22
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
              AIRSOFT
            </Typography>
          </Box>
        )}
        <IconButton
          size="small"
          onClick={onToggleCollapse}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          {collapsed ? <MenuIcon sx={{ fontSize: 20 }} /> : <CloseIcon sx={{ fontSize: 20 }} />}
        </IconButton>
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
                title={item.label}
                sx={{
                  py: 1.5,
                  px: collapsed ? 1.5 : 2.5,
                  color: 'text.secondary',
                  justifyContent: collapsed ? 'center' : 'flex-start',
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
                    minWidth: collapsed ? 'auto' : 40,
                    color: 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1, alignItems: collapsed ? 'center' : 'stretch' }}>
        <Button
          variant="contained"
          startIcon={<LogoutRoundedIcon />}
          onClick={onLogout}
          title={collapsed ? 'Logout' : ''}
          sx={{
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 0,
            py: 1,
            px: collapsed ? 1 : 2,
            minWidth: collapsed ? 'auto' : 'auto',
            '&:hover': {
              background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
            },
          }}
        >
          {!collapsed && 'Logout'}
        </Button>
        {!collapsed && (
          <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
            © 2026 Airsoft 22
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}
