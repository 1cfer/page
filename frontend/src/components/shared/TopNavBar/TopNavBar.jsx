import React, { useState, useEffect } from 'react';
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
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import AgevitalLogo from '../../../assets/agevitalLogo.png';
import GreenModal from '../GreenModal/GreenModal';

// Styles
import styles from './TopNavBar.module.css';

const logoutIdm = async () => {
  const response = await fetch('/auth/logout?_method=DELETE', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to log out');
  }

  return response;
};

const getUserInfo = async ({ token, navigate, setIsAuthenticated }) => {
  const response = await fetch('/user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    setIsAuthenticated(false);
    navigate('/');
    throw new Error('Failed to get user info');
  }

  return response.json();
};

const tokenRequest = async ({ code }) => {
  const response = await fetch('/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:5173',
      client_id: import.meta.env.VITE_CLIENT_ID,
      client_secret: import.meta.env.VITE_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get token');
  }

  return response.json();
};

export default function TopNavBar({ setOpenSideNavBar, showLoginButton, setShowLoginButton }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const tokenLocal = localStorage.getItem('access_token');
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const redirectUri = encodeURIComponent('http://localhost:5173');
  const keyrockURL = 'http://localhost:7000/oauth2/authorize';

  const userInfoMutation = useMutation({
    mutationFn: getUserInfo,
    onSuccess: (data) => {
      setUserInfo(data);
      /* localStorage.setItem('userId', data?.User?.id);
      localStorage.setItem('userRole', data?.User?.admin ? 'admin' : 'user'); */
    },
    onError: (error) => {
      console.error('Error getting user info:', error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutIdm,
    onSuccess: () => {
      navigate('/');
      window.location.reload();
    },
    onError: (error) => {
      console.error('Error loging out:', error.message);
    },
  });

  const mutation = useMutation({
    mutationFn: tokenRequest,
    onSuccess: (data) => {
      const token = data.access_token;
      console.log('token: ', token);
      localStorage.setItem('access_token', token); // or use any secure storage
      setIsAuthenticated(true);
    },
    onError: (error) => {
      console.error('Error getting token:', error.message);
      setIsAuthenticated(false);
    },
  });

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
    /* navigate('/login'); */
    window.location.href = `${keyrockURL}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=xyz`;
    setShowLoginButton(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    logoutMutation.mutate();
  };

  useEffect(() => {
    if (tokenLocal) {
      console.log('token: ', tokenLocal);
      setIsAuthenticated(true);
      userInfoMutation.mutate({ token: tokenLocal, navigate, setIsAuthenticated });
    } else {
      setIsAuthenticated(false);
    }
  }, [tokenLocal]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code');

    if (code) {
      mutation.mutate({ code });
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
              <Grid size={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <img src={AgevitalLogo} alt="AgeVital" width="200px" />
              </Grid>
              <Grid size={3} />
              <Grid size={1} className={styles.user}>
                {isAuthenticated && (
                  <div className={styles.userColumn}>
                    <p>{userInfo?.username}</p>
                    {/* <span className={styles.userRole}>
                      {userInfo?.User?.admin ? 'admin' : 'user'}
                    </span> */}
                  </div>
                )}
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
                      <MenuItem onClick={logOut}>Log out</MenuItem>
                    </Menu>
                  </div>
                ) : (
                  showLoginButton && (
                    <Button variant="contained" sx={{ bgcolor: '#3FC244' }} onClick={handleLogin}>
                      Log in
                    </Button>
                  )
                )}
              </Grid>
            </Grid>
          </Box>
        </Toolbar>
      </AppBar>
      <GreenModal
        modalText="Do you want to log out?"
        open={open}
        setOpen={setOpen}
        acceptFunction={handleLogout}
      />
    </Box>
  );
}

TopNavBar.propTypes = {
  setOpenSideNavBar: PropTypes.func.isRequired,
  showLoginButton: PropTypes.bool.isRequired,
  setShowLoginButton: PropTypes.func.isRequired,
};
