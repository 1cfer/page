import React, { useState, useEffect, useRef, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import { createDevice, editDevice } from '../../../services/devices';
import ErrorAlert from '../../shared/ErrorAlert/ErrorAlert';
import styles from './DeviceModal.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// VARIABLE ICONS
// ─────────────────────────────────────────────────────────────────────────────

const VAR_ICONS = {
  humidity:    '💧',
  temperature: '🌡️',
  temp_amb:    '🌡️',
  temp_water:  '🌊',
  noise:       '🔊',
  pressure:    '🔵',
  light:       '💡',
  illuminance: '💡',
  co2:         '🌿',
  flow:        '🚿',
  voltage:     '⚡',
  current:     '⚡',
  power:       '⚡',
  ph:          '🧪',
  wind:        '💨',
  rain:        '🌧️',
  default:     '📡',
};

function varIcon(name) {
  if (!name) return '📡';
  const k = name.toLowerCase();
  if (VAR_ICONS[k]) return VAR_ICONS[k];
  for (const [key, val] of Object.entries(VAR_ICONS)) {
    if (k.includes(key)) return val;
  }
  return VAR_ICONS.default;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'active',   label: 'Active',   color: '#10b981', dot: '#10b981' },
  { value: 'inactive', label: 'Inactive', color: '#94a3b8', dot: '#94a3b8' },
  { value: 'damaged',  label: 'Damaged',  color: '#f43f5e', dot: '#f43f5e' },
];

// ─────────────────────────────────────────────────────────────────────────────
// META KEYS TO EXCLUDE FROM VARIABLE LIST
// ─────────────────────────────────────────────────────────────────────────────

const META_KEYS = new Set(['id', 'type', 'creationdate', 'location', 'state']);

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

