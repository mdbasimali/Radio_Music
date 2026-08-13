// src/components/atmosphere/SceneBackground.jsx
// Render dynamic 90s nostalgic background scenes using high-clarity SVGs with universal subtle overlays.
import { motion, AnimatePresence } from 'framer-motion';
import { useNostalgia } from '../../context/NostalgiaContext';

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

// ── Default 90s Nostalgic Street Vector Scene ────────────────────────────
function StreetSceneSVG() {
  return (
    <svg
      viewBox="0 0 1200 650"
      className="w-full h-full object-cover select-none pointer-events-none"
      preserveAspectRatio="xMidYMax slice"
    >
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

      <path d="M0,450 L0,240 L110,240 L110,210 L220,210 L220,280 L290,280 L290,190 L420,190 L420,330 L500,330 L500,450 Z" fill="#090507" />
      <path d="M780,450 L780,310 L860,310 L860,220 L960,220 L960,280 L1080,280 L1080,230 L1200,230 L1200,450 Z" fill="#090507" />
      <path d="M0,100 Q300,180 600,165 T1200,120" fill="none" stroke="#0b0709" strokeWidth="1.2" />
      <path d="M0,115 Q300,200 600,180 T1200,135" fill="none" stroke="#0b0709" strokeWidth="0.8" />
      <path d="M290,190 Q500,230 780,220" fill="none" stroke="#0b0709" strokeWidth="0.6" />
      <rect x="220" y="300" width="200" height="200" fill="#0e080b" />
      <rect x="800" y="280" width="220" height="220" fill="#0e080b" />
      <path d="M260,330 Q270,320 280,330 L280,360 L260,360 Z" fill="#e59846" opacity="0.18" />
      <path d="M310,330 Q320,320 330,330 L330,360 L310,360 Z" fill="#e59846" opacity="0.25" />
      <path d="M840,310 Q850,300 860,310 L860,345 L840,345 Z" fill="#e59846" opacity="0.12" />
      <path d="M890,310 Q900,300 910,310 L910,345 L890,345 Z" fill="#e59846" opacity="0.22" />
      <line x1="590" y1="90" x2="590" y2="480" stroke="#160e12" strokeWidth="6.5" />
      <path d="M590,110 Q625,100 635,120" fill="none" stroke="#160e12" strokeWidth="3.5" />
      <path d="M620,120 L650,120 L645,127 L625,127 Z" fill="#24161d" />
      <ellipse cx="635" cy="127" rx="7" ry="2.5" fill="#fff5d6" />
      <polygon points="635,127 410,485 860,485" fill="url(#lanternWarmth)" />
      <rect x="0" y="475" width="1200" height="175" fill="#060305" />
      <rect x="0" y="475" width="1200" height="50" fill="url(#wetReflections)" />
      <g transform="translate(470, 412)" stroke="#060305" strokeWidth="2.5" fill="none">
        <circle cx="20" cy="50" r="18" />
        <circle cx="75" cy="50" r="18" />
        <line x1="20" y1="50" x2="75" y2="50" />
        <line x1="20" y1="50" x2="38" y2="25" />
        <line x1="75" y1="50" x2="68" y2="28" />
        <line x1="38" y1="25" x2="68" y2="28" />
        <line x1="68" y1="28" x2="65" y2="12" />
        <line x1="65" y1="12" x2="74" y2="12" />
        <path d="M12,32 Q12,20 28,20 L36,20 L36,36" strokeWidth="2" />
      </g>
      <g transform="translate(680, 390)">
        <rect x="5" y="0" width="3.5" height="90" fill="#130b0e" />
        <rect x="135" y="0" width="3.5" height="90" fill="#130b0e" />
        <polygon points="-10,5 155,5 140,28 -5,28" fill="#4d161a" />
        <polygon points="-10,5 -5,28 -10,28" fill="#360f12" />
        <rect x="0" y="55" width="145" height="35" fill="#20120d" stroke="#130a08" />
        <rect x="15" y="42" width="20" height="14" fill="#2a1813" rx="1.5" />
        <path d="M18,42 L32,42 L30,33 L20,33 Z" fill="#130b0e" />
        <rect x="75" y="45" width="14" height="11" fill="#40281f" rx="1" />
        <path d="M82,45 L82,35 L75,38" stroke="#40281f" strokeWidth="1.5" fill="none" />
        <rect x="120" y="20" width="7" height="11" fill="#e59846" rx="1" />
        <line x1="123" y1="10" x2="123" y2="20" stroke="#130b0e" />
        <circle cx="123" cy="25" r="12" fill="url(#chaiLantern)" />
      </g>
      <ellipse cx="635" cy="485" rx="75" ry="6" fill="#e59846" opacity="0.08" />
      <ellipse cx="780" cy="495" rx="55" ry="4" fill="#e59846" opacity="0.06" />
    </svg>
  );
}

