import React, { useState, useEffect } from 'react';
import SensorMeasurement from './Components/SensorMeasurement';
import SensorModal from './Components/SensorModal';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddSensorModal from './Components/AddSensorModal';

import { getSensorData } from '../../services/getSensorData';

import styles from './Admin.module.css';

function Admin() {
  const [temperatureCards, setTemperatureCards] = useState([]);
  const [humidityCards, setHumidityCards] = useState([]);
  const [noiseCards, setNoiseCards] = useState([]);
  const [airQualityCards, setAirQualityCards] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const image = 'https://www.upb.edu.co/es/imagenes/img-upbsostenibleaerea-1464235639641.jpeg';
  const [tiposMedicion, setTiposMedicion] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/tipos_medicion')
      .then(response => response.json())
      .then(data => setTiposMedicion(data))
      .catch(error => console.error('Error al obtener tipos de medición:', error));
  }, []);

  const fetchData = () => {
    getSensorData()
      .then(data => {
        const sensorTypeToStateSetter = {
          'temperatura': setTemperatureCards,
          'humedadrelativa': setHumidityCards,
          'ruido': setNoiseCards,
          'calidadaire': setAirQualityCards,
        };

        Object.entries(sensorTypeToStateSetter).forEach(([sensorType, setState]) => {
          const cards = data
            .filter(sensor => sensor.tipo === sensorType || sensor.tipo.toLowerCase() === sensorType.toLowerCase())
            .map(sensor => ({
              nombreId: sensor.nombre,
              id_sensor: sensor.id_sensor,
              ubicacion: `(${sensor.latitud}, ${sensor.longitud})`,
              estado: sensor.estado.toLowerCase(),
              imagenurl: image,
            }));
          setState(cards);
        });
      })
      .catch(error => console.error('Error al obtener los datos:', error));
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000); // Actualiza cada 5 segundos
    return () => clearInterval(intervalId);
  }, []);

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleOpenModal = (sensor) => {
    setSelectedSensor(sensor);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSensor(null);
  };

  const handleUpdateSensor = (updatedSensor) => {
    const updateCards = (cards) =>
      cards.map((card) =>
        card.nombreId === updatedSensor.nombreId ? updatedSensor : card
      );

    setTemperatureCards((prevCards) => updateCards(prevCards));
    setHumidityCards((prevCards) => updateCards(prevCards));
    setNoiseCards((prevCards) => updateCards(prevCards));
    setAirQualityCards((prevCards) => updateCards(prevCards));

    handleCloseModal();
  };

  const handleDeleteSensor = (nombreId) => {
    const filterCards = (cards) => cards.filter((card) => card.nombreId !== nombreId);

    setTemperatureCards((prevCards) => filterCards(prevCards));
    setHumidityCards((prevCards) => filterCards(prevCards));
    setNoiseCards((prevCards) => filterCards(prevCards));
    setAirQualityCards((prevCards) => filterCards(prevCards));

    handleCloseModal();
  };

  const handleAddSensor = (newSensor) => {
    const tiposMedicionSeleccionados = Object.keys(newSensor.mediciones)
      .filter(tipo => newSensor.mediciones[tipo])
      .map(tipo => {
        const tipoMedicion = tiposMedicion.find(tm => tm.nombre_tipo === tipo);
        return tipoMedicion ? tipoMedicion.id_tipo_medicion : null;
      })
      .filter(id_tipo_medicion => id_tipo_medicion !== null);

    const nuevoSensor = {
      nombre: newSensor.nombre,
      estado: newSensor.estado,
      latitud: parseFloat(newSensor.latitud),
      longitud: parseFloat(newSensor.longitud),
      tipos_medicion: tiposMedicionSeleccionados,
    };
    console.log(newSensor);
    console.log(nuevoSensor);

    fetch('http://127.0.0.1:5000/api/sensores', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return fetch('http://127.0.0.1:5000/api/sensores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(nuevoSensor)
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.error("Error al crear el sensor:", data.error);
        } else {
          console.log("Sensor creado exitosamente:", data);
          fetchData(); // Actualiza los datos
          handleCloseAddModal();
        }
      })
      .catch(error => console.error("Error en la solicitud:", error));
  };

  return (
    <div className={styles.measurement}>
      <SensorMeasurement
        titulo="Temperatura"
        cardsData={temperatureCards}
        handleOpenModal={handleOpenModal}
      />

      <SensorMeasurement
        titulo="humedad"
        cardsData={humidityCards}
        handleOpenModal={handleOpenModal}
      />
      <SensorMeasurement
        titulo="ruido"
        cardsData={noiseCards}
        handleOpenModal={handleOpenModal}
      />

      <SensorMeasurement
        titulo="Calidad del Aire"
        cardsData={airQualityCards}
        handleOpenModal={handleOpenModal}
      />

      {selectedSensor && (
        <SensorModal
          open={openModal}
          handleClose={handleCloseModal}
          nombreId={selectedSensor.nombreId}
          id_sensor={selectedSensor.id_sensor}
          ubicacion={selectedSensor.ubicacion}
          estado={selectedSensor.estado}
          imagenurl={selectedSensor.imagenurl}
          handleUpdate={handleUpdateSensor}
          handleDelete={handleDeleteSensor}
        />
      )}
      <Fab
        color="primary"
        aria-label="add"
        style={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenAddModal(true)}
      >
        <AddIcon className="custom-color" />
      </Fab>

      <AddSensorModal
        open={openAddModal}
        onClose={handleCloseAddModal}
        handleAddSensor={handleAddSensor}
      />
    </div>
  );
}

export default Admin;
