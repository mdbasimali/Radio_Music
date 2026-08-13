// src/hooks/useAmbientSound.js
// Interface between React RadioContext state and Web Audio API audioEngine service
import { useEffect } from 'react';
import { useRadio } from '../context/RadioContext';
import * as audioEngine from '../services/audioEngine';

export function useAmbientSound() {
  const { ambientEnabled, ambientVolumes, isPlaying } = useRadio();

  // Try to initialize or resume AudioContext on common user gestures
  useEffect(() => {
    const handleGesture = () => {
      audioEngine.initContext();
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);
    window.addEventListener('touchstart', handleGesture);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, []);

  // Update ducking state based on music playing state
  useEffect(() => {
    audioEngine.setMusicActive(isPlaying);
  }, [isPlaying]);

  // Synchronize ambience layers
  useEffect(() => {
    Object.keys(ambientEnabled).forEach((id) => {
      const enabled = ambientEnabled[id];
      const vol = ambientVolumes[id] ?? 0.3;
      audioEngine.setAmbientLayer(id, enabled, vol);
    });
  }, [ambientEnabled, ambientVolumes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.cleanupAudioEngine();
    };
  }, []);
}
