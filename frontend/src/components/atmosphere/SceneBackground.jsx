// src/components/atmosphere/SceneBackground.jsx
// Premium cinematic nostalgic Indian street corner at night during light rain
import { motion } from 'framer-motion';

function RainLayer({ count = 35 }) {
  const drops = Array.from({ length: count }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    height: `${Math.random() * 50 + 25}px`,
    animationDuration: `${Math.random() * 0.7 + 0.5}s`,
    animationDelay: `${Math.random() * 2}s`,
    opacity: Math.random() * 0.25 + 0.08,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {drops.map((drop, i) => (
        <div
          key={i}
          className="rain-drop"
          style={{
            left: drop.left,
            height: drop.height,
            animationDuration: drop.animationDuration,
            animationDelay: drop.animationDelay,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function SceneBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050304]">
      {/* Cinematic night-sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 15%, #12070c 0%, #050304 100%)',
        }}
      />

      {/* Street Scene Vector */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1200 650"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMax slice"
        >
          {/* Gradients definitions */}
          <defs>
            <radialGradient id="lanternWarmth" cx="50%" cy="15%" r="80%">
              <stop offset="0%" stopColor="#e59846" stopOpacity="0.45" />
              <stop offset="30%" stopColor="#e59846" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#e59846" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="chaiLantern" cx="50%" cy="20%" r="70%">
              <stop offset="0%" stopColor="#e59846" stopOpacity="0.5" />
              <stop offset="35%" stopColor="#e59846" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#e59846" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="wetReflections" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e59846" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#9e2a2b" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#050304" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Distant building skyline */}
          <path d="M0,450 L0,240 L110,240 L110,210 L220,210 L220,280 L290,280 L290,190 L420,190 L420,330 L500,330 L500,450 Z" fill="#090507" />
          <path d="M780,450 L780,310 L860,310 L860,220 L960,220 L960,280 L1080,280 L1080,230 L1200,230 L1200,450 Z" fill="#090507" />

          {/* Hanging power cables */}
          <path d="M0,100 Q300,180 600,165 T1200,120" fill="none" stroke="#0b0709" strokeWidth="1.2" />
          <path d="M0,115 Q300,200 600,180 T1200,135" fill="none" stroke="#0b0709" strokeWidth="0.8" />
          <path d="M290,190 Q500,230 780,220" fill="none" stroke="#0b0709" strokeWidth="0.6" />

          {/* Midground brick/concrete walls */}
          <rect x="220" y="300" width="200" height="200" fill="#0e080b" />
          <rect x="800" y="280" width="220" height="220" fill="#0e080b" />

          {/* Traditional arches / window design */}
          <path d="M260,330 Q270,320 280,330 L280,360 L260,360 Z" fill="#e59846" opacity="0.18" />
          <path d="M310,330 Q320,320 330,330 L330,360 L310,360 Z" fill="#e59846" opacity="0.25" />
          <path d="M840,310 Q850,300 860,310 L860,345 L840,345 Z" fill="#e59846" opacity="0.12" />
          <path d="M890,310 Q900,300 910,310 L910,345 L890,345 Z" fill="#e59846" opacity="0.22" />

          {/* Streetlamp assembly */}
          <line x1="590" y1="90" x2="590" y2="480" stroke="#160e12" strokeWidth="6.5" />
          <path d="M590,110 Q625,100 635,120" fill="none" stroke="#160e12" strokeWidth="3.5" />
          <path d="M620,120 L650,120 L645,127 L625,127 Z" fill="#24161d" />
          <ellipse cx="635" cy="127" rx="7" ry="2.5" fill="#fff5d6" />

          {/* Warm tungsten cone glow */}
          <polygon points="635,127 410,485 860,485" fill="url(#lanternWarmth)" />

          {/* Wet asphalt ground & street level */}
          <rect x="0" y="475" width="1200" height="175" fill="#060305" />
          <rect x="0" y="475" width="1200" height="50" fill="url(#wetReflections)" />

          {/* Hand-pulled rickshaw/bicycle silhouette */}
          <g transform="translate(470, 412)" stroke="#060305" strokeWidth="2.5" fill="none">
            {/* Wheels */}
            <circle cx="20" cy="50" r="18" />
            <circle cx="75" cy="50" r="18" />
            {/* Frame lines */}
            <line x1="20" y1="50" x2="75" y2="50" />
            <line x1="20" y1="50" x2="38" y2="25" />
            <line x1="75" y1="50" x2="68" y2="28" />
            <line x1="38" y1="25" x2="68" y2="28" />
            <line x1="68" y1="28" x2="65" y2="12" />
            <line x1="65" y1="12" x2="74" y2="12" />
            {/* Passenger seat outline (rickshaw feel) */}
            <path d="M12,32 Q12,20 28,20 L36,20 L36,36" strokeWidth="2" />
          </g>

          {/* Indian Chai Stall setup */}
          <g transform="translate(680, 390)">
            {/* Pillars */}
            <rect x="5" y="0" width="3.5" height="90" fill="#130b0e" />
            <rect x="135" y="0" width="3.5" height="90" fill="#130b0e" />
            {/* Slanted awning canvas */}
            <polygon points="-10,5 155,5 140,28 -5,28" fill="#4d161a" />
            <polygon points="-10,5 -5,28 -10,28" fill="#360f12" />
            {/* Stall counter panel */}
            <rect x="0" y="55" width="145" height="35" fill="#20120d" stroke="#130a08" />
            {/* Steaming brass chai pot and cups */}
            <rect x="15" y="42" width="20" height="14" fill="#2a1813" rx="1.5" />
            <path d="M18,42 L32,42 L30,33 L20,33 Z" fill="#130b0e" />
            {/* Brass kettle */}
            <rect x="75" y="45" width="14" height="11" fill="#40281f" rx="1" />
            <path d="M82,45 L82,35 L75,38" stroke="#40281f" strokeWidth="1.5" fill="none" />
            {/* Glowing lantern */}
            <rect x="120" y="20" width="7" height="11" fill="#e59846" rx="1" />
            <line x1="123" y1="10" x2="123" y2="20" stroke="#130b0e" />
            <circle cx="123" cy="25" r="12" fill="url(#chaiLantern)" />
          </g>

          {/* Puddle reflection highlights */}
          <ellipse cx="635" cy="485" rx="75" ry="6" fill="#e59846" opacity="0.08" />
          <ellipse cx="780" cy="495" rx="55" ry="4" fill="#e59846" opacity="0.06" />
        </svg>
      </div>

      {/* Ambient rain */}
      <RainLayer count={30} />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 35%, transparent 25%, rgba(5, 3, 4, 0.8) 95%)',
        }}
      />

      {/* Vintage camera film grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
}
