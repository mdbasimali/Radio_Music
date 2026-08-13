// src/components/stations/StationCard.jsx
import { motion } from 'framer-motion';
import { useRadio } from '../../context/RadioContext';

export default function StationCard({ station, index }) {
  const { currentStation, setStation, isPlaying } = useRadio();
  const isActive = currentStation?.id === station.id;

  return (
    <motion.button
      id={`station-${station.id}`}
      className="relative w-full text-left rounded-lg overflow-hidden transition-all duration-300 backdrop-blur-md"
      style={{
        background: isActive
          ? 'rgba(30, 20, 24, 0.65)'
          : 'rgba(15, 10, 12, 0.25)',
        border: isActive
          ? '1px solid rgba(212, 140, 54, 0.35)'
          : '1px solid rgba(235, 220, 185, 0.04)',
        boxShadow: isActive
          ? '0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212, 140, 54, 0.08)'
          : 'none',
      }}
      onClick={() => setStation(station)}
      whileHover={{ y: -1, border: '1px solid rgba(235, 220, 185, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {/* Delicate inner accent line */}
      <div className="absolute inset-0.5 border border-white/5 pointer-events-none rounded" />

      <div className="p-3.5 relative z-10 flex flex-col justify-between h-24">
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <span className="text-lg opacity-70 filter saturate-75">{station.icon}</span>
          <span className="text-[9px] font-body tracking-wider uppercase text-paper-muted/50">
            {station.language}
          </span>
        </div>

        {/* Station name and play waves */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-xs font-semibold tracking-wide text-paper truncate">
              {station.name}
            </h3>
            <p className="text-[9px] font-body text-paper-muted/60 truncate">
              {station.subtitle}
            </p>
          </div>

          {isActive && isPlaying && (
            <div className="flex gap-0.5 items-end h-2.5 pb-0.5 flex-shrink-0">
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{ background: '#d48c36' }}
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
