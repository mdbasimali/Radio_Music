// src/hooks/useMediaSession.js
// Web Media Session API integration for background playback controls.
// Keeps lock-screen / system media controls in sync with the radio player.
// Safe to call even when the API is unsupported — all paths are guarded.

import { useEffect, useRef } from 'react';

const SUPPORTED = typeof navigator !== 'undefined' && 'mediaSession' in navigator;

/**
 * Returns a resized artwork URL array for MediaMetadata.
 * Prefers the track's artwork field.  Falls back to a generic radio icon.
 */
function buildArtwork(track) {
  const artworkUrl = track?.artwork;

  // If artwork is an emoji or not a real URL, use a generic SVG fallback
  const isUrl =
    artworkUrl &&
    typeof artworkUrl === 'string' &&
    (artworkUrl.startsWith('http') || artworkUrl.startsWith('/'));

  if (!isUrl) {
    // Return an SVG data-URI so we always have *something* to show
    return [
      {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='80' fill='%23141414'/%3E%3Ctext x='256' y='310' font-size='240' text-anchor='middle' fill='%23ffffff'%3E%F0%9F%8E%B5%3C/text%3E%3C/svg%3E",
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ];
  }

  // Provide multiple sizes so the OS can pick the best one
  return [
    { src: artworkUrl, sizes: '96x96',   type: 'image/jpeg' },
    { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
    { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
    { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
    { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
  ];
}

/**
 * useMediaSession
 *
 * @param {object} params
 * @param {object|null} params.currentTrack  - Current track object from RadioContext
 * @param {object|null} params.currentStation - Current station from RadioContext
 * @param {boolean}     params.isPlaying     - Current playback state
 * @param {function}    params.onPlay        - Calls setPlaying(true)
 * @param {function}    params.onPause       - Calls setPlaying(false)
 * @param {function}    params.onNext        - Calls nextTrack()
 * @param {function}    params.onPrev        - Calls prevTrack()
 */
export function useMediaSession({ currentTrack, currentStation, isPlaying, onPlay, onPause, onNext, onPrev }) {
  // Keep a ref to always-fresh handlers so Media Session closures never go stale
  const handlersRef = useRef({ onPlay, onPause, onNext, onPrev });
  useEffect(() => {
    handlersRef.current = { onPlay, onPause, onNext, onPrev };
  }, [onPlay, onPause, onNext, onPrev]);

  // ── Register action handlers (once, on mount) ──────────────────
  useEffect(() => {
    if (!SUPPORTED) return;

    const actions = [
      ['play',          () => handlersRef.current.onPlay()],
      ['pause',         () => handlersRef.current.onPause()],
      ['nexttrack',     () => handlersRef.current.onNext()],
      ['previoustrack', () => handlersRef.current.onPrev()],
      // stop mirrors pause for our radio use-case
      ['stop',          () => handlersRef.current.onPause()],
    ];

    for (const [action, handler] of actions) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {
        // Some browsers may not support every action — silently skip
      }
    }

    return () => {
      // Clean up handlers on unmount
      for (const [action] of actions) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) { /* ignore */ }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update metadata whenever track changes ─────────────────────
  useEffect(() => {
    if (!SUPPORTED) return;
    if (!currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title:  currentTrack.title  || 'Radio Track',
        artist: currentTrack.artist || 'Unknown Artist',
        album:  currentStation?.name || currentTrack.album || '90s Radio',
        artwork: buildArtwork(currentTrack),
      });
    } catch (e) {
      console.warn('[MediaSession] Failed to set metadata:', e);
    }
  }, [currentTrack?.id, currentStation?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync playback state ────────────────────────────────────────
  useEffect(() => {
    if (!SUPPORTED) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (e) { /* ignore */ }
  }, [isPlaying]);
}
