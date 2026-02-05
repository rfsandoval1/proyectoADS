const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface User {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  status?: string;
}

export const userService = {
  listUsers: async (token) => {
    const res = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.users || [];
  },
  updateUser: async (id, data, token) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  deleteUser: async (id, token) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },

  getAllUsers: async (token) => {
    const res = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.users || [];
  },
};
