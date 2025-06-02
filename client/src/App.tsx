import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import LogoutButton from './components/LogoutButton';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import React from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A standard blue
    },
    secondary: {
      main: '#dc004e', // A standard red
    },
    mode: 'light', // You can switch to 'dark' here
  },
  typography: {
    h4: {
      fontSize: '1.8rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.2rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          margin: '0 8px', // Add some horizontal margin to buttons
        },
      },
    },
  },
});

function AppContent() {
  const { isAuthenticated } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between', display: 'flex' }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 1, textAlign: 'left', pl: 2 }}>
              EventFlow
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenu}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  {isAuthenticated && [
                    <MenuItem key="home" onClick={handleClose} component={RouterLink} to="/">Home</MenuItem>,
                    <MenuItem key="calendar" onClick={handleClose} component={RouterLink} to="/calendar">Calendar</MenuItem>
                  ]}
                  {!isAuthenticated ? (
                    [
                      <MenuItem key="login" onClick={handleClose} component={RouterLink} to="/login">Login</MenuItem>,
                      <MenuItem key="register" onClick={handleClose} component={RouterLink} to="/register">Register</MenuItem>
                    ]
                  ) : (
                    <MenuItem onClick={() => { handleClose(); }}>
                      <LogoutButton />
                    </MenuItem>
                  )}
                </Menu>
              </>
            ) : (
              <>
                {isAuthenticated && (
                  <>
                    <Button color="inherit" component={RouterLink} to="/">Home</Button>
                    <Button color="inherit" component={RouterLink} to="/calendar">Calendar</Button>
                  </>
                )}
                {!isAuthenticated ? (
                  <>
                    <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                    <Button color="inherit" component={RouterLink} to="/register">Register</Button>
                  </>
                ) : (
                  <LogoutButton />
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main"
        maxWidth={false}
        sx={{
          mt: 4,
          mb: 4,
          px: { xs: 0, sm: 2, md: 4 },
          width: '90vw',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: '90%', md: '70%', lg: '60%' }, mx: 'auto' }}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
