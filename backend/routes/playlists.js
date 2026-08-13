const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');

// Helper to extract playlist ID
function extractPlaylistId(url) {
  try {
    const reg = /[&?]list=([^&]+)/;
    const match = url.match(reg);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (e) {
    return null;
  }
}

// GET all playlists
router.get('/', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      const dbPlaylists = await Playlist.find({});
      return res.json(dbPlaylists);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST import playlist (adds playlist detail but does NOT sync/import tracks from YT API yet)
router.post('/', async (req, res) => {
  try {
    const { stationId, youtubePlaylistUrl } = req.body;
    if (!stationId || !youtubePlaylistUrl) {
      return res.status(400).json({ error: 'Missing required fields (stationId, youtubePlaylistUrl)' });
    }

    const playlistId = extractPlaylistId(youtubePlaylistUrl);
    if (!playlistId) {
      return res.status(400).json({ error: 'Invalid YouTube Playlist URL format. Must contain ?list=PLAYLIST_ID' });
    }

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection offline' });
    }

    const existing = await Playlist.findOne({ youtubePlaylistId: playlistId });
    if (existing) {
      return res.status(400).json({ error: 'This YouTube Playlist is already imported.' });
    }

    const newPlaylist = new Playlist({
      stationId,
      name: `Playlist ${playlistId.substring(0, 8)}...`, // Placeholder name until YT API metadata is implemented
      youtubePlaylistId: playlistId,
      youtubePlaylistUrl,
      trackCount: 0,
      status: 'active',
      lastSyncedAt: null,
    });

    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update status or details
router.patch('/:id', async (req, res) => {
  try {
    const { status, name } = req.body;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection offline' });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (status !== undefined) playlist.status = status;
    if (name !== undefined) playlist.name = name;

    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/playlists/:id/sync
router.post('/:id/sync', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection offline' });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      playlist.syncStatus = 'failed';
      playlist.lastSyncStats = { imported: 0, updated: 0, skipped: 0, error: 'YOUTUBE_API_KEY is not configured on the backend server.' };
      await playlist.save();
      return res.status(500).json({ error: 'YouTube API Key is missing on the server.' });
    }

    // Set status to syncing
    playlist.syncStatus = 'syncing';
    await playlist.save();

    const Track = require('../models/Track');
    const ytPlaylistId = playlist.youtubePlaylistId;

    let videoItems = [];
    let nextPageToken = '';
    let hasMore = true;
    let pageCount = 0;

    // Phase 1: Fetch playlist items (Paginated)
    while (hasMore) {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${ytPlaylistId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errDetail = errJson.error?.message || `HTTP ${response.status}`;
        playlist.syncStatus = 'failed';
        playlist.lastSyncStats = { imported: 0, updated: 0, skipped: 0, error: `Failed to fetch playlist items: ${errDetail}` };
        await playlist.save();
        return res.status(response.status).json({ error: `YouTube API Error: ${errDetail}` });
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        videoItems.push(...data.items);
      }

      nextPageToken = data.nextPageToken || '';
      hasMore = !!nextPageToken;
      pageCount++;
      
      // Safety ceiling to avoid infinite loop
      if (pageCount > 100) break;
    }

    // Filter valid videos and skip deleted/private/unavailable videos
    const validPlaylistItems = videoItems.filter(item => {
      const vidId = item.contentDetails?.videoId;
      const title = item.snippet?.title;
      // Deleted / private videos typically have titles like "Deleted video" or "Private video"
      if (!vidId || title === 'Deleted video' || title === 'Private video') {
        return false;
      }
      return true;
    });

    const totalFetchedCount = videoItems.length;
    const initialSkipped = totalFetchedCount - validPlaylistItems.length;

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = initialSkipped;

    // Phase 2: Fetch detailed video metadata in batches of 50
    const videoIds = validPlaylistItems.map(item => item.contentDetails.videoId);
    const videoDetailsMap = new Map();

    for (let i = 0; i < videoIds.length; i += 50) {
      const batchIds = videoIds.slice(i, i + 50);
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${batchIds.join(',')}&key=${apiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          data.items.forEach(v => {
            videoDetailsMap.set(v.id, v);
          });
        }
      }
    }

    // Phase 3: Create or update Tracks in database
    for (const item of validPlaylistItems) {
      const videoId = item.contentDetails.videoId;
      const detail = videoDetailsMap.get(videoId);

      if (!detail) {
        // Video might be restricted, region-blocked, or deleted since playlist list fetched
        skippedCount++;
        continue;
      }

      const title = detail.snippet?.title || item.snippet?.title || 'Unknown Title';
      const channelTitle = detail.snippet?.channelTitle || item.snippet?.channelTitle || 'Unknown Artist';
      const description = detail.snippet?.description || '';
      const publishedAt = detail.snippet?.publishedAt || item.snippet?.publishedAt;
      
      // Handle artwork thumbnail selector
      const thumbnails = detail.snippet?.thumbnails || item.snippet?.thumbnails || {};
      const artworkUrl = thumbnails.medium?.url || thumbnails.default?.url || '📻';

      // Duplicate handling: playlistId + providerId combination (or search existing by providerId under the same station)
      const existingTrack = await Track.findOne({
        station: playlist.stationId,
        provider: 'youtube',
        providerId: videoId
      });

      if (existingTrack) {
        existingTrack.title = title;
        existingTrack.artist = channelTitle;
        existingTrack.artwork = artworkUrl;
        await existingTrack.save();
        updatedCount++;
      } else {
        const newTrack = new Track({
          title,
          artist: channelTitle,
          album: playlist.name || 'YouTube Playlist',
          year: publishedAt ? new Date(publishedAt).getFullYear().toString() : '90s',
          language: getStationLanguageCategory(playlist.stationId),
          artwork: artworkUrl,
          provider: 'youtube',
          providerId: videoId,
          audioUrl: '', // Explicitly no audioUrl for YouTube tracks
          station: playlist.stationId
        });
        await newTrack.save();
        importedCount++;
      }
    }

    // Refresh playlist details
    const totalTracksCount = await Track.countDocuments({ station: playlist.stationId });
    
    // Update playlist fields
    playlist.name = videoItems.length > 0 ? (playlist.name.startsWith('Playlist ') ? `Playlist (${videoItems.length} items)` : playlist.name) : playlist.name;
    playlist.trackCount = videoItems.length;
    playlist.syncStatus = 'success';
    playlist.lastSyncStats = {
      imported: importedCount,
      updated: updatedCount,
      skipped: skippedCount
    };
    playlist.lastSyncedAt = new Date();
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    playlist.syncStatus = 'failed';
    playlist.lastSyncStats = { imported: 0, updated: 0, skipped: 0, error: error.message };
    await playlist.save();
    res.status(500).json({ error: error.message });
  }
});

// Helper helper
function getStationLanguageCategory(stationId) {
  const mapping = {
    'hindi': 'Hindi',
    'bengali': 'Bengali',
    'bhojpuri': 'Bhojpuri',
    'mixed': 'Mixed'
  };
  return mapping[stationId] || 'Hindi';
}

// DELETE playlist
router.delete('/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection offline' });
    }

    const result = await Playlist.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
