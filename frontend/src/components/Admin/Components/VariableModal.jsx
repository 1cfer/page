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
import { useMutation, useQuery } from '@tanstack/react-query';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import editVariables from '../../../services/variables';
import editSubscription from '../../../services/subscriptions';
import styles from './DeviceModal.module.css';
import ErrorAlert from '../../shared/ErrorAlert/ErrorAlert';

export default function VariableModal({ open, setOpen, getDevices, variablesData }) {
  const [variableName, setVariableName] = useState('');
  const [variableUnit, setVariableUnit] = useState('');
  const [errorAlert, setErrorAlert] = useState(false);

  const { subscriptionsPending, data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () =>
      fetch('v2/subscriptions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }).then((res) => res.json()),
  });

  const mutation = useMutation({
    mutationFn: editVariables,
    onSuccess: () => {
      getDevices();
      setOpen(false);
      setVariableName('');
      setVariableUnit('');
    },
    onError: (error) => {
      setErrorAlert(true);
      console.error('Error creating variable:', error.message);
    },
  });

  const subscriptionMutation = useMutation({
    mutationFn: editSubscription,
    onError: (error) => {
      setErrorAlert(true);
      console.error('Error editing subscription:', error.message);
    },
  });

  return (
    <>
      <Backdrop
        sx={() => ({ color: '#fff', position: 'fixed', zIndex: 1700 })}
        open={mutation.isPending || subscriptionsPending}
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
              <DialogTitle variant="h5">Create Variable</DialogTitle>
            </Grid>

            <Grid container sx={{ padding: '2% 0% 4% 4%' }}>
              <Grid size={1} />
              <Grid size={4}>
                <Typography variant="body2">Variable name:</Typography>
                <TextField
                  value={variableName}
                  onChange={(e) => setVariableName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={3} />
              <Grid size={4}>
                <Typography variant="body2">Unit:</Typography>
                <TextField
                  value={variableUnit}
                  onChange={(e) => setVariableUnit(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid size={4} />
            <Grid size={2}>
              <Button
                onClick={() => {
                  mutation.mutate({ variablesData, variableName, variableUnit });
                  subscriptionMutation.mutate({ subscriptions, variableName });
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
        message="There was an error trying to create the variable"
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
      />
    </>
  );
}

VariableModal.propTypes = {
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
  getDevices: PropTypes.func.isRequired,
  variablesData: PropTypes.arrayOf(
    PropTypes.shape({
      variables: PropTypes.shape({
        value: PropTypes.string,
        type: PropTypes.string,
      }),
    })
  ).isRequired,
};
