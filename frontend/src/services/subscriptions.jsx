// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION SERVICE
//
// Each device owns exactly ONE subscription in Orion that notifies QuantumLeap.
// Subscriptions are scoped by entity ID and use attrsFormat: "normalized"
// (required by QuantumLeap — "legacy" format causes silent write failures).
//
// Public API:
//   createDeviceSubscription({ deviceId, attrs, token })
//   addVariableToSubscription({ deviceId, variableName, token })
//   removeVariableFromSubscription({ deviceId, variableName, token })
//   getDeviceSubscription({ deviceId, token })
// ─────────────────────────────────────────────────────────────────────────────

const QL_NOTIFY_URL = 'http://quantumleap:8668/v2/notify';

function getToken() {
  return localStorage.getItem('access_token') || '';
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token || getToken()}`,
    'Content-Type': 'application/json',
  };
}

function formatAttrName(name) {
  return name.toLowerCase().replace(/\s/g, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD SUBSCRIPTION BODY
// ─────────────────────────────────────────────────────────────────────────────

function buildSubscriptionBody(deviceId, attrs) {
  const cleanAttrs = attrs.map(formatAttrName);
  return {
    description: `Auto-subscription for device: ${deviceId}`,
    subject: {
      entities: [{ id: deviceId, type: 'device' }],
      condition: { attrs: cleanAttrs },
    },
    notification: {
      // CRITICAL: must be "normalized" — "legacy" causes QuantumLeap to silently
      // receive the notification but fail to write it to CrateDB.
      attrsFormat: 'normalized',
      attrs: cleanAttrs,
      http: { url: QL_NOTIFY_URL },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET EXISTING SUBSCRIPTION FOR A DEVICE
// Returns the subscription object or null if none exists.
// ─────────────────────────────────────────────────────────────────────────────

export async function getDeviceSubscription({ deviceId, token }) {
  const response = await fetch('/v2/subscriptions', {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Failed to list subscriptions: ${response.status}`);
  }

  const all = await response.json();

  // Find the subscription that targets exactly this device ID
  return all.find(sub =>
    sub?.subject?.entities?.some(e => e.id === deviceId)
  ) || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE A NEW SUBSCRIPTION FOR A DEVICE
// Called automatically when a new device is created.
// ─────────────────────────────────────────────────────────────────────────────

export async function createDeviceSubscription({ deviceId, attrs, token }) {
  const body = buildSubscriptionBody(deviceId, attrs);

  const response = await fetch('/v2/subscriptions', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create subscription for ${deviceId}: ${errorText}`);
  }

  // Orion returns 201 with Location header containing the new subscription ID
  const location = response.headers.get('Location') || '';
  const newId = location.split('/').pop();
  return { subscriptionId: newId };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD A VARIABLE TO AN EXISTING DEVICE SUBSCRIPTION
// If no subscription exists yet, creates one automatically.
// ─────────────────────────────────────────────────────────────────────────────

export async function addVariableToSubscription({ deviceId, variableName, token }) {
  const attrName = formatAttrName(variableName);

  // 1. Find the device's existing subscription
  let sub = await getDeviceSubscription({ deviceId, token });

  // 2. If no subscription exists, create one with just this variable
  if (!sub) {
    console.warn(`[subscriptions] No subscription found for ${deviceId}, creating one.`);
    return createDeviceSubscription({ deviceId, attrs: [attrName], token });
  }

  // 3. Build updated attr lists (avoid duplicates)
  const currentConditionAttrs = sub.subject?.condition?.attrs || [];
  const currentNotifAttrs     = sub.notification?.attrs || [];

  const newConditionAttrs = currentConditionAttrs.includes(attrName)
    ? currentConditionAttrs
    : [...currentConditionAttrs, attrName];

  const newNotifAttrs = currentNotifAttrs.includes(attrName)
    ? currentNotifAttrs
    : [...currentNotifAttrs, attrName];

  // 4. PATCH the subscription — also enforce normalized format
  const response = await fetch(`/v2/subscriptions/${sub.id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({
      subject: {
        ...sub.subject,
        condition: { attrs: newConditionAttrs },
      },
      notification: {
        attrsFormat: 'normalized', // enforce correct format on every update
        attrs: newNotifAttrs,
        http: { url: QL_NOTIFY_URL },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update subscription for ${deviceId}: ${errorText}`);
  }

  return { subscriptionId: sub.id, attrs: newNotifAttrs };
}

// ─────────────────────────────────────────────────────────────────────────────
// REMOVE A VARIABLE FROM AN EXISTING DEVICE SUBSCRIPTION
// ─────────────────────────────────────────────────────────────────────────────

export async function removeVariableFromSubscription({ deviceId, variableName, token }) {
  const attrName = formatAttrName(variableName);

  const sub = await getDeviceSubscription({ deviceId, token });
  if (!sub) {
    console.warn(`[subscriptions] No subscription found for ${deviceId}, nothing to remove.`);
    return;
  }

  const newConditionAttrs = (sub.subject?.condition?.attrs || []).filter(a => a !== attrName);
  const newNotifAttrs     = (sub.notification?.attrs || []).filter(a => a !== attrName);

  const response = await fetch(`/v2/subscriptions/${sub.id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({
      subject: {
        ...sub.subject,
        condition: { attrs: newConditionAttrs },
      },
      notification: {
        attrsFormat: 'normalized',
        attrs: newNotifAttrs,
        http: { url: QL_NOTIFY_URL },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update subscription for ${deviceId}: ${errorText}`);
  }

  return { subscriptionId: sub.id, attrs: newNotifAttrs };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY COMPAT: default export for code that still uses the old API
// (editSubscription({ subscriptions, variableName }))
// This shim reads the deviceId from the first subscription's entity list.
// ─────────────────────────────────────────────────────────────────────────────

export default async function editSubscription({ subscriptions, variableName }) {
  const deviceId = subscriptions?.[0]?.subject?.entities?.[0]?.id;
  if (!deviceId) throw new Error('Cannot determine deviceId from subscription');
  return addVariableToSubscription({ deviceId, variableName });
}
