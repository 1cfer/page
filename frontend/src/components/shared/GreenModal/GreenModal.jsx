import React from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';

import styles from './GreenModal.module.css';

export default function GreenModal({ modalText, open, setOpen, acceptFunction, userId }) {
  const handleCloseModal = () => setOpen(false);

  return (
    <Modal open={open}>
      <Box className={styles.modal}>
        <h3>{modalText}</h3>
        <div className={styles.buttonRow}>
          <Button
            variant="contained"
            sx={{ bgcolor: '#3FC244', marginRight: '5%' }}
            onClick={() => (userId ? acceptFunction({ userId }) : acceptFunction())}
          >
            Accept
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#EBEBEB', color: '#606060' }}
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
        </div>
      </Box>
    </Modal>
  );
}

GreenModal.propTypes = {
  modalText: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  acceptFunction: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

import React from 'react';
import { Modal, Box, Button, Typography, Fade, Backdrop } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import PropTypes from 'prop-types';

import styles from './GreenModal.module.css';

export default function GreenModal({ 
  modalText, 
  modalSubtext, 
  open, 
  setOpen, 
  acceptFunction, 
  userId, 
  isDestructive = false 
}) {
  
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    if (userId) {
      acceptFunction({ userId });
    } else {
      acceptFunction();
    }
    handleClose();
  };

  // Elegimos el icono basado en si es una acción de borrado o una pregunta simple
  const Icon = isDestructive ? WarningAmberRoundedIcon : HelpOutlineRoundedIcon;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          className: styles.backdrop // Para el efecto de desenfoque (blur)
        },
      }}
      className={styles.modalWrapper}
    >
      <Fade in={open}>
        <Box className={styles.modalContainer}>
          {/* Decoración superior: El Icono */}
          <div className={`${styles.iconCircle} ${isDestructive ? styles.iconDestructive : styles.iconStandard}`}>
            <Icon sx={{ fontSize: 32 }} />
          </div>

          <div className={styles.content}>
            <Typography variant="h6" className={styles.title}>
              {modalText}
            </Typography>
            
            {modalSubtext && (
              <Typography variant="body2" className={styles.subtext}>
                {modalSubtext}
              </Typography>
            )}
          </div>

          <div className={styles.actions}>
            <Button
              onClick={handleClose}
              variant="text"
              className={styles.cancelBtn}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleConfirm}
              variant="contained"
              disableElevation
              className={`${styles.confirmBtn} ${isDestructive ? styles.confirmBtnDestructive : styles.confirmBtnStandard}`}
            >
              Confirmar
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}

GreenModal.propTypes = {
  modalText: PropTypes.string.isRequired,
  modalSubtext: PropTypes.string,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  acceptFunction: PropTypes.func.isRequired,
  userId: PropTypes.string,
  isDestructive: PropTypes.bool,
};