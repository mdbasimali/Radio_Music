// src/components/player/MobilePlayer.jsx
// Compact floating bottom player for mobile screens
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, SkipBack, ChevronUp, ChevronDown } from 'lucide-react';
import { useRadio } from '../../context/RadioContext';
import AlbumArt from './AlbumArt';
import NowPlaying from './NowPlaying';
import PlayPauseButton from './PlayPauseButton';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';

export default function MobilePlayer() {
  const { nextTrack, prevTrack, currentStation } = useRadio();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Floating mini bar for mobile */}
      <motion.div
        id="mobile-player"
        className="fixed bottom-4 left-4 right-4 z-50 md:hidden rounded-xl overflow-hidden shadow-2xl pb-safe"
        style={{
          background: 'linear-gradient(180deg, #1b120f 0%, #110b09 100%)',
          border: '1px solid #2d1c17',
        }}
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <AlbumArt size={42} />
          <NowPlaying compact className="flex-1" />
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <motion.button
              onClick={prevTrack}
              className="w-7 h-7 rounded-full bg-[#1b1116] border border-[#2d1c17] flex items-center justify-center text-paper-dark"
              whileTap={{ scale: 0.9 }}
              aria-label="Previous"
            >
              <SkipBack size={12} />
            </motion.button>
            <PlayPauseButton size="sm" />
            <motion.button
              onClick={nextTrack}
              className="w-7 h-7 rounded-full bg-[#1b1116] border border-[#2d1c17] flex items-center justify-center text-paper-dark"
              whileTap={{ scale: 0.9 }}
              aria-label="Next"
            >
              <SkipForward size={12} />
            </motion.button>
          </div>
          <ChevronUp size={14} className="text-paper-dark" />
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setExpanded(false)}
            />
            {/* Panel */}
            <motion.div
              className="relative rounded-t-2xl pb-safe overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #1b120f 0%, #0d080a 100%)',
                borderTop: '1px solid #2d1c17',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              {/* Drag handle decoration */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-8 h-1 rounded-full bg-white/10" />
              </div>

              {/* Collapse action */}
              <button
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 text-paper-dark hover:text-paper"
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
                <div className="w-full h-5 bg-[#0c080a] border border-[#2d1c17] rounded flex items-center relative overflow-hidden px-4">
                  <div className="flex justify-between w-full opacity-20 text-[7px] font-mono text-paper-dark">
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
                      background: currentStation?.color || '#d48c36',
                      boxShadow: `0 0 8px ${currentStation?.color || '#d48c36'}`,
                    }}
                  />
                </div>

                {/* Progress scale */}
                <ProgressBar className="w-full" />

                {/* Buttons container */}
                <div className="flex items-center gap-6">
                  <motion.button
                    onClick={prevTrack}
                    className="w-12 h-12 rounded-full bg-[#1b1116] border border-[#2d1c17] flex items-center justify-center text-paper-muted"
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous"
                  >
                    <SkipBack size={18} />
                  </motion.button>
                  <PlayPauseButton size="lg" />
                  <motion.button
                    onClick={nextTrack}
                    className="w-12 h-12 rounded-full bg-[#1b1116] border border-[#2d1c17] flex items-center justify-center text-paper-muted"
                    whileTap={{ scale: 0.95 }}
                    aria-label="Next"
                  >
                    <SkipForward size={18} />
                  </motion.button>
                </div>

                {/* Volume bar */}
                <div className="flex items-center gap-3 w-full border-t border-white/5 pt-3 sm:hidden">
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
