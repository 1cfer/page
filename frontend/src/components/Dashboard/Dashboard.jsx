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

// ─────────────────────────────────────────────────────────────────────────────
// ICON MANAGER
// Persiste en localStorage. Mapea nombreVariable (lowercase) → emoji/texto
// ─────────────────────────────────────────────────────────────────────────────

const ICON_STORAGE_KEY = 'db_var_icons_v1';

const DEFAULT_ICONS = {
  temperature:  '🌡️',
  temp_amb:     '🌡️',
  temp_water:   '🌊',
  humidity:     '💧',
  co2:          '🌿',
  noise:        '🔊',
  pressure:     '🔵',
  light:        '💡',
  illuminance:  '💡',
  flow:         '🚿',
};

function loadIcons() {
  try {
    const raw = localStorage.getItem(ICON_STORAGE_KEY);
    return raw ? { ...DEFAULT_ICONS, ...JSON.parse(raw) } : { ...DEFAULT_ICONS };
  } catch { return { ...DEFAULT_ICONS }; }
}

function saveIcons(icons) {
  try { localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(icons)); } catch {}
}

function getIcon(name, icons) {
  if (!name) return '📡';
  const key = name.toLowerCase().trim();
  return icons[key] || '📡';
}

// ─────────────────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  { line: '#10b981' }, { line: '#3b82f6' }, { line: '#f43f5e' },
  { line: '#f59e0b' }, { line: '#8b5cf6' }, { line: '#06b6d4' },
  { line: '#f97316' }, { line: '#ec4899' }, { line: '#14b8a6' },
  { line: '#a855f7' }, { line: '#84cc16' }, { line: '#ef4444' },
];

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

const RELATIVE_RANGES = [
  { key: '1h',  label: '1H',  ms: 3_600_000 },
  { key: '6h',  label: '6H',  ms: 21_600_000 },
  { key: '24h', label: '24H', ms: 86_400_000 },
  { key: '7d',  label: '7D',  ms: 604_800_000 },
  { key: '30d', label: '30D', ms: 2_592_000_000 },
];

const CALENDAR_RANGES = [
  { key: 'today', label: 'Today', getCutoff: () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0); } },
  { key: 'mtd',   label: 'Month', getCutoff: () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1, 0, 0, 0, 0); } },
  { key: 'ytd',   label: 'Year',  getCutoff: () => new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0) },
];

function getFilterCutoff(mode, rangeKey) {
  if (mode === 'relative') {
    const r = RELATIVE_RANGES.find(x => x.key === rangeKey);
    return r ? new Date(Date.now() - r.ms) : new Date(0);
  }
  const r = CALENDAR_RANGES.find(x => x.key === rangeKey);
  return r ? r.getCutoff() : new Date(0);
}

