// src/components/ambient/AmbientControls.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Sliders } from 'lucide-react';
import { useRadio } from '../../context/RadioContext';
import { useAmbientSound } from '../../hooks/useAmbientSound';
import { AMBIENT_SOUNDS } from '../../data/ambientSounds';
import Slider from '../ui/Slider';

export default function AmbientControls() {
  const { ambientEnabled, ambientVolumes, toggleAmbient, setAmbientVolume } = useRadio();
  const [open, setOpen] = useState(false);

  // Mount ambient synthesis engine
  useAmbientSound();

  return (
    <div className="relative">
      {/* Toggle button */}
      <motion.button
        id="ambient-toggle-btn"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[10px] font-body uppercase tracking-wider transition-all ${
          open
            ? 'text-amber-glow bg-[#1b120f] border-[#d48c36]/40'
            : 'text-paper-dark bg-black/30 border-white/5 hover:border-[#d48c36]/20 hover:text-paper'
        }`}
        whileTap={{ scale: 0.97 }}
        aria-label="Ambient sound controls"
      >
        <Sliders size={10} />
        <span>Ambience</span>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-full mb-2 right-0 w-48 rounded border overflow-hidden z-40"
            style={{
              background: 'rgba(15, 10, 12, 0.95)',
              borderColor: 'rgba(212, 140, 54, 0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <div className="px-3 pt-2 pb-1 border-b border-white/5 bg-black/20">
              <p className="text-[9px] font-body tracking-widest uppercase text-paper-dark/60 font-semibold">
                Atmosphere Mixer
              </p>
            </div>
            <div className="p-3 space-y-2.5">
              {AMBIENT_SOUNDS.map((sound) => {
                const enabled = ambientEnabled[sound.id];
                const vol = ambientVolumes[sound.id] ?? sound.defaultVolume;
                return (
                  <div key={sound.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <button
                        id={`ambient-${sound.id}-btn`}
                        onClick={() => toggleAmbient(sound.id)}
                        className={`flex items-center gap-1.5 text-[10px] font-body transition-colors ${
                          enabled ? 'text-amber-glow' : 'text-paper-dark hover:text-paper-muted'
                        }`}
                        aria-pressed={enabled}
                      >
                        <span>{sound.icon}</span>
                        <span>{sound.label}</span>
                      </button>
                      <div
                        className={`w-6 h-3.5 rounded-full relative cursor-pointer transition-colors ${
                          enabled ? 'bg-[#d48c36]' : 'bg-[#26171d]'
                        }`}
                        onClick={() => toggleAmbient(sound.id)}
                      >
                        <motion.div
                          className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-paper"
                          animate={{ left: enabled ? '12px' : '1.5px' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </div>
                    {enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Slider
                          value={vol}
                          min={0}
                          max={1}
                          step={0.05}
                          onChange={(v) => setAmbientVolume(sound.id, v)}
                          color="#d48c36"
                          className="w-full pt-0.5"
                          ariaLabel={`${sound.label} volume`}
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
