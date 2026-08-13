// src/services/playbackPersistence.js
// Handles client-side persistence and restoration of radio playback state
// Key: 'radioPlaybackState' in localStorage

const STORAGE_KEY = 'radioPlaybackState';

/**
 * Saves current playback state to localStorage (throttled/debounced)
 */
export function savePlaybackState(state) {
  try {
    const payload = {
      stationId: state.stationId || null,
      trackId: state.trackId || null,
      providerId: state.providerId || null,
      provider: state.provider || 'direct',
      currentTime: typeof state.currentTime === 'number' && !isNaN(state.currentTime) ? state.currentTime : 0,
      isPlaying: Boolean(state.isPlaying),
      volume: typeof state.volume === 'number' ? state.volume : 0.8,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // Ignore storage quota errors
  }
}

/**
 * Retrieves saved playback state from localStorage
 */
export function getSavedPlaybackState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.trackId) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

/**
 * Clears saved playback state (used when station/track is invalid or manually reset)
 */
export function clearSavedPlaybackState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

/**
 * Optional BroadcastChannel cross-tab synchronization
 */
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('radio_playback_channel');
  } catch (e) {}
}

export function notifyTabState(action, payload) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ action, payload, tabId: window.name || 'tab_' + Date.now() });
    } catch (e) {}
  }
}

export function subscribeTabState(onMessage) {
  if (broadcastChannel) {
    const handler = (event) => {
      if (event.data) onMessage(event.data);
    };
    broadcastChannel.addEventListener('message', handler);
    return () => broadcastChannel.removeEventListener('message', handler);
  }
  return () => {};
}
