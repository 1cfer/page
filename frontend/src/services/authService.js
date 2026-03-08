/**
 * authService.js — Maneja la autenticación OAuth2 con Keyrock
 * Sin redirigir al usuario a Keyrock
 */

export const loginDirectly = async ({ email, password }) => {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Guardar el token
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUserInfo = async (token) => {
  try {
    const response = await fetch('/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await fetch('/auth/logout', {
      method: 'DELETE',
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
  } catch (error) {
    console.error('Logout error:', error);
  }
};