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