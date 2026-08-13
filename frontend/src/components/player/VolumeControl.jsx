// src/components/player/VolumeControl.jsx
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRadio } from '../../context/RadioContext';
import Slider from '../ui/Slider';

export default function VolumeControl({ className = '', compact = false }) {
  const { volume, isMuted, setVolume, toggleMute, currentStation } = useRadio();

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX :
    volume < 0.35 ? Volume :
    volume < 0.7 ? Volume1 : Volume2;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        id="mute-btn"
        onClick={toggleMute}
        className="text-paper-muted hover:text-amber-glow transition-colors flex-shrink-0"
        whileTap={{ scale: 0.9 }}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon size={16} />
      </motion.button>
      {!compact && (
        <Slider
          value={isMuted ? 0 : volume}
          min={0}
          max={1}
          step={0.02}
          onChange={setVolume}
          color={currentStation?.color || '#d48c36'}
          className="w-20"
          ariaLabel="Volume"
        />
      )}
    </div>
  );
}