function filterData(index, values, mode, rangeKey) {
  if (!index?.length || !values?.length) return [];
  const cutoff = getFilterCutoff(mode, rangeKey);
  const result = [];
  for (let i = 0; i < index.length; i++) {
    // Skip nulls/undefined — QuantumLeap fills missing positions with null
    // when multiple attributes share the same index timeline
    if (values[i] === null || values[i] === undefined) continue;
    const t = new Date(index[i]);
    const v = parseFloat(values[i]);
    if (t >= cutoff && !isNaN(v)) result.push({ time: t.getTime(), value: v });
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────

function calcStats(data) {
  if (!data.length) return { min: null, max: null, avg: null, last: null, trend: 0 };
  const vals = data.map(d => d.value);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  const avg  = vals.reduce((a, b) => a + b, 0) / vals.length;
  const last = vals[vals.length - 1];
  const mid  = Math.floor(vals.length / 2);
  const firstAvg  = mid > 0 ? vals.slice(0, mid).reduce((a, b) => a + b, 0) / mid : avg;
  const secondAvg = vals.slice(mid).reduce((a, b) => a + b, 0) / (vals.length - mid);
  const trend = firstAvg !== 0 ? ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100 : 0;
  return { min, max, avg, last, trend };
}

function fmt(n, d = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toFixed(d);
}

function yAxisWidth(max) {
  if (max === null || max === undefined) return 38;
  const chars = Math.abs(Math.round(max)).toString().length;
  return Math.max(38, chars * 7 + 18);
}

function getXAxisConfig(data, mode, rangeKey) {
  if (!data.length) return { ticks: [], formatter: () => '' };
  const first  = data[0].time;
  const last   = data[data.length - 1].time;
  const spanMs = last - first;
  let formatter;
  if (spanMs > 86_400_000 * 5) {
    formatter = ts => new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  } else if (spanMs > 86_400_000 * 1.5) {
    formatter = ts => new Date(ts).toLocaleDateString('en', { weekday: 'short', day: 'numeric' });
  } else {
    formatter = ts => new Date(ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  }
  const TARGET = 5;
  const ticks = [];
  for (let i = 0; i <= TARGET; i++) ticks.push(Math.round(first + (spanMs / TARGET) * i));
  return { ticks, formatter };
}

function formatTooltipTime(ts) {
  return new Date(ts).toLocaleString('en', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

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

function LivePulse({ active }) {
  return (
    <span className={`db-live-pulse ${active ? 'db-live-pulse--on' : ''}`}>
      <span className="db-live-ring" />
      <span className="db-live-dot" />
    </span>
  );
}

function KpiCard({ label, value, trend, highlight, color }) {
  const showTrend = highlight && trend !== undefined && !isNaN(trend);
  const up = trend >= 0;
  return (
    <div className={`db-kpi ${highlight ? 'db-kpi--hl' : ''}`}>
      <span className="db-kpi-label">{label}</span>
      <span className="db-kpi-value" style={highlight && color ? { color: color.line } : {}}>{value}</span>
      {showTrend && (
        <span className={`db-kpi-trend ${up ? 'db-kpi-trend--up' : 'db-kpi-trend--dn'}`}>
          {up ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
        </span>
      )}
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
// ICON MANAGER MODAL
// ─────────────────────────────────────────────────────────────────────────────

function IconManagerModal({ knownVars, icons, onSave, onClose }) {
  const [local, setLocal] = useState({ ...icons });
  const [search, setSearch] = useState('');
  const [newVar, setNewVar] = useState('');
  const [newIcon, setNewIcon] = useState('');

  // All variables: known from device + any already in icons
  const allVars = useMemo(() => {
    const set = new Set([
      ...knownVars.map(v => v.toLowerCase()),
      ...Object.keys(local),
    ]);
    return Array.from(set).sort();
  }, [knownVars, local]);

  const filtered = search
    ? allVars.filter(v => v.includes(search.toLowerCase()))
    : allVars;

  const handleChange = (varName, value) => {
    setLocal(prev => ({ ...prev, [varName]: value }));
  };

  const handleAdd = () => {
    const key = newVar.trim().toLowerCase();
    if (!key) return;
    setLocal(prev => ({ ...prev, [key]: newIcon.trim() || '📡' }));
    setNewVar('');
    setNewIcon('');
  };

  const handleDelete = (varName) => {
    setLocal(prev => {
      const next = { ...prev };
      delete next[varName];
      return next;
    });
  };

  const modal = (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal db-icon-modal" onClick={e => e.stopPropagation()}>
        <div className="db-modal-hdr">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎨</span>
            <span className="db-modal-title">Manage Variable Icons</span>
          </div>
          <button className="db-modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="db-icon-subtitle">
          Assign any emoji or text icon to each sensor variable. Changes apply instantly.
        </p>

        {/* Search */}
        <div className="db-icon-search-wrap">
          <input
            className="db-icon-search"
            placeholder="Search variables…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Variable list */}
        <div className="db-icon-list">
          {filtered.map(varName => (
            <div key={varName} className="db-icon-row">
              <div className="db-icon-preview">{local[varName] || '📡'}</div>
              <div className="db-icon-var-name">{varName}</div>
              <input
                className="db-icon-input"
                value={local[varName] || ''}
                onChange={e => handleChange(varName, e.target.value)}
                placeholder="emoji or text"
                maxLength={6}
              />
              <button
                className="db-icon-delete"
                onClick={() => handleDelete(varName)}
                title="Remove override"
              >✕</button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              No variables found
            </p>
          )}
        </div>

        {/* Add new */}
        <div className="db-icon-add">
          <span className="db-icon-add-label">Add / override</span>
          <div className="db-icon-add-row">
            <input
              className="db-icon-input db-icon-input--var"
              placeholder="variable name"
              value={newVar}
              onChange={e => setNewVar(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <input
              className="db-icon-input"
              placeholder="icon"
              value={newIcon}
              onChange={e => setNewIcon(e.target.value)}
              maxLength={6}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button className="db-icon-add-btn" onClick={handleAdd}>Add</button>
          </div>
        </div>

        {/* Actions */}
        <div className="db-icon-actions">
          <button className="db-icon-reset" onClick={() => setLocal({ ...DEFAULT_ICONS })}>
            Reset to defaults
          </button>
          <button className="db-icon-save" onClick={() => onSave(local)}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART CARD
// ─────────────────────────────────────────────────────────────────────────────

function ChartCard({ attr, index, color, mode, rangeKey, onExpand, cardIndex, icons }) {
  const data   = useMemo(() => filterData(index, attr.values, mode, rangeKey), [index, attr.values, mode, rangeKey]);
  const stats  = useMemo(() => calcStats(data), [data]);
  const gradId = `grad-${attr.attrName}`;
  const icon   = getIcon(attr.attrName, icons);
  const { ticks, formatter } = useMemo(() => getXAxisConfig(data, mode, rangeKey), [data, mode, rangeKey]);
  const yWidth = useMemo(() => yAxisWidth(stats.max), [stats.max]);

  if (!data.length) {
    return (
      <div className="db-chart-card db-chart-card--empty" style={{ '--delay': `${cardIndex * 60}ms` }}>
        <span style={{ fontSize: 28, opacity: 0.2 }}>{icon}</span>
        <p className="db-empty-label">No data for this range</p>
        <p className="db-empty-sub">{attr.attrName}</p>
      </div>
    );
  }

  return (
    <div className="db-chart-card" style={{ '--delay': `${cardIndex * 60}ms` }}>
      <div className="db-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span className="db-card-name">{attr.attrName}</span>
          <span className={`db-card-trend ${stats.trend >= 0 ? 'trend-up' : 'trend-dn'}`}>
            {stats.trend >= 0 ? '↑' : '↓'} {Math.abs(stats.trend).toFixed(1)}%
          </span>
        </div>
        <button className="db-expand-btn" onClick={() => onExpand(attr, index, color, data, stats)} title="Expand">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </button>
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
            <XAxis
              dataKey="time" type="number" scale="time"
              domain={['dataMin', 'dataMax']}
              ticks={ticks} tickFormatter={formatter}
              tick={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fill: '#94a3b8' }}
              axisLine={false} tickLine={false} interval={0}
            />
            <YAxis
              tick={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fill: '#94a3b8' }}
              axisLine={false} tickLine={false} width={yWidth} tickCount={4}
            />
            <Tooltip
              content={<CustomTooltipContent attrName={attr.attrName} color={color} />}
              wrapperStyle={{ zIndex: 9999 }}
            />
            <Area
              type="monotone" dataKey="value"
              stroke={color.line} strokeWidth={2}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 5, fill: color.line, stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPAND MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ExpandModal({ attr, index, color, mode, rangeKey, prefetchedData, prefetchedStats, icons, onClose }) {
  const data   = prefetchedData  ?? useMemo(() => filterData(index, attr.values, mode, rangeKey), []);
  const stats  = prefetchedStats ?? useMemo(() => calcStats(data), [data]);
  const gradId = `modal-grad-${attr.attrName}`;
  const { ticks, formatter } = useMemo(() => getXAxisConfig(data, mode, rangeKey), [data]);
  const yWidth = useMemo(() => yAxisWidth(stats.max), [stats.max]);

  const modal = (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal" onClick={e => e.stopPropagation()}>
        <div className="db-modal-hdr">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{getIcon(attr.attrName, icons)}</span>
            <span className="db-modal-title">{attr.attrName}</span>
            <span className={`db-card-trend ${stats.trend >= 0 ? 'trend-up' : 'trend-dn'}`}>
              {stats.trend >= 0 ? '↑' : '↓'} {Math.abs(stats.trend).toFixed(1)}%
            </span>
          </div>
          <button className="db-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="db-modal-kpis">
          <KpiCard label="LAST VALUE" value={fmt(stats.last)} trend={stats.trend} highlight color={color} />
          <KpiCard label="AVERAGE"    value={fmt(stats.avg)} />
          <KpiCard label="MINIMUM"    value={fmt(stats.min)} />
          <KpiCard label="MAXIMUM"    value={fmt(stats.max)} />
          <KpiCard label="SAMPLES"    value={data.length} />
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
              <XAxis
                dataKey="time" type="number" scale="time"
                domain={['dataMin', 'dataMax']}
                ticks={ticks} tickFormatter={formatter}
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: '#94a3b8' }}
                axisLine={false} tickLine={false} interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: '#94a3b8' }}
                axisLine={false} tickLine={false} width={yWidth} tickCount={6}
              />
              <Tooltip
                content={<CustomTooltipContent attrName={attr.attrName} color={color} />}
                wrapperStyle={{ zIndex: 99999, position: 'fixed' }}
              />
              <ReferenceLine
                y={stats.avg} stroke={color.line} strokeDasharray="5 4" strokeOpacity={0.4}
                label={{ value: `avg ${fmt(stats.avg)}`, position: 'insideTopRight', fontSize: 9, fontFamily: 'JetBrains Mono', fill: color.line }}
              />
              <Area
                type="monotone" dataKey="value"
                stroke={color.line} strokeWidth={2.5}
                fill={`url(#${gradId})`} dot={false}
                activeDot={{ r: 6, fill: color.line, stroke: '#fff', strokeWidth: 2.5 }}
                isAnimationActive={false}
              />
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
  const [devices,        setDevices]        = useState([]);
  const [pickedDevice,   setPickedDevice]   = useState('');
  const [deviceData,     setDeviceData]     = useState({});
  const [filterMode,     setFilterMode]     = useState('relative');
  const [rangeKey,       setRangeKey]       = useState('24h');
  const [expanded,       setExpanded]       = useState(null);
  const [polling,        setPolling]        = useState(true);
  const [lastUpdated,    setLastUpdated]    = useState(null);
  const [initialLoaded,  setInitialLoaded]  = useState(false);
  const [listLoading,    setListLoading]    = useState(true);
  const [showIconMgr,    setShowIconMgr]    = useState(false);
  const [icons,          setIcons]          = useState(loadIcons);

  const pollingRef   = useRef(null);
  const prevIndexRef = useRef(null);

  // ── Mutations (original logic preserved) ──────────────────────────────────

  // deviceId passed as argument so the closure always fetches the correct device
  const deviceHistoryMutation = useMutation({
    mutationFn: (deviceId) => {
      // Use lastN=10000 to ensure we get enough history for all attributes.
      // QuantumLeap's default can be too small and silently drops attributes
      // that have fewer records than the returned index length.
      const params = new URLSearchParams({
        type: 'device',
        lastN: '10000',
      });
      return fetch(`/quantumleap/v2/entities/${deviceId}?${params}`, {
        headers: { 'Fiware-Service': '', 'Fiware-ServicePath': '/' },
      }).then(r => r.json());
    },
    onSuccess: (data) => {
      // Diagnose: log the raw API response to understand structure
      console.group('[Dashboard] QuantumLeap response for', data?.entityId || 'unknown');
      console.log('Full response:', data);
      console.log('Attributes received:', data?.attributes?.map(a => a.attrName) || []);
      console.log('Index length:', data?.index?.length || 0);
      console.log('Index sample (last 3):', data?.index?.slice(-3) || []);
      console.groupEnd();

      setDeviceData(data);
      setInitialLoaded(true);
      const key = data?.index?.slice(-3).join(',');
      if (prevIndexRef.current !== key) {
        prevIndexRef.current = key;
        setLastUpdated(new Date());
      }
    },
    onError: (e) => console.error('History error:', e.message),
  });

  const listMutation = useMutation({
    mutationFn: () =>
      fetch('/v2/entities?type=device', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      }).then(r => r.json()),
    onSuccess: (data) => {
      setDevices(data);
      setPickedDevice(data[0]?.id || '');
      setListLoading(false);
    },
    onError: (e) => { console.error('List error:', e.message); setListLoading(false); },
  });

  useEffect(() => { listMutation.mutate(); }, []);

  useEffect(() => {
    if (pickedDevice) {
      // Clear previous device data immediately so stale variables never show
      setDeviceData({});
      setInitialLoaded(false);
      prevIndexRef.current = null;
      deviceHistoryMutation.mutate(pickedDevice);
    }
  }, [pickedDevice]);

  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (polling && pickedDevice && initialLoaded) {
      pollingRef.current = setInterval(() => deviceHistoryMutation.mutate(pickedDevice), 5000);
    }
    return () => clearInterval(pollingRef.current);
  }, [polling, pickedDevice, initialLoaded]);

  // ── Icon manager save ──────────────────────────────────────────────────────
  const handleIconSave = (newIcons) => {
    setIcons(newIcons);
    saveIcons(newIcons);
    setShowIconMgr(false);
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  // Normalize: some QuantumLeap versions return per-attribute index,
  // others return a shared top-level index. We normalize to always have
  // { attrName, values, index } per attribute.
  const idxFull = deviceData?.index || [];
  const attrs = useMemo(() => {
    const raw = deviceData?.attributes || [];
    return raw
      .filter(a => a?.attrName && Array.isArray(a?.values))
      .map(a => ({
        ...a,
        // Use per-attribute index if present, otherwise fall back to shared index
        _index: Array.isArray(a.index) && a.index.length ? a.index : idxFull,
      }));
  }, [deviceData, idxFull]);

  // Collect all known variable names for the icon manager
  const knownVars = useMemo(() => attrs.map(a => a.attrName), [attrs]);

  const showInitialLoader = listLoading || (pickedDevice && !initialLoaded);
  const isLive            = polling && !deviceHistoryMutation.isPending;
  const isRefetching      = deviceHistoryMutation.isPending && initialLoaded;
  const currentRanges     = filterMode === 'relative' ? RELATIVE_RANGES : CALENDAR_RANGES;

  const handleModeSwitch = (m) => {
    setFilterMode(m);
    setRangeKey(m === 'relative' ? '24h' : 'today');
  };

  return (
    <>
      {showInitialLoader && (
        <div className="db-initial-loader">
          <div className="db-initial-spinner" />
        </div>
      )}

      <div className={`db-root ${initialLoaded ? 'db-root--loaded' : ''}`}>

        {/* ── Top Bar ── */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <div className="db-brand">
              <span className="db-brand-dot" />
              <h1 className="db-title">Dashboard</h1>
            </div>
            {pickedDevice && <span className="db-device-badge">{pickedDevice}</span>}
            <LivePulse active={isLive} />
            {lastUpdated && (
              <span className="db-last-update">
                {lastUpdated.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          <div className="db-topbar-right">
            <div className="db-select-wrap">
              <label className="db-select-label">Device</label>
              <select
                className="db-select"
                value={pickedDevice}
                onChange={e => { setInitialLoaded(false); setPickedDevice(e.target.value); }}
              >
                {devices.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
              </select>
            </div>

            {/* Icon manager button */}
            <button
              className="db-icon-mgr-btn"
              onClick={() => setShowIconMgr(true)}
              title="Manage variable icons"
            >
              <span style={{ fontSize: 15 }}>🎨</span>
              <span>Icons</span>
            </button>

            <button
              className={`db-polling-btn ${polling ? 'db-polling-btn--on' : ''}`}
              onClick={() => setPolling(p => !p)}
              title={polling ? 'Pause live updates' : 'Resume live updates'}
            >
              {polling ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
              {polling ? 'Live' : 'Paused'}
            </button>
          </div>
        </header>

        {/* ── Filter Bar ── */}
        <div className="db-filter-bar">
          <div className="db-mode-switch">
            <button className={`db-mode-btn ${filterMode === 'relative' ? 'db-mode-btn--active' : ''}`} onClick={() => handleModeSwitch('relative')}>Relative</button>
            <button className={`db-mode-btn ${filterMode === 'calendar' ? 'db-mode-btn--active' : ''}`} onClick={() => handleModeSwitch('calendar')}>Calendar</button>
          </div>
          <div className="db-range-pills">
            {currentRanges.map(({ key, label }) => (
              <button key={key} className={`db-pill ${rangeKey === key ? 'db-pill--active' : ''}`} onClick={() => setRangeKey(key)}>{label}</button>
            ))}
          </div>
          <div className={`db-fetch-indicator ${isRefetching ? 'db-fetch-indicator--visible' : ''}`}>
            <div className="db-fetch-spinner" />
            <span>Updating…</span>
          </div>
        </div>

        {/* ── Debug panel: shows when attrs don't match expected ── */}
        {process.env.NODE_ENV !== 'production' && initialLoaded && deviceData?.entityId && (
          <details className="db-debug-panel">
            <summary>🔍 Debug: API response for <strong>{deviceData.entityId}</strong></summary>
            <p>Variables received from QuantumLeap: <strong>{attrs.map(a => a.attrName).join(', ') || '(none)'}</strong></p>
            <p>Index length: <strong>{idxFull.length}</strong> | Attributes: <strong>{attrs.length}</strong></p>
            <p>Raw entityId in response: <strong>{deviceData.entityId}</strong> | Selected device: <strong>{pickedDevice}</strong></p>
          </details>
        )}

        {/* ── Summary Strip ── */}
        {attrs.length > 0 && (
          <div className="db-summary-strip">
            {attrs.map((attr, i) => {
              const data = filterData(attr._index, attr.values, filterMode, rangeKey);
              const s = calcStats(data);
              const c = CHART_COLORS[i % CHART_COLORS.length];
              return (
                <div key={attr.attrName} className="db-summary-item">
                  <span style={{ fontSize: 14 }}>{getIcon(attr.attrName, icons)}</span>
                  <div className="db-summary-info">
                    <span className="db-summary-name">{attr.attrName}</span>
                    <span className="db-summary-val" style={{ color: c.line }}>{fmt(s.last)}</span>
                  </div>
                  <Sparkline data={data} color={c} />
                  <span className={`db-summary-trend ${s.trend >= 0 ? 'trend-up' : 'trend-dn'}`}>
                    {s.trend >= 0 ? '↑' : '↓'}{Math.abs(s.trend).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Charts Grid ── */}
        {attrs.length === 0 && initialLoaded ? (
          <div className="db-empty">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <p>No attributes found for this device</p>
          </div>
        ) : initialLoaded ? (
          <div className="db-charts-grid">
            {attrs.map((attr, i) => (
              <ChartCard
                key={attr.attrName}
                attr={attr}
                index={attr._index}
                color={CHART_COLORS[i % CHART_COLORS.length]}
                mode={filterMode}
                rangeKey={rangeKey}
                cardIndex={i}
                icons={icons}
                onExpand={(a, idx, c, data, stats) => setExpanded({ attr: a, index: idx, color: c, data, stats })}
              />
            ))}
          </div>
        ) : null}

        {/* ── Grafana FAB ── */}
        <button className="db-grafana-fab" onClick={() => window.open('http://localhost:3000', '_blank')} title="Open Grafana">
          <InsertChartOutlinedRoundedIcon style={{ fontSize: 18 }} />
          <span className="db-fab-tooltip">Open Grafana</span>
        </button>
      </div>

      {/* ── Expand Modal ── */}
      {expanded && (
        <ExpandModal
          attr={expanded.attr}
          index={expanded.index}
          color={expanded.color}
          mode={filterMode}
          rangeKey={rangeKey}
          prefetchedData={expanded.data}
          prefetchedStats={expanded.stats}
          icons={icons}
          onClose={() => setExpanded(null)}
        />
      )}

      {/* ── Icon Manager Modal ── */}
      {showIconMgr && (
        <IconManagerModal
          knownVars={knownVars}
          icons={icons}
          onSave={handleIconSave}
          onClose={() => setShowIconMgr(false)}
        />
      )}
    </>
  );
}