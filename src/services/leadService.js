import api from './api';

/**
 * Lead service handling API calls for lead CRUD operations and statistics.
 */
export const getLeads = async (params = {}) => {
  const response = await api.get('/api/leads', { params });
  return response.data;
};

export const createLead = async (leadData) => {
  const response = await api.post('/api/leads', leadData);
  return response.data;
};

export const updateLead = async (id, leadData) => {
  const response = await api.put(`/api/leads/${id}`, leadData);
  return response.data;
};

export const updateLeadStatus = async (id, status) => {
  const response = await api.patch(`/api/leads/${id}/status`, { status });
  return response.data;
};

export const deleteLead = async (id) => {
  const response = await api.delete(`/api/leads/${id}`);
  return response.data;
};

export const getLeadStats = async () => {
  // Try stats/summary first, but fallback to stats just in case
  const response = await api.get('/api/leads/stats/summary');
  return response.data;
};

export const getMonthlyStats = async () => {
  const response = await api.get('/api/leads/stats/monthly');
  return response.data;
};

const leadService = {
  getLeads,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats
};

export default leadService;
