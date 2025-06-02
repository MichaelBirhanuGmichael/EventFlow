import axios from 'axios';

const API_BASE = 'http://localhost:8000/api'; // Updated for backend URL

// Helper function to get auth token from local storage
const getAuthToken = () => {
  const token = localStorage.getItem('authToken'); // Use the correct key 'authToken'
  console.log('Attempting to retrieve auth token. Found:', token ? 'Yes' : 'No'); // Log token presence
  return token;
};

// Helper function to create headers with auth token
const createAuthHeaders = () => {
  const token = getAuthToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
};

export const getEvents = async () => {
  const res = await axios.get(`${API_BASE}/events/`, { headers: createAuthHeaders() });
  return res.data;
};

export const getEvent = async (id: number) => {
  const res = await axios.get(`${API_BASE}/events/${id}/`, { headers: createAuthHeaders() });
  return res.data;
};

export const createEvent = async (data: any) => {
  const res = await axios.post(`${API_BASE}/events/`, data, { headers: createAuthHeaders() });
  return res.data;
};

export const updateEvent = async (id: number, data: any) => {
  const res = await axios.put(`${API_BASE}/events/${id}/`, data, { headers: createAuthHeaders() });
  return res.data;
};

export const deleteEvent = async (id: number) => {
  const res = await axios.delete(`${API_BASE}/events/${id}/`, { headers: createAuthHeaders() });
  return res.data;
};

export const getEventOccurrences = async (id: number, count: number = 10) => {
  const res = await axios.get(`${API_BASE}/events/${id}/occurrences/?count=${count}`, { headers: createAuthHeaders() });
  return res.data;
};

export const deleteOccurrence = async (eventId: number, startTime: string) => {
  const res = await axios.post(`${API_BASE}/events/${eventId}/occurrences/delete/`, { start_time: startTime }, { headers: createAuthHeaders() });
  return res.data;
}; 