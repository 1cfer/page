function addVariableToSubs(subscription, variableName) {
  const variableNameToSend = variableName.toLowerCase().replace(/\s/g, '');
  subscription?.subject?.condition?.attrs.push(variableNameToSend);
  subscription?.notification?.attrs.push(variableNameToSend);
  return subscription;
}

export default async function editSubscription({ subscriptions, variableName }) {
  const subscriptionToSend = addVariableToSubs(subscriptions[0], variableName);
  const response = await fetch(`v2/subscriptions/${subscriptions[0]?.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: subscriptionToSend.subject,
      notification: subscriptionToSend.notification,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to edit subscription');
  }

  return response;
}
