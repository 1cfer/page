import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid2';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './SensorModal.module.css';
import ErrorAlert from '../../shared/ErrorAlert/ErrorAlert';

export default function DeviceModal({ open, handleClose, selectedSensor, getDevices }) {
  const [sensorName, setSensorName] = useState(selectedSensor.nombre);
  const [sensorLatitude, setSensorLatitude] = useState(null);
  const [sensorLongitude, setSensorLongitude] = useState(null);
  const [sensorState, setSensorState] = useState(null);
  const [errorAlert, setErrorAlert] = useState(false);

  async function createDevice() {
    const currentDate = new Date();
    const response = await fetch('/v2/entities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: sensorName,
        type: 'sensor',
        location: {
          type: 'geo:json',
          value: {
            type: 'Point',
            coordinates: [parseFloat(sensorLatitude), parseFloat(sensorLongitude)],
          },
        },
        state: {
          type: 'String',
          value: sensorState,
        },
        creationdate: {
          type: 'DateTime',
          value: currentDate.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create device');
    }

    return response;
  }

  const mutation = useMutation({
    mutationFn: createDevice,
    onSuccess: (data) => {
      console.log('Device created:', data);
      getDevices();
      handleClose();
    },
    onError: (error) => {
      setErrorAlert(true);
      console.error('Error creating device:', error.message);
    },
  });

  useEffect(() => {
    setSensorName(selectedSensor.nombre);
    setSensorLatitude(selectedSensor.latitud);
    setSensorLongitude(selectedSensor.longitud);
    setSensorState(selectedSensor.estado);
  }, [selectedSensor]);

  return (
    <>
      <Backdrop
        sx={() => ({ color: '#fff', position: 'fixed', zIndex: 1700 })}
        open={mutation.isPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog
        open={open}
        onClose={handleClose}
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
              <IconButton className={styles.closeButton} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid size={12}>
              <DialogTitle>Crear Sensor</DialogTitle>
            </Grid>

            <Grid container sx={{ padding: '0% 4% 4% 4%' }}>
              <Grid size={12}>
                <Typography variant="body2">Nombre:</Typography>
                <TextField
                  value={sensorName}
                  onChange={(e) => setSensorName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={5}>
                <Typography variant="body2">Latitud:</Typography>
                <TextField
                  value={sensorLatitude}
                  onChange={(e) => setSensorLatitude(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={2} />
              <Grid size={5}>
                <Typography variant="body2">Longitud:</Typography>
                <TextField
                  value={sensorLongitude}
                  onChange={(e) => setSensorLongitude(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <Typography variant="body2">Estado:</Typography>
                <Select
                  value={sensorState}
                  onChange={(e) => setSensorState(e.target.value)}
                  fullWidth
                  required
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                  <MenuItem value="damaged">Dañado</MenuItem>
                </Select>
              </Grid>
            </Grid>

            <Grid size={4} />
            <Grid size={2}>
              <Button
                onClick={mutation.mutate}
                sx={{
                  marginBottom: '20%',
                  backgroundColor: '#3FC244',
                  color: 'white',
                  padding: '10%',
                }}
              >
                Crear
              </Button>
            </Grid>
            <Grid size={2}>
              <Button
                onClick={handleClose}
                sx={{ backgroundColor: '#EBEBEB', color: 'black', padding: '10%' }}
              >
                Cancelar
              </Button>
            </Grid>
            <Grid size={4} />
          </Grid>
        </Box>
      </Dialog>
      <ErrorAlert
        message="There was an error trying to create the device"
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
      />
    </>
  );
}

DeviceModal.propTypes = {
  open: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedSensor: PropTypes.shape({
    nombre: PropTypes.string,
    latitud: PropTypes.string,
    longitud: PropTypes.string,
    estado: PropTypes.string,
  }).isRequired,
  getDevices: PropTypes.func.isRequired,
};
