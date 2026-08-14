// src/components/player/PlayPauseButton.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useRadio } from '../../context/RadioContext';
import { playbackManager } from '../../services/playbackManager';
import * as audioEngine from '../../services/audioEngine';


export default function PlayPauseButton({ size = 'md', className = '' }) {
  const {
    isPlaying,
    isLoading,
    hasUserInteracted,
    setPlaying,
    setUserInteracted,
    currentStation,
  } = useRadio();

  const sizes = {
    sm: { btn: 'w-9 h-9', icon: 16 },
    md: { btn: 'w-12 h-12', icon: 20 },
    lg: { btn: 'w-16 h-16', icon: 26 },
  };
  const s = sizes[size] || sizes.md;

  const bgStyle = currentStation?.color
    ? `linear-gradient(135deg, ${currentStation.color}, ${currentStation.color}cc)`
    : 'var(--theme-accent-gradient, linear-gradient(135deg, #d48c36, #b06f25))';

  const shadowStyle = isPlaying
    ? `0 0 20px ${currentStation?.color || 'var(--theme-glow, rgba(212,140,54,0.4))'}`
    : '0 8px 20px rgba(0, 0, 0, 0.3)';

  // Show subtle loading ring ONLY when genuinely loading after user interaction.
  // This never replaces the Play/Pause icon — it's a separate visual layer.
  const showLoadingRing = isLoading && hasUserInteracted;

  return (
    <motion.button
      id="play-pause-btn"
      onClick={() => {
        setUserInteracted();
        try { audioEngine.initContext(); } catch (e) {}
        if (!isPlaying) {
          playbackManager.play();
          setPlaying(true);
        } else {
          playbackManager.pause();
          setPlaying(false);
        }
      }}

      // Never disable the button for loading — user can always click
      className={`relative flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 ${s.btn} ${className}`}
      style={{
        background: bgStyle,
        boxShadow: shadowStyle,
        border: '1px solid rgba(255, 255, 255, 0.25)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {/* Liquid glass inner highlight arc */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, transparent 70%)',
        }}
      />

      {/* Subtle loading ring — sits BEHIND the icon, never replaces it */}
      <AnimatePresence>
        {showLoadingRing && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              border: '2px solid transparent',
              borderTopColor: 'rgba(255,255,255,0.5)',
              animation: 'spin 1s linear infinite',
            }}
          />
        )}
      </AnimatePresence>

      {/* Main icon — ALWAYS Play or Pause, never replaced by spinner */}
      <motion.div
        key={isPlaying ? 'pause' : 'play'}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.12 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {isPlaying
          ? <Pause size={s.icon} fill="#0a0608" color="#0a0608" />
          : <Play  size={s.icon} fill="#0a0608" color="#0a0608" className="ml-0.5" />
        }
      </motion.div>
    </motion.button>
  );
}
