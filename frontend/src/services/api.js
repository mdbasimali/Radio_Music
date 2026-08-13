// src/services/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[API Error]', error.message);
    return Promise.reject(error);
  }
);

// ─── Reusable API Functions ────────────────────────────────────
export const getStations = () => api.get('/stations');
export const getStationById = (id) => api.get(`/stations/${id}`);
export const getTracks = () => api.get('/tracks');
export const getTracksByStation = (stationId) => api.get(`/stations/${stationId}/tracks`).then(res => res.tracks);
export const getTrackById = (id) => api.get(`/tracks/${id}`);

export default api;
