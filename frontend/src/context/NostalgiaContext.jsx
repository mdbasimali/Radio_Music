// src/context/NostalgiaContext.jsx
// Manages active Nostalgia Background scene & cohesive UI theme styling.
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'radio_nostalgia_bg';

export const NOSTALGIA_THEMES = [
  {
    id: '90s-street',
    name: '90s Street',
    desc: 'Vintage Indian street at night with warm lamp glow',
    thumbnail: 'linear-gradient(135deg, #12070c 0%, #d48c36 100%)',
    vars: {
      '--theme-surface': 'rgba(24, 14, 10, 0.72)',
      '--theme-surface-active': 'rgba(38, 22, 14, 0.85)',
      '--theme-border': 'rgba(212, 140, 54, 0.25)',
      '--theme-border-active': 'rgba(212, 140, 54, 0.65)',
      '--theme-accent': '#d48c36',
      '--theme-accent-gradient': 'linear-gradient(135deg, #d48c36, #b06f25)',
      '--theme-glow': 'rgba(212, 140, 54, 0.3)',
      '--theme-text': '#ebdcb9',
      '--theme-muted': '#a09070',
    }
  },
  {
    id: 'rainy-night',
    name: 'Rainy Night',
    desc: 'Nostalgic rainy street with wet reflections',
    thumbnail: 'linear-gradient(135deg, #090e17 0%, #2b4c6f 100%)',
    vars: {
      '--theme-surface': 'rgba(12, 20, 32, 0.72)',
      '--theme-surface-active': 'rgba(20, 34, 52, 0.85)',
      '--theme-border': 'rgba(65, 140, 215, 0.25)',
      '--theme-border-active': 'rgba(65, 140, 215, 0.65)',
      '--theme-accent': '#3b92d4',
      '--theme-accent-gradient': 'linear-gradient(135deg, #3b92d4, #1f619e)',
      '--theme-glow': 'rgba(59, 146, 212, 0.3)',
      '--theme-text': '#d6e8f5',
      '--theme-muted': '#789bb5',
    }
  },
  {
    id: 'cassette-room',
    name: 'Cassette Room',
    desc: 'Warm 90s music room filled with tape cassettes',
    thumbnail: 'linear-gradient(135deg, #1c0f0a 0%, #8c4c23 100%)',
    vars: {
      '--theme-surface': 'rgba(28, 16, 10, 0.72)',
      '--theme-surface-active': 'rgba(44, 26, 14, 0.85)',
      '--theme-border': 'rgba(225, 120, 45, 0.25)',
      '--theme-border-active': 'rgba(225, 120, 45, 0.65)',
      '--theme-accent': '#e1782d',
      '--theme-accent-gradient': 'linear-gradient(135deg, #e1782d, #b85414)',
      '--theme-glow': 'rgba(225, 120, 45, 0.3)',
      '--theme-text': '#f7e3d2',
      '--theme-muted': '#b5886d',
    }
  },
  {
    id: 'vinyl-room',
    name: 'Vinyl Room',
    desc: 'Classic dark turntable room with vinyl records',
    thumbnail: 'linear-gradient(135deg, #111111 0%, #443422 100%)',
    vars: {
      '--theme-surface': 'rgba(20, 18, 14, 0.75)',
      '--theme-surface-active': 'rgba(34, 30, 22, 0.88)',
      '--theme-border': 'rgba(200, 165, 85, 0.25)',
      '--theme-border-active': 'rgba(200, 165, 85, 0.65)',
      '--theme-accent': '#c8a555',
      '--theme-accent-gradient': 'linear-gradient(135deg, #c8a555, #9c7b33)',
      '--theme-glow': 'rgba(200, 165, 85, 0.3)',
      '--theme-text': '#eee6d5',
      '--theme-muted': '#a19782',
    }
  },
  {
    id: 'retro-radio',
    name: 'Retro Radio',
    desc: 'Vintage radio receiver with warm glowing dial',
    thumbnail: 'linear-gradient(135deg, #1a0c05 0%, #b8621b 100%)',
    vars: {
      '--theme-surface': 'rgba(30, 14, 6, 0.72)',
      '--theme-surface-active': 'rgba(48, 24, 8, 0.85)',
      '--theme-border': 'rgba(235, 125, 30, 0.25)',
      '--theme-border-active': 'rgba(235, 125, 30, 0.65)',
      '--theme-accent': '#eb7d1e',
      '--theme-accent-gradient': 'linear-gradient(135deg, #eb7d1e, #b8540b)',
      '--theme-glow': 'rgba(235, 125, 30, 0.3)',
      '--theme-text': '#fae5d4',
      '--theme-muted': '#ba8763',
    }
  },
  {
    id: 'old-cinema',
    name: 'Old Cinema',
    desc: 'Dim 90s single-screen theater atmosphere',
    thumbnail: 'linear-gradient(135deg, #170508 0%, #7a1c27 100%)',
    vars: {
      '--theme-surface': 'rgba(26, 10, 14, 0.72)',
      '--theme-surface-active': 'rgba(42, 16, 22, 0.85)',
      '--theme-border': 'rgba(215, 60, 75, 0.25)',
      '--theme-border-active': 'rgba(215, 60, 75, 0.65)',
      '--theme-accent': '#d73c4b',
      '--theme-accent-gradient': 'linear-gradient(135deg, #d73c4b, #a31d2b)',
      '--theme-glow': 'rgba(215, 60, 75, 0.3)',
      '--theme-text': '#f7dcd9',
      '--theme-muted': '#b3787a',
    }
  },
  {
    id: 'tea-stall',
    name: 'Tea Stall',
    desc: 'Roadside chai stall with steaming brass kettle glow',
    thumbnail: 'linear-gradient(135deg, #190c07 0%, #a65d24 100%)',
    vars: {
      '--theme-surface': 'rgba(26, 14, 8, 0.72)',
      '--theme-surface-active': 'rgba(42, 24, 12, 0.85)',
      '--theme-border': 'rgba(220, 135, 45, 0.25)',
      '--theme-border-active': 'rgba(220, 135, 45, 0.65)',
      '--theme-accent': '#dc872d',
      '--theme-accent-gradient': 'linear-gradient(135deg, #dc872d, #ab6116)',
      '--theme-glow': 'rgba(220, 135, 45, 0.3)',
      '--theme-text': '#f7e7d6',
      '--theme-muted': '#b38d6b',
    }
  },
  {
    id: 'railway-platform',
    name: 'Railway Platform',
    desc: 'Quiet 90s train station under yellow lamps',
    thumbnail: 'linear-gradient(135deg, #0d1216 0%, #3a4b53 100%)',
    vars: {
      '--theme-surface': 'rgba(16, 22, 28, 0.72)',
      '--theme-surface-active': 'rgba(26, 36, 46, 0.85)',
      '--theme-border': 'rgba(180, 160, 90, 0.25)',
      '--theme-border-active': 'rgba(180, 160, 90, 0.65)',
      '--theme-accent': '#b4a05a',
      '--theme-accent-gradient': 'linear-gradient(135deg, #b4a05a, #82723c)',
      '--theme-glow': 'rgba(180, 160, 90, 0.3)',
      '--theme-text': '#e7ebd8',
      '--theme-muted': '#809199',
    }
  },
  {
    id: 'music-shop',
    name: 'Music Shop',
    desc: 'Retro cassette & CD store with wooden racks',
    thumbnail: 'linear-gradient(135deg, #140d16 0%, #68386c 100%)',
    vars: {
      '--theme-surface': 'rgba(22, 14, 24, 0.72)',
      '--theme-surface-active': 'rgba(36, 22, 40, 0.85)',
      '--theme-border': 'rgba(175, 80, 185, 0.25)',
      '--theme-border-active': 'rgba(175, 80, 185, 0.65)',
      '--theme-accent': '#af50b9',
      '--theme-accent-gradient': 'linear-gradient(135deg, #af50b9, #7d2687)',
      '--theme-glow': 'rgba(175, 80, 185, 0.3)',
      '--theme-text': '#f3e3f5',
      '--theme-muted': '#9d75a3',
    }
  },
  {
    id: '90s-cafe',
    name: '90s Cafe',
    desc: 'Cozy retro bistro with warm amber ambience',
    thumbnail: 'linear-gradient(135deg, #18110b 0%, #9e7247 100%)',
    vars: {
      '--theme-surface': 'rgba(26, 18, 12, 0.72)',
      '--theme-surface-active': 'rgba(42, 30, 18, 0.85)',
      '--theme-border': 'rgba(215, 145, 75, 0.25)',
      '--theme-border-active': 'rgba(215, 145, 75, 0.65)',
      '--theme-accent': '#d7914b',
      '--theme-accent-gradient': 'linear-gradient(135deg, #d7914b, #a66724)',
      '--theme-glow': 'rgba(215, 145, 75, 0.3)',
      '--theme-text': '#f7e9db',
      '--theme-muted': '#b39070',
    }
  }
];

const NostalgiaContext = createContext(null);

function applyThemeVariables(theme) {
  if (!theme || !theme.vars) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}

export function NostalgiaProvider({ children }) {
  const [activeId, setActiveId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '90s-street';
    } catch {
      return '90s-street';
    }
  });

  const activeBg = NOSTALGIA_THEMES.find((bg) => bg.id === activeId) || NOSTALGIA_THEMES[0];

  useEffect(() => {
    applyThemeVariables(activeBg);
  }, [activeBg]);

  const setBackground = useCallback((id) => {
    setActiveId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  }, []);

  return (
    <NostalgiaContext.Provider value={{ activeBg, backgrounds: NOSTALGIA_THEMES, setBackground }}>
      {children}
    </NostalgiaContext.Provider>
  );
}

export const useNostalgia = () => {
  const ctx = useContext(NostalgiaContext);
  if (!ctx) throw new Error('useNostalgia must be used within NostalgiaProvider');
  return ctx;
};
