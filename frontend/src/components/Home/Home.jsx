import React, { useEffect, useState } from 'react';
import './Home.css';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import homeImage from './home1.png';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(token !== null);
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1} className="main-container">
        <Grid size={1} />
        <Grid size={3}>
          <h1 className="title">Smart Monitoring for Healthy Aging</h1>
          <p className="text">
            AgeVital+ uses IoT technology to monitor your physical and mental health in real time.
          </p>
          <h1 className="title">Key Benefits</h1>
          <p className="text">
            AgeVital+ connects noninvasive sensors at home to collect data from physical health and
            environment. This data is analyzed in real time to detect any anomalies, allowing users
            and caregivers to make informed decisions.
          </p>
        </Grid>
        <Grid size={1} />
        <Grid size={6}>
          <img src={homeImage} alt="Home" className="home-image" />
        </Grid>
        <Grid size={1} />
      </Grid>
      <Grid container spacing={1}>
        <Grid size={1} />
        <Grid size={10}>
          <hr className="divider" />
        </Grid>
        <Grid size={1} />
      </Grid>
      <Grid container spacing={1}>
        <Grid size={2} />
        <Grid size={2}>
          <div className="icon-item">
            <AccessTimeOutlinedIcon className="icon" />
            <h3>Real-Time Monitoring</h3>
            <p>Continuous monitoring of your health.</p>
          </div>
        </Grid>
        <Grid size={1} />
        <Grid size={2}>
          <div className="icon-item">
            <FavoriteBorderOutlinedIcon className="icon" />
            <h3>Early Detection</h3>
            <p>Cardiovascular risks identification</p>
          </div>
        </Grid>
        <Grid size={1} />
        <Grid size={2}>
          <div className="icon-item">
            <StarOutlineOutlinedIcon className="icon" />
            <h3>Easy to Use</h3>
            <p>Accessible for seniors and caregivers.</p>
          </div>
        </Grid>
        <Grid size={2} />
      </Grid>
    </Box>
  );
}

export default Home;
