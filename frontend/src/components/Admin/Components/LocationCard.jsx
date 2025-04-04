import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import styles from './LocationCard.module.css';

const getStatusClass = (status) => {
  switch (status) {
    case 'activo':
      return styles.activo; 
    case 'inactivo':
      return styles.inactivo; 
    case 'dañado':
      return styles.dañado;  
    default:
      return ''; // Return an empty string or a default style
  }
};

const LocationCard = ({ nombreId, ubicacion, estado, imagenurl, handleOpenModal }) => {
  const handleClickOpen = () => {
    handleOpenModal({ nombreId, ubicacion, estado, imagenurl });
    // setOpen(true); // Removed if 'open' is not used
  };

  return (
    <>    
      <Card 
        className={styles.card} 
        style={{ 
          backgroundImage: `linear-gradient(to bottom, white 50%, transparent 80%), url(${imagenurl})` 
        }}
        onClick={handleClickOpen}
      >
        <CardContent className={styles.cardContent}>
          <Box className={styles.header}>
            <Box>
              <Typography variant="h10" component="div">
                {nombreId}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {ubicacion}
              </Typography>
            </Box>
            
            <Box className={styles.flexContainer}>
              <Typography variant="body2" color="text.secondary" className={styles.marginRight}>
                {estado}
              </Typography>
              
              <Box className={`${styles.circle} ${getStatusClass(estado)}`} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default LocationCard;
