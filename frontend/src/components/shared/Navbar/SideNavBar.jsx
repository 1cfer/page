import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Box            from '@mui/material/Box';
import Drawer         from '@mui/material/Drawer';
import List           from '@mui/material/List';
import Toolbar        from '@mui/material/Toolbar';
import ListItem       from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon   from '@mui/material/ListItemIcon';
import ListItemText   from '@mui/material/ListItemText';
import PropTypes      from 'prop-types';

import HomeRoundedIcon               from '@mui/icons-material/HomeRounded';
import QueryStatsRoundedIcon         from '@mui/icons-material/QueryStatsRounded';
import PlaceRoundedIcon              from '@mui/icons-material/PlaceRounded';
import ViewInArRoundedIcon           from '@mui/icons-material/ViewInArRounded';
import DashboardRoundedIcon          from '@mui/icons-material/DashboardRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LogoutRoundedIcon             from '@mui/icons-material/LogoutRounded';
import LoginRoundedIcon              from '@mui/icons-material/LoginRounded';
import PersonRoundedIcon             from '@mui/icons-material/PersonRounded';
import ShieldRoundedIcon             from '@mui/icons-material/ShieldRounded';
import TuneRoundedIcon               from '@mui/icons-material/TuneRounded';
import StorageRoundedIcon            from '@mui/icons-material/StorageRounded';
import BarChartRoundedIcon           from '@mui/icons-material/BarChartRounded';
import MemoryRoundedIcon             from '@mui/icons-material/MemoryRounded';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getRole()     { return localStorage.getItem('userRole')  || null; }
function getUserName() {
  return localStorage.getItem('username') || localStorage.getItem('userEmail') || null;
}

const DRAWER_WIDTH = 272;

// ─────────────────────────────────────────────────────────────────────────────
// NAV STRUCTURE — all routes are fully public
// ─────────────────────────────────────────────────────────────────────────────

const NAV_MAIN = [
  { label: 'Inicio',       path: '/',          icon: <HomeRoundedIcon />          },
  { label: 'Dispositivos', path: '/devices',   icon: <QueryStatsRoundedIcon />    },
  { label: 'Mapa',         path: '/map',       icon: <PlaceRoundedIcon />         },
  { label: '3D',           path: '/threed',    icon: <ViewInArRoundedIcon />      },
  { label: 'Dashboard',    path: '/dashboard', icon: <DashboardRoundedIcon />     },
];

