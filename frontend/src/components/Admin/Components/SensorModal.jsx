import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box, TextField, Select, MenuItem, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './SensorModal.module.css';
import { NavLink } from 'react-router-dom';
import { updateSensor, deleteSensor } from '../../../services/getSensorData'; 

const SensorModal = ({ open, handleClose, nombreId, id_sensor, ubicacion, estado, imagenurl, handleUpdate,handleDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNombre, setEditedNombre] = useState(nombreId); // Estado para el nombre
  const [editedUbicacion, setEditedUbicacion] = useState(ubicacion);
  const [editedEstado, setEditedEstado] = useState(estado);

  const handleSave = async () => {
    if (!editedUbicacion || !editedEstado) {
      alert("Por favor, completa todos los campos");
      return;
    }
    try {
      const cleanedUbicacion = editedUbicacion.replace(/[()]/g, ''); 
      const [latitud, longitud] = cleanedUbicacion.split(',').map(Number); 
      if (isNaN(latitud) || isNaN(longitud)) {
        alert('Ubicación inválida. Asegúrate de que esté en el formato correcto (latitud,longitud)');
        return;
      }
      const updatedSensor = await updateSensor(editedNombre,id_sensor, latitud, longitud, editedEstado, imagenurl);
      handleUpdate(updatedSensor);  
      handleClose();
    } catch (error) {
      console.error("Error al guardar el sensor:", error);
    }
  };
  

  const handleCancel = () => {
    setIsEditing(false);
    setEditedNombre(nombreId);
    setEditedUbicacion(ubicacion);
    setEditedEstado(estado);
  };

  const handleDeleteClick = async () => {
    if (estado === 'activo') {
      alert('No se puede eliminar un sensor activo');
    } else {
      try {
        await deleteSensor(id_sensor);
        handleDelete(id_sensor); 
        handleClose(); 
      } catch (error) {
        console.error("Error al eliminar el sensor:", error);
        alert("Hubo un error al intentar eliminar el sensor.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box className={styles.header}>
        <DialogTitle>Detalles del Sensor</DialogTitle>
        <IconButton className={styles.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent>
        <Box className={styles.container}>
          <Box className={styles.imageContainer}>
            <img src={imagenurl} alt={nombreId} className={styles.image} />
          </Box>

          <Box className={styles.detailsContainer}>
            <Typography variant="h6">{isEditing ? (
              <TextField
                value={editedNombre}
                onChange={(e) => setEditedNombre(e.target.value)}
                fullWidth
              />
            ) : (
              nombreId
            )}</Typography>

            <Box className={styles.details}>
              <Typography variant="body2">Ubicación:</Typography>
              {isEditing ? (
                <TextField 
                  value={editedUbicacion} 
                  onChange={(e) => setEditedUbicacion(e.target.value)} 
                  fullWidth 
                />
              ) : (
                <Typography>{ubicacion}</Typography>
              )}
            </Box>

            <Box className={styles.details}>
              <Typography variant="body2">Estado:</Typography>
              {isEditing ? (
                <Select
                  value={editedEstado}
                  onChange={(e) => setEditedEstado(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                  <MenuItem value="dañado">Dañado</MenuItem>
                </Select>
              ) : (
                <Typography>{estado}</Typography>
              )}
            </Box>
            <Box className={styles.roundButtonsContainer}>
        <NavLink to={'/mapa'}>
          <Tooltip title="Visualizar mapa" arrow>
            <IconButton 
              className={styles.roundButton} 
              style={{ backgroundImage: `url('https://png.pngtree.com/png-clipart/20230916/original/pngtree-google-map-map-application-vector-png-image_12256712.png')` }}
            />
          </Tooltip>
        </NavLink>
          <NavLink to={'/mapa'}>
            <Tooltip title="Visualizar Ecovilla 3D" arrow placement="bottom">
              <IconButton  
                className={styles.roundButton} 
                style={{ backgroundImage: `url('https://cdn-icons-png.flaticon.com/512/751/751438.png')` }}
              />
            </Tooltip>
        </NavLink>
        </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={handleCancel} className={styles.buttonPurple}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className={styles.buttonPurple}>
              Guardar
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)} className={styles.buttonPurple}>
              Modificar
            </Button>
            <Button  onClick={handleDeleteClick} className={styles.buttonPurple}>
              Eliminar
            </Button>
          </>
          
        )}
        
      </DialogActions>
        
    </Dialog>
  );
};


export default SensorModal;
