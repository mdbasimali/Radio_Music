// src/hooks/useRadioPlayer.js
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useRadio } from '../context/RadioContext';
import * as audioEngine from '../services/audioEngine';
import { playbackManager } from '../services/playbackManager';
import { useMediaSession } from './useMediaSession';
import { savePlaybackState } from '../services/playbackPersistence';

let _preloadAudio = null;

export function getAudio() {
  return playbackManager.getAudio();
}

export function useRadioPlayer() {
  const {
    currentTrack,
    currentTrackIndex,
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    currentTime,
    duration,
    queue,
    failedTrackIds,
    restoredState,
    hasUserInteracted,
    setPlaying,
    setCurrentTime,
    setDuration,
    setLoading,
    nextTrack,
    prevTrack,
    markTrackFailed,
    invalidateTracks,
    clearRestoredState,
  } = useRadio();

  // Stable callbacks for Media Session handlers
  const handlePlay  = useCallback(() => setPlaying(true),  [setPlaying]);
  const handlePause = useCallback(() => setPlaying(false), [setPlaying]);

  // Wire up Web Media Session API
  useMediaSession({
    currentTrack,
    currentStation,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    onPlay:  handlePlay,
    onPause: handlePause,
    onNext:  nextTrack,
    onPrev:  prevTrack,
  });

  const lastLoadedTrackIdRef = useRef(null);
  const seekRestoredRef = useRef(false);
  const lastSaveTimeRef = useRef(0);

  // Store latest values in a ref to avoid stale closures
  const stateRef = useRef({
    currentTrack,
    currentStation,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    restoredState,
    nextTrack,
    markTrackFailed,
    setPlaying,
    setLoading,
    setCurrentTime,
    setDuration,
    clearRestoredState,
  });

  useEffect(() => {
    stateRef.current = {
      currentTrack,
      currentStation,
      isPlaying,
      volume,
      isMuted,
      currentTime,
      restoredState,
      hasUserInteracted,
      nextTrack,
      markTrackFailed,
      setPlaying,
      setLoading,
      setCurrentTime,
      setDuration,
      clearRestoredState,
    };
  });

  // Periodic persistence of playback state every 1.5 seconds or on state change
  useEffect(() => {
    if (!currentTrack || !currentStation) return;

    const now = Date.now();
    if (now - lastSaveTimeRef.current > 1500 || !isPlaying) {
      lastSaveTimeRef.current = now;
      savePlaybackState({
        stationId: currentStation.id,
        trackId: currentTrack.id,
        providerId: currentTrack.providerId,
        provider: currentTrack.provider,
        currentTime: currentTime,
        isPlaying: isPlaying,
        volume: volume,
      });
    }
  }, [currentTrack, currentStation, currentTime, isPlaying, volume]);

  // Save state immediately on page unload / hide
  useEffect(() => {
    const handleUnload = () => {
      if (stateRef.current.currentTrack && stateRef.current.currentStation) {
        savePlaybackState({
          stationId: stateRef.current.currentStation.id,
          trackId: stateRef.current.currentTrack.id,
          providerId: stateRef.current.currentTrack.providerId,
          provider: stateRef.current.currentTrack.provider,
          currentTime: stateRef.current.currentTime,
          isPlaying: stateRef.current.isPlaying,
          volume: stateRef.current.volume,
        });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, []);

  // Setup socket connection for real-time playlist invalidation updates
  useEffect(() => {
    const backendHost = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5001';

    const socket = io(backendHost, {
      query: { visitorId: localStorage.getItem('radio_visitorId') || 'anonymous' }
    });

    socket.on('tracks_invalidated', ({ deletedTrackIds }) => {
      if (deletedTrackIds && deletedTrackIds.length > 0) {
        invalidateTracks(deletedTrackIds);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [invalidateTracks]);

  // Audio event listeners setup
  useEffect(() => {
    playbackManager.setCallbacks({
      onTimeUpdate: (time) => setCurrentTime(time),
      onDurationChange: (duration) => setDuration(duration),
      onEnded: () => {
        stateRef.current.nextTrack();
      },
      onLoadStart: () => {
        if (stateRef.current.hasUserInteracted && stateRef.current.isPlaying) {
          stateRef.current.setLoading(true);
        }
      },
      onCanPlay: () => {
        stateRef.current.setLoading(false);

        // Perform seek restoration when player becomes ready
        const res = stateRef.current.restoredState;
        if (res && !seekRestoredRef.current && res.currentTime > 0) {
          seekRestoredRef.current = true;
          console.log('[useRadioPlayer] Seeking to restored position:', res.currentTime);
          playbackManager.seek(res.currentTime);
          if (!res.isPlaying) {
            playbackManager.pause();
          }
          stateRef.current.clearRestoredState();
        }
      },
      onStateChange: ({ isPlaying, isLoading }) => {
        if (isPlaying !== undefined) {
          stateRef.current.setPlaying(isPlaying);
        }
        if (isLoading !== undefined) {
          stateRef.current.setLoading(isLoading);
        }
      },
      onError: (err) => {
        console.error('Playback error event:', err);
        stateRef.current.setLoading(false);
        stateRef.current.setPlaying(false);
        
        if (stateRef.current.currentTrack) {
          stateRef.current.markTrackFailed(stateRef.current.currentTrack.id);
          setTimeout(() => {
            stateRef.current.nextTrack();
          }, 2000);
        }
      }
    });

    playbackManager.setVolume(volume);
    playbackManager.setMuted(isMuted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track changed → load into audio engine.
  useEffect(() => {
    if (!currentTrack) return;
    if (failedTrackIds.includes(currentTrack.id)) return;

    if (lastLoadedTrackIdRef.current !== currentTrack.id) {
      lastLoadedTrackIdRef.current = currentTrack.id;
      seekRestoredRef.current = false;
      playbackManager.load(currentTrack);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, currentTrack?.id]);


  // Handle play/pause commands
  useEffect(() => {
    if (isPlaying) {
      audioEngine.initContext();
      if (currentTrack && !failedTrackIds.includes(currentTrack.id)) {
        playbackManager.play();
      }
    } else {
      // Only pause if something has actually been loaded — avoids
      // calling pause() on the audio engine before the user has
      // interacted with the page at all.
      if (lastLoadedTrackIdRef.current !== null) {
        playbackManager.pause();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    playbackManager.setVolume(volume);
    playbackManager.setMuted(isMuted);
  }, [volume, isMuted]);

  // Preload next track's metadata
  useEffect(() => {
    if (!queue || queue.length <= 1) return;
    const nextIdx = (currentTrackIndex + 1) % queue.length;
    const nextTrackItem = queue[nextIdx];
    
    if (nextTrackItem && nextTrackItem.provider === 'direct' && nextTrackItem.url && !failedTrackIds.includes(nextTrackItem.id)) {
      if (!_preloadAudio) {
        _preloadAudio = new Audio();
        _preloadAudio.crossOrigin = 'anonymous';
      }
      _preloadAudio.preload = 'metadata';
      _preloadAudio.src = nextTrackItem.url;
      _preloadAudio.load();
    }
  }, [currentTrackIndex, queue, failedTrackIds]);

  return { seek: seekAudio };
}

export function seekAudio(time) {
  playbackManager.seek(time);
}