function validate({ sensorName, sensorLatitude, sensorLongitude, sensorState, mode }) {
  const errors = {};
  if (mode === 'Create') {
    if (!sensorName?.trim()) errors.sensorName = 'Device name is required';
    else if (!/^[a-z0-9_-]+$/i.test(sensorName.trim()))
      errors.sensorName = 'Only letters, numbers, hyphens and underscores';
  }
  const lat = parseFloat(sensorLatitude);
  const lon = parseFloat(sensorLongitude);
  if (sensorLatitude === '' || sensorLatitude === null || isNaN(lat))
    errors.sensorLatitude = 'Valid latitude required (−90 to 90)';
  else if (lat < -90 || lat > 90)
    errors.sensorLatitude = 'Latitude must be between −90 and 90';
  if (sensorLongitude === '' || sensorLongitude === null || isNaN(lon))
    errors.sensorLongitude = 'Valid longitude required (−180 to 180)';
  else if (lon < -180 || lon > 180)
    errors.sensorLongitude = 'Longitude must be between −180 and 180';
  if (!sensorState) errors.sensorState = 'Please select a status';
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE MAP PICKER  (OpenStreetMap tiles, no API key needed)
// ─────────────────────────────────────────────────────────────────────────────

function MapPicker({ lat, lon, onChange }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markerRef  = useRef(null);
  const [ready, setReady]   = useState(false);
  const [error, setError]   = useState(false);

  // Lazily load Leaflet from CDN
  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload  = () => setReady(true);
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || leafletRef.current) return;
    const L   = window.L;
    const initLat = (lat !== '' && !isNaN(parseFloat(lat))) ? parseFloat(lat) : 4.711;
    const initLon = (lon !== '' && !isNaN(parseFloat(lon))) ? parseFloat(lon) : -74.0721;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([initLat, initLon], 13);
    leafletRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom marker icon
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:#10b981;border:3px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        transform:rotate(-45deg);
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    if (initLat !== 4.711 || initLon !== -74.0721) {
      markerRef.current = L.marker([initLat, initLon], { icon, draggable: true }).addTo(map);
      markerRef.current.on('dragend', (e) => {
        const { lat: newLat, lng: newLon } = e.target.getLatLng();
        onChange(newLat.toFixed(6), newLon.toFixed(6));
      });
    }

    map.on('click', (e) => {
      const { lat: newLat, lng: newLon } = e.latlng;
      onChange(newLat.toFixed(6), newLon.toFixed(6));
      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLon]);
      } else {
        markerRef.current = L.marker([newLat, newLon], { icon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', (ev) => {
          const { lat: dLat, lng: dLon } = ev.target.getLatLng();
          onChange(dLat.toFixed(6), dLon.toFixed(6));
        });
      }
    });

    // Fix tile rendering after modal animation
    setTimeout(() => map.invalidateSize(), 350);
  }, [ready]);

  // Sync marker when lat/lon inputs change externally
  useEffect(() => {
    if (!leafletRef.current || !window.L) return;
    const L = window.L;
    const newLat = parseFloat(lat);
    const newLon = parseFloat(lon);
    if (isNaN(newLat) || isNaN(newLon)) return;
    leafletRef.current.setView([newLat, newLon], leafletRef.current.getZoom());
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLon]);
    } else {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#10b981;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);transform:rotate(-45deg);"></div>`,
        iconSize: [28, 28], iconAnchor: [14, 28],
      });
      markerRef.current = L.marker([newLat, newLon], { icon, draggable: true }).addTo(leafletRef.current);
      markerRef.current.on('dragend', (e) => {
        const { lat: dLat, lng: dLon } = e.target.getLatLng();
        onChange(dLat.toFixed(6), dLon.toFixed(6));
      });
    }
  }, [lat, lon]);

  if (error) return (
    <div className={styles.mapError}>
      ⚠️ Map unavailable — enter coordinates manually above
    </div>
  );

  return (
    <div className={styles.mapWrap}>
      {!ready && <div className={styles.mapLoading}><div className={styles.mapSpinner} /></div>}
      <div ref={mapRef} className={styles.mapContainer} style={{ opacity: ready ? 1 : 0 }} />
      <div className={styles.mapHint}>Click map or drag marker to set coordinates</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIABLE TOGGLE CARD
// ─────────────────────────────────────────────────────────────────────────────

function VarCard({ name, checked, onChange }) {
  return (
    <button
      type="button"
      className={`${styles.varCard} ${checked ? styles.varCardOn : ''}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className={styles.varCardIcon}>{varIcon(name)}</span>
      <span className={styles.varCardName}>{name}</span>
      <span className={`${styles.varCardCheck} ${checked ? styles.varCardCheckOn : ''}`}>
        {checked ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM FIELD
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, error, children, required }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.fieldRequired}>*</span>}
      </label>
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MODAL
// ─────────────────────────────────────────────────────────────────────────────

export default function DeviceModal({
  open,
  handleClose,
  selectedSensor,
  getDevices,
  variablesData,
  mode,
}) {
  const [sensorName,      setSensorName]      = useState('');
  const [sensorLatitude,  setSensorLatitude]  = useState('');
  const [sensorLongitude, setSensorLongitude] = useState('');
  const [sensorState,     setSensorState]     = useState('active');
  const [checkboxStates,  setCheckboxStates]  = useState({});
  const [errors,          setErrors]          = useState({});
  const [touched,         setTouched]         = useState({});
  const [errorAlert,      setErrorAlert]      = useState(false);
  const [showMap,         setShowMap]         = useState(false);

  // ── Populate form when editing ────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setTouched({});
    setShowMap(false);

    if (mode === 'Edit' && selectedSensor?.id) {
      const vars = Object.keys(selectedSensor).filter(k => !META_KEYS.has(k));
      const states = {};
      vars.forEach(v => { states[v] = true; });
      setSensorName(selectedSensor.id);
      setSensorLatitude(String(selectedSensor?.location?.value?.coordinates?.[0] ?? ''));
      setSensorLongitude(String(selectedSensor?.location?.value?.coordinates?.[1] ?? ''));
      setSensorState(selectedSensor?.state?.value || 'active');
      setCheckboxStates(states);
    } else {
      setSensorName('');
      setSensorLatitude('');
      setSensorLongitude('');
      setSensorState('active');
      setCheckboxStates({});
    }
  }, [open, mode, selectedSensor]);

  // ── Available variables from variablelist ─────────────────────────────────
  // IMPORTANT: only variables registered in the variablelist entity are shown.
  // This prevents "perro", "gato" or any stray attr from appearing.
  const availableVars = variablesData?.[0]?.variables?.value ?? [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const onSuccess = useCallback(() => {
    getDevices();
    handleClose();
    setCheckboxStates({});
  }, [getDevices, handleClose]);

  const onError = useCallback((error) => {
    setErrorAlert(true);
    console.error('Device mutation error:', error.message);
  }, []);

  const createMutation = useMutation({ mutationFn: createDevice, onSuccess, onError });
  const editMutation   = useMutation({ mutationFn: editDevice,   onSuccess, onError });
  const isPending      = createMutation.isPending || editMutation.isPending;

  // ── Validation helpers ────────────────────────────────────────────────────
  const getErrors = useCallback(() =>
    validate({ sensorName, sensorLatitude, sensorLongitude, sensorState, mode }),
    [sensorName, sensorLatitude, sensorLongitude, sensorState, mode]
  );

  const handleBlur = (field) => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(getErrors());
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const allTouched = { sensorName: true, sensorLatitude: true, sensorLongitude: true, sensorState: true };
    setTouched(allTouched);
    const errs = getErrors();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = { checkboxStates, sensorName, sensorLatitude, sensorLongitude, sensorState };
    if (mode === 'Create') createMutation.mutate(payload);
    else editMutation.mutate({ ...payload, selectedSensor });
  };

  // ── Map coordinate callback ───────────────────────────────────────────────
  const handleMapPick = useCallback((lat, lon) => {
    setSensorLatitude(lat);
    setSensorLongitude(lon);
    setTouched(p => ({ ...p, sensorLatitude: true, sensorLongitude: true }));
    setErrors(prev => ({ ...prev, sensorLatitude: undefined, sensorLongitude: undefined }));
  }, []);

  const selectedCount = Object.values(checkboxStates).filter(Boolean).length;
  const isEdit = mode === 'Edit';

  return (
    <>
      <Backdrop sx={{ color: '#fff', position: 'fixed', zIndex: 1900 }} open={isPending}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        open={open}
        onClose={() => { handleClose(); setCheckboxStates({}); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: styles.paper }}
      >
        <div className={styles.modal}>

          {/* ── Header ── */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}>
                {isEdit ? '✏️' : '📡'}
              </div>
              <div>
                <h2 className={styles.headerTitle}>
                  {isEdit ? 'Edit Device' : 'New Device'}
                </h2>
                <p className={styles.headerSub}>
                  {isEdit
                    ? `Editing · ${selectedSensor?.id}`
                    : 'Register a new sensor in the network'}
                </p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={handleClose} type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className={styles.body}>

            {/* Step 1 — Identity */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>01</span>
                Identity
              </div>

              <Field label="Device ID" error={touched.sensorName && errors.sensorName} required>
                {isEdit ? (
                  <div className={styles.readonlyField}>
                    <span className={styles.readonlyDot} />
                    {sensorName}
                  </div>
                ) : (
                  <input
                    className={`${styles.input} ${touched.sensorName && errors.sensorName ? styles.inputError : ''}`}
                    value={sensorName}
                    onChange={e => setSensorName(e.target.value)}
                    onBlur={() => handleBlur('sensorName')}
                    placeholder="e.g. sensor_01, infver"
                    autoComplete="off"
                  />
                )}
              </Field>

              <Field label="Status" error={touched.sensorState && errors.sensorState} required>
                <div className={styles.statusRow}>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.statusBtn} ${sensorState === opt.value ? styles.statusBtnOn : ''}`}
                      style={sensorState === opt.value ? { '--status-color': opt.color } : {}}
                      onClick={() => { setSensorState(opt.value); setTouched(p => ({...p, sensorState: true})); }}
                    >
                      <span className={styles.statusDot} style={{ background: opt.dot }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Step 2 — Location */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>02</span>
                Location
                <button
                  type="button"
                  className={styles.mapToggle}
                  onClick={() => setShowMap(p => !p)}
                >
                  {showMap ? '🗺️ Hide map' : '🗺️ Pick on map'}
                </button>
              </div>

              <div className={styles.coordRow}>
                <Field label="Latitude" error={touched.sensorLatitude && errors.sensorLatitude} required>
                  <input
                    className={`${styles.input} ${touched.sensorLatitude && errors.sensorLatitude ? styles.inputError : ''}`}
                    value={sensorLatitude}
                    onChange={e => { setSensorLatitude(e.target.value); }}
                    onBlur={() => handleBlur('sensorLatitude')}
                    placeholder="4.711000"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Longitude" error={touched.sensorLongitude && errors.sensorLongitude} required>
                  <input
                    className={`${styles.input} ${touched.sensorLongitude && errors.sensorLongitude ? styles.inputError : ''}`}
                    value={sensorLongitude}
                    onChange={e => { setSensorLongitude(e.target.value); }}
                    onBlur={() => handleBlur('sensorLongitude')}
                    placeholder="-74.072100"
                    inputMode="decimal"
                  />
                </Field>
              </div>

              {showMap && (
                <MapPicker
                  lat={sensorLatitude}
                  lon={sensorLongitude}
                  onChange={handleMapPick}
                />
              )}
            </div>

            {/* Step 3 — Variables */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>03</span>
                Sensor Variables
                {selectedCount > 0 && (
                  <span className={styles.varBadge}>{selectedCount} selected</span>
                )}
              </div>

              {availableVars.length === 0 ? (
                <div className={styles.noVars}>
                  No variables registered yet. Add them in <strong>Manage Variables</strong>.
                </div>
              ) : (
                <>
                  <div className={styles.varSelectAll}>
                    <button
                      type="button"
                      className={styles.selectAllBtn}
                      onClick={() => {
                        const allOn = availableVars.every(v => checkboxStates[v]);
                        const next = {};
                        availableVars.forEach(v => { next[v] = !allOn; });
                        setCheckboxStates(next);
                      }}
                    >
                      {availableVars.every(v => checkboxStates[v]) ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div className={styles.varGrid}>
                    {availableVars.map(variable => (
                      <VarCard
                        key={variable}
                        name={variable}
                        checked={!!checkboxStates[variable]}
                        onChange={val => setCheckboxStates(p => ({ ...p, [variable]: val }))}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose}>
              Cancel
            </button>
            <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={isPending}>
              {isPending
                ? <><span className={styles.submitSpinner} /> Saving…</>
                : isEdit ? '✓ Save Changes' : '＋ Create Device'
              }
            </button>
          </div>
        </div>
      </Dialog>

      <ErrorAlert
        message={
          mode === 'Create'
            ? 'There was an error trying to create the device'
            : 'There was an error trying to edit the device'
        }
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
      />
    </>
  );
}

DeviceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedSensor: PropTypes.shape({
    id: PropTypes.string,
    state: PropTypes.shape({ value: PropTypes.string }),
    location: PropTypes.shape({ value: PropTypes.shape({ coordinates: PropTypes.array }) }),
    creationdate: PropTypes.shape({ value: PropTypes.string }),
  }).isRequired,
  getDevices: PropTypes.func.isRequired,
  variablesData: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
};