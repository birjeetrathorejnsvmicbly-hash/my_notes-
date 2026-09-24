import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getNotes = (params = {}) => api.get('/notes', { params });
export const getNote = (id) => api.get(`/notes/${id}`);
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const togglePin = (id) => api.patch(`/notes/${id}/pin`);
export const toggleArchive = (id) => api.patch(`/notes/${id}/archive`);
export const deleteNote = (id) => api.delete(`/notes/${id}`);

export default api;
