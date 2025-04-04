// Servicio para cambiar la contraseña
export const changePassword = async (userId, newPassword, token) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/auth/change_password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // El token JWT para autenticar la solicitud
        },
        body: JSON.stringify({
          user_id: userId,
          new_password: newPassword,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al cambiar la contraseña: ${response.status} - ${errorText}`);
        throw new Error(`Error al cambiar la contraseña: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      return data; // Devuelve la respuesta, por ejemplo, un mensaje de éxito
    } catch (error) {
      console.error("Error en changePassword:", error);
      throw error;
    }
  };
  