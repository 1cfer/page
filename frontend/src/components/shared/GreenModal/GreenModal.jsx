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
  modalText:      PropTypes.string.isRequired,
  open:           PropTypes.bool.isRequired,
  setOpen:        PropTypes.func.isRequired,
  acceptFunction: PropTypes.func.isRequired,
  userId:         PropTypes.string, // optional — only needed when deleting a user
};

GreenModal.defaultProps = {
  userId: undefined,
};