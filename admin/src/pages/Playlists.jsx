import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ListMusic, Plus, FolderOpen, RefreshCw, X, MoreVertical, RefreshCcw, Edit, Power, Trash2 } from 'lucide-react';
import { api } from '../services/api';

// Portal-based anchored action menu component
function PlaylistActionMenuPortal({ triggerId, onClose, onSync, onToggleStatus, onDelete, status }) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  const updatePosition = () => {
    const trigger = document.getElementById(triggerId);
    if (!trigger) {
      onClose();
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuWidth = 176; // w-44 is 11rem -> 176px
    const menuHeight = 110; // approximate menu height
    
    let top = rect.bottom + window.scrollY;
    let left = rect.right + window.scrollX - menuWidth;

    // Boundary check below
    if (rect.bottom + menuHeight > window.innerHeight) {
      top = rect.top + window.scrollY - menuHeight - 4; // open above
    } else {
      top = rect.bottom + window.scrollY + 4; // open below
    }

    // Boundary check right/left
    if (left < 10) {
      left = 10;
    } else if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    updatePosition();
    
    // Recalculate on scroll or window resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Close on outside click
    const handleOutsideClick = (e) => {
      const trigger = document.getElementById(triggerId);
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        trigger && !trigger.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    // Close on Escape press
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerId, onClose]);

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      className="w-44 rounded-lg bg-surface-900 border border-surface-800/80 shadow-lg py-1 z-50"
    >
      <button
        onClick={() => {
          onSync();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-surface-100"
      >
        <RefreshCcw size={14} /> Sync Playlist
      </button>
      <button
        onClick={() => {
          onToggleStatus();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-surface-100"
      >
        <Power size={14} /> {status === 'active' ? 'Disable' : 'Enable'}
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-surface-800 hover:text-red-300"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>,
    document.body
  );
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Syncing states
  const [syncingPlaylistId, setSyncingPlaylistId] = useState(null);
  const [syncStats, setSyncStats] = useState(null);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [importing, setImporting] = useState(false);
  
  // Menu action state
  const [activeMenuId, setActiveMenuId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [playlistsData, stationsData] = await Promise.all([
        api.getPlaylists(),
        api.getStations()
      ]);
      setPlaylists(playlistsData);
      setStations(stationsData);
    } catch (err) {
      console.error('Error loading playlists data:', err);
      setError('Failed to fetch playlists or stations. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    if (stations.length > 0) {
      setSelectedStationId(stations[0].id);
    } else {
      setSelectedStationId('');
    }
    setPlaylistUrl('');
    setFormError('');
    setModalOpen(true);
  };

  const handleImportPlaylistSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedStationId) {
      setFormError('Please select a station.');
      return;
    }

    if (!playlistUrl.trim()) {
      setFormError('Please enter a YouTube playlist URL.');
      return;
    }

    const match = playlistUrl.match(/[&?]list=([^&]+)/);
    if (!match || !match[1]) {
      setFormError('Invalid YouTube Playlist URL format. Must contain "?list=PLAYLIST_ID".');
      return;
    }

    try {
      setImporting(true);
      const newPlaylist = await api.importPlaylist({
        stationId: selectedStationId,
        youtubePlaylistUrl: playlistUrl.trim()
      });

      setPlaylists([...playlists, newPlaylist]);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const handleSyncPlaylist = async (playlist) => {
    setActiveMenuId(null);
    setSyncStats(null);
    setSyncingPlaylistId(playlist._id);
    try {
      const result = await api.syncPlaylist(playlist._id);
      
      // Update local playlist state
      setPlaylists(playlists.map(p => p._id === playlist._id ? result : p));
      
      // Save stats to display
      setSyncStats({
        playlistName: result.name,
        ...result.lastSyncStats
      });
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncingPlaylistId(null);
    }
  };

  const handleToggleStatus = async (playlist) => {
    try {
      const updated = await api.updatePlaylist(playlist._id, {
        status: playlist.status === 'active' ? 'inactive' : 'active'
      });
      setPlaylists(playlists.map(p => p._id === playlist._id ? { ...p, status: updated.status } : p));
      setActiveMenuId(null);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeletePlaylist = async (playlist) => {
    if (!window.confirm(`Are you sure you want to delete this playlist?`)) {
      return;
    }
    try {
      await api.deletePlaylist(playlist._id);
      setPlaylists(playlists.filter(p => p._id !== playlist._id));
      setActiveMenuId(null);
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : stationId;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-100 flex items-center gap-3">
            Playlists
            <button 
              onClick={loadData}
              className="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
              title="Refresh Playlists List"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Manage YouTube playlists connected to your radio stations.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-surface-950 text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Add Playlist
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Sync Status Overlay / Banner */}
      {syncingPlaylistId && (
        <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm flex items-center gap-3">
          <RefreshCw size={16} className="animate-spin text-brand-400" />
          <span>Syncing playlist items and fetching metadata from YouTube... Please wait.</span>
        </div>
      )}

      {syncStats && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm space-y-2 relative">
          <button 
            onClick={() => setSyncStats(null)}
            className="absolute top-2 right-2 text-emerald-500 hover:text-emerald-300"
          >
            <X size={16} />
          </button>
          <p className="font-bold">✓ Sync completed successfully for "{syncStats.playlistName}"</p>
          <div className="flex gap-6 text-xs">
            <span>Imported (New): <strong className="text-emerald-400">{syncStats.imported}</strong></span>
            <span>Updated: <strong className="text-surface-300">{syncStats.updated}</strong></span>
            <span>Skipped (Deleted/Private): <strong className="text-amber-400">{syncStats.skipped}</strong></span>
          </div>
        </div>
      )}

      {loading && playlists.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-surface-400">
          <RefreshCw size={24} className="animate-spin mr-2" /> Loading playlists...
        </div>
      ) : playlists.length === 0 ? (
        /* Empty state */
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-800/50 border border-surface-700/40 flex items-center justify-center mb-4">
            <FolderOpen size={28} className="text-surface-500" />
          </div>
          <h3 className="text-lg font-bold text-surface-200">No Playlists Yet</h3>
          <p className="text-sm text-surface-500 mt-1 max-w-md">
            Connect YouTube playlists to your radio stations.
            Create your first playlist configuration to get started.
          </p>
          <button 
            onClick={handleOpenAddModal}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold hover:bg-brand-500/20 transition-colors"
          >
            <ListMusic size={16} />
            Connect Playlist
          </button>
        </div>
      ) : (
        /* Playlists Table */
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-800/40 bg-surface-900/30">
                  <th className="px-5 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Playlist</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Station</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Tracks</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Last Synced</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {playlists.map((playlist) => (
                  <tr key={playlist._id} className="border-b border-surface-800/20 hover:bg-surface-800/10 transition-colors">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-surface-200 truncate">{playlist.name}</p>
                        <a 
                          href={playlist.youtubePlaylistUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-brand-400 hover:underline truncate block"
                        >
                          YouTube ID: {playlist.youtubePlaylistId}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-surface-300">
                      {getStationName(playlist.stationId)}
                    </td>
                    <td className="px-5 py-4 text-sm text-surface-400">
                      {playlist.trackCount ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        playlist.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-surface-850 text-surface-500 border border-surface-800'
                      }`}>
                        {playlist.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-surface-500">
                      {playlist.lastSyncedAt ? new Date(playlist.lastSyncedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-5 py-4 relative">
                      <button 
                        id={`action-trigger-${playlist._id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeMenuId === playlist._id) {
                            setActiveMenuId(null);
                          } else {
                            setActiveMenuId(playlist._id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-surface-650 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                        disabled={syncingPlaylistId !== null}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === playlist._id && (
                        <PlaylistActionMenuPortal
                          triggerId={`action-trigger-${playlist._id}`}
                          onClose={() => setActiveMenuId(null)}
                          onSync={() => handleSyncPlaylist(playlist)}
                          onToggleStatus={() => handleToggleStatus(playlist)}
                          onDelete={() => handleDeletePlaylist(playlist)}
                          status={playlist.status}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Playlist Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl overflow-hidden shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800/40">
              <h3 className="text-base font-bold text-surface-100">Add Playlist</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleImportPlaylistSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {formError
                  }
                </div>
              )}

              {/* Station Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">Station</label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800/80 text-sm text-surface-200 outline-none focus:border-brand-500/50 transition-colors"
                >
                  <option value="" disabled>Select a Station...</option>
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Playlist URL */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">YouTube Playlist URL</label>
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800/80 text-sm text-surface-100 placeholder:text-surface-600 outline-none focus:border-brand-500/50 transition-colors"
                />
                <p className="text-[10px] text-surface-500">Must include '?list=PLAYLIST_ID' query parameter.</p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-800/40">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-900 border border-surface-800/80 hover:bg-surface-800 text-surface-300 text-sm font-medium transition-colors"
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-surface-950 text-sm font-semibold transition-colors flex items-center gap-2"
                  disabled={importing}
                >
                  {importing ? 'Importing...' : 'Import Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
