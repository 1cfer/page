import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import AgevitalLogo from '../../../assets/agevitalLogo.png';
import GreenModal from '../GreenModal/GreenModal';

import styles from './TopNavBar.module.css';

const logoutIdm = async () => {
  const response = await fetch('/auth/logout?_method=DELETE', { method: 'GET' });
  if (!response.ok) throw new Error('Failed to log out');
  return response;
};

const getUserInfo = async ({ token, navigate, setIsAuthenticated }) => {
  const response = await fetch('/user', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
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
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:5173',
      client_id: import.meta.env.VITE_CLIENT_ID,
      client_secret: import.meta.env.VITE_CLIENT_SECRET,
    }),
  });
  if (!response.ok) throw new Error('Failed to get token');
  return response.json();
};

export default function TopNavBar({ setOpenSideNavBar, showLoginButton, setShowLoginButton }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo,        setUserInfo]         = useState({});
  const [anchorEl,        setAnchorEl]         = useState(null);
  const [open,            setOpen]             = useState(false);
  const navigate   = useNavigate();
  const tokenLocal = localStorage.getItem('access_token');
  const clientId   = import.meta.env.VITE_CLIENT_ID;
  const keyrockURL = 'http://localhost:7000/oauth2/authorize';

  const userInfoMutation = useMutation({
    mutationFn: getUserInfo,
    onSuccess: (data) => {
      setUserInfo(data);
      localStorage.setItem('userRole', data?.roles[0]?.name === 'orionAdmin' ? 'admin' : 'user');
    },
    onError: (e) => console.error('Error getting user info:', e.message),
  });

  const logoutMutation = useMutation({
    mutationFn: logoutIdm,
    onSuccess: () => { navigate('/'); window.location.reload(); },
    onError:   (e) => console.error('Error logging out:', e.message),
  });

  const mutation = useMutation({
    mutationFn: tokenRequest,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      setIsAuthenticated(true);
      const returnTo = localStorage.getItem('returnTo');
      if (returnTo && returnTo !== '/') {
        localStorage.removeItem('returnTo');
        navigate(returnTo);
      }
    },
    onError: (e) => {
      console.error('Error getting token:', e.message);
      setIsAuthenticated(false);
      localStorage.removeItem('returnTo');
    },
  });

  const handleLogin = () => {
    localStorage.setItem('returnTo', window.location.pathname);
    const uri = encodeURIComponent('http://localhost:5173');
    window.location.href = `${keyrockURL}?response_type=code&client_id=${clientId}&redirect_uri=${uri}&state=xyz`;
    setShowLoginButton(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    logoutMutation.mutate();
  };

  useEffect(() => {
    if (tokenLocal) {
      setIsAuthenticated(true);
      userInfoMutation.mutate({ token: tokenLocal, navigate, setIsAuthenticated });
    } else {
      setIsAuthenticated(false);
    }
  }, [tokenLocal]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) mutation.mutate({ code });
  }, []);

  return (
    <>
      {/* ── Pure flexbox header — no MUI AppBar/Grid ── */}
      <header className={styles.navbar}>

        {/* Left zone */}
        <div className={styles.navLeft}>
          <IconButton
            size="medium"
            aria-label="open menu"
            onClick={() => setOpenSideNavBar(true)}
            className={styles.menuBtn}
          >
            <MenuIcon sx={{ fontSize: 22, color: '#15803d' }} />
          </IconButton>
        </div>

        {/* Center zone — logo always centered */}
        <div className={styles.navCenter}>
          <img
            src={AgevitalLogo}
            alt="AgeVital+"
            className={styles.logo}
            onClick={() => navigate('/')}
          />
        </div>

        {/* Right zone */}
        <div className={styles.navRight}>
          {isAuthenticated ? (
            <>
              {/* Username + role pill — hidden on mobile */}
              <div className={styles.userInfo}>
                <span className={styles.username}>{userInfo?.username}</span>
                <span className={styles.userRole}>{localStorage.getItem('userRole')}</span>
              </div>

              {/* Account icon */}
              <IconButton
                size="medium"
                aria-haspopup="true"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  color: '#22c55e',
                  transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)',
                  '&:hover': { transform: 'scale(1.12)' },
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <AccountCircle sx={{ fontSize: 26 }} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top',    horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: '14px',
                    border: '1px solid rgba(34,197,94,0.14)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    minWidth: 140,
                  },
                }}
              >
                <MenuItem
                  onClick={() => { setAnchorEl(null); setOpen(true); }}
                  sx={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#dc2626',
                    borderRadius: '8px',
                    mx: '4px',
                    '&:hover': { background: '#fef2f2' },
                  }}
                >
                  Log out
                </MenuItem>
              </Menu>
            </>
          ) : (
            showLoginButton && (
              <button className={styles.loginBtn} onClick={handleLogin}>
                Log in
              </button>
            )
          )}
        </div>
      </header>

      <GreenModal
        modalText="Do you want to log out?"
        open={open}
        setOpen={setOpen}
        acceptFunction={handleLogout}
      />
    </>
  );
}

TopNavBar.propTypes = {
  setOpenSideNavBar:  PropTypes.func.isRequired,
  showLoginButton:    PropTypes.bool.isRequired,
  setShowLoginButton: PropTypes.func.isRequired,
};