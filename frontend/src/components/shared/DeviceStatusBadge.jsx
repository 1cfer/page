// ─────────────────────────────────────────────────────────────────────────────
// DeviceStatusBadge
//
// En /devices (DeviceRow): muestra sensor.state.value de Orion.
//   Props: orionState="active"|"inactive"|"damaged"
//
// En /dashboard: muestra actividad calculada del último timestamp de QuantumLeap.
//   Props: lastTimestamp="2026-03-07T10:00:00Z"
//
// Si se pasa orionState, ese tiene prioridad y se muestra el estado de Orion.
// Si solo se pasa lastTimestamp, se muestra la actividad de datos.
//
// Props:
//   orionState    — string — "active"|"inactive"|"damaged" (desde sensor.state.value)
//   lastTimestamp — ISO string | null (desde QuantumLeap, para dashboard)
//   compact       — bool (pill más pequeño, sin label)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { DEVICE_STATUSES, ACTIVITY_STATUS, computeActivity } from '../../services/devicestore';

export default function DeviceStatusBadge({ orionState, lastTimestamp, compact }) {
  // Decide qué mostrar: estado de Orion tiene prioridad
  let display;
  if (orionState && DEVICE_STATUSES[orionState]) {
    display = { ...DEVICE_STATUSES[orionState], key: orionState };
  } else {
    const activity = computeActivity(lastTimestamp);
    display = { ...ACTIVITY_STATUS[activity], key: activity };
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span
        style={{
          display:       'inline-flex',
          alignItems:    'center',
          gap:           compact ? 4 : 5,
          padding:       compact ? '3px 8px' : '4px 11px',
          borderRadius:  99,
          border:        `1.5px solid ${display.border}`,
          background:    display.bg,
          color:         display.color,
          fontSize:      compact ? 10 : 11,
          fontFamily:    '"DM Mono", monospace',
          fontWeight:    600,
          letterSpacing: '0.03em',
          whiteSpace:    'nowrap',
        }}
      >
        {display.pulse
          ? <PulseDot color={display.color} />
          : <span style={{ fontSize: 7, lineHeight: 1 }}>●</span>
        }
        {!compact && display.label}
      </span>
    </div>
  );
}

function PulseDot({ color }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: color, opacity: 0.4,
        animation: 'pulsePing 1.4s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{
        position: 'relative', width: 8, height: 8, borderRadius: '50%',
        background: color, display: 'inline-block',
      }} />
      <style>{`
        @keyframes pulsePing {
          0%   { transform: scale(1);   opacity: 0.4; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </span>
  );
}