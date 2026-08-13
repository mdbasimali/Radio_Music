// src/components/ui/NostalgiaSelector.jsx
// Liquid Glass popover for selecting 90s Nostalgia Background Scenes.
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useNostalgia } from '../../context/NostalgiaContext';

export default function NostalgiaSelector({ open, onClose }) {
  const { activeBg, backgrounds, setBackground } = useNostalgia();
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          className="absolute top-full mt-2 right-0 z-[100] w-64 md:w-72 max-w-[calc(100vw-2rem)]"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(160deg, rgba(18, 12, 9, 0.96) 0%, rgba(6, 4, 3, 0.98) 100%)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderTop: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.1) inset',
            borderRadius: 16,
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/30 rounded-t-2xl">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#d48c36]" />
              <p className="text-[10px] font-body tracking-[0.2em] uppercase font-bold text-[#f0cb78]">
                NOSTALGIA BACKGROUNDS
              </p>
            </div>
          </div>

          {/* Background list */}
          <div className="py-2 max-h-[60vh] overflow-y-auto space-y-1 px-1.5">
            {backgrounds.map((bg) => {
              const isActive = bg.id === activeBg.id;
              return (
                <motion.button
                  key={bg.id}
                  onClick={() => {
                    setBackground(bg.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-[#d48c36]/20 border border-[#d48c36]/60 shadow-[0_0_12px_rgba(212,140,54,0.15)]'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 border border-white/15 shadow-md relative overflow-hidden"
                    style={{ background: bg.thumbnail }}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-body font-bold truncate ${
                        isActive ? 'text-[#fbe6ad]' : 'text-paper'
                      }`}
                    >
                      {bg.name}
                    </p>
                    <p className="text-[9.5px] font-body text-paper-muted/75 truncate leading-tight mt-0.5">
                      {bg.desc}
                    </p>
                  </div>

                  {/* Checkmark */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <Check size={14} className="text-[#d48c36] stroke-[2.5]" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
