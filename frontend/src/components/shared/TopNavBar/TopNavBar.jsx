import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Grid from '@mui/material/Grid2';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import AgevitalLogo from '../../../assets/agevitalLogo.png';

// Styles
import styles from './TopNavBar.module.css';

export default function TopNavBar({ setOpenSideNavBar, showLoginButton, setShowLoginButton }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const handleCloseModal = () => setOpen(false);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logOut = () => {
    setAnchorEl(null);
    setOpen(true);
  };

  const handleLogin = () => {
    navigate('/login');
    setShowLoginButton(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);

      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid size={1} sx={{ display: 'flex', alignItems: 'center' }}>
                {isAuthenticated && (
                  <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                    onClick={() => setOpenSideNavBar(true)}
                  >
                    <MenuIcon
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />
                  </IconButton>
                )}
              </Grid>
              <Grid size={4} />
              <Grid size={2}>
                <img src={AgevitalLogo} alt="AgeVital" width="200px" />
              </Grid>
              <Grid size={3} />
              <Grid size={1} className={styles.user}>
                <p>{userRole}</p>
              </Grid>
              <Grid size={1} className={styles.user}>
                {isAuthenticated ? (
                  <div>
                    <IconButton
                      size="large"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="#000000"
                    >
                      <AccountCircle sx={{ color: '#31DE38' }} />
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
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={logOut}>Cerrar sesión</MenuItem>
                    </Menu>
                  </div>
                ) : (
                  showLoginButton && (
                    <Button variant="contained" sx={{ bgcolor: '#3FC244' }} onClick={handleLogin}>
                      Ingresar
                    </Button>
                  )
                )}
              </Grid>
            </Grid>
          </Box>
        </Toolbar>
      </AppBar>
      <Modal open={open}>
        <Box className={styles.modal}>
          <h3>¿Desea cerrar sesión?</h3>
          <div className={styles.buttonRow}>
            <Button
              variant="contained"
              sx={{ bgcolor: '#3FC244', marginRight: '5%' }}
              onClick={handleLogout}
            >
              Aceptar
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: '#EBEBEB', color: '#606060' }}
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
          </div>
        </Box>
      </Modal>
    </Box>
  );
}
