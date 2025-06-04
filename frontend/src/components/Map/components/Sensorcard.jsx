import React from 'react';
import './Sensorcard.css';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

function SensorCard({ sensor, variablesData }) {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };
  const keys = Object.keys(sensor);
  const variables = keys.filter(
    (key) =>
      key !== 'id' &&
      key !== 'type' &&
      key !== 'creationdate' &&
      key !== 'location' &&
      key !== 'state'
  );

  return (
    <div className="sensorCard">
      <div className="sensorStatus">
        <Typography>device</Typography>
        <span className={`statusBadge ${sensor.state.value}`}>{sensor.state.value}</span>
      </div>
      <Typography variant="h4">{sensor.id}</Typography>
      <hr />
      <div className="sensorInfo">
        {variables?.map((variable) => (
          <div className="variableRow">
            <span className="variableName">{`${variable}:`}</span>
            <span className="variableValue">{`${sensor[variable].value} ${variablesData[0]?.variables?.metadata[`${variable}Unit`]?.value}`}</span>
          </div>
        ))}
        <div className="infoRowSub">
          <span>Creation date</span>
        </div>
        <div className="infoRow">
          <span>{formatDate(sensor.creationdate.value)}</span>
        </div>
      </div>
    </div>
  );
}

export default SensorCard;

SensorCard.propTypes = {
  sensor: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    state: PropTypes.shape({
      value: PropTypes.string,
      type: PropTypes.string,
    }),
    latitude: PropTypes.string,
    longitude: PropTypes.string,
    creationdate: PropTypes.string,
  }).isRequired,
  variablesData: PropTypes.arrayOf(
    PropTypes.shape({
      variables: PropTypes.shape({
        value: PropTypes.string,
        type: PropTypes.string,
        metadata: PropTypes.shape({}),
      }),
    })
  ).isRequired,
};
