import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlined';
import { LineChart } from '@mui/x-charts';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import { useMutation } from '@tanstack/react-query';
import Backdrop from '@mui/material/Backdrop';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

const colors = ['#0C5806', '#0C59CF', '#FF5733', '#606060', '#FF3823', '#000000'];

function VariableChart({ label, values, timeArray, color }) {
  const shouldRender = values.some((value) => value !== null);

  return (
    shouldRender && (
      <>
        <Grid size={5}>
          <LineChart
            xAxis={[
              {
                data: timeArray?.map((date) => new Date(date)),
                scaleType: 'time',
                tickMinStep: 3600 * 1000 * 24,
              },
            ]}
            series={[
              {
                label,
                data: values,
                color,
              },
            ]}
            height={300}
          />
        </Grid>
        <Grid size={1} />
      </>
    )
  );
}

VariableChart.propTypes = {
  label: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
  timeArray: PropTypes.arrayOf(PropTypes.string).isRequired,
  color: PropTypes.string.isRequired,
};

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [pickedDevice, setPickedDevice] = useState('');
  const [deviceData, setDeviceData] = useState({});

  const deviceHistoryMutation = useMutation({
    queryKey: ['entityData'],
    mutationFn: () =>
      fetch(`/quantumleap/v2/entities/${pickedDevice}?type=device`, {
        headers: {
          'Fiware-Service': '',
          'Fiware-ServicePath': '/',
        },
      }).then((res) => res.json()),
    onSuccess: (data) => {
      console.log(data);
      setDeviceData(data);
    },
    onError: (error) => {
      console.error('Error getting device:', error.message);
    },
  });

  const mutation = useMutation({
    queryKey: ['getEntities'],
    mutationFn: () =>
      fetch('/v2/entities?type=device', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }).then((res) => res.json()),
    onSuccess: (data) => {
      setDevices(data);
      setPickedDevice(data[0]?.id);
    },
    onError: (error) => {
      console.error('Error getting devices:', error.message);
    },
  });

  useEffect(() => {
    if (pickedDevice !== '') {
      deviceHistoryMutation.mutate();
    }
  }, [pickedDevice]);

  useEffect(() => {
    mutation.mutate();
  }, []);

  const openNewTab = () => {
    window.open('http://localhost:3000', '_blank');
  };

  return (
    <>
      <Backdrop
        sx={() => ({ color: '#fff', position: 'fixed', zIndex: 1700 })}
        open={mutation.isPending || deviceHistoryMutation.isPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={1} sx={{ marginLeft: '5%' }}>
          <Grid size={3} sx={{ margin: '2% 0% 2% 0%' }}>
            <Typography variant="body2" sx={{ marginBottom: '1%' }}>
              Device:
            </Typography>
            <Select
              value={pickedDevice}
              onChange={(e) => setPickedDevice(e.target.value)}
              fullWidth
              required
            >
              {devices?.map((dev) => (
                <MenuItem key={dev?.id} value={dev?.id}>
                  {dev?.id}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={9} />
          {deviceData?.attributes?.map((variable, index) => (
            <VariableChart
              key={variable?.attrName}
              label={variable?.attrName}
              values={variable?.values}
              timeArray={deviceData?.index}
              color={colors[index]}
            />
          ))}
        </Grid>
        <button className="open-dashboard-button" onClick={openNewTab} type="button">
          <InsertChartOutlinedRoundedIcon />
        </button>
      </Box>
    </>
  );
}

export default Dashboard;
