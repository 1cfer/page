import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import loginUser from '../../services/loginUser'; // Asegúrate de que la ruta sea correcta
import ErrorAlert from '../shared/ErrorAlert/ErrorAlert';

const getCsrfToken = async () => {
  const response = await fetch('/keyrock', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to get token');
  }

  return response;
};

const idmAuth = async ({ token }) => {
  const response = await fetch('/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      _csrf: token,
      ua: '',
      email: localStorage.getItem('user'),
      password: localStorage.getItem('password'),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate user on idm');
  }

  return response;
};

function Login({ setShowLoginButton }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorAlert, setErrorAlert] = useState(false);
  const navigate = useNavigate();

  const loginIdmMutation = useMutation({
    mutationFn: idmAuth,
    onSuccess: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('password');
    },
    onError: (error) => {
      console.error('Error logging in on idm:', error.message);
    },
  });

  const tokenMutation = useMutation({
    mutationFn: getCsrfToken,
    onSuccess: async (data) => {
      const html = await data.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const csrfTokenInput = doc.querySelector('input[name="_csrf"]');

      if (csrfTokenInput) {
        loginIdmMutation.mutate({ token: csrfTokenInput.value });
        navigate('/');
      } else {
        setErrorAlert(true);
      }
    },
    onError: (error) => {
      setErrorAlert(true);
      console.error('Error getting token:', error.message);
    },
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      tokenMutation.mutate();
    },
    onError: (error) => {
      setErrorAlert(true);
      console.error('Error logging in:', error.message);
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <>
      <Backdrop
        sx={() => ({ color: '#fff', position: 'fixed', zIndex: 1700 })}
        open={mutation.isPending || tokenMutation.isPending || loginIdmMutation.isPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="login-container">
        <button
          className="back-button"
          onClick={() => {
            navigate('/');
            setShowLoginButton(true);
          }}
        >
          <ExitToAppRoundedIcon />
        </button>
        <div className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
      <ErrorAlert
        message="There was an error logging in"
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
      />
    </>
  );
}

export default Login;

Login.propTypes = {
  setShowLoginButton: PropTypes.func.isRequired,
};
