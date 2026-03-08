import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import ErrorAlert from '../shared/ErrorAlert/ErrorAlert';
import './Login.css';

/**
 * Obtiene el token de acceso desde el código de autorización
 * (Exactamente igual que en TopNavBar.jsx)
 */
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

/**
 * Obtiene la información del usuario autenticado
 */
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

function Login({ setShowLoginButton }) {
  const [errorAlert, setErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Para evitar que en StrictMode se ejecute dos veces
  const codeProcessed = useRef(false);

  const clientId = import.meta.env.VITE_CLIENT_ID;
  const keyrockURL = 'http://localhost:7000/oauth2/authorize';

  // Mutation para obtener la info del usuario
  const userInfoMutation = useMutation({
    mutationFn: getUserInfo,
    onSuccess: (data) => {
      localStorage.setItem('userRole', data?.roles?.[0]?.name === 'orionAdmin' ? 'admin' : 'user');
      
      // Redirigir a donde estaba antes o al dashboard
      const returnTo = localStorage.getItem('returnTo') || '/dashboard';
      localStorage.removeItem('returnTo');
      navigate(returnTo);
    },
    onError: (error) => {
      setErrorMessage('No se pudo obtener la información del usuario');
      setErrorAlert(true);
      console.error('Error getting user info:', error.message);
    },
  });

  // Mutation para obtener el token
  const tokenMutation = useMutation({
    mutationFn: tokenRequest,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      
      // Limpiar la URL de ?code=...
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Obtener la info del usuario con el token
      userInfoMutation.mutate({
        token: data.access_token,
        navigate,
        setIsAuthenticated: () => {}, // dummy
      });
    },
    onError: (error) => {
      setErrorMessage('Error al obtener el token de acceso');
      setErrorAlert(true);
      console.error('Error getting token:', error.message);
      window.history.replaceState({}, document.title, window.location.pathname);
    },
  });

  /**
   * Maneja el login con Keyrock
   * Redirige a Keyrock pero devuelve a esta misma página con el código
   */
  const handleLogin = () => {
    localStorage.setItem('returnTo', window.location.pathname);
    const uri = encodeURIComponent('http://localhost:5173/login');
    window.location.href = `${keyrockURL}?response_type=code&client_id=${clientId}&redirect_uri=${uri}&state=xyz`;
  };

  /**
   * Al cargar la página, verifica si hay un código en la URL
   * Si lo hay, lo intercambia por un token (flujo OAuth2)
   */
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    
    if (code && !codeProcessed.current) {
      codeProcessed.current = true;
      tokenMutation.mutate({ code });
    }
  }, []);

  const isLoading = tokenMutation.isPending || userInfoMutation.isPending;

  // Si estamos cargando, mostrar spinner
  if (isLoading) {
    return (
      <Backdrop
        sx={{ color: '#fff', position: 'fixed', zIndex: 1700 }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <>
      <div className="login-container">
        <button
          className="back-button"
          onClick={() => {
            navigate('/');
            setShowLoginButton(true);
          }}
          aria-label="Volver atrás"
          disabled={isLoading}
        >
          <ExitToAppRoundedIcon />
        </button>

        <div className="login-form-wrapper">
          <div className="login-form">
            <div className="login-header">
              <h1>Bienvenido</h1>
              <p>Inicia sesión en AgeVital+</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="info-box">
                <p>
                  Haz clic en el botón de abajo para iniciar sesión con tus credenciales.
                </p>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                Iniciar sesión con Keyrock
              </button>
            </form>

            <div className="login-footer">
              <p className="forgot-password">
                ¿Olvidaste tu contraseña?{' '}
                <a href="http://localhost:7000" target="_blank" rel="noreferrer">
                  Recupérala aquí
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <ErrorAlert
        message={errorMessage || 'Hubo un error al iniciar sesión'}
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
      />
    </>
  );
}

Login.propTypes = {
  setShowLoginButton: PropTypes.func.isRequired,
};

export default Login;