import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { useDeviceStore, getIcon } from '../../services/devicestore';
import styles from './Map.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const COLOMBIA_CENTER = [6.2424, -75.5894];
const COLOMBIA_ZOOM   = 17;
const DEVICE_ZOOM     = 18;

const META_KEYS = new Set(['id', 'type', 'creationdate', 'location', 'state', 'TimeInstant']);

const STATE_CFG = {
  active:   { color: '#22c55e', label: 'Activo',   pulse: true  },
  inactive: { color: '#f59e0b', label: 'Inactivo', pulse: false },
  damaged:  { color: '#ef4444', label: 'Dañado',   pulse: false },
};
function getStateCfg(s) { return STATE_CFG[s] || STATE_CFG.inactive; }

const PROJECTS_KEY    = 'db_projects_v2';
const PROJECT_MAP_KEY = 'db_device_projects_v1';
const DEFAULT_PROJECTS = [
  { key: 'tars',   label: 'TARS',       emoji: '🏠', color: '#22c55e' },
  { key: 'infver', label: 'Inf. Verdes', emoji: '🌿', color: '#3b82f6' },
];
function loadProjects()   { try { const r = localStorage.getItem(PROJECTS_KEY);    return r ? JSON.parse(r) : DEFAULT_PROJECTS; } catch { return DEFAULT_PROJECTS; } }
function loadProjectMap() { try { const r = localStorage.getItem(PROJECT_MAP_KEY); return r ? JSON.parse(r) : {}; }             catch { return {}; } }

const VAR_COLORS = ['#22c55e','#3b82f6','#8b5cf6','#f43f5e','#f59e0b','#06b6d4','#f97316','#ec4899'];

// ─────────────────────────────────────────────────────────────────────────────
// MARKER ICON
// ── FIX: wrapper div has pointer-events:none so mouse events only fire on
//    the SVG. No CSS transform on hover → no bounding-box shift → no flicker.
//    Pulse animation is pure SVG SMIL — zero DOM interaction.
// ─────────────────────────────────────────────────────────────────────────────

