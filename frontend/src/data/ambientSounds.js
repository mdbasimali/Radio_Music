// src/data/ambientSounds.js
// Ambient sound layers — all generated via Web Audio API, no external files

export const AMBIENT_SOUNDS = [
  {
    id: 'rain',
    label: 'Rain',
    icon: '🌧️',
    type: 'rain',          // generated via noise buffer
    defaultVolume: 0.4,
  },
  {
    id: 'crowd',
    label: 'Chai Stall',
    icon: '☕',
    type: 'crowd',         // low-frequency hum + subtle chatter simulation
    defaultVolume: 0.2,
  },
  {
    id: 'static',
    label: 'Radio Static',
    icon: '📻',
    type: 'static',        // white noise filtered to mid frequencies
    defaultVolume: 0.1,
  },
  {
    id: 'crickets',
    label: 'Crickets',
    icon: '🦗',
    type: 'crickets',      // oscillator-based chirp simulation
    defaultVolume: 0.15,
  },
];
