// src/pages/Home.jsx
// Immersive Indian nostalgic street corner homepage
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import StationSelector from '../components/stations/StationSelector';
import AmbientControls from '../components/ambient/AmbientControls';
import { useRadio } from '../context/RadioContext';
import { useListenerCount } from '../hooks/useListenerCount';

export default function Home() {
  const { currentStation } = useRadio();
  const [hideUI, setHideUI] = useState(false);
  const { listenerCount, isConnected } = useListenerCount();

  return (
    <main className="min-h-screen flex flex-col justify-between relative z-10 select-none pb-28 md:pb-32">
      {/* Top Header: Elegant Vintage Wordmark */}
      <header className="w-full flex items-center justify-between px-6 py-4">
        {/* Distinctive, elegant nostalgic wordmark */}
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 90s Logo — unchanged */}
          <img
            src="/logo.png"
            alt="90s Radio"
            className="h-14 w-auto object-contain"
            style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 0 8px rgba(212,140,54,0.4))' }}
            draggable={false}
          />

          {/* ── 90SGAANA Wordmark — styled to reference ── */}
          <div className="flex flex-col gap-0.5 mt-0.5">

            {/* Main title row with triple-line ornaments */}
            <div className="flex items-center gap-1.5">
              {/* Left ornament — triple lines */}
              <div className="flex flex-col gap-[2px] opacity-70">
                <div style={{ width: 14, height: 1, background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
                <div style={{ width: 14, height: 1, background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
                <div style={{ width: 14, height: 1, background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
              </div>

              {/* 90SGAANA */}
              <h1
                className="font-display font-bold leading-none tracking-[0.18em] whitespace-nowrap"
                style={{
                  fontSize: 'clamp(13px, 2.4vw, 19px)',
                  background: 'linear-gradient(180deg, #f0d97a 0%, #c9a84c 45%, #a87c2a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 1px 3px rgba(180,130,40,0.5))',
                }}
              >
                90SGAANA
              </h1>

              {/* Right ornament — triple lines */}
              <div className="flex flex-col gap-[2px] opacity-70">
                <div style={{ width: 14, height: 1, background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
                <div style={{ width: 14, height: 1, background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
                <div style={{ width: 14, height: 1, background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
              </div>
            </div>

            {/* Subtitle row: — NOSTALGIA ON AIR • — */}
            <div className="flex items-center gap-1">
              <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(to right, transparent, #c9a84c88)' }} />
              <span
                className="uppercase font-body font-medium whitespace-nowrap"
                style={{
                  fontSize: 'clamp(6px, 1vw, 8px)',
                  letterSpacing: '0.35em',
                  color: '#c9a84c',
                  opacity: 0.85,
                }}
              >
                Nostalgia on Air
              </span>
              {/* Bullet dot */}
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#c9a84c', opacity: 0.9, flexShrink: 0 }} />
              <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(to left, transparent, #c9a84c88)' }} />
            </div>
          </div>

          {/* Listener count */}
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected && listenerCount !== null ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[11px] font-mono tracking-wider uppercase text-paper-muted/80 font-medium">
              {isConnected && listenerCount !== null ? `${listenerCount} listening` : 'Listening count unavailable'}
            </span>
          </div>
        </motion.div>



        {/* Hide interface toggle */}
        <motion.button
          onClick={() => setHideUI(!hideUI)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 bg-black/20 text-[9px] uppercase font-body tracking-wider text-paper hover:text-white hover:border-white/10 transition-all"
          whileTap={{ scale: 0.96 }}
          aria-label={hideUI ? 'Show controls' : 'Hide controls'}
        >
          {hideUI ? <Eye size={10} /> : <EyeOff size={10} />}
          <span>{hideUI ? 'Show Controls' : 'Hide UI'}</span>
        </motion.button>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
        <AnimatePresence>
          {!hideUI && (
            <motion.div
              className="w-full space-y-6"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Station Selection */}
              <StationSelector />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient controls block */}
      {!hideUI && (
        <div className="fixed bottom-24 right-4 z-40 md:bottom-28 md:right-6">
          <AmbientControls />
        </div>
      )}
    </main>
  );
}
