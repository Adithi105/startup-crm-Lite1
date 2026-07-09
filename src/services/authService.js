import api from './api';

/**
 * Authentication service handling API calls for register, login, logout, and profile operations.
 */
export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('crm-token');
  localStorage.removeItem('crm_user');
};

export const getProfile = async () => {
  const response = await api.get('/api/auth/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/api/auth/profile', data);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile
};

export default authService;
