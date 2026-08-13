import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  ListMusic,
  Disc3,
  Settings,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stations', label: 'Stations', icon: Radio },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/tracks', label: 'Tracks', icon: Disc3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex w-64 flex-col
        border-r border-surface-800/60 bg-surface-950/95 backdrop-blur-lg
        transition-transform duration-300 ease-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Brand header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-surface-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Radio size={16} className="text-surface-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-surface-100">
              90s Radio
            </h1>
            <p className="text-[10px] font-medium text-brand-500 uppercase tracking-widest">
              Admin
            </p>
          </div>
        </div>

        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? 'nav-link-active text-brand-400 bg-brand-500/10'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-surface-800/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-700/30 border border-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-surface-200 truncate">Admin User</p>
            <p className="text-[10px] text-surface-500 truncate">admin@90sradio.app</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
