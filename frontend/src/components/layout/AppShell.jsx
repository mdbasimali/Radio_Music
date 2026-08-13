// src/components/layout/AppShell.jsx
// Root layout wrapper — contains scene, particles, and player bars
// Audio engine is mounted exactly once here
import { useRadioPlayer } from '../../hooks/useRadioPlayer';
import SceneBackground from '../atmosphere/SceneBackground';
import ParticleLayer from '../atmosphere/ParticleLayer';
import RadioPlayer from '../player/RadioPlayer';
import MobilePlayer from '../player/MobilePlayer';

function AudioEngine() {
  useRadioPlayer();
  return null;
}

export default function AppShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Mount audio engine exactly once */}
      <AudioEngine />

      {/* Atmospheric layers (z-0) */}
      <SceneBackground />
      <ParticleLayer />

      {/* Main content (z-10) */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Persistent player bars */}
      <RadioPlayer />
      <MobilePlayer />
    </div>
  );
}
