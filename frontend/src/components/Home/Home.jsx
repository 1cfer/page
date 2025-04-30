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
    // Verifica si el token está en localStorage
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(token !== null); // Establece si el usuario está logueado
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1} className="main-container">
        <Grid size={1} />
        <Grid size={3}>
          <h1 className="title">Monitoreo Inteligente para un Envejecimiento Saludable</h1>
          <p className="text">
            AgeVital+ utiliza tecnología IoT para monitorear tu salud física y mental en tiempo
            real.
          </p>
          <h1 className="title">Beneficios Clave</h1>
          <p className="text">
            AgeVital+ conecta sensores no invasivos en el hogar para recopilar datos sobre la salud
            física y el ambiente. Estos datos son analizados en tiempo real para detectar cualquier
            anomalía, permitiendo que los usuarios y cuidadores tomen decisiones informadas.
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
            <h3>Monitoreo en Tiempo Real</h3>
            <p>Supervisión continua de tu salud.</p>
          </div>
        </Grid>
        <Grid size={1} />
        <Grid size={2}>
          <div className="icon-item">
            <FavoriteBorderOutlinedIcon className="icon" />
            <h3>Detección Temprana</h3>
            <p>Identificación de riesgos cardiovasculares.</p>
          </div>
        </Grid>
        <Grid size={1} />
        <Grid size={2}>
          <div className="icon-item">
            <StarOutlineOutlinedIcon className="icon" />
            <h3>Fácil de Usar</h3>
            <p>Accesible para personas mayores y cuidadores.</p>
          </div>
        </Grid>
        <Grid size={2} />
      </Grid>
    </Box>
  );
}

export default Home;
