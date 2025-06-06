function addVariable(variables, variableName, variableUnit) {
  const variableNameToSend = variableName.toLowerCase().replace(/\s/g, '');
  variables.value.push(variableNameToSend);
  variables.metadata[`${variableNameToSend}Unit`] = {
    type: 'String',
    value: variableUnit,
  };
  return variables;
}

export default async function editVariables({ variablesData, variableName, variableUnit }) {
  const variablesToSend = addVariable(variablesData[0]?.variables, variableName, variableUnit);
  const response = await fetch(`v2/entities/variablelist/attrs`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variables: variablesToSend,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to edit variables');
  }

  return response;
}
