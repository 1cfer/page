import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

const ThreeD = () => {

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1}>
        <Grid size={12}>
          <embed src="https://pablojbuiles.github.io/EcoVillaVirtual" style={{width: '100%', height: '650px'}}/>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThreeD;
