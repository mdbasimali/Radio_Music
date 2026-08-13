// src/hooks/useRadioPlayer.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useRadio } from '../context/RadioContext';
import * as audioEngine from '../services/audioEngine';
import { playbackManager } from '../services/playbackManager';

let _preloadAudio = null;

export function getAudio() {
  return playbackManager.getAudio();
}

export function useRadioPlayer() {
  const {
    currentTrack,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    queue,
    failedTrackIds,
    setPlaying,
    setCurrentTime,
    setDuration,
    setLoading,
    nextTrack,
    markTrackFailed,
    invalidateTracks,
  } = useRadio();

  const lastLoadedTrackIdRef = useRef(null);

  // Store latest values in a ref to avoid stale closures in event listeners
  const stateRef = useRef({
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    nextTrack,
    markTrackFailed,
    setPlaying,
    setLoading,
    setCurrentTime,
    setDuration,
  });

  useEffect(() => {
    stateRef.current = {
      currentTrack,
      isPlaying,
      volume,
      isMuted,
      nextTrack,
      markTrackFailed,
      setPlaying,
      setLoading,
      setCurrentTime,
      setDuration,
    };
  }, [currentTrack, isPlaying, volume, isMuted, nextTrack, markTrackFailed, setPlaying, setLoading, setCurrentTime, setDuration]);

  // Setup socket connection for real-time playlist invalidation updates
  useEffect(() => {
    const backendHost = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5001';

    const socket = io(backendHost, {
      query: { visitorId: localStorage.getItem('radio_visitorId') || 'anonymous' }
    });

    socket.on('tracks_invalidated', ({ deletedTrackIds }) => {
      console.log('[Socket] Received tracks_invalidated event:', deletedTrackIds);
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
      onLoadStart: () => stateRef.current.setLoading(true),
      onCanPlay: () => stateRef.current.setLoading(false),
      onError: (err) => {
        console.error('Playback error event:', err);
        stateRef.current.setLoading(false);
        
        if (stateRef.current.currentTrack) {
          stateRef.current.markTrackFailed(stateRef.current.currentTrack.id);
          setTimeout(() => {
            stateRef.current.nextTrack();
          }, 2000);
        } else {
          stateRef.current.setPlaying(false);
        }
      }
    });

    // Sync volume immediately
    playbackManager.setVolume(volume);
    playbackManager.setMuted(isMuted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track changed → change source and play if previously playing
  useEffect(() => {
    if (!currentTrack) return;
    if (failedTrackIds.includes(currentTrack.id)) return;

    if (lastLoadedTrackIdRef.current !== currentTrack.id) {
      lastLoadedTrackIdRef.current = currentTrack.id;
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
      playbackManager.pause();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Handle volume changes (persisted across tracks)
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
