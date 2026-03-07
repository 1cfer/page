import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';

export default function ErrorAlert({ message, errorAlert, setErrorAlert }) {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorAlert(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Snackbar
        open={errorAlert}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setErrorAlert(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 5 }}
          severity="error"
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

ErrorAlert.propTypes = {
  message: PropTypes.string.isRequired,
  errorAlert: PropTypes.bool.isRequired,
  setErrorAlert: PropTypes.func.isRequired,
};