// Shown only when role === 'admin'
const NAV_ADMIN = [
  { label: 'Panel Admin', path: '/admin',     icon: <TuneRoundedIcon />,               desc: 'Gestión de dispositivos'  },
  { label: 'Grafana',     path: null,         icon: <BarChartRoundedIcon />,           desc: 'Métricas avanzadas',  ext: 'http://localhost:3000' },
  { label: 'CrateDB',     path: null,         icon: <StorageRoundedIcon />,            desc: 'Base de datos',       ext: 'http://localhost:4200' },
  { label: 'Orion API',   path: null,         icon: <MemoryRoundedIcon />,             desc: 'Context Broker',      ext: 'http://localhost:1026/version' },
  { label: 'Keyrock IDM', path: null,         icon: <AdminPanelSettingsRoundedIcon />, desc: 'Identity Manager',    ext: 'http://localhost:7000' },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROLE CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_CFG = {
  admin:     { label: 'Administrador', color: '#16a34a', bg: 'rgba(22,163,74,0.10)',  dot: '#22c55e' },
  user:      { label: 'Usuario',       color: '#2563eb', bg: 'rgba(37,99,235,0.10)',  dot: '#3b82f6' },
  orionUser: { label: 'Usuario',       color: '#2563eb', bg: 'rgba(37,99,235,0.10)',  dot: '#3b82f6' },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function NavItem({ label, path, icon, isActive, delay, onNavigate, ext }) {
  const handleClick = () => {
    if (ext) { window.open(ext, '_blank'); return; }
    if (path) onNavigate(path);
  };

  return (
    <ListItem disablePadding sx={{ mb: '2px' }}>
      <ListItemButton
        onClick={handleClick}
        sx={{
          borderRadius: '13px',
          py: '9px', px: '13px',
          background: isActive
            ? 'linear-gradient(135deg,rgba(34,197,94,0.13),rgba(134,239,172,0.06))'
            : 'transparent',
          border: isActive ? '1.5px solid rgba(34,197,94,0.22)' : '1.5px solid transparent',
          animation: `snbSlide 320ms ${delay}ms cubic-bezier(0.34,1.56,0.64,1) both`,
          transition: 'background 180ms, border-color 180ms, transform 180ms, box-shadow 180ms',
          '&:hover': {
            background: isActive
              ? 'linear-gradient(135deg,rgba(34,197,94,0.18),rgba(134,239,172,0.10))'
              : 'rgba(34,197,94,0.055)',
            transform: 'translateX(4px)',
            boxShadow: isActive ? '0 4px 18px rgba(34,197,94,0.13)' : 'none',
          },
          '&:active': { transform: 'translateX(2px) scale(0.99)' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 34, color: isActive ? '#16a34a' : '#94a3b8', transition: 'color 180ms', '& svg': { fontSize: 19 } }}>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: isActive ? 700 : 500,
            fontSize: '13.5px',
            color: isActive ? '#15803d' : '#475569',
            letterSpacing: '-0.01em',
          }}
        />
        {isActive && (
          <Box sx={{ width: 3, height: 16, borderRadius: '99px', flexShrink: 0, background: 'linear-gradient(180deg,#22c55e,#16a34a)', boxShadow: '0 0 8px rgba(34,197,94,0.45)' }} />
        )}
      </ListItemButton>
    </ListItem>
  );
}

function AdminNavItem({ label, path, icon, isActive, delay, desc, onNavigate, ext }) {
  const handleClick = () => {
    if (ext) { window.open(ext, '_blank'); return; }
    if (path) onNavigate(path);
  };

  return (
    <ListItem disablePadding sx={{ mb: '2px' }}>
      <ListItemButton
        onClick={handleClick}
        sx={{
          borderRadius: '13px',
          py: '8px', px: '13px',
          background: isActive
            ? 'linear-gradient(135deg,rgba(34,197,94,0.13),rgba(22,163,74,0.06))'
            : 'rgba(248,250,252,0.6)',
          border: isActive ? '1.5px solid rgba(34,197,94,0.25)' : '1.5px solid rgba(241,245,249,0.8)',
          animation: `snbSlide 320ms ${delay}ms cubic-bezier(0.34,1.56,0.64,1) both`,
          transition: 'all 180ms',
          '&:hover': {
            background: isActive ? 'linear-gradient(135deg,rgba(34,197,94,0.18),rgba(22,163,74,0.08))' : 'rgba(34,197,94,0.06)',
            transform: 'translateX(4px)',
            borderColor: 'rgba(34,197,94,0.22)',
          },
          '&:active': { transform: 'translateX(2px) scale(0.99)' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 34, color: isActive ? '#16a34a' : '#64748b', '& svg': { fontSize: 17 } }}>
          {icon}
        </ListItemIcon>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600, fontSize: '13px', color: isActive ? '#15803d' : '#334155', lineHeight: 1.2 }}>
            {label}
          </Box>
          {desc && (
            <Box sx={{ fontFamily: '"DM Sans",sans-serif', fontSize: '10.5px', color: '#94a3b8', mt: '1px' }}>
              {desc}
            </Box>
          )}
        </Box>
        {isActive && (
          <Box sx={{ width: 3, height: 16, borderRadius: '99px', flexShrink: 0, background: 'linear-gradient(180deg,#22c55e,#16a34a)', boxShadow: '0 0 8px rgba(34,197,94,0.45)' }} />
        )}
        {ext && (
          <Box sx={{ fontSize: '9px', fontFamily: '"DM Mono",monospace', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '5px', px: '4px', py: '1px', ml: '4px', flexShrink: 0 }}>
            ↗
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  );
}

function SectionLabel({ children }) {
  return (
    <Box sx={{ px: '16px', pt: '10px', pb: '4px', fontFamily: '"DM Mono", monospace', fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', userSelect: 'none' }}>
      {children}
    </Box>
  );
}

function Sep() {
  return <Box sx={{ mx: '16px', my: '8px', height: '1px', background: 'rgba(34,197,94,0.09)' }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SideNavBar({ openSideNavBar, setOpenSideNavBar }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const role      = useMemo(getRole,     [openSideNavBar]);
  const userName  = useMemo(getUserName, [openSideNavBar]);
  const isLoggedIn = !!role;
  const isAdmin    = role === 'admin';
  const roleCfg    = role ? (ROLE_CFG[role] || ROLE_CFG.user) : null;
  const avatarChar = userName ? userName.charAt(0).toUpperCase() : null;

  const handleNav = (path) => { navigate(path); setOpenSideNavBar(false); };

  // ── Same Keyrock OAuth2 flow as TopNavBar ─────────────────────────────────
  const handleLogin = () => {
    localStorage.setItem('returnTo', window.location.pathname);
    const clientId   = import.meta.env.VITE_CLIENT_ID;
    const keyrockURL = 'http://localhost:7000/oauth2/authorize';
    const uri        = encodeURIComponent('http://localhost:5173');
    window.location.href = `${keyrockURL}?response_type=code&client_id=${clientId}&redirect_uri=${uri}&state=xyz`;
    setOpenSideNavBar(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    navigate('/');
    window.location.reload();
    setOpenSideNavBar(false);
  };

  const content = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Top radial glow */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 30% 0%,rgba(34,197,94,0.08) 0%,transparent 70%)' }} />

      <Toolbar sx={{ minHeight: '56px !important' }} />

      {/* ── Brand ── */}
      <Box sx={{ px: 2, pt: 0.5, pb: 1.5, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '11px', flexShrink: 0, background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34,197,94,0.28)' }}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
              <path d="M5 17 Q12 5 19 17" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="12" cy="17" r="2.2" fill="#fff"/>
            </svg>
          </Box>
          <Box>
            <Box sx={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 800, fontSize: '15px', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>AgeVital+</Box>
            <Box sx={{ fontFamily: '"DM Mono",monospace', fontSize: '9px', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>IoT Platform</Box>
          </Box>
        </Box>
        <Box sx={{ mt: 1.5, height: '2px', borderRadius: '99px', background: 'linear-gradient(90deg,#22c55e,#86efac,transparent)' }} />
      </Box>

      {/* ── User card ── */}
      <Box sx={{ mx: 2, mb: 1.5, borderRadius: '14px', border: isLoggedIn ? `1.5px solid ${roleCfg?.color}28` : '1.5px solid rgba(203,213,225,0.5)', background: isLoggedIn ? roleCfg?.bg : 'rgba(248,250,252,0.8)', p: '10px 12px', display: 'flex', alignItems: 'center', gap: 1.2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0, background: isLoggedIn ? `linear-gradient(135deg,${roleCfg?.color},${roleCfg?.dot})` : 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans",sans-serif', fontWeight: 800, fontSize: '15px', color: '#fff', boxShadow: isLoggedIn ? `0 3px 10px ${roleCfg?.color}38` : 'none' }}>
          {isLoggedIn ? (avatarChar || <PersonRoundedIcon sx={{ fontSize: 18, color: '#fff' }} />) : <PersonRoundedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isLoggedIn ? (userName || 'Usuario') : 'Invitado'}
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', mt: '2px', px: '6px', py: '1.5px', borderRadius: '99px', background: isLoggedIn ? `${roleCfg?.color}16` : 'rgba(148,163,184,0.10)', border: `1px solid ${isLoggedIn ? roleCfg?.color + '28' : 'rgba(148,163,184,0.18)'}` }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: isLoggedIn ? roleCfg?.dot : '#94a3b8', ...(isLoggedIn && { animation: 'snbPulse 2.2s infinite' }) }} />
            <Box sx={{ fontFamily: '"DM Mono",monospace', fontSize: '9px', fontWeight: 700, color: isLoggedIn ? roleCfg?.color : '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {isLoggedIn ? roleCfg?.label : 'Sin sesión'}
            </Box>
          </Box>
        </Box>
        {isAdmin && (
          <Box sx={{ width: 24, height: 24, borderRadius: '7px', flexShrink: 0, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldRoundedIcon sx={{ fontSize: 14, color: '#16a34a' }} />
          </Box>
        )}
      </Box>

      {/* Admin banner */}
      {isAdmin && (
        <Box sx={{ mx: 2, mb: 1, borderRadius: '12px', p: '9px 12px', background: 'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(22,163,74,0.04))', border: '1.5px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', gap: 1, animation: 'snbSlide 350ms 60ms cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <AdminPanelSettingsRoundedIcon sx={{ fontSize: 14, color: '#16a34a', flexShrink: 0 }} />
          <Box sx={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: '11px', color: '#15803d' }}>Modo administrador activo</Box>
        </Box>
      )}

      <Sep />

      {/* ── Main nav ── */}
      <SectionLabel>Navegación</SectionLabel>
      <List sx={{ px: 1.5, pt: 0, pb: 0, position: 'relative', zIndex: 1 }}>
        {NAV_MAIN.map(({ label, path, icon }, idx) => (
          <NavItem key={label} label={label} path={path} icon={icon} isActive={location.pathname === path} delay={idx * 45} onNavigate={handleNav} />
        ))}
      </List>

      {/* ── Admin tools ── */}
      {isAdmin && (
        <>
          <Sep />
          <SectionLabel>Herramientas</SectionLabel>
          <List sx={{ px: 1.5, pt: 0, pb: 0, position: 'relative', zIndex: 1 }}>
            {NAV_ADMIN.map(({ label, path, icon, desc, ext }, idx) => (
              <AdminNavItem key={label} label={label} path={path} icon={icon} desc={desc} ext={ext} isActive={!!path && location.pathname === path} delay={(NAV_MAIN.length + idx) * 40} onNavigate={handleNav} />
            ))}
          </List>
        </>
      )}

      <Box sx={{ flex: 1 }} />

      {/* ── Footer ── */}
      <Box sx={{ px: 2, pt: 1.5, pb: 2, borderTop: '1px solid rgba(34,197,94,0.09)', position: 'relative', zIndex: 1 }}>
        {isLoggedIn ? (
          <Box component="button" onClick={handleLogout} sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', py: '9px', borderRadius: '11px', border: 'none', background: 'rgba(239,68,68,0.07)', color: '#dc2626', fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 180ms, transform 180ms', '&:hover': { background: 'rgba(239,68,68,0.13)', transform: 'scale(1.01)' }, '&:active': { transform: 'scale(0.98)' } }}>
            <LogoutRoundedIcon sx={{ fontSize: 16 }} />
            Cerrar sesión
          </Box>
        ) : (
          <Box component="button" onClick={handleLogin} sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', py: '10px', borderRadius: '11px', border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.30)', transition: 'transform 180ms, box-shadow 180ms', '&:hover': { transform: 'scale(1.02)', boxShadow: '0 6px 20px rgba(34,197,94,0.38)' }, '&:active': { transform: 'scale(0.98)' } }}>
            <LoginRoundedIcon sx={{ fontSize: 16 }} />
            Iniciar sesión
          </Box>
        )}

        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.22)', animation: 'snbPulse 2.4s infinite' }} />
          <Box sx={{ fontFamily: '"DM Mono",monospace', fontSize: '9px', color: '#94a3b8', letterSpacing: '0.06em' }}>SISTEMA OPERATIVO · v2.0</Box>
        </Box>
      </Box>

      <style>{`
        @keyframes snbSlide { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes snbPulse  { 0%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 70%{box-shadow:0 0 0 5px rgba(34,197,94,0)} 100%{box-shadow:0 0 0 0 rgba(34,197,94,0)} }
      `}</style>
    </Box>
  );

  return (
    <Drawer open={openSideNavBar} onClose={() => setOpenSideNavBar(false)}
      PaperProps={{ sx: { width: DRAWER_WIDTH, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px) saturate(1.6)', borderRight: '1px solid rgba(34,197,94,0.10)', boxShadow: '6px 0 48px rgba(0,0,0,0.07)', overflow: 'hidden' } }}>
      {content}
    </Drawer>
  );
}

SideNavBar.propTypes = {
  openSideNavBar:    PropTypes.bool.isRequired,
  setOpenSideNavBar: PropTypes.func.isRequired,
};