import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/stations': 'Stations',
  '/playlists': 'Playlists',
  '/tracks': 'Tracks',
  '/settings': 'Settings',
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Admin';

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-surface-800/40 bg-surface-950/80 backdrop-blur-lg px-4 md:px-6 lg:px-8">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-surface-100">{title}</h2>
          <p className="text-[10px] text-surface-500 font-medium uppercase tracking-widest hidden sm:block">
            90s Radio Management
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800/60 text-surface-500">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-surface-200 placeholder:text-surface-600 outline-none w-40 lg:w-56"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-500 font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>
      </div>
    </header>
  );
}
