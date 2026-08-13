// src/services/api.js
// Admin API service for backend integration

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  getStations: () => request('/stations'),
  getStationById: (id) => request(`/stations/${id}`),
  createStation: (stationData) => request('/stations', {
    method: 'POST',
    body: JSON.stringify(stationData),
  }),
  updateStation: (id, stationData) => request(`/stations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(stationData),
  }),
  deleteStation: (id) => request(`/stations/${id}`, {
    method: 'DELETE',
  }),

  // Playlists API
  getPlaylists: () => request('/playlists'),
  importPlaylist: (playlistData) => request('/playlists', {
    method: 'POST',
    body: JSON.stringify(playlistData),
  }),
  updatePlaylist: (id, playlistData) => request(`/playlists/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(playlistData),
  }),
  deletePlaylist: (id) => request(`/playlists/${id}`, {
    method: 'DELETE',
  }),
  syncPlaylist: (id) => request(`/playlists/${id}/sync`, {
    method: 'POST',
  }),

  // Tracks API
  getTracks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tracks?${query}`);
  },
  getTracksStats: () => request('/tracks/stats'),
  updateTrack: (id, trackData) => request(`/tracks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(trackData),
  }),
  deleteTrack: (id) => request(`/tracks/${id}`, {
    method: 'DELETE',
  }),
  bulkActionTracks: (bulkData) => request('/tracks/bulk-actions', {
    method: 'POST',
    body: JSON.stringify(bulkData),
  }),
};
