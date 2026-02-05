const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const authService = {
  registerClient: async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || 'Error al registrar',
          errors: data.errors || []
        };
      }
      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data?.user?.role) {
      data.user.role = data.user.role.toLowerCase();
    }
    return data;
  },

  getCurrentUser: async (token) => {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data?.user?.role) {
      data.user.role = data.user.role.toLowerCase();
    }
    return data;
  },

  registerAssistant: async (data) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return { success: false, message: 'No autenticado' };
    const res = await fetch(`${API_URL}/users/register-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  logout: async (token) => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
};
