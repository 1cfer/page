import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid2';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import styles from './UserModal.module.css';
import ErrorAlert from '../shared/ErrorAlert/ErrorAlert';
import { createUser } from '../../services/users';

const addAdmins = async ({ token, adminArray }) => {
  const response = await fetch('/idm/admins/administrators?_method=put', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      _csrf: token,
      submit_authorize: `${JSON.stringify(adminArray)}`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed add admin');
  }

  return response;
};

const getCsrfToken = async () => {
  const response = await fetch('/idm/admins/administrators', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to get csrf token');
  }

  return response;
};

export default function UserModal({ open, setOpen, getUsers, adminArray, getAdmins }) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errorAlert, setErrorAlert] = useState(false);
  const tempArray = adminArray;

  const addAdminsMutation = useMutation({
    mutationFn: addAdmins,
    onSuccess: () => {
      getAdmins({ page: 1 });
    },
    onError: (error) => {
      console.error('Error adding admin:', error.message);
    },
  });

  const adminsTokenMutation = useMutation({
    mutationFn: getCsrfToken,
    onSuccess: async (data) => {
      const html = await data.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const csrfTokenInput = doc.querySelector('input[name="_csrf"]');

      if (csrfTokenInput) {
        addAdminsMutation.mutate({ token: csrfTokenInput.value, adminArray: tempArray });
      } else {
        setErrorAlert(true);
        console.error('Error getting admin token:');
      }
    },
    onError: (error) => {
      console.error('Error getting admin token:', error.message);
    },
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      getUsers();
      setOpen(false);
      if (role === 'admin') {
        tempArray.push(data?.user?.id);
        adminsTokenMutation.mutate();
      }
    },
    onError: (error) => {
      setErrorAlert(true);
      console.error('Error creating user:', error.message);
    },
  });

  return (
    <>
      <Backdrop
        sx={() => ({ color: '#fff', position: 'fixed', zIndex: 1700 })}
        open={mutation.isPending || adminsTokenMutation.isPending || addAdminsMutation.isPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        PaperProps={{
          sx: {
            borderRadius: '30px',
          },
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={1}>
            <Grid size={11} />
            <Grid size={1}>
              <IconButton className={styles.closeButton} onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <DialogTitle variant="h5">Create User</DialogTitle>
            </Grid>

            <Grid container sx={{ padding: '0% 0% 4% 0%' }}>
              <Grid size={1} />
              <Grid size={4}>
                <Typography variant="body2">User name:</Typography>
                <TextField
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={2} />
              <Grid size={4}>
                <Typography variant="body2">Email:</Typography>
                <TextField value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              </Grid>
              <Grid size={1} />
              <Grid size={1} />
              <Grid size={4}>
                <Typography variant="body2">Password:</Typography>
                <TextField
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={2} />
              <Grid size={4}>
                <Typography variant="body2">Role:</Typography>
                <Select value={role} onChange={(e) => setRole(e.target.value)} fullWidth required>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </Grid>
              <Grid size={1} />
            </Grid>

            <Grid size={4} />
            <Grid size={2}>
              <Button
                onClick={() => {
                  mutation.mutate({ userName, email, password });
                }}
                sx={{
                  marginBottom: '20%',
                  backgroundColor: '#3FC244',
                  color: 'white',
                  padding: '10%',
                }}
              >
                Create
              </Button>
            </Grid>
            <Grid size={2}>
              <Button
                onClick={() => setOpen(false)}
                sx={{ backgroundColor: '#EBEBEB', color: 'black', padding: '10%' }}
              >
                Cancel
              </Button>
            </Grid>
            <Grid size={4} />
          </Grid>
        </Box>
      </Dialog>
      <ErrorAlert
        message="There was an error trying to create the user"
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
      />
    </>
  );
}

UserModal.propTypes = {
  open: PropTypes.string.isRequired,
  setOpen: PropTypes.func.isRequired,
  selectedSensor: PropTypes.shape({
    id: PropTypes.string,
    state: PropTypes.shape({
      value: PropTypes.string,
    }),
    location: PropTypes.shape({
      value: PropTypes.string,
    }),
    creationdate: PropTypes.string,
  }).isRequired,
  getUsers: PropTypes.func.isRequired,
  adminArray: PropTypes.arrayOf(PropTypes.string).isRequired,
  getAdmins: PropTypes.func.isRequired,
};
