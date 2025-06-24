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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import styles from './DeviceModal.module.css';
import { createDevice, editDevice } from '../../../services/devices';
import ErrorAlert from '../../shared/ErrorAlert/ErrorAlert';

function CheckboxComponent({ variableName, setCheckboxStates, checked }) {
  const handleChange = (event) => {
    setCheckboxStates((prev) => ({
      ...prev,
      [variableName]: event.target.checked,
    }));
  };

  return (
    <Grid size={4}>
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={handleChange} name={variableName} />}
        label={variableName}
      />
    </Grid>
  );
}

CheckboxComponent.propTypes = {
  variableName: PropTypes.string.isRequired,
  setCheckboxStates: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default function DeviceModal({
  open,
  handleClose,
  selectedSensor,
  getDevices,
  variablesData,
  mode,
}) {
  const [sensorName, setSensorName] = useState(selectedSensor.id);
  const [sensorLatitude, setSensorLatitude] = useState(null);
  const [sensorLongitude, setSensorLongitude] = useState(null);
  const [sensorState, setSensorState] = useState(null);
  const [errorAlert, setErrorAlert] = useState(false);
  const [checkboxStates, setCheckboxStates] = useState({});

  const mutation = useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      getDevices();
      handleClose();
      setCheckboxStates({});
    },
    onError: (error) => {
      setErrorAlert(true);
      console.error('Error creating device:', error.message);
    },
  });

  const editMutation = useMutation({
    mutationFn: editDevice,
    onSuccess: () => {
      getDevices();
      handleClose();
      setCheckboxStates({});
    },
    onError: (error) => {
      setErrorAlert(true);
      console.error('Error editing device:', error.message);
    },
  });

  useEffect(() => {
    if (mode === 'Edit') {
      const keys = Object.keys(selectedSensor);
      const variables = keys.filter(
        (key) =>
          key !== 'id' &&
          key !== 'type' &&
          key !== 'creationdate' &&
          key !== 'location' &&
          key !== 'state'
      );
      const initialStates = {};
      variables.forEach((variable) => {
        initialStates[variable] = true;
      });
      setSensorName(selectedSensor?.id);
      setSensorLatitude(selectedSensor?.location?.value?.coordinates[0]);
      setSensorLongitude(selectedSensor?.location?.value?.coordinates[1]);
      setSensorState(selectedSensor?.state?.value);
      setCheckboxStates(initialStates);
    }
  }, [selectedSensor, mode]);

  return (
    <>
      <Backdrop
        sx={() => ({ color: '#fff', position: 'fixed', zIndex: 1700 })}
        open={mutation.isPending || editMutation.isPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog
        open={open}
        onClose={() => {
          handleClose();
          setCheckboxStates({});
        }}
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
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <DialogTitle variant="h5">
                {mode === 'Create' ? 'Create Device' : 'Edit Device'}
              </DialogTitle>
            </Grid>

            <Grid container sx={{ padding: '0% 4% 4% 4%' }}>
              <Grid size={12}>
                <Typography variant="body2">Name:</Typography>
                {mode === 'Create' ? (
                  <TextField
                    value={sensorName}
                    onChange={(e) => setSensorName(e.target.value)}
                    fullWidth
                    required
                  />
                ) : (
                  <Typography variant="h6" sx={{ margin: '1% 0%' }}>
                    {sensorName}
                  </Typography>
                )}
              </Grid>
              <Grid size={5}>
                <Typography variant="body2">Latitude:</Typography>
                <TextField
                  value={sensorLatitude}
                  onChange={(e) => setSensorLatitude(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={2} />
              <Grid size={5}>
                <Typography variant="body2">Longitude:</Typography>
                <TextField
                  value={sensorLongitude}
                  onChange={(e) => setSensorLongitude(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <Typography variant="body2">Status:</Typography>
                <Select
                  value={sensorState}
                  onChange={(e) => setSensorState(e.target.value)}
                  fullWidth
                  required
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="damaged">Damaged</MenuItem>
                </Select>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2">Variables:</Typography>
              </Grid>
              {variablesData &&
                checkboxStates !== null &&
                checkboxStates !== undefined &&
                variablesData[0]?.variables?.value?.map((variable) => {
                  return (
                    <CheckboxComponent
                      variableName={variable}
                      setCheckboxStates={setCheckboxStates}
                      checked={!!checkboxStates[variable]}
                    />
                  );
                })}
            </Grid>

            <Grid size={4} />
            <Grid size={2}>
              <Button
                onClick={() =>
                  mode === 'Create'
                    ? mutation.mutate({
                        checkboxStates,
                        sensorName,
                        sensorLatitude,
                        sensorLongitude,
                        sensorState,
                      })
                    : editMutation.mutate({
                        checkboxStates,
                        sensorName,
                        sensorLatitude,
                        sensorLongitude,
                        sensorState,
                        selectedSensor,
                      })
                }
                sx={{
                  marginBottom: '20%',
                  backgroundColor: '#3FC244',
                  color: 'white',
                  padding: '10%',
                }}
              >
                {mode === 'Create' ? 'Create' : 'Edit'}
              </Button>
            </Grid>
            <Grid size={2}>
              <Button
                onClick={handleClose}
                sx={{ backgroundColor: '#EBEBEB', color: 'black', padding: '10%' }}
              >
                Cancel
              </Button>
            </Grid>
            <Grid size={4} />
          </Grid>
        </Box>
      </Dialog>
      <ErrorAlert
        message={
          mode === 'Create'
            ? 'There was an error trying to create the device'
            : 'There was an error trying to edit the device'
        }
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
    id: PropTypes.string,
    state: PropTypes.shape({
      value: PropTypes.string,
    }),
    location: PropTypes.shape({
      value: PropTypes.string,
    }),
    creationdate: PropTypes.string,
  }).isRequired,
  getDevices: PropTypes.func.isRequired,
  variablesData: PropTypes.arrayOf(
    PropTypes.shape({
      variables: PropTypes.shape({
        value: PropTypes.string,
        type: PropTypes.string,
      }),
    })
  ).isRequired,
  mode: PropTypes.string.isRequired,
};
