import React, { useState, useEffect } from 'react';
import { Radio, Plus, MoreVertical, Edit, Power, Trash2, X, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null); // null means adding a new station
  
  // Form fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formLanguage, setFormLanguage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#d48c36');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  // Dropdown menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStations();
      setStations(data);
    } catch (err) {
      console.error('Error fetching stations:', err);
      setError('Failed to fetch stations from backend. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStation(null);
    setFormId('');
    setFormName('');
    setFormLanguage('');
    setFormDescription('');
    setFormColor('#d48c36');
    setFormIsActive(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (station) => {
    setEditingStation(station);
    setFormId(station.id);
    setFormName(station.name || '');
    setFormLanguage(station.language || '');
    setFormDescription(station.description || '');
    setFormColor(station.color || '#d48c36');
    setFormIsActive(station.isActive !== false);
    setFormError('');
    setModalOpen(true);
    setActiveMenuId(null);
  };

  const handleToggleActive = async (station) => {
    try {
      const updated = await api.updateStation(station.id, { isActive: !station.isActive });
      setStations(stations.map(s => s.id === station.id ? { ...s, isActive: updated.isActive } : s));
      setActiveMenuId(null);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteStation = async (station) => {
    if (!window.confirm(`Are you sure you want to delete station "${station.name}"?`)) {
      return;
    }
    try {
      await api.deleteStation(station.id);
      setStations(stations.filter(s => s.id !== station.id));
      setActiveMenuId(null);
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formId.trim() || !formName.trim() || !formLanguage.trim()) {
      setFormError('Station Name, Category/Language, and Slug/ID are required.');
      return;
    }

    const cleanSlug = formId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanSlug) {
      setFormError('Invalid Slug/ID format.');
      return;
    }

    try {
      if (editingStation) {
        // Edit Mode
        const updated = await api.updateStation(editingStation.id, {
          name: formName.trim(),
          language: formLanguage.trim(),
          description: formDescription.trim(),
          color: formColor,
          isActive: formIsActive
        });
        
        // Sync local UI state
        setStations(stations.map(s => s.id === editingStation.id ? {
          ...s,
          name: updated.name,
          language: updated.language,
          description: updated.description,
          color: updated.color,
          isActive: updated.isActive
        } : s));
      } else {
        // Add Mode
        const newStation = await api.createStation({
          id: cleanSlug,
          name: formName.trim(),
          language: formLanguage.trim(),
          description: formDescription.trim(),
          color: formColor,
          isActive: formIsActive
        });

        setStations([...stations, {
          ...newStation,
          trackCount: 0,
          playlistCount: 0,
          icon: '📻'
        }]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'An error occurred during submission.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-100 flex items-center gap-3">
            Radio Stations
            <button 
              onClick={fetchStations}
              className="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
              title="Refresh Stations List"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Manage your radio station lineup and configuration.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-surface-950 text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Add Station
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && stations.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-surface-400">
          <RefreshCw size={24} className="animate-spin mr-2" /> Loading stations...
        </div>
      ) : (
        /* Station cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map((station) => (
            <div
              key={station.id}
              className="glass-card rounded-xl p-5 hover:border-surface-600/40 transition-all duration-300 group relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      background: `linear-gradient(135deg, ${station.color || '#d48c36'}22, ${station.color || '#d48c36'}08)`,
                      border: `1px solid ${station.color || '#d48c36'}33`,
                    }}
                  >
                    {station.icon || '📻'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-100 group-hover:text-brand-300 transition-colors">
                      {station.name}
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5">{station.description || 'No description provided'}</p>
                    <span className="text-[10px] text-surface-600 font-mono">Slug/ID: {station.id}</span>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === station.id ? null : station.id)}
                    className="p-1.5 rounded-lg text-surface-600 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {activeMenuId === station.id && (
                    <div className="absolute right-0 mt-1 w-48 rounded-lg bg-surface-900 border border-surface-800/80 shadow-lg py-1 z-10">
                      <button
                        onClick={() => handleOpenEditModal(station)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-surface-100"
                      >
                        <Edit size={14} /> Edit Station
                      </button>
                      <button
                        onClick={() => handleToggleActive(station)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-surface-100"
                      >
                        <Power size={14} /> {station.isActive !== false ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteStation(station)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-surface-800 hover:text-red-300"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-surface-800/40 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-lg font-bold text-surface-200">{station.trackCount ?? 0}</p>
                    <p className="text-[10px] text-surface-500 uppercase tracking-wider">Tracks</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-surface-200">{station.language || 'Mixed'}</p>
                    <p className="text-[10px] text-surface-500 uppercase tracking-wider">Category</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    station.isActive !== false
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-surface-800 text-surface-500 border border-surface-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      station.isActive !== false ? 'bg-emerald-400' : 'bg-surface-600'
                    }`}
                  />
                  {station.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Station Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl overflow-hidden shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800/40">
              <h3 className="text-base font-bold text-surface-100">
                {editingStation ? 'Edit Station' : 'Add Station'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {formError}
                </div>
              )}

              {/* Slug/ID (Only editable for new stations) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">Station Slug / ID</label>
                <input
                  type="text"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  placeholder="e.g. punjabi-hits"
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800/80 text-sm text-surface-100 placeholder:text-surface-600 outline-none focus:border-brand-500/50 transition-colors disabled:opacity-50"
                  disabled={!!editingStation}
                />
                <p className="text-[10px] text-surface-500">Unique identifier, cannot be modified after creation.</p>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">Station Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Punjabi Top Hits"
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800/80 text-sm text-surface-100 placeholder:text-surface-600 outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>

              {/* Category / Language */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">Category / Language</label>
                <input
                  type="text"
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value)}
                  placeholder="e.g. Punjabi"
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800/80 text-sm text-surface-100 placeholder:text-surface-600 outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Tell listeners what this station is about..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800/80 text-sm text-surface-100 placeholder:text-surface-600 outline-none focus:border-brand-500/50 transition-colors resize-none"
                />
              </div>

              {/* Color */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-400">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-8 h-8 rounded border border-surface-800 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-24 px-2 py-1 rounded bg-surface-900 border border-surface-800 text-xs font-mono text-surface-200 outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="block text-xs font-semibold text-surface-200">Active Status</label>
                  <p className="text-[10px] text-surface-500">Enable or disable public visibility</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-10 h-5.5 rounded-full relative transition-colors ${
                    formIsActive ? 'bg-brand-500' : 'bg-surface-700'
                  }`}
                >
                  <span
                    className="absolute top-0.5 left-0.5 bg-white rounded-full transition-transform"
                    style={{
                      width: '18px',
                      height: '18px',
                      transform: formIsActive ? 'translateX(20px)' : 'translateX(0px)',
                    }}
                  />
                </button>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-800/40">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-900 border border-surface-800/80 hover:bg-surface-800 text-surface-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-surface-950 text-sm font-semibold transition-colors"
                >
                  {editingStation ? 'Save Changes' : 'Create Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
