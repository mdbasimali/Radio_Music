import React, { useState, useEffect } from 'react';
import {
  Radio,
  Disc3,
  ListMusic,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTracks: 0,
    activeTracks: 0,
    stationsCount: 4,
    playlistsCount: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [tracksStats, stations, playlists] = await Promise.all([
        api.getTracksStats(),
        api.getStations(),
        api.getPlaylists()
      ]);

      setStats({
        totalTracks: tracksStats.total || 0,
        activeTracks: tracksStats.active || 0,
        stationsCount: stations.length || 0,
        playlistsCount: playlists.length || 0
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const STATS = [
    {
      label: 'Total Stations',
      value: stats.stationsCount.toString(),
      change: 'Configured',
      trend: 'neutral',
      icon: Radio,
      color: 'from-brand-500/20 to-brand-600/5',
      iconColor: 'text-brand-400',
    },
    {
      label: 'Total Tracks',
      value: stats.totalTracks.toString(),
      change: `${stats.activeTracks} Active`,
      trend: 'neutral',
      icon: Disc3,
      color: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Playlists',
      value: stats.playlistsCount.toString(),
      change: 'YouTube Feeds',
      trend: 'neutral',
      icon: ListMusic,
      color: 'from-violet-500/20 to-violet-600/5',
      iconColor: 'text-violet-400',
    },
    {
      label: 'Active Listeners',
      value: '—',
      change: 'Live Status',
      trend: 'up',
      icon: Users,
      color: 'from-sky-500/20 to-sky-600/5',
      iconColor: 'text-sky-400',
    },
  ];

  const RECENT_ACTIVITY = [
    { action: 'System initialized', time: 'Just now', type: 'system' },
    { action: 'Hindi 90s Classics catalog online', time: '—', type: 'station' },
    { action: 'Bengali 90s Classics catalog online', time: '—', type: 'station' },
    { action: 'Bhojpuri Top Hits catalog online', time: '—', type: 'station' },
    { action: 'Mixed Radio catalog online', time: '—', type: 'station' },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome banner */}
      <div className="glass-card rounded-2xl p-6 md:p-8 stat-glow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-surface-100 flex items-center gap-3">
              Welcome back, <span className="text-brand-400">Admin</span>
              <button 
                onClick={loadStats}
                className="p-1 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                title="Refresh Dashboard Stats"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </h1>
            <p className="mt-1 text-sm text-surface-400">
              Manage your 90s Radio stations, tracks, and playlists from here.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-brand-300">Radio Online</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-5 hover:border-surface-600/40 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <Icon size={20} className={stat.iconColor} strokeWidth={1.8} />
                </div>
                {stat.trend === 'up' && (
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400">
                    <ArrowUpRight size={12} />
                  </span>
                )}
                {stat.trend === 'neutral' && (
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-surface-500">
                    —
                  </span>
                )}
              </div>

              <div className="mt-4">
                <p className="text-2xl font-bold text-surface-100 group-hover:text-brand-300 transition-colors">
                  {loading ? '...' : stat.value}
                </p>
                <p className="text-xs text-surface-500 mt-0.5">{stat.label}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-surface-800/40">
                <p className="text-[11px] text-surface-500">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-3 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-surface-200 flex items-center gap-2">
              <Clock size={15} className="text-surface-500" />
              Recent Activity
            </h3>
          </div>

          <div className="space-y-1">
            {RECENT_ACTIVITY.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.type === 'system'
                        ? 'bg-emerald-400'
                        : item.type === 'station'
                        ? 'bg-brand-400'
                        : 'bg-surface-600'
                    }`}
                  />
                  <span className="text-sm text-surface-300">{item.action}</span>
                </div>
                <span className="text-[11px] text-surface-600 whitespace-nowrap ml-4">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="text-sm font-bold text-surface-200 flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-surface-500" />
            Quick Actions
          </h3>

          <div className="space-y-2">
            {[
              { label: 'Manage Stations', desc: 'Add or edit radio stations', href: '/stations' },
              { label: 'Import Tracks', desc: 'Add tracks to your catalog', href: '/tracks' },
              { label: 'Build Playlists', desc: 'Create curated playlists', href: '/playlists' },
              { label: 'App Settings', desc: 'Configure radio behavior', href: '/settings' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-800/40 hover:border-brand-500/30 hover:bg-surface-800/50 transition-all duration-200 group"
              >
                <div>
                  <p className="text-sm font-semibold text-surface-200 group-hover:text-brand-300 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-surface-500">{action.desc}</p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-surface-600 group-hover:text-brand-400 transition-colors"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
