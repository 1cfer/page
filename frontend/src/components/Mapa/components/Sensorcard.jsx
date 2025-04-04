import React from "react";
import "./Sensorcard.css";

function SensorCard({ sensor }) {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("es-CO", options);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="sensor-card">
      <div className="sensor-status">
        <span className="sensor-title">Sensor</span>
        <span
          className={`status-badge ${
            sensor.estado === "activo"
              ? "activo"
              : sensor.estado === "dañado"
              ? "dañado"
              : "desactivado"
          }`}
        >
          {sensor.estado === "activo"
            ? "activo"
            : sensor.estado === "dañado"
            ? "dañado"
            : "desactivado"}
        </span>
      </div>
      <h1 className="sensor-name">{sensor.tipo}</h1>
      <hr />
      <div className="sensor-info">
        <div className="info-row-sub">
          <span>Media</span>
          <span>Max</span>
          <span>Min</span>
        </div>
        <div className="info-row">
          <span>{sensor.medida_promedio}</span>
          <span>{sensor.medida_maxima}</span>
          <span>{sensor.medida_minima}</span>
        </div>
        <div className="info-row-sub">
          <span>Fecha</span>
          <span>Frecuencia</span>
          <span>Hora</span>
        </div>
        <div className="info-row">
          <span>{formatDate(sensor.fecha_instalacion)}</span>
          <span>5min</span>
          <span>{formatTime(sensor.fecha_instalacion)}</span>
        </div>
        <div className="info-row-id">
          <p className="sensor-id-tittle">Id del sensor: </p>
          <p className="sensor-id"> {sensor.nombre}</p>
        </div>
      </div>
      <div className="decorative-circles">
        <div className="circle large"></div>
        <div className="circle small"></div>
      </div>
    </div>
  );
}

export default SensorCard;
