// src/components/ui/InstallBanner.jsx
// Elegant, non-intrusive install prompt matching 90s Gaana dark/gold design.
// Slides up from the bottom after meaningful engagement.

import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';

export default function InstallBanner({ show, isIOS, onInstall, onDismiss }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: 'min(92vw, 380px)',
          }}
        >
          {/* Card */}
          <div
            style={{
              background: 'rgba(14, 8, 10, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 140, 54, 0.25)',
              borderRadius: 16,
              padding: '14px 16px',
              boxShadow:
                '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,140,54,0.08) inset',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Icon */}
            <img
              src="/icon-192.png"
              alt="90s Gaana app icon"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                flexShrink: 0,
                border: '1px solid rgba(212,140,54,0.2)',
              }}
            />

            {/* Text block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#ebdcb9',
                  letterSpacing: '0.01em',
                  lineHeight: 1.3,
                }}
              >
                Install 90s Gaana
              </p>

              {isIOS ? (
                <p
                  style={{
                    fontSize: 11,
                    color: '#a09070',
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  Tap{' '}
                  <Share
                    size={10}
                    style={{ display: 'inline', verticalAlign: 'middle', color: '#d48c36' }}
                  />{' '}
                  <span style={{ color: '#d48c36' }}>Share</span>, then{' '}
                  <strong style={{ color: '#ebdcb9' }}>Add to Home Screen</strong>
                </p>
              ) : (
                <p
                  style={{
                    fontSize: 11,
                    color: '#a09070',
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  Nostalgia on Air — anytime, anywhere
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {!isIOS && (
                <motion.button
                  onClick={onInstall}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '7px 12px',
                    borderRadius: 20,
                    border: '1px solid rgba(212,140,54,0.45)',
                    background: 'linear-gradient(135deg, rgba(212,140,54,0.18) 0%, rgba(180,110,30,0.12) 100%)',
                    color: '#d48c36',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Download size={11} />
                  Install
                </motion.button>
              )}

              {/* Dismiss */}
              <motion.button
                onClick={onDismiss}
                whileTap={{ scale: 0.9 }}
                aria-label="Dismiss install prompt"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#605040',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={13} />
              </motion.button>
            </div>
          </div>

          {/* Subtle gold bottom line */}
          <div
            style={{
              height: 2,
              borderRadius: '0 0 16px 16px',
              background: 'linear-gradient(to right, transparent, #d48c3655, transparent)',
              marginTop: -1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
