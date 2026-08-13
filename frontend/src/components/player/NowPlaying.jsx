// src/components/player/NowPlaying.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useRadio } from '../../context/RadioContext';

export default function NowPlaying({ className = '', compact = false }) {
  const { currentTrack, currentStation, isPlaying, failedTrackIds } = useRadio();

  if (!currentTrack) return null;

  const isPlayable = currentTrack.provider === 'youtube'
    ? Boolean(currentTrack.providerId)
    : Boolean(currentTrack.url);

  const isFailed = failedTrackIds?.includes(currentTrack.id);

  return (
    <div className={`min-w-0 ${className}`}>
      {/* Station badge - clean minimal layout */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-body font-semibold tracking-wider text-amber-glow uppercase">
          {currentStation?.icon} {currentStation?.name}
        </span>
        {isPlaying && (
          <span className="flex gap-0.5 items-end h-2.5">
            {[1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-0.5 rounded-full"
                style={{ background: '#d48c36' }}
                animate={{ height: ['3px', '8px', '3px'] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </span>
        )}
      </div>

      {/* Track title & artist details - higher contrast */}
      <AnimatePresence mode="wait">
        {!isPlayable ? (
          <motion.div
            key="unavailable-state"
            className="overflow-hidden"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-display font-medium text-amber-500 text-xs md:text-sm truncate">
              ⚠️ Audio source unavailable
            </p>
            <p className="font-body text-paper-muted text-[10px] md:text-xs truncate">
              {currentTrack.title} · {currentTrack.artist}
            </p>
          </motion.div>
        ) : isFailed ? (
          <motion.div
            key="failed-state"
            className="overflow-hidden"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-display font-medium text-rose-500 text-xs md:text-sm truncate">
              ⚠️ Audio connection failed
            </p>
            <p className="font-body text-rose-400/80 text-[10px] md:text-xs truncate">
              Skipping to next track...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={currentTrack.id}
            className="overflow-hidden"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-display font-medium text-paper text-xs md:text-sm truncate" title={currentTrack.title}>
              {currentTrack.title}
            </p>
            <p className="font-body text-paper-muted text-[10px] md:text-xs truncate">
              {currentTrack.artist}
              {currentTrack.album && (
                <span className="opacity-50"> · {currentTrack.album}</span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
