const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const paymentService = {
  getMyPayments: async (token) => {
    const res = await fetch(`${API_URL}/payments/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.payments || [];
  },

  getMyPendingPayments: async (token) => {
    const res = await fetch(`${API_URL}/payments/my-pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.payments || [];
  },
  listPayments: async (token) => {
    const res = await fetch(`${API_URL}/payments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.payments || [];
  },
  createPayment: async (data, token) => {
    const res = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  updatePayment: async (id, data, token) => {
    const res = await fetch(`${API_URL}/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  deletePayment: async (id, token) => {
    const res = await fetch(`${API_URL}/payments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  }
};
