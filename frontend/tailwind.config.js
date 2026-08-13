/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm amber streetlamp palette
        amber: {
          glow: '#e8a045',
          soft: '#f5c87a',
          muted: '#c4842a',
          deep: '#7a4e12',
        },
        // Deep midnight backgrounds
        night: {
          900: '#0a0608',
          800: '#120d10',
          700: '#1c1519',
          600: '#271e23',
          500: '#3d2b32',
        },
        // Indian red accent
        sari: {
          DEFAULT: '#c0392b',
          light: '#e74c3c',
          dark: '#922b21',
        },
        // Aged paper text
        paper: {
          DEFAULT: '#f5e6c8',
          muted: '#c9b99a',
          dark: '#8a7260',
        },
        // Station accent colors
        station: {
          hindi: '#e8a045',   // warm gold
          bengali: '#4ecdc4', // cool teal
          bhojpuri: '#e07b39',// earthy orange
          mixed: '#9b59b6',   // deep violet
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'lamp-glow': 'radial-gradient(ellipse 300px 400px at 50% 0%, rgba(232,160,69,0.18) 0%, transparent 70%)',
        'scene-gradient': 'linear-gradient(to bottom, #0a0608 0%, #120d10 40%, #1c1519 100%)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'lamp': '0 0 60px 20px rgba(232,160,69,0.12), 0 0 120px 60px rgba(232,160,69,0.06)',
        'glow-amber': '0 0 20px rgba(232,160,69,0.4)',
        'glow-station': '0 0 30px var(--station-color, rgba(232,160,69,0.3))',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'player': '0 -4px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(232,160,69,0.1)',
      },
      animation: {
        'vinyl-spin': 'spin 4s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'rain': 'rain 1s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'marquee': 'marquee 20s linear infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        rain: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.6' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
