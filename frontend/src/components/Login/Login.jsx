import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from '../../services/loginUser';  // Asegúrate de que la ruta sea correcta
import "./Login.css";
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';  // Importar SweetAlert2

function Login({setShowLoginButton}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const token = await loginUser(email, password);
    if (token) {
      // Guardar el token en localStorage
      localStorage.setItem("access_token", token);
  
      // Decodificar el token para obtener el rol
      const decodedToken = jwtDecode(token);
      const role = decodedToken.role;  // Accede al rol en los claims adicionales
  
      // Guardar el rol en localStorage
      localStorage.setItem("user_role", role);

      navigate("/");
      window.location.reload();
    } else {
      // Mostrar alerta si las credenciales son incorrectas
      Swal.fire({
        icon: 'error',
        title: 'Credenciales Incorrectas',
        text: 'Por favor, inténtalo de nuevo.',
      });
    }
  };

  return (
    <div className="login-container">
      <button className="back-button" onClick={() => {
        navigate('/');
        setShowLoginButton(true);
      }}>
        <ExitToAppRoundedIcon />
      </button>
      <div className="login-form">
        <h2>Inicio de Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electronico</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
