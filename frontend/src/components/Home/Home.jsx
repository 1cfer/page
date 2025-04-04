import React, { useEffect, useState } from 'react';
import './Home.css';
import homeImage from './home1.png';
import homeImage2 from './image2.png';
import { NavLink } from 'react-router-dom';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';


const Home = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica si el token está en localStorage
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(token !== null); // Establece si el usuario está logueado
  }, []);

  return (
    <div className="home-container">
      {/* Sección 1 */}
      <section className="section1">
        <div className="section1-content">
          <h1 className="title">Monitoreo Inteligente para un<br /> Envejecimiento Saludable</h1>
          <p className="description">AgeVital+ utiliza tecnología IoT para monitorear<br /> tu salud física y mental en tiempo real.</p>
          {/* Solo muestra el botón "Ingresar" si el usuario no está logueado */}
          {!isAuthenticated && (
            <NavLink to="/login">
              <button className="enter-button">Ingresar</button>
            </NavLink>
          )}
        </div>
        <img src={homeImage} alt="Imagen principal" className="section1-image" />
      </section>

      {/* Sección 2 */}
      <section className="section2">
        <div className="benefits">
          <h1 className="subtitle">Beneficios Clave</h1>
          <p className="text">AgeVital+ conecta sensores no invasivos en el hogar para recopilar datos sobre la salud física y el ambiente. Estos datos son analizados en tiempo real para detectar cualquier anomalía, permitiendo que los usuarios y cuidadores tomen decisiones informadas.</p>
        </div>
        <div className="icons-section">
          <div className="icon-item">
            <AccessTimeFilledRoundedIcon className="icon" />
            <div className="icon-text">
              <h3>Monitoreo en Tiempo Real</h3>
              <p>Supervisión continua de tu salud.</p>
            </div>
          </div>
          <div className="icon-item">
            <FavoriteRoundedIcon className="icon" />
            <div className="icon-text">
              <h3>Detección Temprana</h3>
              <p>Identificación de riesgos cardiovasculares.</p>
            </div>
          </div>
          <div className="icon-item">
            <StarRoundedIcon className="icon" />
            <div className="icon-text">
              <h3>Fácil de Usar</h3>
              <p>Accesible para personas mayores y cuidadores.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de imágenes */}
      <section className="images-section">
        <img src={homeImage2} alt="Imagen ilustrativa" />
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 AgeVital+</p>
        <nav>
          <a href="#terms">Terms of Service</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#cookies">Cookies</a>
        </nav>
      </footer>
    </div>
  );
};

export default Home;
