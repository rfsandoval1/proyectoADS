// Servicio de créditos usando el backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const creditService = {
    getClientCredits: async (token) => {
      const res = await fetch(`${API_URL}/credits/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data.credits || [];
    },

    getClientPendingPayments: async (token) => {
      const res = await fetch(`${API_URL}/payments/my-pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data.payments || [];
    },
  getAllCredits: async (token) => {
    const res = await fetch(`${API_URL}/credits`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.credits || [];
  },
  getAllPayments: async (token) => {
    const res = await fetch(`${API_URL}/payments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.payments || [];
  },
  grantCredit: async (data, token) => {
    const res = await fetch(`${API_URL}/credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  addPayment: async (payment, token) => {
    const res = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payment)
    });
    return await res.json();
  },
  updateCredit: async (id, data, token) => {
    const res = await fetch(`${API_URL}/credits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  deleteCredit: async (id, token) => {
    const res = await fetch(`${API_URL}/credits/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getClients: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error('Failed to fetch clients');
    }
    return await res.json();
  },
};
