// src/context/RadioContext.jsx
import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { getStations, getTracksByStation } from '../services/api';
import { getSavedPlaybackState, savePlaybackState, clearSavedPlaybackState } from '../services/playbackPersistence';

// --- Local Storage Helpers ---
const getLocalStorage = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore storage errors
  }
};

const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://127.0.0.1:5001';

// --- Audio Source Mapping ---
function mapTrackToAudioSource(track) {
  const id = track.id || track._id || Math.random().toString(36).substring(7);
  
  const provider = track.provider || 'direct';
  const providerId = track.providerId || '';
  
  let url = '';
  if (provider === 'direct') {
    const rawUrl = track.audioUrl && !track.audioUrl.includes('demo-silence') ? track.audioUrl : '';
    url = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${BACKEND_URL}${rawUrl}`) : '';
  }
  
  return {
    id,
    type: provider === 'youtube' ? 'youtube' : 'direct_mp3',
    url,
    provider,
    providerId,
    duration: 0,
    title: track.title || 'Unknown Title',
    artist: track.artist || 'Unknown Artist',
    album: track.album || '',
    artwork: track.artwork || '📻',
    year: track.year || '',
    language: track.language || '',
    station: track.station || '',
    metadata: {
      title: track.title || 'Unknown Title',
      artist: track.artist || 'Unknown Artist',
      album: track.album || '',
      artwork: track.artwork || '📻',
      year: track.year || '',
      language: track.language || '',
      station: track.station || ''
    }
  };
}

// --- Fisher-Yates Shuffle ---
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Shuffle without immediate repeat of the last played source
function shuffleQueueWithNoImmediateRepeat(queue, lastPlayedSource) {
  if (queue.length <= 1) return [...queue];
  let shuffled = shuffleArray(queue);
  if (lastPlayedSource && shuffled[0].id === lastPlayedSource.id) {
    const temp = shuffled[0];
    shuffled[0] = shuffled[shuffled.length - 1];
    shuffled[shuffled.length - 1] = temp;
  }
  return shuffled;
}

const initialState = {
  stations: [],
  currentStation: null,
  queue: [],
  currentTrackIndex: 0,
  isPlaying: false,
  volume: getLocalStorage('radio_volume', 0.8),
  isMuted: getLocalStorage('radio_isMuted', false),
  currentTime: 0,
  duration: 0,
  isLoading: false,
  isApiError: false,
  failedTrackIds: [],
  restoredState: null,
  // Tracks whether the user has explicitly interacted (clicked a card / pressed Play).
  // Until true, ALL loading/playing animations stay hidden.
  hasUserInteracted: false,
};

function radioReducer(state, action) {
  switch (action.type) {
    case 'INIT_STATIONS': {
      // Pre-select "Hindi 90s Classics" as the default station for display.
      // This sets the active card visually but does NOT start playback.
      // isPlaying remains false — the user must explicitly click the card or Play button.
      const defaultStation =
        action.payload.find((s) =>
          s.name?.toLowerCase().includes('hindi') &&
          s.name?.toLowerCase().includes('classic')
        ) || action.payload[0] || null;

      return {
        ...state,
        stations: action.payload,
        currentStation: defaultStation,
        isApiError: false,
      };
    }

    case 'SET_QUEUE': {
      const mappedQueue = action.payload.map(mapTrackToAudioSource);
      const savedState = getSavedPlaybackState();
      
      let targetIndex = 0;
      let restoredStatePayload = null;

      // Check if saved track exists in fetched station queue.
      // We restore the POSITION only (currentTime), never isPlaying.
      // Autoplay on restore is intentionally disabled — the user must
      // press Play after returning to the site.
      if (savedState && savedState.trackId) {
        const foundIdx = mappedQueue.findIndex(t => t.id === savedState.trackId || t.providerId === savedState.providerId);
        if (foundIdx !== -1) {
          targetIndex = foundIdx;
          restoredStatePayload = {
            currentTime: savedState.currentTime || 0,
            isPlaying: false, // NEVER autoplay on restore — user must press Play
            trackId: savedState.trackId,
          };
          console.log('[RadioContext] Restoring saved track position (no autoplay):', mappedQueue[targetIndex].title, 'at time:', savedState.currentTime);
        } else {
          // Saved track no longer valid in current station queue
          clearSavedPlaybackState();
        }
      }

      // If restoring saved track, put it at targetIndex in mapped queue without forcing it to 0
      let finalQueue = mappedQueue;
      if (restoredStatePayload) {
        // Keep queue order or shuffle remaining
        const targetTrack = mappedQueue[targetIndex];
        const remaining = mappedQueue.filter((_, idx) => idx !== targetIndex);
        const shuffledRemaining = shuffleArray(remaining);
        finalQueue = [targetTrack, ...shuffledRemaining];
        targetIndex = 0;
      } else {
        finalQueue = shuffleArray(mappedQueue);
        targetIndex = 0;
      }

      return {
        ...state,
        queue: finalQueue,
        currentTrackIndex: targetIndex,
        currentTime: restoredStatePayload ? restoredStatePayload.currentTime : 0,
        restoredState: restoredStatePayload,
        duration: 0,
        isApiError: false,
        failedTrackIds: [],
      };
    }
    case 'CLEAR_RESTORED_STATE': {
      return {
        ...state,
        restoredState: null,
      };
    }
    case 'SET_STATION_ONLY':
      if (action.payload?.id) {
        localStorage.setItem('radio_lastStationId', action.payload.id);
      }
      return {
        ...state,
        currentStation: action.payload,
        restoredState: null, // clear restore context when manually switching station
      };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_USER_INTERACTED':
      return { ...state, hasUserInteracted: true };
    case 'SET_VOLUME':
      setLocalStorage('radio_volume', action.payload);
      return { ...state, volume: action.payload, isMuted: action.payload === 0 };
    case 'TOGGLE_MUTE':
      const newMuteState = !state.isMuted;
      setLocalStorage('radio_isMuted', newMuteState);
      return { ...state, isMuted: newMuteState };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_API_ERROR':
      return { ...state, isApiError: action.payload, isLoading: false };
    case 'MARK_TRACK_FAILED':
      const updatedFailed = [...state.failedTrackIds, action.payload];
      return { ...state, failedTrackIds: updatedFailed };
    case 'NEXT_TRACK': {
      if (state.queue.length === 0) return state;
      
      let nextIndex = state.currentTrackIndex;
      let queue = state.queue;
      let count = 0;
      
      do {
        nextIndex++;
        if (nextIndex >= queue.length) {
          const lastTrack = queue[state.currentTrackIndex];
          queue = shuffleQueueWithNoImmediateRepeat(queue, lastTrack);
          nextIndex = 0;
        }
        count++;
      } while (
        state.failedTrackIds.includes(queue[nextIndex]?.id) && 
        count < queue.length * 2
      );
      
      if (count >= queue.length * 2) {
        return { ...state, queue, isPlaying: false, currentTime: 0, restoredState: null };
      }
      
      return {
        ...state,
        queue,
        currentTrackIndex: nextIndex,
        currentTime: 0,
        restoredState: null,
      };
    }
    case 'PREV_TRACK': {
      if (state.queue.length === 0) return state;
      
      let prevIndex = state.currentTrackIndex;
      let count = 0;
      
      do {
        prevIndex = (prevIndex - 1 + state.queue.length) % state.queue.length;
        count++;
      } while (
        state.failedTrackIds.includes(state.queue[prevIndex]?.id) && 
        count < state.queue.length
      );
      
      if (count >= state.queue.length) {
        return { ...state, isPlaying: false, currentTime: 0, restoredState: null };
      }
      
      return { ...state, currentTrackIndex: prevIndex, currentTime: 0, restoredState: null };
    }
    case 'ADD_TO_QUEUE': {
      const mapped = mapTrackToAudioSource(action.payload);
      return {
        ...state,
        queue: [...state.queue, mapped]
      };
    }
    case 'REMOVE_FROM_QUEUE': {
      const filteredQueue = state.queue.filter((item) => item.id !== action.payload);
      let newIdx = state.currentTrackIndex;
      if (newIdx >= filteredQueue.length && filteredQueue.length > 0) {
        newIdx = filteredQueue.length - 1;
      }
      return {
        ...state,
        queue: filteredQueue,
        currentTrackIndex: newIdx,
      };
    }
    case 'SHUFFLE_QUEUE': {
      const lastTrack = state.queue[state.currentTrackIndex];
      const shuffled = shuffleQueueWithNoImmediateRepeat(state.queue, lastTrack);
      return {
        ...state,
        queue: shuffled,
        currentTrackIndex: 0,
        currentTime: 0,
        restoredState: null,
      };
    }
    case 'CLEAR_QUEUE':
      clearSavedPlaybackState();
      return {
        ...state,
        queue: [],
        currentTrackIndex: 0,
        currentTime: 0,
        isPlaying: false,
        restoredState: null,
      };
    case 'INVALIDATE_TRACKS': {
      const invalidIds = action.payload || [];
      const filteredQueue = state.queue.filter((item) => !invalidIds.includes(item.id));
      
      let newIdx = state.currentTrackIndex;
      const currentTrack = state.queue[state.currentTrackIndex] || null;
      let shouldStopAndAdvance = false;

      if (currentTrack && invalidIds.includes(currentTrack.id)) {
        shouldStopAndAdvance = true;
      }

      if (newIdx >= filteredQueue.length && filteredQueue.length > 0) {
        newIdx = filteredQueue.length - 1;
      }

      if (shouldStopAndAdvance) {
        clearSavedPlaybackState();
        return {
          ...state,
          queue: filteredQueue,
          currentTrackIndex: filteredQueue.length > 0 ? newIdx % filteredQueue.length : 0,
          currentTime: 0,
          // Keep isPlaying as-is; don't force it to true — that caused autoplay.
          // The audio engine will naturally advance to the next track if already playing.
          isPlaying: state.isPlaying && filteredQueue.length > 0,
          restoredState: null,
        };
      }

      return {
        ...state,
        queue: filteredQueue,
        currentTrackIndex: newIdx,
      };
    }
    default:
      return state;
  }
}

const RadioContext = createContext(null);

export function RadioProvider({ children }) {
  const [state, dispatch] = useReducer(radioReducer, initialState);

  const setPlaying = useCallback((v) => dispatch({ type: 'SET_PLAYING', payload: v }), []);
  const setVolume = useCallback((v) => dispatch({ type: 'SET_VOLUME', payload: v }), []);
  const toggleMute = useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []);
  const setCurrentTime = useCallback((t) => dispatch({ type: 'SET_CURRENT_TIME', payload: t }), []);
  const setDuration = useCallback((d) => dispatch({ type: 'SET_DURATION', payload: d }), []);
  const setLoading = useCallback((v) => dispatch({ type: 'SET_LOADING', payload: v }), []);
  const nextTrack = useCallback(() => dispatch({ type: 'NEXT_TRACK' }), []);
  const prevTrack = useCallback(() => dispatch({ type: 'PREV_TRACK' }), []);
  
  const addToQueue = useCallback((track) => dispatch({ type: 'ADD_TO_QUEUE', payload: track }), []);
  const removeFromQueue = useCallback((id) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id }), []);
  const shuffleQueue = useCallback(() => dispatch({ type: 'SHUFFLE_QUEUE' }), []);
  const clearQueue = useCallback(() => dispatch({ type: 'CLEAR_QUEUE' }), []);
  const markTrackFailed = useCallback((id) => dispatch({ type: 'MARK_TRACK_FAILED', payload: id }), []);
  const clearRestoredState = useCallback(() => dispatch({ type: 'CLEAR_RESTORED_STATE' }), []);
  const setUserInteracted = useCallback(() => dispatch({ type: 'SET_USER_INTERACTED' }), []);

  // Fetch stations on initial load
  useEffect(() => {
    async function loadStations() {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const data = await getStations();
        dispatch({ type: 'INIT_STATIONS', payload: data });
      } catch (err) {
        dispatch({ type: 'SET_API_ERROR', payload: true });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadStations();
  }, []);

  // Load tracks when station changes
  useEffect(() => {
    if (!state.currentStation) return;
    async function loadTracks() {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const tracks = await getTracksByStation(state.currentStation.id);
        dispatch({ type: 'SET_QUEUE', payload: tracks });
      } catch (err) {
        dispatch({ type: 'SET_API_ERROR', payload: true });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadTracks();
  }, [state.currentStation?.id]);

  const setStation = useCallback((station) => {
    dispatch({ type: 'SET_STATION_ONLY', payload: station });
  }, []);

  const invalidateTracks = useCallback((ids) => dispatch({ type: 'INVALIDATE_TRACKS', payload: ids }), []);

  const currentTrack = state.queue[state.currentTrackIndex] || null;

  return (
    <RadioContext.Provider
      value={{
        ...state,
        currentTrack,
        setStation,
        setPlaying,
        setVolume,
        toggleMute,
        setCurrentTime,
        setDuration,
        setLoading,
        nextTrack,
        prevTrack,
        addToQueue,
        removeFromQueue,
        shuffleQueue,
        clearQueue,
        markTrackFailed,
        invalidateTracks,
        clearRestoredState,
        setUserInteracted,

      }}
    >
      {children}
    </RadioContext.Provider>
  );
}

export const useRadio = () => {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used within a RadioProvider');
  return ctx;
};
