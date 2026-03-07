import React from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';

export default function RowActions({
  item,
  setSelectedItem,
  setOpenModal,
  setOpenDeleteModal,
  setMode,
  allowEdition,
}) {
  return (
    <>
      {allowEdition && (
        <IconButton
          onClick={() => {
            setSelectedItem(item);
            setOpenModal(true);
            setMode('Edit');
          }}
        >
          <EditIcon />
        </IconButton>
      )}
      <IconButton
        onClick={() => {
          setSelectedItem(item);
          setOpenDeleteModal(true);
        }}
      >
        <DeleteIcon />
      </IconButton>
    </>
  );
}

RowActions.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    latitude: PropTypes.string,
    longitude: PropTypes.string,
    creationdate: PropTypes.string,
  }).isRequired,
  setSelectedItem: PropTypes.func.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  setOpenDeleteModal: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
  allowEdition: PropTypes.bool.isRequired,
};
