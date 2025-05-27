import React from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';

export default function RowActions({ sensor, setSelectedSensor, setOpenModal }) {
  return (
    <>
      <IconButton
        onClick={() => {
          setOpenModal(true);
          setSelectedSensor(sensor);
        }}
      >
        <EditIcon />
      </IconButton>
      <IconButton>
        <DeleteIcon />
      </IconButton>
    </>
  );
}

RowActions.propTypes = {
  sensor: PropTypes.shape({
    id_sensor: PropTypes.string,
    nombre: PropTypes.string,
    tipo: PropTypes.string,
    latitud: PropTypes.string,
    longitud: PropTypes.string,
    fecha_instalacion: PropTypes.string,
  }).isRequired,
  setSelectedSensor: PropTypes.func.isRequired,
  setOpenModal: PropTypes.func.isRequired,
};
