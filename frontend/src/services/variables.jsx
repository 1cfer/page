export default async function editVariables({ variablesData, variableName, variableUnit }) {
  // 1. Clonamos el objeto para no romper la referencia de React
  let variablesObj = JSON.parse(JSON.stringify(variablesData[0].variables));

  if (variableName) {
    // MODO AGREGAR
    const nameFormatted = variableName.toLowerCase().replace(/\s/g, '');
    if (!variablesObj.value.includes(nameFormatted)) {
      variablesObj.value.push(nameFormatted);
    }
    variablesObj.metadata[`${nameFormatted}Unit`] = {
      type: 'String',
      value: variableUnit || '',
    };
  } else {
    // MODO ELIMINAR (usamos la lista que ya viene filtrada del componente)
    variablesObj.value = variablesData[0].variables.value;
    
    // Limpieza de metadatos (unidades)
    const activeNames = variablesObj.value;
    const cleanMetadata = {};
    activeNames.forEach(name => {
      const key = `${name}Unit`;
      if (variablesObj.metadata[key]) cleanMetadata[key] = variablesObj.metadata[key];
    });
    variablesObj.metadata = cleanMetadata;
  }

  // 2. Petición a Orion
  const response = await fetch(`v2/entities/variablelist/attrs`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ variables: variablesObj }),
  });

  // 3. Manejo de respuesta ultra-seguro
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Error en Orion');
  }

  // IMPORTANTE: Retornamos un objeto plano para que useMutation no crea que falló
  return { status: 'success' };
}