import React from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';

export default function RowActions({
  sensor,
  setSelectedSensor,
  setOpenModal,
  setOpenDeleteModal,
}) {
  return (
    <>
      <IconButton
        onClick={() => {
          setSelectedSensor(sensor);
          setOpenModal(true);
        }}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        onClick={() => {
          setSelectedSensor(sensor);
          setOpenDeleteModal(true);
        }}
      >
        <DeleteIcon />
      </IconButton>
    </>
  );
}

RowActions.propTypes = {
  sensor: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    latitude: PropTypes.string,
    longitude: PropTypes.string,
    creationdate: PropTypes.string,
  }).isRequired,
  setSelectedSensor: PropTypes.func.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  setOpenDeleteModal: PropTypes.func.isRequired,
};