function makeMarkerIcon(state, projectColor, isSelected) {
  const cfg   = getStateCfg(state);
  const color = projectColor || cfg.color;
  const W = 40, H = 52, CX = 20, CY = 19, R = 14;

  const pulseRing = cfg.pulse ? `
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0">
      <animate attributeName="r"       values="${R};${R+16}" dur="2s" begin="0s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0"        dur="2s" begin="0s" repeatCount="indefinite"/>
    </circle>` : '';

  const selectedRing = isSelected ? `
    <circle cx="${CX}" cy="${CY}" r="${R+6}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4"/>` : '';

  const html = `
    <div style="width:${W}px;height:${H}px;pointer-events:none">
      <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
           viewBox="0 0 ${W} ${H}" overflow="visible"
           style="pointer-events:all;cursor:pointer;display:block">
        <defs>
          <filter id="ps${state}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5"
              flood-color="${color}" flood-opacity="0.4"/>
          </filter>
        </defs>
        ${pulseRing}
        ${selectedRing}
        <circle cx="${CX}" cy="${CY}" r="${R}" fill="${color}" filter="url(#ps${state})"/>
        <circle cx="${CX}" cy="${CY}" r="${R-4}" fill="white" opacity="0.2"/>
        <circle cx="${CX}" cy="${CY}" r="4.5" fill="white"/>
        <polygon points="${CX-6},${CY+R-1} ${CX+6},${CY+R-1} ${CX},${H-1}" fill="${color}"/>
      </svg>
    </div>`;

  return new L.DivIcon({
    html,
    className: isSelected ? styles.markerSelected : styles.markerBase,
    iconSize:   [W, H],
    iconAnchor: [W / 2, H],
    popupAnchor:[0, -H],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

function MapController({ flyTarget, fitDevices }) {
  const map = useMap();
  useEffect(() => {
    if (!flyTarget) return;
    map.flyTo(flyTarget.coords, DEVICE_ZOOM, { duration: 1.1, easeLinearity: 0.25 });
  }, [flyTarget]);
  useEffect(() => {
    if (!fitDevices?.length) return;
    const pts = fitDevices
      .map(d => d.location?.value?.coordinates)
      .filter(c => c?.[0] != null)
      .map(c => [c[0], c[1]]);
    if (!pts.length) return;
    if (pts.length === 1) { map.flyTo(pts[0], DEVICE_ZOOM, { duration: 1.1 }); return; }
    const b = L.latLngBounds(pts);
    if (b.isValid()) map.fitBounds(b, { padding: [70, 70], maxZoom: 17, duration: 1.3 });
  }, [fitDevices]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick });
  return null;
}

function MapReady({ mapRef }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE POPUP — React component, positioned by converting lat/lng → px
// ─────────────────────────────────────────────────────────────────────────────

function DevicePopup({ device, variablesData, projectColor, onClose, mapRef }) {
  const { icons } = useDeviceStore();
  const state  = device?.state?.value || 'inactive';
  const cfg    = getStateCfg(state);
  const color  = projectColor || cfg.color;
  const coords = device?.location?.value?.coordinates;
  const [pos, setPos] = useState(null);
  const rafRef = useRef(null);

  const updatePos = useCallback(() => {
    if (!mapRef.current || !coords?.[0]) return;
    const pt = mapRef.current.latLngToContainerPoint([coords[0], coords[1]]);
    setPos({ x: pt.x, y: pt.y });
  }, [coords]);

  useEffect(() => {
    updatePos();
    const map = mapRef.current;
    if (!map) return;
    const handler = () => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(updatePos); };
    map.on('move zoom moveend zoomend', handler);
    return () => { map.off('move zoom moveend zoomend', handler); cancelAnimationFrame(rafRef.current); };
  }, [updatePos]);

  if (!pos) return null;

  const variables = Object.keys(device).filter(k => !META_KEYS.has(k) && device[k]?.value !== undefined);
  const getUnit   = (v) => (Array.isArray(variablesData) && variablesData[0])
    ? (variablesData[0]?.variables?.metadata?.[`${v}Unit`]?.value ?? '') : '';
  const createdAt = device?.creationdate?.value
    ? new Date(device.creationdate.value).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })
    : null;

  return (
    <div className={styles.devicePopup} style={{ '--popup-color': color, left: pos.x, top: pos.y }}>
      <div className={styles.popupArrow} style={{ borderTopColor: color }} />

      {/* Header */}
      <div className={styles.popupHeader} style={{ background: `${color}10`, borderBottom: `1.5px solid ${color}1e` }}>
        <div className={styles.popupHeaderLeft}>
          <span className={styles.popupStateDot} style={{
            background: cfg.color,
            ...(cfg.pulse ? { animation: 'mapPulse 1.8s infinite' } : {}),
          }} />
          <div>
            <div className={styles.popupDeviceId}>{device.id}</div>
            <div className={styles.popupStateLabel} style={{ color: cfg.color }}>{cfg.label}</div>
          </div>
        </div>
        <button className={styles.popupClose} onClick={onClose}>✕</button>
      </div>

      {/* Variables */}
      {variables.length === 0 ? (
        <div className={styles.popupEmpty}><span>📡</span><span>Sin variables registradas</span></div>
      ) : (
        <div className={styles.popupVarsGrid}>
          {variables.map((v, i) => {
            const raw   = device[v]?.value;
            const num   = parseFloat(raw);
            const isNum = !isNaN(num);
            const u     = getUnit(v);
            const c     = VAR_COLORS[i % VAR_COLORS.length];
            return (
              <div key={v} className={styles.popupVarCard} style={{ '--var-color': c }}>
                <div className={styles.popupVarIcon}>{getIcon(v, icons)}</div>
                <div className={styles.popupVarBody}>
                  <span className={styles.popupVarName}>{v}</span>
                  <div className={styles.popupVarValueRow}>
                    <span className={styles.popupVarValue} style={{ color: c }}>
                      {isNum ? num.toFixed(2) : (raw ?? '—')}
                    </span>
                    {u && <span className={styles.popupVarUnit}>{u}</span>}
                  </div>
                </div>
                {isNum && (
                  <div className={styles.popupVarBar}>
                    <div className={styles.popupVarBarFill} style={{ width: `${Math.min(Math.abs(num), 100)}%`, background: c }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {createdAt && (
        <div className={styles.popupFooter}>
          <span className={styles.popupFooterLabel}>Registrado</span>
          <span className={styles.popupFooterVal}>{createdAt}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT BADGE
// ─────────────────────────────────────────────────────────────────────────────

function StatBadge({ count, state }) {
  const cfg = getStateCfg(state);
  return (
    <div className={styles.statBadge} style={{ '--badge-color': cfg.color }}>
      <span className={styles.statDot} style={{ background: cfg.color, ...(cfg.pulse ? { animation: 'mapPulse 1.8s infinite' } : {}) }} />
      <span className={styles.statNum}>{count}</span>
      <span className={styles.statLabel}>{cfg.label}{count !== 1 ? 's' : ''}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE LIST ITEM
// ─────────────────────────────────────────────────────────────────────────────

function DeviceListItem({ device, isSelected, projectColor, onClick }) {
  const state = device?.state?.value || 'inactive';
  const cfg   = getStateCfg(state);
  const coords = device?.location?.value?.coordinates;
  return (
    <button className={`${styles.deviceItem} ${isSelected ? styles.deviceItemActive : ''}`}
      style={{ '--item-color': projectColor || cfg.color }} onClick={onClick}>
      <span className={styles.deviceItemDot}
        style={{ background: cfg.color, ...(cfg.pulse ? { animation: 'mapPulse 1.8s infinite' } : {}) }} />
      <div className={styles.deviceItemInfo}>
        <span className={styles.deviceItemId}>{device.id}</span>
        <span className={styles.deviceItemCoords}>
          {coords ? `${parseFloat(coords[0]).toFixed(4)}, ${parseFloat(coords[1]).toFixed(4)}` : 'Sin coords'}
        </span>
      </div>
      <span className={styles.deviceItemState} style={{ color: cfg.color, background: `${cfg.color}14` }}>{cfg.label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function Map() {
  const token      = localStorage.getItem('access_token') || '';
  const projects   = useMemo(loadProjects,   []);
  const projectMap = useMemo(loadProjectMap, []);
  const mapRef     = useRef(null);

  const [selectedId,   setSelectedId]   = useState(null);
  const [flyTarget,    setFlyTarget]    = useState(null);
  const [activeProj,   setActiveProj]   = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [panelOpen,    setPanelOpen]    = useState(true);
  const [fitRequested, setFitRequested] = useState(null);

  const { isPending: loadingDevices, data: entities = [] } = useQuery({
    queryKey: ['map-entities'],
    queryFn: () => fetch('/v2/entities?type=device', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    refetchInterval: 15000,
  });

  const { data: variablesData } = useQuery({
    queryKey: ['map-variableData'],
    queryFn: () => fetch('/v2/entities?id=variablelist', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  });

  const filtered = useMemo(() => {
    if (!Array.isArray(entities)) return [];
    return entities.filter(d => {
      if (!d?.location?.value?.coordinates) return false;
      return (activeProj === 'all' || projectMap[d.id] === activeProj)
          && (!searchQuery || d.id.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [entities, activeProj, searchQuery, projectMap]);

  const selectedDevice = useMemo(() => filtered.find(d => d.id === selectedId) || null, [filtered, selectedId]);

  const stats = useMemo(() => {
    const c = { active: 0, inactive: 0, damaged: 0 };
    filtered.forEach(d => { const s = d?.state?.value || 'inactive'; if (c[s] !== undefined) c[s]++; });
    return c;
  }, [filtered]);

  const getProjectColor = useCallback((id) => {
    const p = projects.find(p => p.key === projectMap[id]);
    return p?.color || null;
  }, [projectMap, projects]);

  const selectDevice = useCallback((device) => {
    const coords = device?.location?.value?.coordinates;
    setSelectedId(prev => prev === device.id ? null : device.id);
    if (coords?.[0]) setFlyTarget({ coords: [coords[0], coords[1]], ts: Date.now() });
  }, []);

  const closePopup = useCallback(() => setSelectedId(null), []);
  const fitAll     = useCallback(() => { setSelectedId(null); setFitRequested({ devices: filtered, ts: Date.now() }); }, [filtered]);

  return (
    <section className={styles.wrapper}>

      {loadingDevices && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Cargando dispositivos…</span>
        </div>
      )}

      <MapContainer center={COLOMBIA_CENTER} zoom={COLOMBIA_ZOOM} className={styles.mapContainer} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd" maxZoom={20}
        />
        <MapReady mapRef={mapRef} />
        <MapController flyTarget={flyTarget} fitDevices={fitRequested?.devices} />
        <MapClickHandler onMapClick={closePopup} />

        {filtered.map(device => {
          const coords = device.location?.value?.coordinates;
          if (!coords?.[0]) return null;
          return (
            <Marker
              key={device.id}
              position={[coords[0], coords[1]]}
              icon={makeMarkerIcon(device?.state?.value || 'inactive', getProjectColor(device.id), device.id === selectedId)}
              eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); selectDevice(device); } }}
            />
          );
        })}
      </MapContainer>

      {/* React popup — rendered outside Leaflet DOM */}
      {selectedDevice && mapRef.current && (
        <DevicePopup
          device={selectedDevice}
          variablesData={variablesData}
          projectColor={getProjectColor(selectedDevice.id)}
          onClose={closePopup}
          mapRef={mapRef}
        />
      )}

      {/* HUD top bar */}
      <div className={styles.hudTopBar}>
        <div className={styles.hudBrand}>
          <span className={styles.hudBrandDot} />
          <span className={styles.hudBrandName}>Mapa de monitoreo</span>
        </div>
        <div className={styles.hudStats}>
          <StatBadge count={stats.active}   state="active"   />
          <StatBadge count={stats.inactive} state="inactive" />
          {stats.damaged > 0 && <StatBadge count={stats.damaged} state="damaged" />}
          <span className={styles.hudTotal}>{filtered.length} total</span>
        </div>
      </div>

      {/* Panel toggle */}
      <button className={`${styles.panelToggle} ${panelOpen ? styles.panelToggleOpen : ''}`} onClick={() => setPanelOpen(v => !v)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d={panelOpen ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
        </svg>
      </button>

      {/* Side panel */}
      <aside className={`${styles.sidePanel} ${panelOpen ? styles.sidePanelOpen : ''}`}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className={styles.searchInput} placeholder="Buscar dispositivo…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && <button className={styles.searchClear} onClick={() => setSearchQuery('')}>✕</button>}
        </div>

        <div className={styles.projectTabs}>
          <button className={`${styles.projTab} ${activeProj === 'all' ? styles.projTabActive : ''}`}
            style={activeProj === 'all' ? { '--tab-color': '#22c55e' } : {}} onClick={() => setActiveProj('all')}>
            🌐 Todos
          </button>
          {projects.map(p => (
            <button key={p.key} className={`${styles.projTab} ${activeProj === p.key ? styles.projTabActive : ''}`}
              style={activeProj === p.key ? { '--tab-color': p.color } : {}} onClick={() => setActiveProj(p.key)}>
              {p.emoji} {p.label}
            </button>
          ))}
        </div>

        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>{filtered.length} dispositivo{filtered.length !== 1 ? 's' : ''}</span>
          <button className={styles.fitAllBtn} onClick={fitAll}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3l7 7M3 21l7-7M21 3l-7 7M21 21l-7-7"/></svg>
            Centrar
          </button>
        </div>

        <div className={styles.deviceList}>
          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📡</span>
              <span className={styles.emptyText}>{searchQuery ? 'Sin resultados' : 'Sin dispositivos'}</span>
            </div>
          )}
          {filtered.map((device, idx) => (
            <div key={device.id} className={styles.deviceItemWrap} style={{ animationDelay: `${idx * 35}ms` }}>
              <DeviceListItem device={device} isSelected={selectedId === device.id}
                projectColor={getProjectColor(device.id)} onClick={() => selectDevice(device)} />
            </div>
          ))}
        </div>

        <div className={styles.panelFooter}>
          <span className={styles.panelFooterDot} />
          <span className={styles.panelFooterText}>Actualización cada 15s</span>
        </div>
      </aside>

      {/* Zoom controls */}
      <div className={styles.zoomControls}>
        <button className={styles.zoomBtn} onClick={() => mapRef.current?.zoomIn()}>+</button>
        <div className={styles.zoomDivider} />
        <button className={styles.zoomBtn} onClick={() => mapRef.current?.zoomOut()}>−</button>
      </div>

      {/* Reset */}
      <button className={styles.resetBtn}
        onClick={() => { setSelectedId(null); setFitRequested({ devices: filtered, ts: Date.now() }); }}>
        🇨🇴 <span className={styles.resetBtnLabel}>Ver todos</span>
      </button>

    </section>
  );
}