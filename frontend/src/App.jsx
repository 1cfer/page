import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

// Components
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TopNavBar from './components/shared/TopNavBar/TopNavBar';
import SideNavBar from './components/shared/Navbar/SideNavBar';
import Map from './components/Map/Map';
import Home from './components/Home/Home';
import Admin from './components/Admin/Admin';
import Admin2 from './components/Admin/Admin2';
import ThreeD from './components/ThreeD/ThreeD';
import Users from './components/Usuarios/Users';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Ecovilla from './components/Ecovilla/Ecovilla';

const queryClient = new QueryClient();

function Main() {
  const [openSideNavBar, setOpenSideNavBar] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(true);
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  return (
    <QueryClientProvider client={queryClient}>
      <TopNavBar
        setOpenSideNavBar={setOpenSideNavBar}
        showLoginButton={showLoginButton}
        setShowLoginButton={setShowLoginButton}
      />
      <SideNavBar openSideNavBar={openSideNavBar} setOpenSideNavBar={setOpenSideNavBar} />
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/map" exact element={<Map />} />
        <Route path="/devices" exact element={<Admin2 />} />
        <Route path="/threed" exact element={<ThreeD />} />
        {isAdmin && <Route path="/users" exact element={<Users />} />}
        <Route path="/login" exact element={<Login setShowLoginButton={setShowLoginButton} />} />
        <Route path="/dashboard" exact element={<Dashboard />} />
        <Route path="/ecovilla" exact element={<Ecovilla />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default Main;
