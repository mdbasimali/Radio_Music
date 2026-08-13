const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const Track = require('../models/Track');

// Fallback stub data if database connection is offline
const fallbackStations = [
  { id: 'hindi', name: 'Hindi 90s Classics', language: 'Hindi', subtitle: 'Bollywood Golden Era', color: '#d48c36', icon: '🎵', description: 'Lata, Kishore, Rafi — the golden voices reborn', isActive: true },
  { id: 'bengali', name: 'Bengali 90s Classics', language: 'Bengali', subtitle: 'Adhunik & Rabindra Sangeet', color: '#4ecdc4', icon: '🌿', description: 'Bengali soul from the golden nineties', isActive: true },
  { id: 'bhojpuri', name: 'Bhojpuri Top Hits', language: 'Bhojpuri', subtitle: 'Folk & Filmi Fusion', color: '#e07b39', icon: '🌾', description: 'Earthen beats from the heartland', isActive: true },
  { id: 'mixed', name: 'Mixed Radio', language: 'Mixed', subtitle: 'Hindi · Bengali · Bhojpuri', color: '#9b59b6', icon: '📻', description: 'The full 90s Indian experience rotation', isActive: true },
];

router.get('/', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      // Find all stations (both active and inactive for admin panel)
      const dbStations = await Station.find({});
      if (dbStations && dbStations.length > 0) {
        const mapped = await Promise.all(dbStations.map(async s => {
          const fb = fallbackStations.find(f => f.id === s.id) || {};
          const trackCount = await Track.countDocuments({ station: s.id });
          return {
            id: s.id,
            name: s.name,
            language: s.language,
            subtitle: fb.subtitle || '90s Melodies',
            color: s.color || fb.color || '#d48c36',
            icon: fb.icon || '📻',
            description: s.description || fb.description,
            isActive: s.isActive !== undefined ? s.isActive : true,
            trackCount: trackCount,
            playlistCount: 0 // Placeholder
          };
        }));
        return res.json(mapped);
      }
    }
    const fallbackMapped = fallbackStations.map(s => ({
      ...s,
      trackCount: 0,
      playlistCount: 0
    }));
    res.json(fallbackMapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      const station = await Station.findOne({ id: req.params.id });
      if (station) {
        const fb = fallbackStations.find(f => f.id === station.id) || {};
        const trackCount = await Track.countDocuments({ station: station.id });
        return res.json({
          id: station.id,
          name: station.name,
          language: station.language,
          subtitle: fb.subtitle || '90s Melodies',
          color: station.color || fb.color || '#d48c36',
          icon: fb.icon || '📻',
          description: station.description,
          isActive: station.isActive !== undefined ? station.isActive : true,
          trackCount: trackCount,
          playlistCount: 0
        });
      }
    }
    const station = fallbackStations.find((s) => s.id === req.params.id);
    if (!station) return res.status(404).json({ error: 'Station not found' });
    res.json({ ...station, trackCount: 0, playlistCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, language, description, color, isActive } = req.body;
    if (!id || !name || !language) {
      return res.status(400).json({ error: 'Missing required fields (id, name, language)' });
    }

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection offline' });
    }

    const existing = await Station.findOne({ id });
    if (existing) {
      return res.status(400).json({ error: 'Duplicate station ID/slug' });
    }

    const newStation = new Station({
      id,
      name,
      language,
      description,
      color: color || '#d48c36',
      isActive: isActive !== undefined ? isActive : true
    });

    await newStation.save();
    res.status(201).json(newStation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { name, language, description, color, isActive } = req.body;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection offline' });
    }

    const station = await Station.findOne({ id: req.params.id });
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    if (name !== undefined) station.name = name;
    if (language !== undefined) station.language = language;
    if (description !== undefined) station.description = description;
    if (color !== undefined) station.color = color;
    if (isActive !== undefined) station.isActive = isActive;

    await station.save();
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection offline' });
    }

    const stationId = req.params.id;

    // Check if any tracks are using this station
    const trackCount = await Track.countDocuments({ station: stationId });
    if (trackCount > 0) {
      return res.status(400).json({ error: 'Cannot delete station: tracks are assigned to it' });
    }

    const result = await Station.deleteOne({ id: stationId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stations/:stationId/tracks - Return only active tracks for a station
router.get('/:stationId/tracks', async (req, res) => {
  try {
    const { stationId } = req.params;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      // Find station details
      const station = await Station.findOne({ id: stationId });
      if (!station) {
        return res.status(404).json({ error: 'Station not found' });
      }

      // Find active tracks for this station
      let dbTracks = [];
      if (stationId === 'mixed') {
        // Mixed combines active tracks from other active stations
        const activeStations = await Station.find({ isActive: true, id: { $ne: 'mixed' } });
        const activeStationIds = activeStations.map(s => s.id);
        dbTracks = await Track.find({ status: 'active', station: { $in: activeStationIds } });
      } else {
        dbTracks = await Track.find({ status: 'active', station: stationId });
      }

      const mappedTracks = dbTracks.map(t => ({
        id: t._id.toString(),
        title: t.title,
        artist: t.artist,
        artwork: t.artwork || '📻',
        provider: t.provider || 'direct',
        providerId: t.providerId || '',
        audioUrl: t.audioUrl || '',
        station: t.station,
        status: t.status || 'active'
      }));

      return res.json({
        station: {
          id: station.id,
          name: station.name,
          slug: station.id
        },
        tracks: mappedTracks
      });
    }

    // Offline mock fallback response
    const fb = fallbackStations.find(s => s.id === stationId);
    if (!fb) return res.status(404).json({ error: 'Station not found' });
    return res.json({
      station: { id: fb.id, name: fb.name, slug: fb.id },
      tracks: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

