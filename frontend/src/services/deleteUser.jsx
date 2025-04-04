export const deleteUser = async (userId, token) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/auth/delete_user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Incluye el token en el encabezado de autorización
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error al eliminar el usuario: ${response.statusText}`);
      }
  
      const result = await response.json();
      return result; // Devolverá el mensaje de éxito o el error
    } catch (error) {
      console.error("Error en deleteUser:", error);
    }
  };