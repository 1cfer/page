// ─────────────────────────────────────────────────────────────────────────────
// DEVICE SERVICE
//
// createDevice: creates the entity in Orion AND its dedicated subscription
//               in a single atomic operation from the frontend's perspective.
//
// editDevice:   updates the entity attributes in Orion (unchanged from before).
// ─────────────────────────────────────────────────────────────────────────────

import { createDeviceSubscription } from './subscriptions';

function getToken() {
  return localStorage.getItem('access_token') || '';
}

// Build the sensor attribute map from checkbox states
function buildSensorAttrs(states) {
  const attrs = {};
  Object.keys(states).forEach(key => {
    if (states[key]) {
      attrs[key] = { type: 'Integer', value: null };
    }
  });
  return attrs;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE DEVICE
// 1. POST entity to Orion
// 2. POST dedicated subscription for this device to Orion → QuantumLeap
// ─────────────────────────────────────────────────────────────────────────────

export async function createDevice({
  checkboxStates,
  sensorName,
  sensorLatitude,
  sensorLongitude,
  sensorState,
}) {
  const token = getToken();
  const currentDate = new Date();
  const sensorAttrs = buildSensorAttrs(checkboxStates);
  const deviceId = sensorName.toLowerCase().replace(/\s/g, '');

  // ── Step 1: Create entity in Orion ─────────────────────────────────────────
  const entityResponse = await fetch('/v2/entities', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: deviceId,
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
      ...sensorAttrs,
    }),
  });

  if (!entityResponse.ok) {
    const errorText = await entityResponse.text();
    throw new Error(`Failed to create device in Orion: ${errorText}`);
  }

  // ── Step 2: Create dedicated subscription for this device ──────────────────
  //
  // This subscription:
  //   - Targets ONLY this device by ID (not all devices of type "device")
  //   - Uses attrsFormat: "normalized" (required by QuantumLeap)
  //   - Watches only the sensor attributes (not metadata like location/state)
  //
  const sensorAttrNames = Object.keys(sensorAttrs);

  if (sensorAttrNames.length > 0) {
    try {
      await createDeviceSubscription({
        deviceId,
        attrs: sensorAttrNames,
        token,
      });
    } catch (subError) {
      // Log but don't fail the whole operation — device was created successfully.
      // The subscription can be repaired manually or on next variable add.
      console.error(`[devices] Device created but subscription failed:`, subError.message);
    }
  }

  return { deviceId };
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT DEVICE
// Updates entity attributes in Orion. Does not touch subscriptions.
// Variable add/remove operations go through subscriptions.jsx instead.
// ─────────────────────────────────────────────────────────────────────────────

export async function editDevice({
  checkboxStates,
  sensorName,
  sensorLatitude,
  sensorLongitude,
  sensorState,
  selectedSensor,
}) {
  const token = getToken();
  const sensorAttrs = buildSensorAttrs(checkboxStates);

  const response = await fetch(`v2/entities/${sensorName}/attrs`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
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
      ...sensorAttrs,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update device: ${errorText}`);
  }

  return { deviceId: sensorName };
}