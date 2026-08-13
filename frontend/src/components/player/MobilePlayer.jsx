// src/components/player/MobilePlayer.jsx
// Compact floating bottom player for mobile screens with Liquid Glass material matching reference UI
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, SkipBack, ChevronDown } from 'lucide-react';
import { useRadio } from '../../context/RadioContext';
import AlbumArt from './AlbumArt';
import NowPlaying from './NowPlaying';
import PlayPauseButton from './PlayPauseButton';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';

export default function MobilePlayer() {
  const { nextTrack, prevTrack, currentStation } = useRadio();
  const [expanded, setExpanded] = useState(false);

  const glassAccent = currentStation?.color || 'var(--theme-accent, #d48c36)';

  return (
    <>
      {/* Floating mini player for mobile — Apple Liquid Glass */}
      <motion.div
        id="mobile-player"
        className="fixed bottom-[18px] left-[5%] right-[5%] w-[90%] z-50 md:hidden rounded-[20px] overflow-hidden pb-safe transition-all duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.025) 100%)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
        }}
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top reflection highlight */}
        <div
          className="h-full w-full absolute inset-0 pointer-events-none rounded-[20px]"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.015) 30%, transparent 70%)',
          }}
        />

        {/* Reference Composition: [Artwork] [Song Info + Progress/Timing] [Prev Play Next] */}
        <div
          className="flex items-center justify-between gap-2.5 p-2.5 cursor-pointer relative z-10"
          onClick={() => setExpanded(true)}
        >
          {/* Left: Album Artwork */}
          <AlbumArt size={44} className="flex-shrink-0" />

          {/* Middle: Title, Artist and Progress / Timing */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <NowPlaying compact className="w-full" />
            
            {/* Embedded Timing & Progress Bar */}
            <div className="w-full" onClick={(e) => e.stopPropagation()}>
              <ProgressBar compact showTime />
            </div>
          </div>

          {/* Right: Controls [Previous] [Play/Pause] [Next] */}
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <motion.button
              onClick={prevTrack}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--theme-text, #ebdcb9)' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous"
            >
              <SkipBack size={12} fill="currentColor" />
            </motion.button>

            <PlayPauseButton size="sm" />

            <motion.button
              onClick={nextTrack}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--theme-text, #ebdcb9)' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next"
            >
              <SkipForward size={12} fill="currentColor" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Expanded bottom sheet details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setExpanded(false)}
            />
            {/* Panel */}
            <motion.div
              className="relative rounded-t-[28px] pb-safe overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 20, 16, 0.65) 0%, rgba(15, 10, 8, 0.75) 100%)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              {/* Drag handle decoration */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-8 h-1 rounded-full bg-white/25" />
              </div>

              {/* Collapse action */}
              <button
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 text-paper-dark hover:text-paper"
                style={{ color: 'var(--theme-muted, #a09070)' }}
                aria-label="Collapse player"
              >
                <ChevronDown size={20} />
              </button>

              <div className="flex flex-col items-center px-6 pt-4 pb-8 gap-5">
                {/* Vinyl plate graphic */}
                <AlbumArt size={160} />

                {/* Info */}
                <NowPlaying className="text-center w-full" />

                {/* Tuning scale mockup on expanded mobile view */}
                <div className="w-full h-5 rounded-lg flex items-center relative overflow-hidden px-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex justify-between w-full text-[7px] font-mono opacity-70" style={{ color: 'var(--theme-muted, #a09070)' }}>
                    <span>88 MHz</span>
                    <span>96</span>
                    <span>104</span>
                    <span>108</span>
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-[1.5px]"
                    style={{
                      left: currentStation?.id === 'hindi' ? '20%'
                          : currentStation?.id === 'bengali' ? '40%'
                          : currentStation?.id === 'bhojpuri' ? '60%' : '80%',
                      background: glassAccent,
                      boxShadow: `0 0 8px ${glassAccent}`,
                    }}
                  />
                </div>

                {/* Progress scale */}
                <ProgressBar className="w-full" />

                {/* Buttons container */}
                <div className="flex items-center gap-6">
                  <motion.button
                    onClick={prevTrack}
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'var(--theme-text, #ebdcb9)' }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous"
                  >
                    <SkipBack size={18} />
                  </motion.button>
                  <PlayPauseButton size="lg" />
                  <motion.button
                    onClick={nextTrack}
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'var(--theme-text, #ebdcb9)' }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Next"
                  >
                    <SkipForward size={18} />
                  </motion.button>
                </div>

                {/* Volume bar */}
                <div className="flex items-center gap-3 w-full border-t border-white/10 pt-3 sm:hidden">
                  <VolumeControl />
                  <div className="flex-1">
                    <VolumeControl compact={false} className="w-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
