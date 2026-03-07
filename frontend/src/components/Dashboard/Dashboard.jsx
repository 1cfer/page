import React, { useEffect, useState, useMemo, useRef } from 'react';
import './Dashboard.css';
import { useMutation } from '@tanstack/react-query';
import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlined';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Brush,
} from 'recharts';
import { createPortal } from 'react-dom';

import { useDeviceStore, getIcon, ACTIVITY_STATUS, computeActivity } from '../../services/devicestore';
import DeviceStatusBadge from '../shared/DeviceStatusBadge';

// ── Modal unificado de variables (mismo que /devices) ─────────────────────────
import VariableModal from '../Admin/Components/VariableModal';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const META_ATTRS = new Set(['location', 'state', 'creationdate', 'TimeInstant']);

// ── Project color palette ─────────────────────────────────────────────────────
const COLOR_PALETTE = [
  { id: 'green',   hex: '#22c55e', label: 'Verde'    },
  { id: 'blue',    hex: '#3b82f6', label: 'Azul'     },
  { id: 'violet',  hex: '#8b5cf6', label: 'Violeta'  },
  { id: 'rose',    hex: '#f43f5e', label: 'Rosa'     },
  { id: 'amber',   hex: '#f59e0b', label: 'Ámbar'    },
  { id: 'cyan',    hex: '#06b6d4', label: 'Cian'     },
  { id: 'orange',  hex: '#f97316', label: 'Naranja'  },
  { id: 'pink',    hex: '#ec4899', label: 'Fucsia'   },
  { id: 'teal',    hex: '#14b8a6', label: 'Teal'     },
  { id: 'indigo',  hex: '#6366f1', label: 'Índigo'   },
  { id: 'lime',    hex: '#84cc16', label: 'Lima'     },
  { id: 'red',     hex: '#ef4444', label: 'Rojo'     },
];

const EMOJI_SUGGESTIONS = ['🏠','🌿','🏭','🏗️','🌊','⚡','🌱','🏔️','🔬','🌡️','💧','🏙️','🌾','🔋','🛰️','🏕️','🐾','🌸'];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function makeProjectTheme(color) {
  const rgb = hexToRgb(color);
  return {
    color,
    colorDim:    `rgba(${rgb},0.08)`,
    colorBorder: `rgba(${rgb},0.22)`,
  };
}

// ── Project persistence ───────────────────────────────────────────────────────
const PROJECTS_KEY     = 'db_projects_v2';
const PROJECT_MAP_KEY  = 'db_device_projects_v1';

const DEFAULT_PROJECTS = [
  { key: 'tars',   label: 'TARS',       emoji: '🏠', color: '#22c55e', desc: 'Monitoreo ambiental doméstico' },
  { key: 'infver', label: 'Inf. Verdes', emoji: '🌿', color: '#3b82f6', desc: 'Infraestructuras verdes' },
];

function loadProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_PROJECTS;
}

function saveProjects(list) {
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(list)); } catch {}
}

function loadProjectMap() { try { const r = localStorage.getItem(PROJECT_MAP_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; } }
function saveProjectMap(m) { try { localStorage.setItem(PROJECT_MAP_KEY, JSON.stringify(m)); } catch {} }

function genKey(label) {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/__+/g,'_').slice(0,20) + '_' + Date.now().toString(36);
}

