import React from 'react';
import PropTypes from 'prop-types';
import LocationCard from './LocationCard';
import styles from './SensorMeasurement.module.css';

function SensorMeasurement({ titulo, cardsData, handleOpenModal }) {
  return (
    <div className={styles.sensorMeasurement}>
      <h2 className={styles.title}>{titulo}</h2>
      <div className={styles.cardsRow}>
        {cardsData.map((card, index) => (
          <LocationCard
            key={index}
            nombreId={card.nombreId}
            ubicacion={card.ubicacion}
            estado={card.estado}
            imagenurl={card.imagenurl}
            handleOpenModal={() => handleOpenModal(card)}
          />
        ))}
      </div>
    </div>
  );
}

export default SensorMeasurement;

SensorMeasurement.propTypes = {
  titulo: PropTypes.string.isRequired,
  cardsData: PropTypes.shape({
    nombreId: PropTypes.string,
    ubicacion: PropTypes.string,
    estado: PropTypes.string,
    imagenurl: PropTypes.string,
  }).isRequired,
  handleOpenModal: PropTypes.func.isRequired,
};
