import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

// Styles
import styles from './Navbar.module.css';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PlaceIcon from '@mui/icons-material/Place';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SensorOccupiedRoundedIcon from '@mui/icons-material/SensorOccupiedRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);

      // Decodificar el token para obtener el rol
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (!isAuthenticated) return null;

  // Si estamos en la página de login, no mostrar el navbar
  if (location.pathname === '/login') return null;

  // Función para cerrar sesión
  const handleLogout = () => {
    // Eliminar el token y el rol del almacenamiento local
    localStorage.removeItem('access_token');

    // Redirigir al usuario a la página de login
    navigate('/');
    window.location.reload();
  };

  return (
    <header className={styles.Wrapper}>
      <nav className={styles.Nav}>
        <NavLink to={'/'}>
          <HomeIcon className={styles.Icon} />
        </NavLink>
        <NavLink to={'/admin'}>
          <QueryStatsIcon className={styles.Icon} />
        </NavLink>
        <NavLink to={'/mapa'}>
          <PlaceIcon className={styles.Icon} />
        </NavLink>
        <NavLink to={'/tresd'}>
          <ViewInArRoundedIcon className={styles.Icon} />
        </NavLink>

        {/* Mostrar el botón "usuarios" solo si el rol es "admin" */}
        {userRole === "admin" && (
          <NavLink to={"/usuarios"}>
            <SensorOccupiedRoundedIcon className={styles.Icon} />
          </NavLink>
        )}


        <NavLink to={'/dashboard'}>
          <DashboardRoundedIcon className={styles.Icon} />
        </NavLink>




        <ExitToAppIcon
          className={styles.Exit}
          onClick={() => {
            const confirmButtonColor = getComputedStyle(document.documentElement).getPropertyValue('--color-principal').trim()
            Swal.fire({
              title: '¿Estás seguro de que deseas cerrar sesión?',
              text: "No podrás acceder a tu cuenta hasta que inicies sesión nuevamente.",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: confirmButtonColor,
              cancelButtonColor: '#d33',
              confirmButtonText: 'Sí, cerrar sesión',
              cancelButtonText: 'Cancelar'
            }).then((result) => {
              if (result.isConfirmed) {
                handleLogout();
              }
            });
          }}
        />
      </nav>
    </header>
  );
};

export default Navbar;
