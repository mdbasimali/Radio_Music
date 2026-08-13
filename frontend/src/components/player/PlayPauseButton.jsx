// src/components/player/PlayPauseButton.jsx
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useRadio } from '../../context/RadioContext';

export default function PlayPauseButton({ size = 'md', className = '' }) {
  const { isPlaying, isLoading, setPlaying, currentStation } = useRadio();

  const sizes = {
    sm: { btn: 'w-9 h-9', icon: 16 },
    md: { btn: 'w-12 h-12', icon: 20 },
    lg: { btn: 'w-16 h-16', icon: 26 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <motion.button
      id="play-pause-btn"
      onClick={() => setPlaying(!isPlaying)}
      disabled={isLoading}
      className={`relative flex items-center justify-center rounded-full flex-shrink-0 ${s.btn} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${currentStation?.color || '#d48c36'}, ${currentStation?.color || '#d48c36'}bb)`,
        boxShadow: isPlaying ? `0 0 24px ${(currentStation?.color || '#d48c36')}66` : 'none',
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isLoading ? (
        <motion.div
          className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <motion.div
          key={isPlaying ? 'pause' : 'play'}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {isPlaying
            ? <Pause size={s.icon} fill="#0a0608" color="#0a0608" />
            : <Play  size={s.icon} fill="#0a0608" color="#0a0608" className="ml-0.5" />
          }
        </motion.div>
      )}
    </motion.button>
  );
}
