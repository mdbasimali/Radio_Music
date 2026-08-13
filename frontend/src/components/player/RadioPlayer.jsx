// src/components/player/RadioPlayer.jsx
// Premium floating vintage analog radio player deck
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

  return (
    <motion.div
      id="radio-player"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex flex-col w-[92%] max-w-[700px] rounded-lg overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, #160e0c 0%, #0d0807 100%)',
        border: '1px solid #231612',
        borderColor: currentStation?.color ? `${currentStation.color}22` : '#231612',
      }}
      initial={{ y: 60, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Wooden top decorative border */}
      <div className="h-1 w-full bg-gradient-to-r from-[#231612] via-[#3a251d] to-[#231612]" />

      <div className="flex items-center gap-3.5 p-3.5 flex-wrap md:flex-nowrap">
        {/* Left: Album art / Track Info */}
        <div className="flex items-center gap-3.5 w-full md:w-[220px] lg:w-[250px] pr-3 md:border-r border-[#231612]/80 min-w-[200px]">
          <AlbumArt size={48} />
          <NowPlaying compact className="flex-1" />
        </div>

        {/* Center: Frequency dial display & Progress bar */}
        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          {/* Dial scale decoration */}
          <div className="h-7 bg-[#080506] border border-[#231612]/60 rounded px-2.5 flex items-center relative overflow-hidden">
            <div className="flex justify-between w-full opacity-40 text-[8px] font-mono tracking-wider text-paper font-medium">
              <span>88 AM</span>
              <span>92</span>
              <span>96</span>
              <span>100</span>
              <span>104</span>
              <span>108 MHz</span>
            </div>
            {/* Tick marks */}
            <div className="absolute inset-x-0 bottom-0.5 flex justify-between px-3">
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
                background: '#d48c36',
                boxShadow: '0 0 8px #d48c36',
              }}
            />
          </div>

          {/* Time seeker progress */}
          <ProgressBar />
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3.5 pl-3 md:border-l border-[#231612]/80 flex-shrink-0 w-full md:w-auto justify-between md:justify-start mt-2 md:mt-0">
          <div className="flex items-center gap-2">
            <motion.button
              id="prev-track-btn"
              onClick={prevTrack}
              className="w-7 h-7 rounded-full border border-[#231612] bg-[#110b0e] flex items-center justify-center text-paper-dark hover:text-paper hover:bg-[#1b1116] transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label="Previous track"
            >
              <SkipBack size={12} />
            </motion.button>
            <PlayPauseButton size="md" />
            <motion.button
              id="next-track-btn"
              onClick={nextTrack}
              className="w-7 h-7 rounded-full border border-[#231612] bg-[#110b0e] flex items-center justify-center text-paper-dark hover:text-paper hover:bg-[#1b1116] transition-colors"
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
