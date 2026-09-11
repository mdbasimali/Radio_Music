// src/pages/Home.jsx
// Immersive Indian nostalgic street corner homepage
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import StationSelector from '../components/stations/StationSelector';
import NostalgiaSelector from '../components/ui/NostalgiaSelector';
import { useRadio } from '../context/RadioContext';
import { useListenerCount } from '../hooks/useListenerCount';

export default function Home() {
  const { currentStation } = useRadio();
  const [hideUI, setHideUI] = useState(false);
  const [nostalgiaOpen, setNostalgiaOpen] = useState(false);
  const { listenerCount, isConnected } = useListenerCount();

  return (
    <main
      aria-label="90s Gaana – Retro Indian Music Radio"
      className="min-h-screen flex flex-col justify-between relative z-10 select-none pb-28 md:pb-32"
    >
      {/* Visually hidden SEO description — do not remove */}
      <p
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        90s Gaana is an online retro radio playing classic 90s Hindi songs, 90s Bengali songs and 90s Bhojpuri songs. Rediscover nostalgic music from the golden era of Indian cinema.
      </p>
      {/* Top Header */}
      <header className="w-full flex flex-wrap md:flex-nowrap items-center justify-between px-6 py-4 relative">
        {/* Left: Full Brand Logo + Listener status */}
        <motion.div
          className="flex items-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="sr-only">90s Gaana – Nostalgia On Air</h1>
          <img
            src="/logo.png?v=3"
            alt="90s Gaana – Nostalgia On Air"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.03]"
          />
          {/* Listener count badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-sm select-none">
            <span className={`w-2 h-2 rounded-full ${isConnected && listenerCount !== null ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-paper-muted/80 font-medium whitespace-nowrap">
              {isConnected && listenerCount !== null ? `${listenerCount} listening` : 'Connecting...'}
            </span>
          </div>
        </motion.div>

        {/* Center / Signature: Created by Ani (Liquid Glass) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="order-3 md:order-none w-full md:w-auto flex justify-center mt-2.5 md:mt-0 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 pointer-events-none select-none"
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(20, 12, 15, 0.65) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 140, 54, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.08), inset 0 -1px 1px rgba(0, 0, 0, 0.4)',
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
          >
            <span className="text-[10px] font-sans font-light tracking-wider text-paper/55">
              Created by
            </span>
            <span
              style={{
                background: 'linear-gradient(180deg, #fbf2cc 0%, #d48c36 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              className="text-[10.5px] font-sans font-semibold tracking-wide"
            >
              Ani
            </span>
          </div>
        </motion.div>

        {/* Right: NOSTALGIA + HIDE UI buttons */}
        <div className="w-full md:w-auto flex items-center justify-end gap-2 mt-2.5 md:mt-0 order-2 md:order-none">
          {/* NOSTALGIA button with popover */}
          <div className="relative">
            <motion.button
              id="nostalgia-toggle-btn"
              onClick={() => setNostalgiaOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] uppercase font-body tracking-wider transition-all ${
                nostalgiaOpen
                  ? 'border-[#d48c36]/40 bg-[#d48c36]/10 text-[#d48c36]'
                  : 'border-white/5 bg-black/20 text-paper hover:text-white hover:border-white/10'
              }`}
              whileTap={{ scale: 0.96 }}
              aria-label="Choose Nostalgia Background"
              aria-expanded={nostalgiaOpen}
            >
              <Sparkles size={10} />
              <span>Nostalgia</span>
            </motion.button>

            <NostalgiaSelector open={nostalgiaOpen} onClose={() => setNostalgiaOpen(false)} />
          </div>

          {/* HIDE UI button */}
          <motion.button
            id="hide-ui-btn"
            onClick={() => setHideUI(!hideUI)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 bg-black/20 text-[9px] uppercase font-body tracking-wider text-paper hover:text-white hover:border-white/10 transition-all"
            whileTap={{ scale: 0.96 }}
            aria-label={hideUI ? 'Show controls' : 'Hide controls'}
          >
            {hideUI ? <Eye size={10} /> : <EyeOff size={10} />}
            <span>{hideUI ? 'Show Controls' : 'Hide UI'}</span>
          </motion.button>
        </div>
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
              <StationSelector />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
