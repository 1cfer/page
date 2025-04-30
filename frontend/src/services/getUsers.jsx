export default async function getUsers() {
  try {
    const response = await fetch('http://127.0.0.1:5000/auth/users');
    if (!response.ok) {
      throw new Error(`Error al obtener los datos: ${response.statusText}`);
    }
    const usersData = await response.json();
    return usersData;
  } catch (error) {
    console.error('Error en getTrialData:', error);
  }
}
