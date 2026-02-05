// Servicio para métricas de dashboard desde el backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const dashboardService = {
  getManagerMetrics: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/manager`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getAssistantMetrics: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/assistant`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getMonthlyData: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/monthly-data`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getCreditDistribution: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/credit-distribution`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getTasks: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getAlerts: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/alerts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getAuditLogs: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/audit-logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getPaymentsReport: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/payments-report`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getClients: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  getDelinquentClients: async (token) => {
    const res = await fetch(`${API_URL}/dashboard/delinquent-clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  }
};
