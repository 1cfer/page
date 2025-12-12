const addVariables = (states) => {
  const arrayToReturn = {};
  Object.keys(states).map((key) => {
    if (states[key]) {
      arrayToReturn[key] = {
        type: 'Integer',
        value: null,
      };
    }
  });
  return arrayToReturn;
};

export async function createDevice({
  checkboxStates,
  sensorName,
  sensorLatitude,
  sensorLongitude,
  sensorState,
}) {
  const currentDate = new Date();
  const addedVariables = addVariables(checkboxStates);
  const sensorNameToSend = sensorName.toLowerCase().replace(/\s/g, '');
  const response = await fetch('/v2/entities', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: sensorNameToSend,
      type: 'device',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [parseFloat(sensorLatitude), parseFloat(sensorLongitude)],
        },
      },
      state: {
        type: 'String',
        value: sensorState,
      },
      creationdate: {
        type: 'DateTime',
        value: currentDate.toISOString(),
      },
      ...addedVariables,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create device');
  }

  return response;
}

export async function editDevice({
  checkboxStates,
  sensorName,
  sensorLatitude,
  sensorLongitude,
  sensorState,
  selectedSensor,
}) {
  const addedVariables = addVariables(checkboxStates);
  const response = await fetch(`v2/entities/${sensorName}/attrs`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [parseFloat(sensorLatitude), parseFloat(sensorLongitude)],
        },
      },
      state: {
        type: 'String',
        value: sensorState,
      },
      creationdate: selectedSensor.creationdate,
      ...addedVariables,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create device');
  }

  return response;
}