// ── Generic High-Clarity Scene SVG Builder ────────────────────────────────
function ArtworkSceneSVG({ primaryColor, secondaryColor, accentGlow, sceneType }) {
  return (
    <svg
      viewBox="0 0 1200 650"
      className="w-full h-full object-cover select-none pointer-events-none"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <radialGradient id={`glow_${sceneType}`} cx="50%" cy="30%" r="85%">
          <stop offset="0%" stopColor={accentGlow} stopOpacity="0.65" />
          <stop offset="40%" stopColor={secondaryColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background base */}
      <rect x="0" y="0" width="1200" height="650" fill={primaryColor} />

      {/* Distant wall / architectural silhouettes */}
      <path d="M0,450 L0,220 L250,220 L250,180 L420,180 L420,310 L600,310 L600,450 Z" fill="#0d090c" opacity="0.85" />
      <path d="M680,450 L680,260 L850,260 L850,200 L1020,200 L1020,300 L1200,300 L1200,450 Z" fill="#0d090c" opacity="0.85" />

      {/* Central lighting cone / window bloom */}
      <polygon points="600,100 250,580 950,580" fill={`url(#glow_${sceneType})`} />

      {/* Decorative window/arch highlights */}
      <path d="M300,320 Q320,300 340,320 L340,360 L300,360 Z" fill={accentGlow} opacity="0.25" />
      <path d="M860,300 Q880,280 900,300 L900,340 L860,340 Z" fill={accentGlow} opacity="0.25" />

      {/* Ground floor & reflection plane */}
      <rect x="0" y="475" width="1200" height="175" fill="#050304" />
      <ellipse cx="600" cy="495" rx="200" ry="12" fill={accentGlow} opacity="0.12" />
    </svg>
  );
}

export default function SceneBackground() {
  const { activeBg } = useNostalgia();

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050304]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBg.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Scene Rendering */}
          <div className="absolute inset-0">
            {activeBg.id === '90s-street' && (
              <div className="absolute inset-0 bg-[#050304]">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse 80% 70% at 50% 15%, #12070c 0%, #050304 100%)',
                  }}
                />
                <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden">
                  <StreetSceneSVG />
                </div>
              </div>
            )}

            {activeBg.id === 'rainy-night' && (
              <div className="absolute inset-0 bg-[#060c14]">
                <ArtworkSceneSVG primaryColor="#060c14" secondaryColor="#183654" accentGlow="#3888c7" sceneType="rainy" />
                <RainLayer count={60} />
              </div>
            )}

            {activeBg.id === 'cassette-room' && (
              <div className="absolute inset-0 bg-[#120804]">
                <ArtworkSceneSVG primaryColor="#120804" secondaryColor="#3d1b0a" accentGlow="#e67e22" sceneType="cassette" />
              </div>
            )}

            {activeBg.id === 'vinyl-room' && (
              <div className="absolute inset-0 bg-[#0e0c08]">
                <ArtworkSceneSVG primaryColor="#0e0c08" secondaryColor="#2b2313" accentGlow="#d4ac4b" sceneType="vinyl" />
              </div>
            )}

            {activeBg.id === 'retro-radio' && (
              <div className="absolute inset-0 bg-[#140802]">
                <ArtworkSceneSVG primaryColor="#140802" secondaryColor="#421a05" accentGlow="#e8701a" sceneType="radio" />
              </div>
            )}

            {activeBg.id === 'old-cinema' && (
              <div className="absolute inset-0 bg-[#140406]">
                <ArtworkSceneSVG primaryColor="#140406" secondaryColor="#400b12" accentGlow="#db3445" sceneType="cinema" />
              </div>
            )}

            {activeBg.id === 'tea-stall' && (
              <div className="absolute inset-0 bg-[#140a04]">
                <ArtworkSceneSVG primaryColor="#140a04" secondaryColor="#3d1c09" accentGlow="#e68025" sceneType="tea" />
              </div>
            )}

            {activeBg.id === 'railway-platform' && (
              <div className="absolute inset-0 bg-[#0a1017]">
                <ArtworkSceneSVG primaryColor="#0a1017" secondaryColor="#24374a" accentGlow="#d6b658" sceneType="railway" />
              </div>
            )}

            {activeBg.id === 'music-shop' && (
              <div className="absolute inset-0 bg-[#120817]">
                <ArtworkSceneSVG primaryColor="#120817" secondaryColor="#3b154a" accentGlow="#aa4ad4" sceneType="shop" />
              </div>
            )}

            {activeBg.id === '90s-cafe' && (
              <div className="absolute inset-0 bg-[#140e08]">
                <ArtworkSceneSVG primaryColor="#140e08" secondaryColor="#3a2514" accentGlow="#d98c43" sceneType="cafe" />
              </div>
            )}
          </div>

          {/* Rain Overlay for rain-themed scenes & default street */}
          {(activeBg.id === '90s-street' || activeBg.id === 'rainy-night') && (
            <RainLayer count={30} />
          )}

          {/* Single Universal Light Overlay (15-20% opacity) for text readability only */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.22) 100%)',
            }}
          />

          {/* Cinematic Vignette Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 35%, transparent 25%, rgba(5, 3, 4, 0.75) 95%)',
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
