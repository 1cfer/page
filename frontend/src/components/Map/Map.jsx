// Components
import React, { useState, useRef, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';

// Services

// styles
import { renderToString } from 'react-dom/server';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SensorsIcon from '@mui/icons-material/Sensors';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import SensorCard from './components/Sensorcard';
import styles from './Map.module.css';

function Map() {
  const centeredPosition = { lat: 6.242391, lng: -75.589642 };
  const bounds = [
    { lat: 6.244529, lng: -75.592128 },
    { lat: 6.239687, lng: -75.586238 },
  ];
  const [position, setPosition] = useState(centeredPosition);
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    []
  );

  const { isPending, data: entities } = useQuery({
    queryKey: ['entities'],
    queryFn: () => fetch('/v2/entities?type=sensor').then((res) => res.json()),
  });

  const { variablesPending, data: variablesData } = useQuery({
    queryKey: ['variableData'],
    queryFn: () => fetch('/v2/entities?id=variablelist').then((res) => res.json()),
  });

  // Icons
  const sensorIcon = renderToString(<SensorsIcon />);
  const customIcon = new L.divIcon({
    html: sensorIcon,
    className: styles.customIcon,
  });

  return (
    <section className={styles.Wrapper}>
      <Backdrop
        sx={() => ({ color: '#fff', position: 'fixed', zIndex: 1700 })}
        open={isPending || variablesPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MapContainer
        bounds={bounds}
        zoom={20}
        center={centeredPosition}
        className={styles.leafletContainer}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
            contributors'
          url="https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png"
        />
        {entities?.length > 0 &&
          entities?.map((device) => {
            return (
              <Marker
                key={device.id}
                icon={customIcon}
                position={[
                  device.location.value.coordinates[0],
                  device.location.value.coordinates[1],
                ]}
              >
                <Popup>
                  <SensorCard sensor={device} variablesData={variablesData} />
                </Popup>
              </Marker>
            );
          })}
        <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef}>
          <Popup minWidth={90}>
            <span>{`lat: ${position?.lat.toFixed(6)}, long: ${position?.lng.toFixed(6)}`}</span>
          </Popup>
        </Marker>
      </MapContainer>
    </section>
  );
}

export default Map;
