const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: String,
    year: String,
    language: { type: String, required: true },
    artwork: String,
    provider: { type: String, default: 'direct' }, // 'direct' or 'youtube'
    providerId: String, // e.g. YouTube Video ID
    audioUrl: String, // Optional direct audio URL
    station: { type: String, required: true }, // maps to station ID e.g. 'hindi', 'bengali', 'bhojpuri'
    status: { type: String, default: 'active' }, // 'active', 'inactive'
    playlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
    position: Number,
    youtubePublishedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Track', TrackSchema);
