import React, { useState } from 'react';
import Collapse from '@mui/material/Collapse';
import PropTypes from 'prop-types';
import RowActions from './RowActions';
import styles from './DeviceRow.module.css';

const STATUS_CONFIG = {
  active:   { label: 'Active',   icon: '▲', pulse: true },
  inactive: { label: 'Inactive', icon: '●', pulse: false },
  damaged:  { label: 'Damaged',  icon: '▼', pulse: false },
};

const VARIABLE_ICONS = {
  humidity:    '💧',
  temperature: '🌡️',
  noise:       '🔊',
  pressure:    '🔵',
  light:       '💡',
  co2:         '🌿',
  default:     '📡',
};

const getVarIcon = (key) => VARIABLE_ICONS[key.toLowerCase()] || VARIABLE_ICONS.default;

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function DeviceRow({
  sensor,
  setSelectedSensor,
  setOpenModal,
  setOpenDeleteModal,
  variablesData,
  setMode,
}) {
  const [open, setOpen] = useState(false);
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  const keys = Object.keys(sensor);
  const variables = keys.filter(
    (key) => !['id', 'type', 'creationdate', 'location', 'state'].includes(key)
  );

  const status = sensor.state?.value || 'inactive';
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;

  return (
    <div className={`${styles.card} ${open ? styles.cardOpen : ''}`}>

      {/* ── Main Row ── */}
      <div
        className={styles.mainRow}
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}
        aria-expanded={open}
      >
        {/* Chevron */}
        <div className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Status Badge */}
        <div className={`${styles.statusBadge} ${styles[status]}`}>
          {statusCfg.pulse && <span className={styles.pulseDot} />}
          <span className={styles.statusIcon}>{statusCfg.icon}</span>
          <span className={styles.statusLabel}>{statusCfg.label}</span>
        </div>

        {/* Device Info */}
        <div className={styles.deviceInfo}>
          <span className={styles.deviceName}>{sensor?.id}</span>
          <span className={styles.deviceType}>{sensor?.type || 'Sensor'}</span>
        </div>

        {/* Lat */}
        <div className={styles.coordChip}>
          <span className={styles.coordLabel}>LAT</span>
          <span className={styles.coordValue}>{sensor?.location?.value?.coordinates?.[0] ?? '—'}</span>
        </div>

        {/* Lon */}
        <div className={styles.coordChip}>
          <span className={styles.coordLabel}>LON</span>
          <span className={styles.coordValue}>{sensor?.location?.value?.coordinates?.[1] ?? '—'}</span>
        </div>

        {/* Date */}
        <div className={styles.dateCell}>
          <svg className={styles.dateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formatDate(sensor?.creationdate?.value)}</span>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
            <RowActions
              item={sensor}
              setSelectedItem={setSelectedSensor}
              setOpenModal={setOpenModal}
              setOpenDeleteModal={setOpenDeleteModal}
              setMode={setMode}
              allowEdition
            />
          </div>
        )}
      </div>

      {/* ── Variables Panel ── */}
      <Collapse in={open} timeout={300} unmountOnExit>
        <div className={styles.variablesPanel}>
          <div className={styles.variablesHeader}>
            <span className={styles.variablesTitle}>📊 Live Variables</span>
            <span className={styles.variablesCount}>
              {variables.length} channel{variables.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className={styles.variablesGrid}>
            {variablesData && variables.map((variable) => {
              const unit = variablesData[0]?.variables?.metadata?.[`${variable}Unit`]?.value ?? '';
              const rawVal = sensor[variable]?.value;
              const numVal = parseFloat(rawVal);
              const isNum = !isNaN(numVal);

              return (
                <div key={variable} className={styles.varCard}>
                  <div className={styles.varIcon}>{getVarIcon(variable)}</div>
                  <div className={styles.varBody}>
                    <span className={styles.varName}>{variable}</span>
                    <div className={styles.varValueRow}>
                      <span className={styles.varValue}>{isNum ? numVal.toFixed(2) : rawVal}</span>
                      {unit && <span className={styles.varUnit}>{unit}</span>}
                    </div>
                  </div>
                  {isNum && (
                    <div className={styles.varBar}>
                      <div
                        className={styles.varBarFill}
                        style={{ width: `${Math.min(numVal, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Collapse>
    </div>
  );
}

DeviceRow.propTypes = {
  sensor: PropTypes.shape({
    id: PropTypes.string,
    state: PropTypes.shape({ value: PropTypes.string }),
    location: PropTypes.shape({ value: PropTypes.shape({ coordinates: PropTypes.array }) }),
    creationdate: PropTypes.shape({ value: PropTypes.string }),
  }).isRequired,
  setSelectedSensor: PropTypes.func.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  setOpenDeleteModal: PropTypes.func.isRequired,
  variablesData: PropTypes.array.isRequired,
  setMode: PropTypes.func.isRequired,
};
import React, { useState } from 'react';
import Collapse from '@mui/material/Collapse';
import PropTypes from 'prop-types';
import RowActions from './RowActions';
import styles from './DeviceRow.module.css';

import { useDeviceStore, getIcon } from '../../../services/devicestore';
import DeviceStatusBadge from '../../shared/DeviceStatusBadge';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function DeviceRow({
  sensor,
  setSelectedSensor,
  setOpenModal,
  setOpenDeleteModal,
  variablesData,
  setMode,
}) {
  const [open, setOpen] = useState(false);
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  const { icons } = useDeviceStore();

  const variables = Object.keys(sensor).filter(
    (key) => !['id', 'type', 'creationdate', 'location', 'state'].includes(key)
  );

  // Estado real de Orion — active | inactive | damaged
  const orionState = sensor?.state?.value || 'inactive';

  return (
    <div className={`${styles.card} ${open ? styles.cardOpen : ''}`}>

      {/* ── Main Row ── */}
      <div
        className={styles.mainRow}
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}
        aria-expanded={open}
      >
        {/* Chevron */}
        <div className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Estado de Orion — fuente de verdad */}
        <DeviceStatusBadge orionState={orionState} />

        {/* Device Info */}
        <div className={styles.deviceInfo}>
          <span className={styles.deviceName}>{sensor?.id}</span>
          <span className={styles.deviceType}>{sensor?.type || 'Sensor'}</span>
        </div>

        {/* Lat */}
        <div className={styles.coordChip}>
          <span className={styles.coordLabel}>LAT</span>
          <span className={styles.coordValue}>
            {sensor?.location?.value?.coordinates?.[0] ?? '—'}
          </span>
        </div>

        {/* Lon */}
        <div className={styles.coordChip}>
          <span className={styles.coordLabel}>LON</span>
          <span className={styles.coordValue}>
            {sensor?.location?.value?.coordinates?.[1] ?? '—'}
          </span>
        </div>

        {/* Date */}
        <div className={styles.dateCell}>
          <svg className={styles.dateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8"  y1="2" x2="8"  y2="6" />
            <line x1="3"  y1="10" x2="21" y2="10" />
          </svg>
          <span>{formatDate(sensor?.creationdate?.value)}</span>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
            <RowActions
              item={sensor}
              setSelectedItem={setSelectedSensor}
              setOpenModal={setOpenModal}
              setOpenDeleteModal={setOpenDeleteModal}
              setMode={setMode}
              allowEdition
            />
          </div>
        )}
      </div>

      {/* ── Variables Panel ── */}
      <Collapse in={open} timeout={280} unmountOnExit>
        <div className={styles.variablesPanel}>

          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <span className={styles.panelIcon}>📊</span>
              <span className={styles.panelTitle}>Variables en vivo</span>
              <span className={styles.variablesCount}>
                {variables.length} canal{variables.length !== 1 ? 'es' : ''}
              </span>
            </div>
            <span className={styles.panelDeviceId}>{sensor.id}</span>
          </div>

          {variables.length === 0 && (
            <div className={styles.noVars}>
              <span>📡</span>
              <span>Sin variables configuradas</span>
            </div>
          )}

          {variables.length > 0 && (
            <div className={styles.variablesGrid}>
              {variablesData && variables.map((variable) => {
                const unit   = variablesData[0]?.variables?.metadata?.[`${variable}Unit`]?.value ?? '';
                const rawVal = sensor[variable]?.value;
                const numVal = parseFloat(rawVal);
                const isNum  = !isNaN(numVal);
                const icon   = getIcon(variable, icons);

                return (
                  <div key={variable} className={styles.varCard}>
                    <div className={styles.varIconWrap}>
                      <span className={styles.varIconEmoji}>{icon}</span>
                    </div>
                    <div className={styles.varBody}>
                      <span className={styles.varName}>{variable}</span>
                      <div className={styles.varValueRow}>
                        <span className={styles.varValue}>
                          {isNum ? numVal.toFixed(2) : (rawVal ?? '—')}
                        </span>
                        {unit && <span className={styles.varUnit}>{unit}</span>}
                      </div>
                    </div>
                    {isNum && (
                      <div className={styles.varBar}>
                        <div
                          className={styles.varBarFill}
                          style={{ width: `${Math.min(Math.abs(numVal), 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
}

DeviceRow.propTypes = {
  sensor: PropTypes.shape({
    id:           PropTypes.string,
    state:        PropTypes.shape({ value: PropTypes.string }),
    location:     PropTypes.shape({ value: PropTypes.shape({ coordinates: PropTypes.array }) }),
    creationdate: PropTypes.shape({ value: PropTypes.string }),
  }).isRequired,
  setSelectedSensor:  PropTypes.func.isRequired,
  setOpenModal:       PropTypes.func.isRequired,
  setOpenDeleteModal: PropTypes.func.isRequired,
  variablesData:      PropTypes.array.isRequired,
  setMode:            PropTypes.func.isRequired,
};