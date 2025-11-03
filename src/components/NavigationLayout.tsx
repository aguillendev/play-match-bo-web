import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import logoMarkUrl from '../assets/logo-appbar.svg';

export interface NavItem {
  label: string;
  path: string;
}

interface NavigationLayoutProps {
  items: NavItem[];
  children: ReactNode;
}

const drawerWidth = 220;

function NavigationLayout({ items, children }: NavigationLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { role, doLogout } = useAuthStore((s) => ({ role: s.role, doLogout: s.doLogout }));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const navList = (
    <Box role="presentation" onClick={() => setOpen(false)} sx={{ width: drawerWidth }}>
      <List>
        {items.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={Link} to={item.path} selected={location.pathname === item.path}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" color="primary" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <img src={logoMarkUrl} alt="PlayMatch" style={{ height: 44, width: 'auto', marginRight: 12, display: 'block' }} />
            <Typography variant="h6" component="div" color="inherit" sx={{
              fontFamily: 'Poppins, Montserrat, "Avenir Next", "Futura PT", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 800,
              letterSpacing: 0.6,
            }}>PLAY MATCH</Typography>
          </Box>
          {role && (
            <>
              <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} aria-controls={openMenu ? 'perfil-menu' : undefined} aria-haspopup="true" aria-expanded={openMenu ? 'true' : undefined}>
                <AccountCircle />
              </IconButton>
              <Menu id="perfil-menu" anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem onClick={() => { setAnchorEl(null); navigate('/perfil'); }}>Perfil</MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); doLogout(); }}>Cerrar sesión</MenuItem>
              </Menu>
            </>
          )}
          </Toolbar>
      </AppBar>
      {isMobile ? (
        <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
          {navList}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              top: theme.spacing(8),
            },
          }}
          open
        >
          {navList}
        </Drawer>
      )}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
}

export default NavigationLayout;
