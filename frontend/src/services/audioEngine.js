// src/services/audioEngine.js
// Singleton Audio Engine managing shared AudioContext and routing

let _ctx = null;
let _masterGain = null;
let _musicGain = null;
let _ambientBus = null;
let _musicSourceNode = null;

const _ambientElements = {};
const _ambientGainNodes = {};

const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://127.0.0.1:5001';

const AMBIENCE_MAP = {
  rain: `${BACKEND_URL}/audio/ambience/rain.mp3`,
  crowd: `${BACKEND_URL}/audio/ambience/chai-stall.mp3`,
  static: `${BACKEND_URL}/audio/ambience/radio-static.mp3`,
  crickets: `${BACKEND_URL}/audio/ambience/crickets.mp3`,
};

// Initialize the shared AudioContext lazily on user gesture
export function initContext() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Master Gain Node
    _masterGain = _ctx.createGain();
    _masterGain.gain.value = 1.0; // Default master volume
    _masterGain.connect(_ctx.destination);
    
    // Music Gain Node
    _musicGain = _ctx.createGain();
    _musicGain.gain.value = 1.0;
    _musicGain.connect(_masterGain);
    
    // Ambient Bus Gain Node
    _ambientBus = _ctx.createGain();
    _ambientBus.gain.value = 1.0; // Dynamic ducking will adjust this
    _ambientBus.connect(_masterGain);
  }
  
  if (_ctx.state === 'suspended') {
    _ctx.resume();
  }
  return _ctx;
}

export function getContext() {
  return _ctx;
}

// Connect the main music Audio element to the Web Audio pipeline
export function connectMusicSource(audioElement) {
  const ctx = initContext();
  if (!_musicSourceNode && audioElement) {
    try {
      _musicSourceNode = ctx.createMediaElementSource(audioElement);
      _musicSourceNode.connect(_musicGain);
    } catch (e) {
      console.warn('Media element source already connected or failed to connect:', e);
    }
  }
}

// Duck the ambient bus when music is playing
export function setMusicActive(isPlaying) {
  const ctx = getContext();
  if (!ctx || !_ambientBus) return;
  
  // Subtle ducking: reduce ambient volume to 70% when music is playing, restore to 100% when paused
  const targetGain = isPlaying ? 0.7 : 1.0;
  _ambientBus.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.4);
}

// Set master volume output
export function setMasterVolume(val) {
  const ctx = getContext();
  if (!ctx || !_masterGain) return;
  _masterGain.gain.setTargetAtTime(val, ctx.currentTime, 0.1);
}

// Set state of individual ambient layer with fade in / out
export function setAmbientLayer(id, enabled, volume) {
  const ctx = initContext();
  const filePath = AMBIENCE_MAP[id];
  if (!filePath) return;

  // Create Audio element and gain node if they don't exist
  if (!_ambientElements[id]) {
    try {
      const audio = new Audio(filePath);
      audio.loop = true;
      audio.crossOrigin = 'anonymous';
      _ambientElements[id] = audio;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0; // Start silent
      gainNode.connect(_ambientBus);
      _ambientGainNodes[id] = gainNode;

      const sourceNode = ctx.createMediaElementSource(audio);
      sourceNode.connect(gainNode);
    } catch (e) {
      console.error(`Failed to initialize ambient layer ${id}:`, e);
      return;
    }
  }

  const audio = _ambientElements[id];
  const gainNode = _ambientGainNodes[id];

  if (enabled) {
    // Start audio element if it's paused
    if (audio.paused) {
      audio.play().catch((err) => {
        console.error(`Error playing ambient layer ${id}:`, err);
      });
    }
    // Smoothly fade in to target volume
    gainNode.gain.setTargetAtTime(volume * 0.4, ctx.currentTime, 0.8);
  } else {
    // Smoothly fade out to 0
    gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
    // Pause audio after fade finishes
    setTimeout(() => {
      // Check if it is still disabled before pausing
      if (gainNode.gain.value < 0.01 && !audio.paused) {
        audio.pause();
      }
    }, 2500);
  }
}

// Cleanup all ambient instances
export function cleanupAudioEngine() {
  Object.values(_ambientElements).forEach((audio) => {
    try {
      audio.pause();
    } catch (e) {
      // Ignore
    }
  });
}
