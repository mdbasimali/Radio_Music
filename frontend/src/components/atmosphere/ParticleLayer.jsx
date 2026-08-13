// src/components/atmosphere/ParticleLayer.jsx
// Floating dust/ember particles for atmospheric depth
import { useMemo } from 'react';
import { motion } from 'framer-motion';

function Particle({ x, y, size, duration, delay, color }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{
        y: [0, -30, 0],
        x: [0, Math.random() * 10 - 5, 0],
        opacity: [0, 0.6, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default function ParticleLayer() {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 80 + 10,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 5,
      color: i % 3 === 0 ? 'rgba(232,160,69,0.8)' : i % 3 === 1 ? 'rgba(245,230,200,0.4)' : 'rgba(192,57,43,0.5)',
    })),
  []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </div>
  );
}
