// ─────────────────────────────────────────────────────────────────────────────
// DEVICE STORE — fuente compartida entre /devices y /dashboard
//
// ESTADO DEL DISPOSITIVO:
//   - La fuente de verdad es sensor.state.value en Orion (active / inactive / damaged)
//   - El Dashboard lo muestra leyendo ese mismo campo vía la API de Orion
//   - "activity" (live/recent/stale) se calcula desde el último timestamp de QuantumLeap
//     y se muestra ADICIONALMENTE en el Dashboard como indicador de datos, no de estado
//
// ICONOS:
//   - Se guardan en localStorage y se sincronizan entre tabs via StorageEvent
//   - Las variables reales vienen de Orion (variablelist entity)
// ─────────────────────────────────────────────────────────────────────────────

export const ICONS_KEY = 'shared_var_icons_v1';

// ── Estado de Orion — estos son los valores reales de sensor.state.value ─────
export const DEVICE_STATUSES = {
  active:   { label: 'Activo',   color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', pulse: true  },
  inactive: { label: 'Inactivo', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', pulse: false },
  damaged:  { label: 'Dañado',   color: '#ef4444', bg: '#fef2f2', border: '#fecaca', pulse: false },
};

// ── Actividad — calculada desde el último timestamp de QuantumLeap ────────────
// Se usa SOLO en Dashboard como indicador de frescura de datos
export const ACTIVITY_STATUS = {
  live:     { label: 'Live',      color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', pulse: true  },
  recent:   { label: 'Reciente',  color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', pulse: false },
  stale:    { label: 'Sin datos', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', pulse: false },
  inactive: { label: 'Offline',   color: '#ef4444', bg: '#fef2f2', border: '#fecaca', pulse: false },
  idle:     { label: '—',         color: '#cbd5e1', bg: '#f8fafc', border: '#e2e8f0', pulse: false },
};

export function computeActivity(lastTimestamp) {
  if (!lastTimestamp) return 'idle';
  const diffMs  = Date.now() - new Date(lastTimestamp).getTime();
  const diffMin = diffMs / 60_000;
  const diffDay = diffMs / 86_400_000;
  if (diffMin < 5)  return 'live';
  if (diffMin < 60) return 'recent';
  if (diffDay < 3)  return 'stale';
  return 'inactive';
}

// ── Iconos ────────────────────────────────────────────────────────────────────

export const DEFAULT_ICONS = {
  temperature: '🌡️', temp_amb: '🌡️', temp_water: '🌊', humidity: '💧',
  co2: '🌿', noise: '🔊', pressure: '🔵', light: '💡', illuminance: '💡',
  flow: '🚿', voltage: '⚡', current: '⚡', power: '⚡', ph: '🧪',
  turbidity: '🌀', wind: '💨', rain: '🌧️', motion: '🚶', door: '🚪',
  smoke: '🔥', gas: '💨', uv: '☀️',
};

export function loadIcons() {
  try {
    const raw = localStorage.getItem(ICONS_KEY);
    return raw ? { ...DEFAULT_ICONS, ...JSON.parse(raw) } : { ...DEFAULT_ICONS };
  } catch { return { ...DEFAULT_ICONS }; }
}

export function saveIcons(icons) {
  try { localStorage.setItem(ICONS_KEY, JSON.stringify(icons)); } catch {}
}

export function getIcon(varName, icons) {
  if (!varName) return '📡';
  const key = varName.toLowerCase().trim();
  if (icons[key]) return icons[key];
  for (const [k, v] of Object.entries(icons)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return '📡';
}

// ── React hook ────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

export function useDeviceStore() {
  const [icons, setIconsState] = useState(loadIcons);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === ICONS_KEY) setIconsState(loadIcons());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const updateIcons = (newIcons) => {
    saveIcons(newIcons);
    setIconsState({ ...newIcons });
  };

  return { icons, updateIcons };
}