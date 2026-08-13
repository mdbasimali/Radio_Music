const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema(
  {
    stationId: { type: String, required: true }, // Maps to Station.id e.g., 'hindi'
    name: { type: String, required: true },
    youtubePlaylistId: { type: String, required: true, unique: true },
    youtubePlaylistUrl: { type: String, required: true },
    trackCount: { type: Number, default: 0 },
    status: { type: String, default: 'active' }, // 'active', 'inactive'
    syncStatus: { type: String, default: 'never' }, // 'never', 'syncing', 'success', 'failed'
    lastSyncStats: {
      imported: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      error: String
    },
    lastSyncedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', PlaylistSchema);
