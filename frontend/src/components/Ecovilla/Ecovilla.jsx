import React, { useState, useEffect } from 'react';
import { SwipeableDrawer, Button } from '@mui/material';

// Components
import mpld3 from 'mpld3';
import ListRoundedIcon from '@mui/icons-material/ListRounded';
import mpld3LoadLib from './components/mpld3LoadLib';

// Styles
import styles from './Ecovilla.module.css';
import PrimerPlanta from '../../assets/PrimerPlanta.png';
import SegundaPlanta from '../../assets/SegundaPlanta.png';

function Ecovilla() {
  const [pisoActual] = useState('Primer Piso');
  const ImagenPlanta = pisoActual === 'Primer Piso' ? PrimerPlanta : SegundaPlanta;
  const [open, setOpen] = useState(false);
  const [medida, setMedida] = useState('Temperatura');

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const figName = 'fig_el427345810798888193429725';

  useEffect(() => {
    let valor;
    if (medida === 'Temperatura') {
      valor = 1;
    } else if (medida === 'Humedad') {
      valor = 2;
    } else {
      valor = 3;
    }
    const json = require(`assets/interpolaciones/interpolation_${valor}_floor_1`);

    mpld3LoadLib('https://d3js.org/d3.v5.js', function () {
      mpld3LoadLib('https://mpld3.github.io/js/mpld3.v0.5.8.js', function () {
        mpld3.remove_figure(figName);
        mpld3.draw_figure(figName, json);
      });
    });
  }, [medida]);

  return (
    <section className={styles.Section}>
      <button onClick={toggleDrawer(true)} className={styles.toggleDrawer}>
        <ListRoundedIcon />
      </button>
      <img src={ImagenPlanta} alt={pisoActual} className={styles.Background} />
      <div className={styles.Wrapper}>
        <h1>{pisoActual}</h1>
        <div className={styles.Graph} id={figName} />
        <SwipeableDrawer
          anchor="right"
          open={open}
          sx={{ padding: '2rem' }}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <Button onClick={() => setMedida('Temperatura')} variant="text">
            Temperatura
          </Button>
          <Button onClick={() => setMedida('Humedad')} variant="text">
            Humedad
          </Button>
          <Button onClick={() => setMedida('Ruido')} variant="text">
            Ruido
          </Button>
        </SwipeableDrawer>
      </div>
    </section>
  );
}

export default Ecovilla;
