import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Components
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TopNavBar from './components/shared/TopNavBar/TopNavBar';
import SideNavBar from './components/shared/Navbar/SideNavBar';
import Map from './components/Map/Map';
import Home from './components/Home/Home';
import Admin from './components/Admin/Admin';
import ThreeD from './components/ThreeD/ThreeD';
import Users from './components/Usuarios/Users';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Ecovilla from './components/Ecovilla/Ecovilla';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Main() {
  const [openSideNavBar, setOpenSideNavBar] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TopNavBar
        setOpenSideNavBar={setOpenSideNavBar}
        showLoginButton={showLoginButton}
        setShowLoginButton={setShowLoginButton}
      />
      <SideNavBar openSideNavBar={openSideNavBar} setOpenSideNavBar={setOpenSideNavBar} />
      
      <Routes>
        {/* Home Principal */}
        <Route path="/" element={<Home />} />
        
        {/* ESTA ES LA RUTA CLAVE: Permite que el Dashboard cargue Tars, Moreha, etc. */}
        <Route path="/project/:projectId" element={<Dashboard />} />
        
        {/* Rutas de Herramientas */}
        <Route path="/map" element={<Map />} />
        <Route path="/devices" element={<Admin />} />
        <Route path="/threed" element={<ThreeD />} />
        <Route path="/users" element={<Users />} />
        <Route path="/login" element={<Login setShowLoginButton={setShowLoginButton} />} />
        
        {/* Dashboards Directos */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ecovilla" element={<Ecovilla />} />

        {/* Redirección por si acaso */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default Main;