// ─────────────────────────────────────────────────────────────────────────────
// IconManagerModal — compartido entre /devices y /dashboard
//
// Las variables reales se leen de Orion (variablelist entity),
// igual que lo hace VariableModal. Si no se pueden cargar, se usa
// la prop knownVars como fallback.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DEFAULT_ICONS, useDeviceStore } from '../../services/devicestore';

export default function IconManagerModal({ knownVars = [], onClose }) {
  const { icons, updateIcons } = useDeviceStore();

  const [local,       setLocal]       = useState({ ...icons });
  const [search,      setSearch]      = useState('');
  const [newVar,      setNewVar]      = useState('');
  const [newIcon,     setNewIcon]     = useState('');
  const [orionVars,   setOrionVars]   = useState(null);  // null = loading
  const [loadError,   setLoadError]   = useState(false);

  // ── Cargar variables reales de Orion (igual que VariableModal) ─────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token') || '';
    fetch('/v2/entities?id=variablelist', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const vars = data?.[0]?.variables?.value;
        setOrionVars(Array.isArray(vars) ? vars : []);
      })
      .catch(() => {
        setLoadError(true);
        setOrionVars([]); // fallback to knownVars
      });
  }, []);

  // Variables a mostrar: variables reales de Orion + cualquier icono guardado
  const allVars = useMemo(() => {
    const base = orionVars !== null ? orionVars : knownVars;
    const set = new Set([
      ...base.map(v => v.toLowerCase()),
      ...Object.keys(local),
    ]);
    return Array.from(set).sort();
  }, [orionVars, knownVars, local]);

  const filtered = search
    ? allVars.filter(v => v.includes(search.toLowerCase()))
    : allVars;

  const handleChange = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  const handleDelete = (k) => setLocal(p => { const n = { ...p }; delete n[k]; return n; });
  const handleAdd = () => {
    const key = newVar.trim().toLowerCase();
    if (!key) return;
    setLocal(p => ({ ...p, [key]: newIcon.trim() || '📡' }));
    setNewVar(''); setNewIcon('');
  };
  const handleSave  = () => { updateIcons(local); onClose(); };
  const handleReset = () => setLocal({ ...DEFAULT_ICONS });

  const isLoading = orionVars === null;

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(15,23,42,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 24px 80px rgba(0,0,0,0.13)',
          width: 480, maxWidth: '92vw', maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1.5px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1.5px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>🎨</div>
            <div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                Iconos de variables
              </div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                {isLoading
                  ? 'Cargando variables de Orion…'
                  : loadError
                    ? `Variables de Orion no disponibles — usando ${allVars.length} locales`
                    : `${allVars.length} variables desde Orion`
                }
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none',
              background: '#f1f5f9', color: '#64748b', fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* ── Search ── */}
        <div style={{ padding: '12px 24px 8px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.4 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar variable…"
              style={{
                width: '100%', padding: '7px 12px 7px 32px',
                border: '1.5px solid #e2e8f0', borderRadius: 8,
                fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: '#334155',
                outline: 'none', boxSizing: 'border-box', background: '#f8fafc',
              }}
            />
          </div>
        </div>

        {/* ── Variable list ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 8px' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontFamily: '"DM Sans", sans-serif', fontSize: 13 }}>
              ⏳ Cargando variables…
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontFamily: '"DM Sans", sans-serif', fontSize: 13 }}>
              Sin variables encontradas
            </div>
          )}

          {!isLoading && filtered.map(varName => (
            <div
              key={varName}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', borderRadius: 8, marginBottom: 3,
                background: '#f8fafc', border: '1px solid #f1f5f9',
              }}
            >
              {/* Preview icon */}
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#fff', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {local[varName] || '📡'}
              </div>

              {/* Var name */}
              <span style={{
                flex: 1, fontFamily: '"DM Mono", monospace', fontSize: 12,
                color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {varName}
              </span>

              {/* Icon input */}
              <input
                value={local[varName] || ''}
                onChange={e => handleChange(varName, e.target.value)}
                placeholder="emoji"
                maxLength={6}
                style={{
                  width: 54, padding: '4px 6px', textAlign: 'center',
                  border: '1.5px solid #e2e8f0', borderRadius: 7,
                  fontFamily: '"DM Mono", monospace', fontSize: 14,
                  outline: 'none', background: '#fff',
                }}
              />

              {/* Delete */}
              <button
                onClick={() => handleDelete(varName)}
                title="Quitar icono personalizado"
                style={{
                  width: 24, height: 24, borderRadius: 6, border: 'none',
                  background: '#fef2f2', color: '#ef4444', fontSize: 11,
                  cursor: 'pointer', flexShrink: 0,
                }}
              >✕</button>
            </div>
          ))}
        </div>

        {/* ── Add new ── */}
        <div style={{
          padding: '10px 24px',
          borderTop: '1.5px solid #f1f5f9',
          background: '#fafafa',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.06em' }}>
            AGREGAR / SOBREESCRIBIR
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={newVar}
              onChange={e => setNewVar(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="nombre de variable"
              style={{
                flex: 1, padding: '6px 10px',
                border: '1.5px solid #e2e8f0', borderRadius: 7,
                fontFamily: '"DM Mono", monospace', fontSize: 12,
                outline: 'none', background: '#fff',
              }}
            />
            <input
              value={newIcon}
              onChange={e => setNewIcon(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="🎯"
              maxLength={6}
              style={{
                width: 54, padding: '6px 8px', textAlign: 'center',
                border: '1.5px solid #e2e8f0', borderRadius: 7,
                fontSize: 16, outline: 'none', background: '#fff',
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                padding: '6px 14px', borderRadius: 7, border: 'none',
                background: '#22c55e', color: '#fff',
                fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
              }}
            >+ Agregar</button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1.5px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '7px 14px', borderRadius: 8,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#94a3b8', fontSize: 12,
              fontFamily: '"DM Sans", sans-serif', cursor: 'pointer',
            }}
          >↺ Restablecer</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 16px', borderRadius: 8,
                border: '1.5px solid #e2e8f0', background: '#fff',
                color: '#64748b', fontSize: 12,
                fontFamily: '"DM Sans", sans-serif', cursor: 'pointer',
              }}
            >Cancelar</button>
            <button
              onClick={handleSave}
              style={{
                padding: '7px 20px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontSize: 12, fontWeight: 700,
                fontFamily: '"DM Sans", sans-serif', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
              }}
            >Guardar cambios</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}