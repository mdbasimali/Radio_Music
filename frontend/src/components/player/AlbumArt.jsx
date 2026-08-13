// src/components/player/AlbumArt.jsx
// Animated vinyl record with groove rings — spins while playing
import { motion } from 'framer-motion';
import { useRadio } from '../../context/RadioContext';

function VinylRecord({ color, isPlaying, size = 80 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, #1a1118 0deg, #2a1d27 10deg, #1a1118 20deg, #231820 30deg, #1a1118 40deg, #2a1d27 50deg, #1a1118 60deg)`,
          boxShadow: isPlaying ? `0 0 20px ${color}40` : 'none',
        }}
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}
      >
        {/* Groove rings */}
        {[0.85, 0.72, 0.6, 0.48].map((scale, i) => (
          <div
            key={i}
            className="absolute rounded-full vinyl-groove"
            style={{
              inset: `${((1 - scale) / 2) * 100}%`,
            }}
          />
        ))}

        {/* Label in center */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            inset: '30%',
            background: `radial-gradient(circle, ${color}dd, ${color}88)`,
          }}
        >
          {/* Center hole */}
          <div className="w-[20%] h-[20%] rounded-full bg-night-900" />
        </div>
      </motion.div>
    </div>
  );
}

export default function AlbumArt({ size = 80, className = '' }) {
  const { currentStation, isPlaying } = useRadio();

  const color = currentStation?.color || '#d48c36';

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <VinylRecord
        color={color}
        isPlaying={isPlaying}
        size={size}
      />
      {/* Playing pulse ring */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `1px solid ${color}` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}
