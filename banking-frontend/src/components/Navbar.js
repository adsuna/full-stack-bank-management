import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountsIcon,
  Payments as TransactionsIcon,
  AccountBalanceWallet as InvestmentsIcon,
  CreditScore as LoansIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { title: 'Accounts', path: '/accounts', icon: <AccountsIcon /> },
    { title: 'Transactions', path: '/transactions', icon: <TransactionsIcon /> },
    { title: 'Investments', path: '/investments', icon: <InvestmentsIcon /> },
    { title: 'Loans', path: '/loans', icon: <LoansIcon /> }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  if (hideNavbar) return null;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Banking App
          </Typography>
          {token && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
            <Divider />
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;