const express = require('express');
const router = express.Router();
const Track = require('../models/Track');

// GET /api/tracks (with search, station, provider, status filters, and pagination)
router.get('/', async (req, res) => {
  try {
    const { stationId, provider, status, search, page = 1, limit = 25 } = req.query;
    
    const query = {};
    
    // Filters
    if (stationId && stationId !== 'all') {
      query.station = stationId;
    }
    if (provider && provider !== 'all') {
      query.provider = provider;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } }
      ];
    }

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitVal = parseInt(limit);

      const totalTracks = await Track.countDocuments(query);
      const dbTracks = await Track.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitVal);

      const mapped = dbTracks.map(t => ({
        id: t._id.toString(),
        title: t.title,
        artist: t.artist,
        album: t.album || '',
        year: t.year || '',
        language: t.language || '',
        artwork: t.artwork || '📻',
        provider: t.provider || 'direct',
        providerId: t.providerId || '',
        audioUrl: t.audioUrl || '',
        station: t.station,
        status: t.status || 'active',
        createdAt: t.createdAt
      }));

      // Public radio client expects a simple array when fetching tracks for a specific station queue.
      // If stationId query parameter is present and not 'all', return array directly.
      if (stationId && stationId !== 'all') {
        return res.json(mapped);
      }

      return res.json({
        tracks: mapped,
        total: totalTracks,
        page: parseInt(page),
        pages: Math.ceil(totalTracks / limitVal)
      });
    }

    // Return empty mock paginated response if DB offline
    if (stationId && stationId !== 'all') {
      return res.json([]);
    }
    res.json({
      tracks: [],
      total: 0,
      page: 1,
      pages: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tracks/stats (Dashboard/overall statistics)
router.get('/stats', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      const totalTracks = await Track.countDocuments({});
      const activeTracks = await Track.countDocuments({ status: 'active' });
      const inactiveTracks = await Track.countDocuments({ status: 'inactive' });
      
      const countsByStation = {};
      const stations = ['hindi', 'bengali', 'bhojpuri', 'mixed'];
      for (const s of stations) {
        countsByStation[s] = await Track.countDocuments({ station: s });
      }

      return res.json({
        total: totalTracks,
        active: activeTracks,
        inactive: inactiveTracks,
        byStation: countsByStation
      });
    }
    res.json({
      total: 0,
      active: 0,
      inactive: 0,
      byStation: { hindi: 0, bengali: 0, bhojpuri: 0, mixed: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tracks/:id (Edit Metadata & Enable/Disable)
router.patch('/:id', async (req, res) => {
  try {
    const { title, artist, station, status } = req.body;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database offline' });
    }

    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    if (title !== undefined) track.title = title;
    if (artist !== undefined) track.artist = artist;
    if (station !== undefined) track.station = station;
    if (status !== undefined) track.status = status;

    await track.save();
    res.json(track);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tracks/:id
router.delete('/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database offline' });
    }

    const deleted = await Track.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tracks/bulk-actions (Bulk update status / bulk delete)
router.post('/bulk-actions', async (req, res) => {
  try {
    const { ids, action, status } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No track IDs provided' });
    }

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database offline' });
    }

    if (action === 'delete') {
      await Track.deleteMany({ _id: { $in: ids } });
      return res.json({ message: 'Tracks deleted successfully' });
    } else if (action === 'status') {
      if (!status) {
        return res.status(400).json({ error: 'Status value is required' });
      }
      await Track.updateMany({ _id: { $in: ids } }, { $set: { status } });
      return res.json({ message: `Tracks status updated to ${status}` });
    }

    res.status(400).json({ error: 'Invalid action parameter' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
