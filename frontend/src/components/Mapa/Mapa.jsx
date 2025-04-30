// Components
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, Popup } from 'react-leaflet';

// Services

// styles
import { renderToString } from 'react-dom/server';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import { getSensorData } from '../../services/getSensorData';
import SensorCard from './components/Sensorcard';
import styles from './Mapa.module.css';

function Mapa() {
  const [data, setData] = useState([]);
  const position = [6.242391, -75.589642];
  const bounds = [
    [6.244529, -75.592128],
    [6.239687, -75.586238],
  ];

  useEffect(() => {
    const fetchData = async () => {
      const result = await getSensorData();
      setData(result);
    };
    fetchData();
  }, []);

  function Boundaries() {
    const map = useMap();
    map.setMaxBounds(bounds);
    return null; // Aseguramos que el componente no renderiza nada
  }

  // Icons
  const radioButtonIconHtml = renderToString(<RadioButtonCheckedRoundedIcon />);
  const customIcon = new L.divIcon({
    html: radioButtonIconHtml,
    className: styles.customIcon,
  });

  return (
    <section className={styles.Wrapper}>
      <NavLink to="/ecovilla">
        <button className={styles.openBocetoButton}>
          <HomeWorkRoundedIcon />
        </button>
      </NavLink>
      <MapContainer
        bounds={bounds}
        zoom={20}
        center={position}
        zoomControl
        scrollWheelZoom={false}
        className={styles.leafletContainer}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
            contributors, Tiles courtesy of
            <a href="https://www.openstreetmap.cat" target="_blank">Breton OpenStreetMap Team</a>'
          url="https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png"
        />
        {data.length > 0 &&
          data.map((sensor) => {
            console.log(sensor);
            return (
              <Marker
                key={sensor.id_sensor}
                icon={customIcon}
                position={[sensor.latitud, sensor.longitud]}
              >
                <Popup>
                  <SensorCard sensor={sensor} />
                </Popup>
              </Marker>
            );
          })}
        <Boundaries />
      </MapContainer>
    </section>
  );
}

export default Mapa;
