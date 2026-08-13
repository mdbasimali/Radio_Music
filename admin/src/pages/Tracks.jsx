import React, { useState, useEffect } from 'react';
import { Disc3, Plus, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, X, Edit, Trash2, Power, MoreVertical, Play, Pause } from 'lucide-react';
import { api } from '../services/api';

export default function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Selection / Bulk State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Menu Actions
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  
  // Edit Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formArtist, setFormArtist] = useState('');
  const [formStation, setFormStation] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formError, setFormError] = useState('');

  // Audio Preview State
  const [previewTrack, setPreviewTrack] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 25,
        search: searchTerm,
        stationId: selectedStation,
        provider: selectedProvider,
        status: selectedStatus
      };

      const data = await api.getTracks(params);
      setTracks(data.tracks || []);
      setTotal(data.total || 0);
      setPages(data.pages || 0);
    } catch (err) {
      console.error('Error fetching tracks:', err);
      setError('Failed to fetch tracks catalog from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedStation, selectedProvider, selectedStatus]);

  // Debounced search / trigger on enter or button click
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchTracks();
  };

  // Toggle single status
  const handleToggleStatus = async (track) => {
    try {
      const nextStatus = track.status === 'active' ? 'inactive' : 'active';
      const updated = await api.updateTrack(track.id, { status: nextStatus });
      setTracks(tracks.map(t => t.id === track.id ? { ...t, status: updated.status } : t));
      setActiveMenuId(null);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Delete single track
  const handleDeleteTrack = async (track) => {
    if (!window.confirm(`Are you sure you want to delete "${track.title}"?`)) return;
    try {
      await api.deleteTrack(track.id);
      setTracks(tracks.filter(t => t.id !== track.id));
      setActiveMenuId(null);
      setTotal(prev => prev - 1);
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (track) => {
    setEditingTrack(track);
    setFormTitle(track.title || '');
    setFormArtist(track.artist || '');
    setFormStation(track.station || 'hindi');
    setFormStatus(track.status || 'active');
    setFormError('');
    setEditModalOpen(true);
    setActiveMenuId(null);
  };

  // Submit Edit Metadata
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formTitle.trim() || !formArtist.trim()) {
      setFormError('Title and Artist are required.');
      return;
    }

    try {
      const updated = await api.updateTrack(editingTrack.id, {
        title: formTitle.trim(),
        artist: formArtist.trim(),
        station: formStation,
        status: formStatus
      });

      setTracks(tracks.map(t => t.id === editingTrack.id ? {
        ...t,
        title: updated.title,
        artist: updated.artist,
        station: updated.station,
        status: updated.status
      } : t));

      setEditModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Update failed.');
    }
  };

  // Bulk Actions
  const handleCheckboxChange = (trackId) => {
    if (selectedIds.includes(trackId)) {
      setSelectedIds(selectedIds.filter(id => id !== trackId));
    } else {
      setSelectedIds([...selectedIds, trackId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === tracks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tracks.map(t => t.id));
    }
  };

  const handleBulkStatusChange = async (targetStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await api.bulkActionTracks({
        ids: selectedIds,
        action: 'status',
        status: targetStatus
      });
      setTracks(tracks.map(t => selectedIds.includes(t.id) ? { ...t, status: targetStatus } : t));
      setSelectedIds([]);
      alert(`Successfully updated status for selected tracks.`);
    } catch (err) {
      alert(`Bulk update status failed: ${err.message}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected tracks?`)) return;
    try {
      await api.bulkActionTracks({
        ids: selectedIds,
        action: 'delete'
      });
      setTracks(tracks.filter(t => !selectedIds.includes(t.id)));
      setTotal(prev => prev - selectedIds.length);
      setSelectedIds([]);
      alert(`Successfully deleted selected tracks.`);
    } catch (err) {
      alert(`Bulk delete failed: ${err.message}`);
    }
  };

  // Audio Preview Handling (ONLY for direct provider, HTML5 Audio element)
  const handlePlayPreview = (track) => {
    // If playing, stop it
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }

    if (track.provider === 'youtube') {
      alert(`YouTube Video ID: ${track.providerId}. In Admin Panel, YouTube tracks cannot be played via HTML5 audio. Please play YouTube tracks in the public website.`);
      return;
    }

    if (!track.audioUrl) {
      alert('This track has no audio source URL.');
      return;
    }

    const audioUrl = track.audioUrl.startsWith('http') ? track.audioUrl : `http://127.0.0.1:5001${track.audioUrl}`;
    const audio = new Audio(audioUrl);
    audio.play()
      .then(() => {
        setAudioElement(audio);
        setPreviewTrack(track);
        setIsPlayingPreview(true);
        audio.onended = () => {
          setIsPlayingPreview(false);
          setPreviewTrack(null);
          setAudioElement(null);
        };
      })
      .catch(err => {
        alert(`Failed to play preview: ${err.message}`);
      });
  };

  const handleStopPreview = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    setIsPlayingPreview(false);
    setPreviewTrack(null);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-100 flex items-center gap-3">
            Track Catalog
            <button 
              onClick={fetchTracks}
              className="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
              title="Refresh Tracks"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Browse and manage all tracks in your catalog. (Total: {total})
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="glass-card p-4 rounded-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-900 border border-surface-800/60 text-surface-500">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search tracks by title, artist, or album... (Press Enter)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm text-surface-200 placeholder:text-surface-600 outline-none w-full"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-surface-950 text-sm font-semibold rounded-xl transition-colors">
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Station selector */}
          <div className="space-y-1">
            <label className="block text-xs text-surface-500 font-medium">Station</label>
            <select
              value={selectedStation}
              onChange={(e) => { setSelectedStation(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800/80 text-xs text-surface-200 outline-none"
            >
              <option value="all">All Stations</option>
              <option value="hindi">Hindi 90s Classics</option>
              <option value="bengali">Bengali 90s Classics</option>
              <option value="bhojpuri">Bhojpuri Top Hits</option>
              <option value="mixed">Mixed Radio</option>
            </select>
          </div>

          {/* Provider selector */}
          <div className="space-y-1">
            <label className="block text-xs text-surface-500 font-medium">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => { setSelectedProvider(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800/80 text-xs text-surface-200 outline-none"
            >
              <option value="all">All Providers</option>
              <option value="youtube">YouTube</option>
              <option value="direct">Direct</option>
            </select>
          </div>

          {/* Status selector */}
          <div className="space-y-1">
            <label className="block text-xs text-surface-500 font-medium">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-800/80 text-xs text-surface-200 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Header */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-between text-xs">
          <span className="text-brand-300 font-semibold">{selectedIds.length} tracks selected</span>
          <div className="flex gap-2">
            <button 
              onClick={() => handleBulkStatusChange('active')}
              className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
            >
              Activate
            </button>
            <button 
              onClick={() => handleBulkStatusChange('inactive')}
              className="px-3 py-1 rounded bg-surface-800 text-surface-300 hover:bg-surface-700 transition-colors"
            >
              Deactivate
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1 rounded bg-red-500/20 text-red-350 hover:bg-red-500/35 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Preview Player Floating status */}
      {isPlayingPreview && previewTrack && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
          <span className="text-emerald-300">Currently playing preview: <strong>{previewTrack.title}</strong></span>
          <button 
            onClick={handleStopPreview}
            className="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
          >
            Stop
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && tracks.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-surface-400">
          <RefreshCw size={24} className="animate-spin mr-2" /> Loading track catalog...
        </div>
      ) : tracks.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-surface-400">
          No tracks found matching the filter options.
        </div>
      ) : (
        /* Table */
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-800/40 bg-surface-900/20">
                  <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 uppercase w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === tracks.length}
                      onChange={handleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Track</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider hidden md:table-cell">Album</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider hidden lg:table-cell">Year</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Station</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Provider</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track) => (
                  <tr
                    key={track.id || track._id}
                    className="border-b border-surface-800/25 hover:bg-surface-800/10 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(track.id)}
                        onChange={() => handleCheckboxChange(track.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-surface-800/50 border border-surface-700/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {track.artwork && track.artwork.startsWith('http') ? (
                            <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Disc3 size={16} className="text-surface-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-surface-200 truncate">{track.title}</p>
                          <p className="text-[11px] text-surface-500 truncate">{track.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-surface-400 hidden md:table-cell truncate max-w-xs">
                      {track.album || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-surface-500 hidden lg:table-cell">
                      {track.year || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-brand-300 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/10 uppercase tracking-wider text-[10px]">
                        {track.station}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          track.provider === 'youtube'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {track.provider === 'youtube' ? 'YouTube' : 'Direct'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        track.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-surface-800 text-surface-500 border border-surface-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${track.status === 'active' ? 'bg-emerald-400' : 'bg-surface-600'}`} />
                        {track.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right relative">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePlayPreview(track)}
                          className="p-1.5 rounded text-surface-500 hover:text-emerald-400 hover:bg-surface-800 transition-colors"
                          title="Preview Track"
                        >
                          <Play size={14} />
                        </button>

                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === track.id ? null : track.id)}
                          className="p-1.5 rounded text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>

                      {activeMenuId === track.id && (
                        <div className="absolute right-4 mt-1 w-44 rounded-lg bg-surface-900 border border-surface-800/80 shadow-lg py-1 z-10 text-left">
                          <button
                            onClick={() => handleOpenEdit(track)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-surface-100"
                          >
                            <Edit size={14} /> Edit Metadata
                          </button>
                          <button
                            onClick={() => handleToggleStatus(track)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-surface-100"
                          >
                            <Power size={14} /> {track.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteTrack(track)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-surface-800 hover:text-red-300"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pages > 1 && (
            <div className="px-5 py-4 border-t border-surface-800/40 flex items-center justify-between bg-surface-900/10 text-xs">
              <span className="text-surface-500">Showing page {page} of {pages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(prev => prev - 1)}
                  className="p-1.5 rounded border border-surface-800 text-surface-400 hover:text-surface-200 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage(prev => prev + 1)}
                  className="p-1.5 rounded border border-surface-800 text-surface-400 hover:text-surface-200 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl overflow-hidden shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800/40">
              <h3 className="text-base font-bold text-surface-100">Edit Track Metadata</h3>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">Track Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800/80 text-sm text-surface-100 placeholder:text-surface-600 outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>

              {/* Artist / Channel */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">Artist / Channel</label>
                <input
                  type="text"
                  value={formArtist}
                  onChange={(e) => setFormArtist(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800/80 text-sm text-surface-100 placeholder:text-surface-600 outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>

              {/* Station binding */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">Station</label>
                <select
                  value={formStation}
                  onChange={(e) => setFormStation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800/80 text-sm text-surface-200 outline-none focus:border-brand-500/50 transition-colors"
                >
                  <option value="hindi">Hindi 90s Classics</option>
                  <option value="bengali">Bengali 90s Classics</option>
                  <option value="bhojpuri">Bhojpuri Top Hits</option>
                  <option value="mixed">Mixed Radio</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="block text-xs font-semibold text-surface-200">Active Status</label>
                  <p className="text-[10px] text-surface-500">Enable visibility in station queue</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormStatus(formStatus === 'active' ? 'inactive' : 'active')}
                  className={`w-10 h-5.5 rounded-full relative transition-colors ${
                    formStatus === 'active' ? 'bg-brand-500' : 'bg-surface-700'
                  }`}
                >
                  <span
                    className="absolute top-0.5 left-0.5 bg-white rounded-full transition-transform"
                    style={{
                      width: '18px',
                      height: '18px',
                      transform: formStatus === 'active' ? 'translateX(20px)' : 'translateX(0px)',
                    }}
                  />
                </button>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-800/40">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-900 border border-surface-800/80 hover:bg-surface-800 text-surface-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-surface-950 text-sm font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
