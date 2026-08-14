// src/components/stations/StationCard.jsx
import { motion } from 'framer-motion';
import { useRadio } from '../../context/RadioContext';

export default function StationCard({ station, index }) {
  const { currentStation, setStation, isPlaying, setPlaying } = useRadio();
  const isActive = currentStation?.id === station.id;

  return (
    <motion.button
      id={`station-${station.id}`}
      className="relative w-full text-left rounded-xl overflow-hidden transition-all duration-300 backdrop-blur-xl"
      style={{
        background: isActive
          ? 'var(--theme-surface-active, rgba(38, 22, 14, 0.85))'
          : 'var(--theme-surface, rgba(20, 14, 12, 0.72))',
        border: isActive
          ? '1px solid var(--theme-border-active, rgba(212, 140, 54, 0.65))'
          : '1px solid var(--theme-border, rgba(255, 255, 255, 0.12))',
        boxShadow: isActive
          ? '0 10px 28px rgba(0, 0, 0, 0.7), 0 0 16px var(--theme-glow, rgba(212, 140, 54, 0.2)), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          : '0 6px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      }}
      onClick={() => {
        if (isActive) {
          // Toggle play/pause for the already-selected station
          setPlaying(!isPlaying);
        } else {
          // Select the new station and immediately begin playback
          setStation(station);
          setPlaying(true);
        }
      }}
      whileHover={{ y: -2, border: '1px solid var(--theme-border-active, rgba(212, 140, 54, 0.5))' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {/* Delicate glass highlight border */}
      <div className="absolute inset-0.5 border border-white/10 pointer-events-none rounded-lg" />

      <div className="p-3.5 relative z-10 flex flex-col justify-between h-24">
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <span className="text-lg opacity-90">{station.icon}</span>
          <span
            className="text-[9px] font-body tracking-wider uppercase font-bold transition-colors"
            style={{ color: 'var(--theme-muted, #a09070)' }}
          >
            {station.language}
          </span>
        </div>

        {/* Station name and play waves */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3
              className="font-display text-xs font-bold tracking-wide truncate drop-shadow-md transition-colors"
              style={{ color: 'var(--theme-text, #ebdcb9)' }}
            >
              {station.name}
            </h3>
            <p
              className="text-[9px] font-body truncate font-medium transition-colors"
              style={{ color: 'var(--theme-muted, #a09070)' }}
            >
              {station.subtitle}
            </p>
          </div>

          {isActive && isPlaying && (
            <div className="flex gap-0.5 items-end h-2.5 pb-0.5 flex-shrink-0">
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{ background: 'var(--theme-accent, #d48c36)' }}
                  animate={{ height: ['3px', '8px', '3px'] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
