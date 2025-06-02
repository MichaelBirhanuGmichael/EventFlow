import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const register = async (data: { username: string; password: string; email?: string }) => {
  const res = await axios.post(`${API_BASE}/users/register/`, data);
  return res.data;
};

export const login = async (data: { username: string; password: string }) => {
  const res = await axios.post(`${API_BASE}/token/`, data);
  return res.data;
};

export const logout = async () => {
  // For JWT, logout is client-side (remove token). For session, call backend logout endpoint if available.
  return Promise.resolve();
};

export const getCurrentUser = async (token: string) => {
  const res = await axios.get(`${API_BASE}/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};