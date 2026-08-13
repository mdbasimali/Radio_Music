// src/components/player/AlbumArt.jsx
// Dynamic artwork display — shows live current-track artwork image.
// Falls back to animated vinyl record when no real artwork is available.
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadio } from '../../context/RadioContext';

// ── Vinyl fallback (shown when no artwork image is available) ──────────────
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
            style={{ inset: `${((1 - scale) / 2) * 100}%` }}
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
          <div className="w-[20%] h-[20%] rounded-full bg-night-900" />
        </div>
      </motion.div>
    </div>
  );
}

// ── Live artwork image (shown when a real artwork URL is available) ─────────
function ArtworkImage({ src, alt, color, isPlaying, size }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset when src changes (track changes)
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  if (error) return null; // Let parent fall back to vinyl

  return (
    <motion.div
      className="absolute inset-0 rounded-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      style={{
        boxShadow: `0 0 0 2px ${color}55, 0 0 16px ${color}33`,
      }}
    >
      {/* Subtle slow rotation while playing — premium feel */}
      <motion.div
        className="w-full h-full"
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { duration: 18, repeat: Infinity, ease: 'linear' } : { duration: 1 }}
      >
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className="w-full h-full rounded-full"
          style={{ objectFit: 'cover', display: 'block' }}
          draggable={false}
        />
      </motion.div>

      {/* Liquid-glass inner edge highlight on image */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
        }}
      />
    </motion.div>
  );
}

// ── Main AlbumArt component ────────────────────────────────────────────────
export default function AlbumArt({ size = 80, className = '' }) {
  const { currentStation, currentTrack, isPlaying } = useRadio();
  const color = currentStation?.color || '#d48c36';

  // Determine artwork URL:
  // 1. currentTrack.artwork — already set to YouTube thumbnail URL by backend
  // 2. For YouTube tracks: construct hqdefault from providerId as fallback
  // 3. No artwork → show vinyl
  const artworkUrl = (() => {
    const raw = currentTrack?.artwork;
    // If it's a real URL (http/https), use it directly
    if (raw && typeof raw === 'string' && raw.startsWith('http')) return raw;
    // If no real URL but it's a YouTube track, build thumbnail
    if (currentTrack?.provider === 'youtube' && currentTrack?.providerId) {
      return `https://i.ytimg.com/vi/${currentTrack.providerId}/mqdefault.jpg`;
    }
    return null;
  })();

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Always render vinyl underneath as the fallback */}
      <VinylRecord color={color} isPlaying={isPlaying} size={size} />

      {/* Overlay the live artwork image on top with crossfade */}
      <AnimatePresence mode="wait">
        {artworkUrl && (
          <ArtworkImage
            key={`${currentTrack?.id}-${artworkUrl}`}
            src={artworkUrl}
            alt={currentTrack?.title || 'Track artwork'}
            color={color}
            isPlaying={isPlaying}
            size={size}
          />
        )}
      </AnimatePresence>

      {/* Playing pulse ring — same as before */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `1.5px solid ${color}` }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}
