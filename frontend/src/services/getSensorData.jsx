export const getSensorData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/sensores');
      if (!response.ok) {
        throw new Error(`Error al obtener los datos: ${response.statusText}`);
      }
      const sensorsData = await response.json();
      return sensorsData;
    } catch (error) {
        console.error("Error en getTrialData:", error);
    }
  };


// Función para actualizar un sensor
export const updateSensor = async (nombreId,id_sensor, latitud, longitud, estado, imagenurl) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/sensores/${id_sensor}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombreId,
        id_sensor,
        latitud,
        longitud,
        estado,
        imagenurl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar el sensor: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en updateSensor:", error);
    throw error;
  }
};

export const deleteSensor = async (id_sensor) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/sensores/${id_sensor}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('Response failed:', response);
      throw new Error('Error al eliminar el sensor');
    }

    if (response.status === 204) {
      console.log('Sensor eliminado correctamente');
      return;
    }

    const data = await response.json();
    console.log('Respuesta de eliminación:', data);
    return data;
  } catch (error) {
    console.error("Error al eliminar el sensor:", error);
    throw error;
  }
};

