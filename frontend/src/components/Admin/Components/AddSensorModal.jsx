import React, { useState } from 'react';
import { Modal, Box, TextField, Button, IconButton, FormGroup, FormControlLabel, Checkbox, Grid, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './AddSensorModal.css'; 

const AddSensorModal = ({ open, onClose, handleAddSensor }) => {
  const [sensorData, setSensorData] = useState({
    nombre: '',
    latitud: '',
    longitud: '',
    estado: '',
    mediciones: {
      temperatura: false,
      humedadrelativa: false,
      ruido: false,
      calidadaire: false,
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSensorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSensorData((prev) => ({
      ...prev,
      mediciones: {
        ...prev.mediciones,
        [name]: checked,
      },
    }));
  };

  const handleSubmit = () => {
    handleAddSensor(sensorData);
    onClose(); 
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="modal-container">
        <IconButton className="close-button" onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <h2 className="title">Agregar Nuevo Sensor</h2>
        <Grid container spacing={6} className="form-grid">
          <Grid item xs={5}>
            <TextField
              label="Nombre"
              name="nombre"
              value={sensorData.nombre}
              onChange={handleChange}
              fullWidth
              margin="dense"
              className="form-item"
            />
            <TextField
              label="Latitud"
              name="latitud"
              value={sensorData.latitud}
              onChange={handleChange}
              fullWidth
              margin="dense"
              className="form-item"
            />
            <TextField
              label="Longitud"
              name="longitud"
              value={sensorData.longitud}
              onChange={handleChange}
              fullWidth
              margin="dense"
              className="form-item"
            />
            <FormControl fullWidth margin="dense" className="form-item">
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                name="estado"
                value={sensorData.estado}
                onChange={handleChange}
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="desactivado">Desactivado</MenuItem>
                <MenuItem value="dañado">Dañado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormGroup>
              <h3 className="mediciones-title">Mediciones</h3>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sensorData.mediciones.temperatura}
                    onChange={handleCheckboxChange}
                    name="temperatura"
                  />
                }
                label="Temperatura"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sensorData.mediciones.humedadrelativa}
                    onChange={handleCheckboxChange}
                    name="humedadrelativa"
                  />
                }
                label="Humedad Relativa"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sensorData.mediciones.ruido}
                    onChange={handleCheckboxChange}
                    name="ruido"
                  />
                }
                label="Ruido"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sensorData.mediciones.calidadaire}
                    onChange={handleCheckboxChange}
                    name="calidadaire"
                  />
                }
                label="Calidad del Aire"
              />
            </FormGroup>
          </Grid>
        </Grid>
        <Box className="add-button">
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Agregar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddSensorModal;
