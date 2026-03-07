import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
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
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to get token: ${errorBody}`);
  }
  return response.json();
};

export default function TopNavBar({ setOpenSideNavBar, showLoginButton, setShowLoginButton }) {
  const [accessToken,     setAccessToken]     = useState(() => localStorage.getItem('access_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo,        setUserInfo]         = useState({});
  const [anchorEl,        setAnchorEl]         = useState(null);
  const [open,            setOpen]             = useState(false);
  const [scrolled,        setScrolled]         = useState(false);

  // Prevents React StrictMode from firing the code exchange twice,
  // which would consume the one-time-use code on the first call and 503 on the second.
  const codeProcessed = useRef(false);

  const navigate   = useNavigate();
  const clientId   = import.meta.env.VITE_CLIENT_ID;
  const keyrockURL = 'http://localhost:7000/oauth2/authorize';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const userInfoMutation = useMutation({
    mutationFn: getUserInfo,
    onSuccess: (data) => {
      setUserInfo(data);
      setIsAuthenticated(true);
      localStorage.setItem('userRole', data?.roles?.[0]?.name === 'orionAdmin' ? 'admin' : 'user');
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
      setAccessToken(data.access_token);
      // Remove ?code=&state= from URL — prevents retry with expired code on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      // Redirect back to where the user was before login
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
      window.history.replaceState({}, document.title, window.location.pathname);
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
    setAccessToken('');
    setIsAuthenticated(false);
    setUserInfo({});
    logoutMutation.mutate();
  };

  // Reactive on accessToken state — fires when token is set after code exchange
  useEffect(() => {
    if (accessToken) {
      setIsAuthenticated(true);
      userInfoMutation.mutate({ token: accessToken, navigate, setIsAuthenticated });
    } else {
      setIsAuthenticated(false);
    }
  }, [accessToken]);

  // Code exchange — useRef guard ensures single execution even in React StrictMode
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code && !codeProcessed.current) {
      codeProcessed.current = true;
      mutation.mutate({ code });
    }
  }, []);

  const userInitial = userInfo?.username?.[0]?.toUpperCase() || '?';
  const isAdmin     = localStorage.getItem('userRole') === 'admin';

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>

        <div className={styles.navLeft}>
          <button
            className={styles.menuBtn}
            aria-label="open menu"
            onClick={() => setOpenSideNavBar(true)}
          >
            <MenuIcon sx={{ fontSize: 20, color: '#64748b' }} />
          </button>
        </div>

        <div className={styles.navCenter}>
          <img
            src={AgevitalLogo}
            alt="AgeVital+"
            className={styles.logo}
            onClick={() => navigate('/')}
          />
        </div>

        <div className={styles.navRight}>
          {isAuthenticated ? (
            <>
              <div className={styles.userPill}>
                <div className={styles.userTexts}>
                  <span className={styles.username}>{userInfo?.username}</span>
                  <span className={`${styles.roleTag} ${isAdmin ? styles.roleTagAdmin : styles.roleTagUser}`}>
                    {isAdmin ? 'admin' : 'user'}
                  </span>
                </div>
                <button
                  className={styles.avatarBtn}
                  aria-haspopup="true"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  aria-label="Account menu"
                >
                  <span className={styles.avatarInitial}>{userInitial}</span>
                </button>
              </div>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: '6px',
                    borderRadius: '14px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                    minWidth: 160,
                    overflow: 'visible',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: -6, right: 16,
                      width: 12, height: 12,
                      background: '#fff',
                      border: '1px solid #f1f5f9',
                      borderBottom: 'none', borderRight: 'none',
                      transform: 'rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {userInfo?.username}
                  </div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                    {userInfo?.email || (isAdmin ? 'Administrador' : 'Usuario')}
                  </div>
                </div>
                <MenuItem
                  onClick={() => { setAnchorEl(null); setOpen(true); }}
                  sx={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#ef4444',
                    borderRadius: '8px',
                    mx: '4px',
                    my: '4px',
                    gap: '8px',
                    '&:hover': { background: '#fef2f2' },
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                  </svg>
                  Cerrar sesión
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
        modalText="¿Deseas cerrar sesión?"
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