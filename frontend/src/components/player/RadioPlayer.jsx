// src/components/player/RadioPlayer.jsx
// Apple VisionOS Liquid Glass floating radio player deck
import { motion } from 'framer-motion';
import { SkipForward, SkipBack } from 'lucide-react';
import { useRadio } from '../../context/RadioContext';
import AlbumArt from './AlbumArt';
import NowPlaying from './NowPlaying';
import PlayPauseButton from './PlayPauseButton';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';

export default function RadioPlayer() {
  const { nextTrack, prevTrack, currentStation } = useRadio();

  const glassAccent = currentStation?.color || 'var(--theme-accent, #d48c36)';

  return (
    <motion.div
      id="radio-player"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex flex-col w-[92%] max-w-[700px] rounded-[24px] overflow-hidden transition-all duration-500"
      style={{
        /* ── Apple VisionOS Liquid Glass Material ── */
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.035) 45%, rgba(255, 255, 255, 0.015) 100%)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.18),
          inset 0 -1px 0 rgba(255, 255, 255, 0.04),
          0 20px 60px rgba(0, 0, 0, 0.30)
        `,
      }}
      initial={{ y: 60, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top light reflection arc */}
      <div
        className="h-full w-full absolute inset-0 pointer-events-none rounded-[24px]"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.025) 25%, transparent 60%)',
        }}
      />

      <div className="flex items-center gap-3.5 p-3.5 flex-wrap md:flex-nowrap relative z-10">
        {/* Left: Album art / Track Info */}
        <div className="flex items-center gap-3.5 w-full md:w-[220px] lg:w-[250px] pr-3 md:border-r border-white/[0.12] min-w-[200px]">
          <AlbumArt size={48} />
          <NowPlaying compact className="flex-1" />
        </div>

        {/* Center: Frequency dial display & Progress bar */}
        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          {/* Dial scale decoration */}
          <div
            className="h-7 rounded-xl px-2.5 flex items-center relative overflow-hidden transition-colors duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex justify-between w-full opacity-70 text-[8px] font-mono tracking-wider font-medium" style={{ color: 'var(--theme-text, #ebdcb9)' }}>
              <span>88 AM</span>
              <span>92</span>
              <span>96</span>
              <span>100</span>
              <span>104</span>
              <span>108 MHz</span>
            </div>
            {/* Tick marks */}
            <div className="absolute inset-x-0 bottom-0.5 flex justify-between px-3 opacity-40">
              {Array.from({ length: 21 }).map((_, i) => (
                <div
                  key={i}
                  className={`radio-dial-mark ${i % 4 === 0 ? 'major' : ''}`}
                />
              ))}
            </div>
            {/* Glowing station marker line */}
            <div
              className="absolute top-0 bottom-0 w-[2px] transition-all duration-500"
              style={{
                left: currentStation?.id === 'hindi' ? '18%'
                    : currentStation?.id === 'bengali' ? '38%'
                    : currentStation?.id === 'bhojpuri' ? '58%' : '82%',
                background: glassAccent,
                boxShadow: `0 0 10px ${glassAccent}`,
              }}
            />
          </div>

          {/* Time seeker progress */}
          <ProgressBar />
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3.5 pl-3 md:border-l border-white/[0.12] flex-shrink-0 w-full md:w-auto justify-between md:justify-start mt-2 md:mt-0">
          <div className="flex items-center gap-2">
            <motion.button
              id="prev-track-btn"
              onClick={prevTrack}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--theme-text, #ebdcb9)',
                backdropFilter: 'blur(8px)',
              }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous track"
            >
              <SkipBack size={12} />
            </motion.button>

            <PlayPauseButton size="md" />

            <motion.button
              id="next-track-btn"
              onClick={nextTrack}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--theme-text, #ebdcb9)',
                backdropFilter: 'blur(8px)',
              }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next track"
            >
              <SkipForward size={12} />
            </motion.button>
          </div>

          {/* Volume Control */}
          <VolumeControl />
        </div>
      </div>
    </motion.div>
  );
}
