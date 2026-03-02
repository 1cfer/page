import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';

import HomeIcon from '@mui/icons-material/Home';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PlaceIcon from '@mui/icons-material/Place';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';

const NAV_ITEMS = [
  { label: 'Home',      path: '/',         icon: <HomeIcon /> },
  { label: 'Devices',   path: '/devices',  icon: <QueryStatsIcon /> },
  { label: 'Location',  path: '/map',      icon: <PlaceIcon /> },
  { label: '3D',        path: '/threed',   icon: <ViewInArRoundedIcon /> },
  { label: 'Dashboard', path: '/dashboard',icon: <DashboardRoundedIcon /> },
];

export default function SideNavBar({ openSideNavBar, setOpenSideNavBar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const DrawerList = (
    <Box
      sx={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}
      role="presentation"
      onClick={() => setOpenSideNavBar(false)}
    >
      <Toolbar />

      {/* Brand accent strip */}
      <Box sx={{
        mx: 2,
        mb: 1,
        height: 3,
        borderRadius: '99px',
        background: 'linear-gradient(90deg, #22c55e, #86efac)',
      }} />

      <Divider sx={{ borderColor: 'rgba(34,197,94,0.12)' }} />

      <List sx={{ pt: 2, px: 1.5, flex: 1 }}>
        {NAV_ITEMS.map(({ label, path, icon }, idx) => {
          const isActive = location.pathname === path;
          return (
            <ListItem key={label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(path)}
                sx={{
                  borderRadius: '14px',
                  py: 1.2,
                  px: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(134,239,172,0.08))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                  animation: `slideIn 300ms ${idx * 50}ms cubic-bezier(0.34,1.56,0.64,1) both`,
                  '@keyframes slideIn': {
                    from: { opacity: 0, transform: 'translateX(-12px)' },
                    to:   { opacity: 1, transform: 'translateX(0)' },
                  },
                  transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease',
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(134,239,172,0.1))'
                      : 'rgba(34,197,94,0.06)',
                    transform: 'translateX(3px)',
                    boxShadow: isActive ? '0 4px 16px rgba(34,197,94,0.15)' : 'none',
                  },
                  '&:active': { transform: 'translateX(1px) scale(0.98)' },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 38,
                  color: isActive ? '#16a34a' : '#94a3b8',
                  transition: 'color 200ms ease',
                  '& svg': { fontSize: 20 },
                }}>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '14px',
                    color: isActive ? '#15803d' : '#475569',
                    transition: 'color 200ms ease, font-weight 200ms ease',
                    letterSpacing: isActive ? '-0.01em' : '0',
                  }}
                />
                {isActive && (
                  <Box sx={{
                    width: 4,
                    height: 20,
                    borderRadius: '99px',
                    background: 'linear-gradient(180deg, #22c55e, #16a34a)',
                    flexShrink: 0,
                    boxShadow: '0 0 8px rgba(34,197,94,0.4)',
                  }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{
        px: 2.5,
        py: 2,
        borderTop: '1px solid rgba(34,197,94,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        <Box sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#22c55e',
          boxShadow: '0 0 6px rgba(34,197,94,0.6)',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%':  { boxShadow: '0 0 0 0 rgba(34,197,94,0.5)' },
            '70%': { boxShadow: '0 0 0 6px rgba(34,197,94,0)' },
            '100%':{ boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
          },
        }} />
        <Box sx={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#94a3b8', letterSpacing: '0.05em' }}>
          AgeVital+ IoT Platform
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      open={openSideNavBar}
      onClose={() => setOpenSideNavBar(false)}
      PaperProps={{
        sx: {
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(34,197,94,0.12)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.08)',
        },
      }}
    >
      {DrawerList}
    </Drawer>
  );
}

SideNavBar.propTypes = {
  openSideNavBar: PropTypes.bool.isRequired,
  setOpenSideNavBar: PropTypes.func.isRequired,
};