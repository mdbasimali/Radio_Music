// src/data/stations.js
import { SONGS } from './songs';

export const STATIONS = [
  {
    id: 'hindi',
    name: 'Hindi 90s Classics',
    subtitle: 'Bollywood Golden Era',
    language: 'Hindi',
    color: '#d48c36',
    colorRgb: '212,140,54',
    icon: '🎵',
    description: 'Lata, Kishore, Rafi — the golden voices reborn'
  },
  {
    id: 'bengali',
    name: 'Bengali 90s Classics',
    subtitle: 'Adhunik & Rabindra Sangeet',
    language: 'Bengali',
    color: '#4ecdc4',
    colorRgb: '78,205,196',
    icon: '🌿',
    description: 'Bengali soul from the golden nineties'
  },
  {
    id: 'bhojpuri',
    name: 'Bhojpuri Top Hits',
    subtitle: 'Folk & Filmi Fusion',
    language: 'Bhojpuri',
    color: '#e07b39',
    colorRgb: '224,123,57',
    icon: '🌾',
    description: 'Earthen beats from the heartland'
  },
  {
    id: 'mixed',
    name: 'Mixed Radio',
    subtitle: 'Hindi · Bengali · Bhojpuri',
    language: 'Mixed',
    color: '#9b59b6',
    colorRgb: '155,89,182',
    icon: '📻',
    description: 'The full 90s Indian experience rotation'
  }
];

// Returns the queue for a given station
export function getStationQueue(stationId) {
  if (stationId === 'mixed') {
    return SONGS; // Mixed contains everything
  }
  return SONGS.filter((song) => song.station === stationId);
}

export const getStation = (id) => STATIONS.find((s) => s.id === id) || STATIONS[0];
