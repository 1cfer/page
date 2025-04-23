import { useState } from "react";
import { Route, Routes } from "react-router-dom";

//Components
import TopNavBar from "./components/shared/TopNavBar/TopNavBar";
import SideNavBar from "./components/shared/Navbar/SideNavBar";
import Mapa from "./components/Mapa/Mapa";
import Home from "./components/Home/Home";
import Admin from "./components/Admin/Admin";
import ThreeD from "./components/ThreeD/ThreeD";
import Usuarios from "./components/Usuarios/Usuarios";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import Ecovilla from "./components/Ecovilla/Ecovilla";


function Main() {

  const [openSideNavBar, setOpenSideNavBar] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(true);

  return (
    <>
      <TopNavBar setOpenSideNavBar={setOpenSideNavBar} showLoginButton={showLoginButton} setShowLoginButton={setShowLoginButton} />
      <SideNavBar openSideNavBar={openSideNavBar} setOpenSideNavBar={setOpenSideNavBar} />
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/mapa" exact element={<Mapa />} />
        <Route path="/admin" exact element={<Admin />} />
        <Route path="/threed" exact element={<ThreeD />} />
        <Route path="/usuarios" exact element={<Usuarios />} />
        <Route path="/login" exact element={<Login setShowLoginButton={setShowLoginButton}/>} />
        <Route path="/dashboard" exact element={<Dashboard />} />
        <Route path="/ecovilla" exact element={<Ecovilla />} />
      </Routes>
    </>
  );
}

export default Main;
