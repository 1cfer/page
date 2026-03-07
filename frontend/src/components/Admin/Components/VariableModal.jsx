import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@tanstack/react-query';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import editVariables from '../../../services/variables';
import ErrorAlert from '../../shared/ErrorAlert/ErrorAlert';

import styles from './VariableModal.module.css';

export default function VariableModal({ open, setOpen, getDevices, variablesData }) {
  const [variableName, setVariableName] = useState('');
  const [variableUnit, setVariableUnit] = useState('');
  const [errorAlert,   setErrorAlert]   = useState(false);
  const [deletingName, setDeletingName] = useState(null); // shows confirm state inline

  const currentVariableNames = variablesData?.[0]?.variables?.value || [];

  const { isPending: subscriptionsPending } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () =>
      fetch('v2/subscriptions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      }).then((r) => r.json()),
  });

  const mutation = useMutation({
    mutationFn: editVariables,
    onSuccess: () => {
      setErrorAlert(false);
      setVariableName('');
      setVariableUnit('');
      setDeletingName(null);
      if (getDevices) getDevices();
    },
    onError: (error) => {
      setErrorAlert(true);
      console.error('Error:', error);
    },
  });

  const handleAdd = () => {
    if (!variableName.trim()) return;
    mutation.mutate({ variablesData, variableName, variableUnit });
  };

  const handleDelete = (name) => {
    const filtered = currentVariableNames.filter((n) => n !== name);
    const updated  = JSON.parse(JSON.stringify(variablesData));
    updated[0].variables.value = filtered;
    mutation.mutate({ variablesData: updated, variableName: null, variableUnit: null });
    setDeletingName(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', position: 'fixed', zIndex: 1700 }}
        open={mutation.isPending || subscriptionsPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          },
        }}
      >
        <div className={styles.modal}>

          {/* ── Header ── */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <span className={styles.titleText}>Variables</span>
              <span className={styles.titleCount}>{currentVariableNames.length}</span>
            </div>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{
                color: '#94a3b8',
                borderRadius: '8px',
                transition: 'background 150ms ease, color 150ms ease',
                '&:hover': { background: '#fee2e2', color: '#be123c' },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </div>

          {/* ── Variables List ── */}
          <div className={styles.listSection}>
            <p className={styles.sectionLabel}>Existing variables</p>

            {currentVariableNames.length === 0 ? (
              <div className={styles.emptyList}>
                <p>No variables defined yet.</p>
              </div>
            ) : (
              <ul className={styles.varList}>
                {currentVariableNames.map((name) => (
                  <li key={name} className={styles.varItem}>
                    <div className={styles.varName}>{name}</div>

                    {deletingName === name ? (
                      /* Inline confirm */
                      <div className={styles.confirmRow}>
                        <span className={styles.confirmText}>Remove?</span>
                        <button
                          className={`${styles.confirmBtn} ${styles.confirmYes}`}
                          onClick={() => handleDelete(name)}
                        >
                          Yes
                        </button>
                        <button
                          className={`${styles.confirmBtn} ${styles.confirmNo}`}
                          onClick={() => setDeletingName(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeletingName(name)}
                        aria-label={`Delete ${name}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Divider ── */}
          <div className={styles.divider} />

          {/* ── Add Form ── */}
          <div className={styles.addSection}>
            <p className={styles.sectionLabel}>Add new variable</p>

            <div className={styles.fields}>
              <div className={styles.fieldWrap}>
                <label className={styles.fieldLabel}>Name</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. temperature"
                  value={variableName}
                  onChange={(e) => setVariableName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
              </div>
              <div className={styles.fieldWrap}>
                <label className={styles.fieldLabel}>Unit <span className={styles.optional}>(optional)</span></label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. °C"
                  value={variableUnit}
                  onChange={(e) => setVariableUnit(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={!variableName.trim() || mutation.isPending}
              >
                Add variable
              </button>
              <button className={styles.doneBtn} onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      <ErrorAlert
        message="Error updating variables"
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
      />
    </>
  );
}

VariableModal.propTypes = {
  open:          PropTypes.bool.isRequired,
  setOpen:       PropTypes.func.isRequired,
  getDevices:    PropTypes.func.isRequired,
  variablesData: PropTypes.array.isRequired,
};
// ─────────────────────────────────────────────────────────────────────────────
// VariableModal — modal unificado para /devices y /dashboard
//
// Muestra las variables reales de Orion (variablelist entity).
// Permite por cada variable:
//   - Ver y editar su icono emoji (guardado en deviceStore / localStorage)
//   - Ver y editar su unidad (guardado en Orion via editVariables)
//   - Eliminar la variable de Orion
// Permite agregar nuevas variables (nombre + icono + unidad) → Orion
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';

import editVariables from '../../../services/variables';
import ErrorAlert from '../../shared/ErrorAlert/ErrorAlert';
import { useDeviceStore, getIcon, DEFAULT_ICONS } from '../../../services/devicestore';

import styles from './VariableModal.module.css';

// ─── helpers ─────────────────────────────────────────────────────────────────

function buildIconKey(varName) {
  return varName.toLowerCase().trim();
}

// ─────────────────────────────────────────────────────────────────────────────
export default function VariableModal({ open, setOpen, getDevices, variablesData }) {
  const { icons, updateIcons } = useDeviceStore();

  // ── State ─────────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('');
  const [errorAlert,   setErrorAlert]   = useState(false);
  const [deletingName, setDeletingName] = useState(null);

  // New variable form
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newIcon, setNewIcon] = useState('');

  // Inline editing state: { [varName]: { icon, unit } }
  const [editing, setEditing] = useState({});

  // ── Data from variablesData prop (Orion) ──────────────────────────────────
  const currentVars = useMemo(
    () => variablesData?.[0]?.variables?.value || [],
    [variablesData]
  );

  const unitMeta = useMemo(
    () => variablesData?.[0]?.variables?.metadata || {},
    [variablesData]
  );

  // Initialize editing state whenever vars change
  useEffect(() => {
    const initial = {};
    currentVars.forEach(name => {
      const key  = buildIconKey(name);
      const unit = unitMeta[`${name}Unit`]?.value || '';
      initial[name] = {
        icon: icons[key] || DEFAULT_ICONS[key] || '',
        unit,
      };
    });
    setEditing(initial);
  }, [currentVars, unitMeta, icons]);

  const filtered = useMemo(() => {
    if (!search.trim()) return currentVars;
    return currentVars.filter(n => n.toLowerCase().includes(search.toLowerCase()));
  }, [currentVars, search]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  // Add new variable
  const addMutation = useMutation({
    mutationFn: () => editVariables({ variablesData, variableName: newName.trim(), variableUnit: newUnit.trim() }),
    onSuccess: () => {
      // Also save icon locally
      if (newIcon.trim()) {
        const key = buildIconKey(newName);
        updateIcons({ ...icons, [key]: newIcon.trim() });
      }
      setNewName(''); setNewUnit(''); setNewIcon('');
      setErrorAlert(false);
      if (getDevices) getDevices();
    },
    onError: () => setErrorAlert(true),
  });

  // Delete variable
  const deleteMutation = useMutation({
    mutationFn: (name) => {
      const filtered = currentVars.filter(n => n !== name);
      const updated  = JSON.parse(JSON.stringify(variablesData));
      updated[0].variables.value = filtered;
      return editVariables({ variablesData: updated, variableName: null, variableUnit: null });
    },
    onSuccess: () => {
      setDeletingName(null);
      setErrorAlert(false);
      if (getDevices) getDevices();
    },
    onError: () => setErrorAlert(true),
  });

  // Save edits (icon + unit) for all variables at once
  const saveEditsMutation = useMutation({
    mutationFn: async () => {
      // 1. Save icons to localStorage (deviceStore)
      const newIconMap = { ...icons };
      Object.entries(editing).forEach(([name, vals]) => {
        const key = buildIconKey(name);
        if (vals.icon) newIconMap[key] = vals.icon;
        else delete newIconMap[key];
      });
      updateIcons(newIconMap);

      // 2. Save units to Orion — rebuild variablesData with updated metadata
      const updated = JSON.parse(JSON.stringify(variablesData));
      if (!updated[0].variables.metadata) updated[0].variables.metadata = {};
      Object.entries(editing).forEach(([name, vals]) => {
        if (vals.unit !== undefined) {
          updated[0].variables.metadata[`${name}Unit`] = { type: 'Text', value: vals.unit };
        }
      });
      // editVariables with variableName=null only updates metadata
      return editVariables({ variablesData: updated, variableName: null, variableUnit: null });
    },
    onSuccess: () => {
      setErrorAlert(false);
      if (getDevices) getDevices();
      setOpen(false);
    },
    onError: () => setErrorAlert(true),
  });

  const isPending = addMutation.isPending || deleteMutation.isPending || saveEditsMutation.isPending;

  const handleEditChange = useCallback((name, field, value) => {
    setEditing(prev => ({
      ...prev,
      [name]: { ...prev[name], [field]: value },
    }));
  }, []);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMutation.mutate();
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', position: 'fixed', zIndex: 1700 }} open={isPending}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
            overflow: 'hidden',
            maxHeight: '88vh',
          },
        }}
      >
        <div className={styles.modal}>

          {/* ── Header ── */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}>📋</div>
              <div>
                <div className={styles.titleText}>Gestionar variables</div>
                <div className={styles.titleSub}>
                  {currentVars.length} variable{currentVars.length !== 1 ? 's' : ''} en Orion
                </div>
              </div>
            </div>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{
                color: '#94a3b8', borderRadius: '8px',
                '&:hover': { background: '#fee2e2', color: '#be123c' },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </div>

          {/* ── Search ── */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Buscar variable…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* ── Column labels ── */}
          <div className={styles.colLabels}>
            <span className={styles.colLabelName}>Variable</span>
            <span className={styles.colLabelIcon}>Icono</span>
            <span className={styles.colLabelUnit}>Unidad</span>
            <span className={styles.colLabelDel} />
          </div>

          {/* ── Variable list ── */}
          <div className={styles.varList}>
            {currentVars.length === 0 && (
              <div className={styles.emptyList}>
                <span>📡</span>
                <span>No hay variables definidas todavía</span>
              </div>
            )}

            {filtered.length === 0 && currentVars.length > 0 && (
              <div className={styles.emptyList}>
                <span>🔍</span>
                <span>Sin resultados para "{search}"</span>
              </div>
            )}

            {filtered.map(name => {
              const vals      = editing[name] || { icon: '', unit: '' };
              const iconVal   = vals.icon;
              const unitVal   = vals.unit;
              const previewIcon = iconVal || getIcon(name, icons);

              return (
                <div key={name} className={`${styles.varRow} ${deletingName === name ? styles.varRowDeleting : ''}`}>

                  {/* Icon preview */}
                  <div className={styles.varIconPreview}>
                    <span>{previewIcon}</span>
                  </div>

                  {/* Name */}
                  <div className={styles.varName}>{name}</div>

                  {/* Icon input */}
                  <input
                    className={styles.iconInput}
                    value={iconVal}
                    onChange={e => handleEditChange(name, 'icon', e.target.value)}
                    placeholder="emoji"
                    maxLength={6}
                    title="Icono emoji para esta variable"
                  />

                  {/* Unit input */}
                  <input
                    className={styles.unitInput}
                    value={unitVal}
                    onChange={e => handleEditChange(name, 'unit', e.target.value)}
                    placeholder="ej: °C"
                    title="Unidad de medida"
                  />

                  {/* Delete */}
                  {deletingName === name ? (
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmText}>¿Eliminar?</span>
                      <button className={`${styles.confirmBtn} ${styles.confirmYes}`} onClick={() => deleteMutation.mutate(name)}>Sí</button>
                      <button className={`${styles.confirmBtn} ${styles.confirmNo}`}  onClick={() => setDeletingName(null)}>No</button>
                    </div>
                  ) : (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeletingName(name)}
                      title={`Eliminar ${name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.divider} />

          {/* ── Add new variable ── */}
          <div className={styles.addSection}>
            <p className={styles.sectionLabel}>➕ Agregar nueva variable</p>
            <div className={styles.addRow}>
              <input
                className={`${styles.addInput} ${styles.addInputName}`}
                placeholder="nombre (ej: temperatura)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <input
                className={`${styles.addInput} ${styles.addInputIcon}`}
                placeholder="🎯"
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
                maxLength={6}
                title="Icono"
              />
              <input
                className={`${styles.addInput} ${styles.addInputUnit}`}
                placeholder="unidad"
                value={newUnit}
                onChange={e => setNewUnit(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                title="Unidad"
              />
              <button
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={!newName.trim() || isPending}
              >
                + Agregar
              </button>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button
              className={styles.saveBtn}
              onClick={() => saveEditsMutation.mutate()}
              disabled={isPending}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </Dialog>

      <ErrorAlert
        message="Error al guardar variables"
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
      />
    </>
  );
}

VariableModal.propTypes = {
  open:          PropTypes.bool.isRequired,
  setOpen:       PropTypes.func.isRequired,
  getDevices:    PropTypes.func,
  variablesData: PropTypes.array,
};

VariableModal.defaultProps = {
  getDevices:    () => {},
  variablesData: [],
};