// ── Project Manager Modal ─────────────────────────────────────────────────────
function ProjectManagerModal({ projects, onSave, onClose }) {
  const [list,    setList]    = useState(projects.map(p => ({ ...p })));
  const [editing, setEditing] = useState(null); // key being edited or 'new'
  const [form,    setForm]    = useState({ label:'', emoji:'🏠', color:'#22c55e', desc:'' });
  const [emojiOpen, setEmojiOpen] = useState(false);

  const openNew = () => {
    setForm({ label:'', emoji:'🏠', color:'#22c55e', desc:'' });
    setEditing('new');
    setEmojiOpen(false);
  };

  const openEdit = (p) => {
    setForm({ label: p.label, emoji: p.emoji, color: p.color, desc: p.desc || '' });
    setEditing(p.key);
    setEmojiOpen(false);
  };

  const handleSaveForm = () => {
    if (!form.label.trim()) return;
    if (editing === 'new') {
      const key = genKey(form.label);
      setList(prev => [...prev, { key, label: form.label.trim(), emoji: form.emoji, color: form.color, desc: form.desc.trim() }]);
    } else {
      setList(prev => prev.map(p => p.key === editing ? { ...p, ...form, label: form.label.trim(), desc: form.desc.trim() } : p));
    }
    setEditing(null);
  };

  const handleDelete = (key) => {
    setList(prev => prev.filter(p => p.key !== key));
    if (editing === key) setEditing(null);
  };

  const modal = (
    <div style={{
      position:'fixed', inset:0, zIndex:8000,
      background:'rgba(15,23,42,0.4)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }} onClick={onClose}>
      <div style={{
        background:'#fff', borderRadius:20, border:'1.5px solid #e2e8f0',
        boxShadow:'0 24px 80px rgba(0,0,0,0.14)',
        width:520, maxWidth:'94vw', maxHeight:'88vh',
        display:'flex', flexDirection:'column',
        animation:'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        overflow:'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:'20px 24px 14px', borderBottom:'1.5px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1.5px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🗂️</div>
            <div>
              <div style={{ fontFamily:'"DM Sans",sans-serif', fontWeight:700, fontSize:15, color:'#0f172a' }}>Gestionar proyectos</div>
              <div style={{ fontFamily:'"DM Mono",monospace', fontSize:10, color:'#94a3b8' }}>{list.length} proyecto{list.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'#f1f5f9', color:'#64748b', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Project list */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 24px 8px' }}>
          {list.map(p => {
            const theme = makeProjectTheme(p.color);
            return (
              <div key={p.key} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 12px', borderRadius:12, marginBottom:6,
                background: editing === p.key ? theme.colorDim : '#f8fafc',
                border:`1.5px solid ${editing === p.key ? theme.colorBorder : '#f1f5f9'}`,
                transition:'all 0.15s',
              }}>
                <div style={{ width:36, height:36, borderRadius:9, background:`${p.color}18`, border:`1.5px solid ${p.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{p.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'"DM Sans",sans-serif', fontWeight:700, fontSize:13, color:'#0f172a' }}>{p.label}</div>
                  {p.desc && <div style={{ fontFamily:'"DM Sans",sans-serif', fontSize:11, color:'#94a3b8', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.desc}</div>}
                </div>
                <div style={{ width:10, height:10, borderRadius:'50%', background:p.color, flexShrink:0 }} />
                <button onClick={() => openEdit(p)} style={{ padding:'4px 10px', borderRadius:7, border:'1.5px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:11, fontFamily:'"DM Sans",sans-serif', cursor:'pointer', flexShrink:0 }}>✏️ Editar</button>
                {list.length > 1 && (
                  <button onClick={() => handleDelete(p.key)} style={{ width:28, height:28, borderRadius:7, border:'none', background:'#fef2f2', color:'#ef4444', fontSize:13, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                )}
              </div>
            );
          })}

          {/* Add new button */}
          {editing !== 'new' && (
            <button onClick={openNew} style={{
              width:'100%', padding:'12px', borderRadius:12, marginTop:4,
              border:'2px dashed #cbd5e1', background:'transparent',
              color:'#94a3b8', fontSize:13, fontFamily:'"DM Sans",sans-serif',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#22c55e'; e.currentTarget.style.color='#22c55e'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#cbd5e1'; e.currentTarget.style.color='#94a3b8'; }}
            >
              <span style={{ fontSize:16, fontWeight:700 }}>+</span> Agregar proyecto
            </button>
          )}
        </div>

        {/* Edit / New form */}
        {editing !== null && (
          <div style={{ borderTop:'1.5px solid #f1f5f9', padding:'14px 24px', background:'#fafafa', flexShrink:0 }}>
            <div style={{ fontFamily:'"DM Sans",sans-serif', fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>
              {editing === 'new' ? '➕ Nuevo proyecto' : '✏️ Editar proyecto'}
            </div>

            {/* Row 1: emoji + name */}
            <div style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
              {/* Emoji picker */}
              <div style={{ position:'relative' }}>
                <button onClick={() => setEmojiOpen(v => !v)} style={{
                  width:44, height:38, borderRadius:8, border:'1.5px solid #e2e8f0',
                  background:'#fff', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                }}>{form.emoji}</button>
                {emojiOpen && (
                  <div style={{
                    position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:100,
                    background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12,
                    padding:8, display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:4,
                    boxShadow:'0 8px 24px rgba(0,0,0,0.10)',
                  }}>
                    {EMOJI_SUGGESTIONS.map(em => (
                      <button key={em} onClick={() => { setForm(f => ({ ...f, emoji: em })); setEmojiOpen(false); }}
                        style={{ width:34, height:34, borderRadius:7, border:'none', background: form.emoji === em ? '#f0fdf4' : 'transparent', fontSize:18, cursor:'pointer' }}
                      >{em}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Name input */}
              <input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="Nombre del proyecto"
                style={{ flex:1, padding:'8px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontFamily:'"DM Sans",sans-serif', fontSize:13, outline:'none', background:'#fff', boxSizing:'border-box' }}
              />
            </div>

            {/* Description */}
            <input
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Descripción (opcional)"
              style={{ width:'100%', padding:'7px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontFamily:'"DM Sans",sans-serif', fontSize:12, outline:'none', background:'#fff', boxSizing:'border-box', marginBottom:10 }}
            />

            {/* Color palette */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontFamily:'"DM Mono",monospace', fontSize:9, color:'#94a3b8', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>COLOR DEL PROYECTO</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {COLOR_PALETTE.map(c => (
                  <button key={c.id} onClick={() => setForm(f => ({ ...f, color: c.hex }))}
                    title={c.label}
                    style={{
                      width:28, height:28, borderRadius:7,
                      background:c.hex, border: form.color === c.hex ? '3px solid #0f172a' : '3px solid transparent',
                      cursor:'pointer', boxSizing:'border-box',
                      boxShadow: form.color === c.hex ? `0 0 0 2px #fff, 0 0 0 4px ${c.hex}` : 'none',
                      transition:'box-shadow 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Form actions */}
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setEditing(null)} style={{ padding:'7px 16px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:12, fontFamily:'"DM Sans",sans-serif', cursor:'pointer' }}>Cancelar</button>
              <button onClick={handleSaveForm} disabled={!form.label.trim()}
                style={{ padding:'7px 18px', borderRadius:8, border:'none', background:'#22c55e', color:'#fff', fontSize:12, fontWeight:700, fontFamily:'"DM Sans",sans-serif', cursor:'pointer', opacity: form.label.trim() ? 1 : 0.5 }}>
                {editing === 'new' ? '+ Crear' : '✓ Guardar'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding:'12px 24px', borderTop:'1.5px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:8, flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:'8px 18px', borderRadius:9, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:13, fontFamily:'"DM Sans",sans-serif', cursor:'pointer' }}>Cancelar</button>
          <button onClick={() => onSave(list)}
            style={{ padding:'8px 22px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontSize:13, fontWeight:700, fontFamily:'"DM Sans",sans-serif', cursor:'pointer', boxShadow:'0 2px 10px rgba(34,197,94,0.3)' }}>
            Guardar proyectos
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );

  return createPortal(modal, document.body);
}

const CHART_COLORS = [
  { line: '#10b981' }, { line: '#3b82f6' }, { line: '#f43f5e' },
  { line: '#f59e0b' }, { line: '#8b5cf6' }, { line: '#06b6d4' },
  { line: '#f97316' }, { line: '#ec4899' }, { line: '#14b8a6' },
  { line: '#a855f7' }, { line: '#84cc16' }, { line: '#ef4444' },
];

const RELATIVE_RANGES = [
  { key: '1h',  label: '1H',  ms: 3_600_000 },
  { key: '6h',  label: '6H',  ms: 21_600_000 },
  { key: '24h', label: '24H', ms: 86_400_000 },
  { key: '7d',  label: '7D',  ms: 604_800_000 },
  { key: '30d', label: '30D', ms: 2_592_000_000 },
];

const CALENDAR_RANGES = [
  { key: 'today', label: 'Today', getCutoff: () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); } },
  { key: 'mtd',   label: 'Month', getCutoff: () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); } },
  { key: 'ytd',   label: 'Year',  getCutoff: () => new Date(new Date().getFullYear(), 0, 1) },
];

function getFilterCutoff(mode, rangeKey) {
  if (mode === 'relative') { const r = RELATIVE_RANGES.find(x => x.key === rangeKey); return r ? new Date(Date.now() - r.ms) : new Date(0); }
  const r = CALENDAR_RANGES.find(x => x.key === rangeKey); return r ? r.getCutoff() : new Date(0);
}

function filterData(index, values, mode, rangeKey) {
  if (!index?.length || !values?.length) return [];
  const cutoff = getFilterCutoff(mode, rangeKey);
  const result = [];
  for (let i = 0; i < index.length; i++) {
    if (values[i] === null || values[i] === undefined) continue;
    const t = new Date(index[i]); const v = parseFloat(values[i]);
    if (t >= cutoff && !isNaN(v)) result.push({ time: t.getTime(), value: v });
  }
  return result;
}

function extractOrionAttrs(orionEntity) {
  if (!orionEntity || typeof orionEntity !== 'object') return null;
  const validAttrs = new Set();
  for (const key of Object.keys(orionEntity)) {
    if (key === 'id' || key === 'type') continue;
    if (META_ATTRS.has(key)) continue;
    validAttrs.add(key.toLowerCase());
  }
  return validAttrs;
}

function hasRealValues(values) {
  if (!Array.isArray(values)) return false;
  return values.some(v => v !== null && v !== undefined && !isNaN(parseFloat(v)));
}

function calcStats(data) {
  if (!data.length) return { min: null, max: null, avg: null, last: null, trend: 0 };
  const vals = data.map(d => d.value);
  const min  = Math.min(...vals), max = Math.max(...vals);
  const avg  = vals.reduce((a, b) => a + b, 0) / vals.length;
  const last = vals[vals.length - 1];
  const mid  = Math.floor(vals.length / 2);
  const firstAvg  = mid > 0 ? vals.slice(0, mid).reduce((a, b) => a + b, 0) / mid : avg;
  const secondAvg = vals.slice(mid).reduce((a, b) => a + b, 0) / (vals.length - mid);
  const trend = firstAvg !== 0 ? ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100 : 0;
  return { min, max, avg, last, trend };
}

function fmt(n, d = 2)   { if (n === null || n === undefined || isNaN(n)) return '—'; return Number(n).toFixed(d); }
function fmtCompact(n)   { if (n === null || n === undefined || isNaN(n)) return '—'; const abs = Math.abs(n); if (abs >= 1000) return (n/1000).toFixed(1)+'k'; return Number(n).toFixed(abs < 10 ? 2 : 1); }
function yAxisWidth(max) { if (max === null || max === undefined) return 38; return Math.max(38, Math.abs(Math.round(max)).toString().length * 7 + 18); }

function getXAxisConfig(data) {
  if (!data.length) return { ticks: [], formatter: () => '' };
  const first = data[0].time, last = data[data.length - 1].time, spanMs = last - first;
  let formatter;
  if (spanMs > 86_400_000 * 5)        formatter = ts => new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  else if (spanMs > 86_400_000 * 1.5) formatter = ts => new Date(ts).toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
  else                                 formatter = ts => new Date(ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  const ticks = [];
  for (let i = 0; i <= 5; i++) ticks.push(Math.round(first + (spanMs / 5) * i));
  return { ticks, formatter };
}

function formatTooltipTime(ts) { return new Date(ts).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CustomTooltipContent({ active, payload, label, attrName, color }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-time">{formatTooltipTime(label)}</p>
      <p className="db-tooltip-value">
        <span className="db-tooltip-label">{attrName}</span>
        <span className="db-tooltip-num" style={{ color: color.line }}>{fmt(payload[0]?.value)}</span>
      </p>
    </div>
  );
}

function KpiCard({ label, value, trend, highlight, color }) {
  const showTrend = highlight && trend !== undefined && !isNaN(trend);
  const up = trend >= 0;
  return (
    <div className={`db-kpi ${highlight ? 'db-kpi--hl' : ''}`}>
      <span className="db-kpi-label">{label}</span>
      <span className="db-kpi-value" style={highlight && color ? { color: color.line } : {}}>{value}</span>
      {showTrend && <span className={`db-kpi-trend ${up ? 'db-kpi-trend--up' : 'db-kpi-trend--dn'}`}>{up ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%</span>}
    </div>
  );
}

function Sparkline({ data, color }) {
  if (!data?.length) return null;
  return (
    <div style={{ width: 72, height: 26, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.slice(-40)} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line type="monotone" dataKey="value" stroke={color.line} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

function ProjectSelector({ projects, activeProject, onSelect, onManage }) {
  return (
    <div className="db-project-selector">
      {projects.map(p => {
        const theme = makeProjectTheme(p.color);
        return (
          <button
            key={p.key}
            className={`db-project-tab ${activeProject === p.key ? 'db-project-tab--active' : ''}`}
            style={{ '--proj-color': p.color, '--proj-dim': theme.colorDim, '--proj-border': theme.colorBorder }}
            onClick={() => onSelect(p.key)}
          >
            <span className="db-project-tab-emoji">{p.emoji}</span>
            <div className="db-project-tab-text">
              <span className="db-project-tab-label">{p.label}</span>
              <span className="db-project-tab-desc">{p.desc}</span>
            </div>
            {activeProject === p.key && <span className="db-project-tab-check">✓</span>}
          </button>
        );
      })}
      <button onClick={onManage} className="db-project-add-btn" title="Agregar proyecto">
        <span className="db-project-add-icon">+</span>
        <span className="db-project-add-label">Agregar proyecto</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE ASSIGNMENT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function DeviceAssignModal({ devices, projects, projectMap, onSave, onClose }) {
  const [local, setLocal] = useState({ ...projectMap });
  const assign = (deviceId, projectKey) => setLocal(prev => ({ ...prev, [deviceId]: projectKey }));

  const modal = (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal db-assign-modal" onClick={e => e.stopPropagation()}>
        <div className="db-modal-hdr">
          <div className="db-modal-hdr-left">
            <span className="db-modal-emoji">🗂️</span>
            <span className="db-modal-title">Asignar dispositivos</span>
          </div>
          <button className="db-modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="db-assign-subtitle">Asigna cada dispositivo a un proyecto.</p>
        <div className="db-assign-list">
          {devices.length === 0 && <p className="db-icon-empty">No hay dispositivos disponibles</p>}
          {devices.map(d => {
            const assigned = local[d.id];
            return (
              <div key={d.id} className="db-assign-row">
                <div className="db-assign-device-info">
                  <span className="db-assign-device-id">{d.id}</span>
                  <span className="db-assign-device-type">{d.type || 'device'}</span>
                </div>
                <div className="db-assign-btns">
                  {projects.map(p => {
                    const theme = makeProjectTheme(p.color);
                    return (
                      <button
                        key={p.key}
                        className={`db-assign-btn ${assigned === p.key ? 'db-assign-btn--active' : ''}`}
                        style={{ '--proj-color': p.color, '--proj-dim': theme.colorDim }}
                        onClick={() => assign(d.id, p.key)}
                      >
                        {p.emoji} {p.label}
                      </button>
                    );
                  })}
                  {assigned && (
                    <button className="db-assign-btn db-assign-btn--clear" onClick={() => assign(d.id, null)}>
                      ✕ Sin proyecto
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="db-icon-actions">
          <button className="db-icon-reset" onClick={onClose}>Cancelar</button>
          <button className="db-icon-save" onClick={() => onSave(local)}>Guardar asignaciones</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART CARD
// ─────────────────────────────────────────────────────────────────────────────

function ChartCard({ attr, color, mode, rangeKey, onExpand, cardIndex, icons, projectColor }) {
  const data   = useMemo(() => filterData(attr._index, attr.values, mode, rangeKey), [attr._index, attr.values, mode, rangeKey]);
  const stats  = useMemo(() => calcStats(data), [data]);
  const gradId = `grad-${attr.attrName}-${cardIndex}`;
  const icon   = getIcon(attr.attrName, icons);
  const { ticks, formatter } = useMemo(() => getXAxisConfig(data), [data]);
  const yWidth = useMemo(() => yAxisWidth(stats.max), [stats.max]);

  if (!data.length) {
    return (
      <div className="db-chart-card db-chart-card--empty" style={{ '--card-delay': `${cardIndex * 60}ms` }}>
        <div className="db-empty-card-icon">{icon}</div>
        <p className="db-empty-label">No data for this range</p>
        <p className="db-empty-sub">{attr.attrName}</p>
      </div>
    );
  }

  return (
    <div className="db-chart-card" style={{ '--card-delay': `${cardIndex * 60}ms` }}>
      <div className="db-card-accent-bar" style={{ background: `linear-gradient(90deg, ${projectColor || color.line}, transparent)` }} />
      <div className="db-card-header">
        <div className="db-card-header-left">
          <span className="db-card-icon">{icon}</span>
          <span className="db-card-name">{attr.attrName}</span>
          <span className={`db-card-trend ${stats.trend >= 0 ? 'trend-up' : 'trend-dn'}`}>
            {stats.trend >= 0 ? '↑' : '↓'} {Math.abs(stats.trend).toFixed(1)}%
          </span>
        </div>
        <div className="db-card-header-right">
          <span className="db-card-samples">{data.length} pts</span>
          <button className="db-expand-btn" onClick={() => onExpand(attr, color, data, stats)} title="Expand">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </button>
        </div>
      </div>
      <div className="db-kpi-row">
        <KpiCard label="LAST" value={fmt(stats.last)} trend={stats.trend} highlight color={color} />
        <KpiCard label="AVG"  value={fmt(stats.avg)} />
        <KpiCard label="MIN"  value={fmt(stats.min)} />
        <KpiCard label="MAX"  value={fmt(stats.max)} />
      </div>
      <div className="db-chart-area">
        <ResponsiveContainer width="100%" height={175}>
          <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color.line} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color.line} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" type="number" scale="time" domain={['dataMin','dataMax']} ticks={ticks} tickFormatter={formatter} tick={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fill: '#94a3b8' }} axisLine={false} tickLine={false} width={yWidth} tickCount={4} />
            <Tooltip content={<CustomTooltipContent attrName={attr.attrName} color={color} />} wrapperStyle={{ zIndex: 9999 }} />
            <Area type="monotone" dataKey="value" stroke={color.line} strokeWidth={2} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 5, fill: color.line, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPAND MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ExpandModal({ attr, color, mode, rangeKey, prefetchedData, prefetchedStats, icons, onClose }) {
  const data   = prefetchedData  ?? useMemo(() => filterData(attr._index, attr.values, mode, rangeKey), []);
  const stats  = prefetchedStats ?? useMemo(() => calcStats(data), [data]);
  const gradId = `modal-grad-${attr.attrName}`;
  const { ticks, formatter } = useMemo(() => getXAxisConfig(data), [data]);
  const yWidth = useMemo(() => yAxisWidth(stats.max), [stats.max]);

  const modal = (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal" onClick={e => e.stopPropagation()}>
        <div className="db-modal-hdr">
          <div className="db-modal-hdr-left">
            <span className="db-modal-emoji">{getIcon(attr.attrName, icons)}</span>
            <span className="db-modal-title">{attr.attrName}</span>
            <span className={`db-card-trend ${stats.trend >= 0 ? 'trend-up' : 'trend-dn'}`}>{stats.trend >= 0 ? '↑' : '↓'} {Math.abs(stats.trend).toFixed(1)}%</span>
          </div>
          <button className="db-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="db-modal-kpis">
          <KpiCard label="LAST VALUE" value={fmt(stats.last)} trend={stats.trend} highlight color={color} />
          <KpiCard label="AVERAGE"    value={fmt(stats.avg)} />
          <KpiCard label="MINIMUM"    value={fmt(stats.min)} />
          <KpiCard label="MAXIMUM"    value={fmt(stats.max)} />
          <KpiCard label="SAMPLES"    value={data.length.toLocaleString()} />
        </div>
        <div className="db-modal-chart">
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color.line} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color.line} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" type="number" scale="time" domain={['dataMin','dataMax']} ticks={ticks} tickFormatter={formatter} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: '#94a3b8' }} axisLine={false} tickLine={false} width={yWidth} tickCount={6} />
              <Tooltip content={<CustomTooltipContent attrName={attr.attrName} color={color} />} wrapperStyle={{ zIndex: 99999, position: 'fixed' }} />
              <ReferenceLine y={stats.avg} stroke={color.line} strokeDasharray="5 4" strokeOpacity={0.4} label={{ value: `avg ${fmt(stats.avg)}`, position: 'insideTopRight', fontSize: 9, fontFamily: 'JetBrains Mono', fill: color.line }} />
              <Area type="monotone" dataKey="value" stroke={color.line} strokeWidth={2.5} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 6, fill: color.line, stroke: '#fff', strokeWidth: 2.5 }} isAnimationActive={false} />
              <Brush dataKey="time" height={22} stroke={color.line} strokeOpacity={0.25} fill="#f8fafc" travellerWidth={6} tickFormatter={formatter} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { icons } = useDeviceStore();

  const [devices,        setDevices]        = useState([]);
  const [pickedDevice,   setPickedDevice]   = useState('');
  const [deviceData,     setDeviceData]     = useState(null);
  const [orionEntity,    setOrionEntity]    = useState(null);
  const [orionAttrs,     setOrionAttrs]     = useState(null);
  const [filterMode,     setFilterMode]     = useState('relative');
  const [rangeKey,       setRangeKey]       = useState('24h');
  const [expanded,       setExpanded]       = useState(null);
  const [polling,        setPolling]        = useState(true);
  const [lastUpdated,    setLastUpdated]    = useState(null);
  const [initialLoaded,  setInitialLoaded]  = useState(false);
  const [listLoading,    setListLoading]    = useState(true);
  const [showVarMgr,     setShowVarMgr]     = useState(false);   // ← modal de variables
  const [showAssignMgr,  setShowAssignMgr]  = useState(false);
  const [showProjMgr,    setShowProjMgr]    = useState(false);
  const [projects,       setProjects]       = useState(loadProjects);
  const [projectMap,     setProjectMap]     = useState(loadProjectMap);
  const [activeProject,  setActiveProject]  = useState(() => {
    const saved = loadProjects();
    return saved[0]?.key || 'tars';
  });

  // variablesData cargado desde Orion — mismo formato que Admin usa
  const [variablesData,  setVariablesData]  = useState([]);

  const pollingRef   = useRef(null);
  const prevIndexRef = useRef(null);
  const loadedForRef = useRef(null);

  const projData = projects.find(p => p.key === activeProject) || projects[0] || { key:'default', label:'Default', emoji:'📊', color:'#22c55e', desc:'' };
  const proj = { ...projData, ...makeProjectTheme(projData.color) };

  const projectDevices = useMemo(
    () => devices.filter(d => projectMap[d.id] === activeProject),
    [devices, projectMap, activeProject]
  );

  useEffect(() => {
    const first = projectDevices[0]?.id || '';
    setPickedDevice(first);
    setDeviceData(null); setOrionEntity(null); setOrionAttrs(null); setInitialLoaded(false);
  }, [activeProject]);

  useEffect(() => {
    if (projectDevices.length && !projectDevices.find(d => d.id === pickedDevice)) {
      setPickedDevice(projectDevices[0].id);
    }
  }, [projectDevices]);

  // ── Cargar variablesData desde Orion (igual que Admin) ────────────────────
  const loadVariablesData = () => {
    const token = localStorage.getItem('access_token') || '';
    fetch('/v2/entities?id=variablelist', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setVariablesData(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => { loadVariablesData(); }, []);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const deviceHistoryMutation = useMutation({
    mutationFn: ({ deviceId }) => {
      const params = new URLSearchParams({ type: 'device', lastN: '10000' });
      return fetch(`/quantumleap/v2/entities/${deviceId}?${params}`, {
        headers: { 'Fiware-Service': '', 'Fiware-ServicePath': '/' },
      }).then(r => { if (!r.ok) throw new Error(`QL ${r.status}`); return r.json(); });
    },
    onSuccess: (data, variables) => {
      if (variables.deviceId !== pickedDevice) return;
      loadedForRef.current = variables.deviceId;
      setDeviceData(data);
      setInitialLoaded(true);
      const key = (data?.index || []).slice(-3).join(',');
      if (prevIndexRef.current !== key) { prevIndexRef.current = key; setLastUpdated(new Date()); }
    },
    onError: () => setInitialLoaded(true),
  });

  const orionEntityMutation = useMutation({
    mutationFn: ({ deviceId }) =>
      fetch(`/v2/entities/${deviceId}?type=device`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}` },
      }).then(r => { if (!r.ok) throw new Error(`Orion ${r.status}`); return r.json(); }),
    onSuccess: (data, variables) => {
      if (variables.deviceId !== pickedDevice) return;
      setOrionEntity(data);
      setOrionAttrs(extractOrionAttrs(data));
    },
    onError: () => { setOrionEntity(null); setOrionAttrs(null); },
  });

  const listMutation = useMutation({
    mutationFn: () =>
      fetch('/v2/entities?type=device', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}` },
      }).then(r => r.json()),
    onSuccess: (data) => { setDevices(data); setListLoading(false); },
    onError:   () => setListLoading(false),
  });

  useEffect(() => { listMutation.mutate(); }, []);

  useEffect(() => {
    if (!pickedDevice) return;
    setDeviceData(null); setOrionEntity(null); setOrionAttrs(null);
    setInitialLoaded(false); prevIndexRef.current = null; loadedForRef.current = null;
    orionEntityMutation.mutate({ deviceId: pickedDevice });
    deviceHistoryMutation.mutate({ deviceId: pickedDevice });
  }, [pickedDevice]);

  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (polling && pickedDevice && initialLoaded) {
      pollingRef.current = setInterval(() => {
        deviceHistoryMutation.mutate({ deviceId: pickedDevice });
        orionEntityMutation.mutate({ deviceId: pickedDevice });
      }, 5000);
    }
    return () => clearInterval(pollingRef.current);
  }, [polling, pickedDevice, initialLoaded]);

  const orionState    = orionEntity?.state?.value || null;
  const lastTimestamp = deviceData?.index?.slice(-1)[0] || null;
  const activityKey   = computeActivity(lastTimestamp);
  const activityCfg   = ACTIVITY_STATUS[activityKey];

  const handleAssignSave = (newMap) => {
    const cleaned = Object.fromEntries(Object.entries(newMap).filter(([, v]) => v));
    setProjectMap(cleaned); saveProjectMap(cleaned); setShowAssignMgr(false);
  };

  const handleProjectsSave = (newProjects) => {
    saveProjects(newProjects);
    setProjects(newProjects);
    // If active project was deleted, switch to first
    if (!newProjects.find(p => p.key === activeProject)) {
      setActiveProject(newProjects[0]?.key || '');
    }
    setShowProjMgr(false);
  };

  const idxFull = deviceData?.index || [];
  const attrs = useMemo(() => {
    if (!deviceData || loadedForRef.current !== pickedDevice) return [];
    return (deviceData?.attributes || [])
      .filter(a => {
        if (!a?.attrName || !Array.isArray(a?.values)) return false;
        const nameLC = a.attrName.toLowerCase();
        if (META_ATTRS.has(a.attrName) || META_ATTRS.has(nameLC)) return false;
        if (orionAttrs !== null && !orionAttrs.has(nameLC)) return false;
        if (!hasRealValues(a.values)) return false;
        return true;
      })
      .map(a => ({ ...a, _index: Array.isArray(a.index) && a.index.length ? a.index : idxFull }));
  }, [deviceData, idxFull, pickedDevice, orionAttrs]);

  const summaryItems = useMemo(() => attrs.map((attr, i) => {
    const data  = filterData(attr._index, attr.values, filterMode, rangeKey);
    const stats = calcStats(data);
    return { attr, data, stats, color: CHART_COLORS[i % CHART_COLORS.length] };
  }), [attrs, filterMode, rangeKey]);

  const showInitialLoader = listLoading || (pickedDevice && !initialLoaded);
  const isRefetching      = deviceHistoryMutation.isPending && initialLoaded;
  const currentRanges     = filterMode === 'relative' ? RELATIVE_RANGES : CALENDAR_RANGES;
  const unassignedCount   = devices.filter(d => !projectMap[d.id]).length;

  return (
    <>
      {showInitialLoader && (
        <div className="db-initial-loader">
          <div className="db-initial-spinner" style={{ borderTopColor: proj.color }} />
          <span className="db-loading-text">Loading sensor data…</span>
        </div>
      )}

      <div
        className={`db-root ${initialLoaded ? 'db-root--loaded' : ''}`}
        style={{ '--proj-color': proj.color, '--proj-dim': proj.colorDim, '--proj-border': proj.colorBorder }}
      >
        <div className="db-project-bar">
          <ProjectSelector projects={projects} activeProject={activeProject} onSelect={setActiveProject} onManage={() => setShowProjMgr(true)} />
          <div className="db-project-bar-right">
            {unassignedCount > 0 && (
              <button className="db-unassigned-badge" onClick={() => setShowAssignMgr(true)}>
                ⚠️ {unassignedCount} sin asignar
              </button>
            )}
            <button className="db-assign-mgr-btn" onClick={() => setShowAssignMgr(true)}>
              🗂️ <span>Proyectos</span>
            </button>
          </div>
        </div>

        <div className="db-project-band" style={{ background: proj.colorDim, borderColor: proj.colorBorder }}>
          <span className="db-project-band-emoji">{proj.emoji}</span>
          <div>
            <div className="db-project-band-name">{proj.label}</div>
            <div className="db-project-band-desc">{proj.desc}</div>
          </div>
          <span className="db-project-band-count">{projectDevices.length} dispositivo{projectDevices.length !== 1 ? 's' : ''}</span>
        </div>

        <header className="db-topbar">
          <div className="db-topbar-left">
            <div className="db-brand">
              <div className="db-brand-icon" style={{ background: `linear-gradient(135deg, ${proj.color}, ${proj.color}cc)` }}>📊</div>
              <div className="db-brand-text">
                <h1 className="db-title">Dashboard</h1>
                <span className="db-subtitle">Sensor Monitoring</span>
              </div>
            </div>

            {pickedDevice && (
              <div className="db-device-cluster">
                <span className="db-device-badge" style={{ color: proj.color, background: proj.colorDim, borderColor: proj.colorBorder }}>
                  {pickedDevice}
                </span>
                <span className="db-cluster-sep" />
                <DeviceStatusBadge orionState={orionState} />
                <span className="db-cluster-sep" />
                <span
                  className="db-activity-pill"
                  title="Frescura de datos en QuantumLeap"
                  style={{ color: activityCfg.color, background: `${activityCfg.color}14`, borderColor: `${activityCfg.color}33` }}
                >
                  {activityCfg.pulse
                    ? <span style={{ display:'inline-flex', width:7, height:7, borderRadius:'50%', background: activityCfg.color, marginRight:4, animation:'pulsePing 1.4s infinite' }} />
                    : <span style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background: activityCfg.color, marginRight:4 }} />
                  }
                  {activityCfg.label}
                </span>
                <span className="db-cluster-sep" />
                {lastUpdated && (
                  <span className="db-last-update">
                    {lastUpdated.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            )}

            <div className={`db-conn-pill ${initialLoaded ? 'db-conn-pill--ok' : 'db-conn-pill--idle'}`} style={initialLoaded ? { color: proj.color, background: proj.colorDim, borderColor: proj.colorBorder } : {}}>
              <span className="db-conn-dot" style={initialLoaded ? { background: proj.color } : {}} />
              <span>{initialLoaded ? 'Connected' : 'Connecting…'}</span>
            </div>
          </div>

          <div className="db-topbar-right">
            <div className="db-select-wrap">
              <label className="db-select-label">Dispositivo</label>
              <select
                className="db-select"
                value={pickedDevice}
                onChange={e => { setInitialLoaded(false); setPickedDevice(e.target.value); }}
                style={{ borderColor: proj.colorBorder }}
              >
                {projectDevices.length === 0
                  ? <option value="">— Sin dispositivos —</option>
                  : projectDevices.map(d => <option key={d.id} value={d.id}>{d.id}</option>)
                }
              </select>
            </div>
            {/* ── Botón que abre el mismo modal de variables que /devices ── */}
            <button className="db-icon-mgr-btn" onClick={() => setShowVarMgr(true)}>
              <span>📋</span><span>Variables</span>
            </button>
            <button
              className={`db-polling-btn ${polling ? 'db-polling-btn--on' : ''}`}
              style={polling ? { color: proj.color, background: proj.colorDim, borderColor: proj.colorBorder } : {}}
              onClick={() => setPolling(p => !p)}
            >
              {polling
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              }
              {polling ? 'Live' : 'Paused'}
            </button>
          </div>
        </header>

        {projectDevices.length === 0 && !listLoading && (
          <div className="db-empty db-empty--project">
            <div className="db-empty-icon" style={{ fontSize: 48 }}>{proj.emoji}</div>
            <p className="db-empty-title">No hay dispositivos en {proj.label}</p>
            <p className="db-empty-hint">Asigna dispositivos a este proyecto desde el gestor de proyectos.</p>
            <button className="db-empty-retry" style={{ color: proj.color, background: proj.colorDim, borderColor: proj.colorBorder }} onClick={() => setShowAssignMgr(true)}>
              🗂️ Asignar dispositivos
            </button>
          </div>
        )}

        {projectDevices.length > 0 && (
          <>
            <div className="db-filter-bar">
              <div className="db-mode-switch">
                <button className={`db-mode-btn ${filterMode === 'relative' ? 'db-mode-btn--active' : ''}`} style={filterMode === 'relative' ? { background: proj.color } : {}} onClick={() => { setFilterMode('relative'); setRangeKey('24h'); }}>Relative</button>
                <button className={`db-mode-btn ${filterMode === 'calendar' ? 'db-mode-btn--active' : ''}`} style={filterMode === 'calendar' ? { background: proj.color } : {}} onClick={() => { setFilterMode('calendar'); setRangeKey('today'); }}>Calendar</button>
              </div>
              <div className="db-range-pills">
                {currentRanges.map(({ key, label }) => (
                  <button key={key} className={`db-pill ${rangeKey === key ? 'db-pill--active' : ''}`} style={rangeKey === key ? { background: proj.colorDim, color: proj.color, fontWeight: 700 } : {}} onClick={() => setRangeKey(key)}>{label}</button>
                ))}
              </div>
              <div className="db-filter-right">
                <div className={`db-fetch-indicator ${isRefetching ? 'db-fetch-indicator--visible' : ''}`}>
                  <div className="db-fetch-spinner" style={{ borderTopColor: proj.color }} />
                  <span>Updating…</span>
                </div>
                {attrs.length > 0 && <span className="db-attr-count">{attrs.length} variable{attrs.length !== 1 ? 's' : ''}</span>}
              </div>
            </div>

            {summaryItems.length > 0 && (
              <div className="db-summary-strip" style={{ borderColor: proj.colorBorder }}>
                {summaryItems.map(({ attr, data, stats, color }) => (
                  <div key={attr.attrName} className="db-summary-item">
                    <span className="db-summary-icon">{getIcon(attr.attrName, icons)}</span>
                    <div className="db-summary-info">
                      <span className="db-summary-name">{attr.attrName}</span>
                      <span className="db-summary-val" style={{ color: color.line }}>{fmtCompact(stats.last)}</span>
                    </div>
                    <Sparkline data={data} color={color} />
                    <span className={`db-summary-trend ${stats.trend >= 0 ? 'trend-up' : 'trend-dn'}`}>
                      {stats.trend >= 0 ? '↑' : '↓'}{Math.abs(stats.trend).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {attrs.length === 0 && initialLoaded && (
              <div className="db-empty">
                <div className="db-empty-icon"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></div>
                <p className="db-empty-title">No attributes found</p>
                <p className="db-empty-hint">Device <strong>{pickedDevice}</strong> has no historical data in QuantumLeap.</p>
              </div>
            )}

            {attrs.length > 0 && initialLoaded && (
              <div className="db-charts-grid">
                {attrs.map((attr, i) => (
                  <ChartCard
                    key={attr.attrName}
                    attr={attr}
                    color={CHART_COLORS[i % CHART_COLORS.length]}
                    mode={filterMode}
                    rangeKey={rangeKey}
                    cardIndex={i}
                    icons={icons}
                    projectColor={proj.color}
                    onExpand={(a, c, data, stats) => setExpanded({ attr: a, color: c, data, stats })}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <button className="db-grafana-fab" onClick={() => window.open('http://localhost:3000', '_blank')} title="Open Grafana">
          <InsertChartOutlinedRoundedIcon style={{ fontSize: 18 }} />
          <span className="db-fab-tooltip">Open Grafana</span>
        </button>
      </div>

      {expanded && (
        <ExpandModal attr={expanded.attr} color={expanded.color} mode={filterMode} rangeKey={rangeKey}
          prefetchedData={expanded.data} prefetchedStats={expanded.stats} icons={icons} onClose={() => setExpanded(null)} />
      )}

      {/* ── Modal de variables — mismo que en /devices ── */}
      {showVarMgr && (
        <VariableModal
          open={showVarMgr}
          setOpen={setShowVarMgr}
          variablesData={variablesData}
          getDevices={loadVariablesData}
        />
      )}

      {showProjMgr && (
        <ProjectManagerModal projects={projects} onSave={handleProjectsSave} onClose={() => setShowProjMgr(false)} />
      )}

      {showAssignMgr && (
        <DeviceAssignModal devices={devices} projects={projects} projectMap={projectMap} onSave={handleAssignSave} onClose={() => setShowAssignMgr(false)} />
      )}
    </>
  );
}