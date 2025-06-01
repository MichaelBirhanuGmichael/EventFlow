import axios from 'axios';

const API_BASE = 'http://localhost:8000/api'; // Updated for backend URL

export const getEvents = async () => {
  const res = await axios.get(`${API_BASE}/events/`);
  return res.data;
};

export const getEvent = async (id: number) => {
  const res = await axios.get(`${API_BASE}/events/${id}/`);
  return res.data;
};

export const createEvent = async (data: any) => {
  const res = await axios.post(`${API_BASE}/events/`, data);
  return res.data;
};

export const updateEvent = async (id: number, data: any) => {
  const res = await axios.put(`${API_BASE}/events/${id}/`, data);
  return res.data;
};

export const deleteEvent = async (id: number) => {
  const res = await axios.delete(`${API_BASE}/events/${id}/`);
  return res.data;
};

export const getEventOccurrences = async (id: number, count: number = 10) => {
  const res = await axios.get(`${API_BASE}/events/${id}/occurrences/?count=${count}`);
  return res.data;
};

export const deleteOccurrence = async (eventId: number, startTime: string) => {
  const res = await axios.post(`${API_BASE}/events/${eventId}/occurrences/delete/`, { start_time: startTime });
  return res.data;
}; 