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
import styles from './SensorModal.module.css';
import { updateSensor } from '../../../services/getSensorData';

function SensorModal({ open, handleClose, selectedSensor }) {
  const [sensorName, setSensorName] = useState(selectedSensor.nombre);
  const [sensorLatitude, setSensorLatitude] = useState(selectedSensor.latitud);
  const [sensorLongitude, setSensorLongitude] = useState(selectedSensor.longitud);
  const [sensorState, setSensorState] = useState(selectedSensor.estado);

  const handleSave = async () => {
    if (!editedUbicacion || !sensorState) {
      alert('Por favor, completa todos los campos');
      return;
    }
    try {
      const cleanedUbicacion = editedUbicacion.replace(/[()]/g, '');
      const [latitud, longitud] = cleanedUbicacion.split(',').map(Number);
      if (isNaN(latitud) || isNaN(longitud)) {
        alert(
          'Ubicación inválida. Asegúrate de que esté en el formato correcto (latitud,longitud)'
        );
        return;
      }
      const updatedSensor = await updateSensor(
        sensorName,
        id_sensor,
        sensorLatitude,
        sensorLongitude,
        sensorState,
        imagenurl
      );
      handleUpdate(updatedSensor);
      handleClose();
    } catch (error) {
      console.error('Error al guardar el sensor:', error);
    }
  };

  useEffect(() => {
    setSensorName(selectedSensor.nombre);
    setSensorLatitude(selectedSensor.latitud);
    setSensorLongitude(selectedSensor.longitud);
    setSensorState(selectedSensor.estado);
  }, [selectedSensor]);

  return (
    <Dialog open={open} onClose={handleClose} sx={{ borderRadius: '30px' }}>
      <Box sx={{ flexGrow: 1, borderRadius: '30px' }}>
        <Grid container spacing={1}>
          <Grid size={11} />
          <Grid size={1}>
            <IconButton className={styles.closeButton} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <Grid size={12}>
            <DialogTitle>Editar Sensor</DialogTitle>
          </Grid>

          <Grid container sx={{ padding: '0% 4% 4% 4%' }}>
            <Grid size={12}>
              <Typography variant="body2">Nombre:</Typography>
              <TextField
                value={sensorName}
                onChange={(e) => setSensorName(e.target.value)}
                fullWidth
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
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
                <MenuItem value="dañado">Dañado</MenuItem>
              </Select>
            </Grid>
          </Grid>

          <Grid size={4} />
          <Grid size={2}>
            <Button
              onClick={handleSave}
              sx={{
                marginBottom: '20%',
                backgroundColor: '#3FC244',
                color: 'white',
                padding: '10%',
              }}
            >
              Editar
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
  );
}

export default SensorModal;

SensorModal.propTypes = {
  open: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedSensor: PropTypes.shape({
    nombre: PropTypes.string,
    latitud: PropTypes.string,
    longitud: PropTypes.string,
    estado: PropTypes.string,
  }).isRequired,
};
