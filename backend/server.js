require('dotenv').config();
const dns = require('dns');
// Set DNS servers to Google and Cloudflare to resolve MongoDB SRV records correctly
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const stationsRouter = require('./routes/stations');
const tracksRouter = require('./routes/tracks');
const playlistsRouter = require('./routes/playlists');

const app = express();
const PORT = process.env.PORT || 5001;

// Define allowed CORS origins
const allowedOrigins = [
  'https://90sgaana.in',
  'https://www.90sgaana.in'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map(o => o.trim()));
}
if (process.env.ADMIN_URL) {
  allowedOrigins.push(...process.env.ADMIN_URL.split(',').map(o => o.trim()));
}
// Default development origins fallback
if (allowedOrigins.length === 2) { // only if no env variables were added
  allowedOrigins.push(
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5001'
  );
}

// Setup HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

console.log('Allowed CORS Origins:', allowedOrigins);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 || 
      allowedOrigins.includes('*') ||
      (origin.startsWith('https://radio-music-') && origin.endsWith('.vercel.app'))
    ) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
const path = require('path');
app.use('/audio', express.static(path.join(__dirname, 'public/audio'), {
  setHeaders: (res) => {
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// Routes
app.use('/api/stations', stationsRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/playlists', playlistsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});



// Socket.IO state management
// visitorSockets: visitorId -> Set of socketIds
const visitorSockets = new Map();
// socketVisitors: socketId -> visitorId
const socketVisitors = new Map();
// socketListening: Set of active socketIds (currently playing audio)
const socketListening = new Set();

function getActiveListenerCount() {
  let count = 0;
  // A visitorId is counted as an active listener if at least one of their sockets is listening
  for (const [visitorId, socketIds] of visitorSockets.entries()) {
    let visitorIsListening = false;
    for (const socketId of socketIds) {
      if (socketListening.has(socketId)) {
        visitorIsListening = true;
        break;
      }
    }
    if (visitorIsListening) {
      count++;
    }
  }
  return count;
}

function broadcastListenerCount() {
  const count = getActiveListenerCount();
  io.emit('listener_count_update', count);
}

io.on('connection', (socket) => {
  const visitorId = socket.handshake.query.visitorId || 'anonymous';
  
  // Register socket connections
  socketVisitors.set(socket.id, visitorId);
  if (!visitorSockets.has(visitorId)) {
    visitorSockets.set(visitorId, new Set());
  }
  visitorSockets.get(visitorId).add(socket.id);

  // Broadcast initial count on connection
  broadcastListenerCount();

  // Listen to playback state change from client
  socket.on('playback_state_change', ({ isPlaying }) => {
    if (isPlaying) {
      socketListening.add(socket.id);
    } else {
      socketListening.delete(socket.id);
    }
    broadcastListenerCount();
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    socketListening.delete(socket.id);
    const vId = socketVisitors.get(socket.id);
    if (vId) {
      const sockets = visitorSockets.get(vId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          visitorSockets.delete(vId);
        }
      }
    }
    socketVisitors.delete(socket.id);
    broadcastListenerCount();
  });
});

// MongoDB connection & HTTP server start
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radio90s')
  .then(() => {
    console.log('✅  MongoDB connected');
    const keyExists = !!process.env.YOUTUBE_API_KEY;
    const keyLength = process.env.YOUTUBE_API_KEY ? process.env.YOUTUBE_API_KEY.length : 0;
    console.log(`YouTube API key configured: ${keyExists}`);
    console.log(`YouTube API key length: ${keyLength}`);
    server.listen(PORT, '0.0.0.0', () => console.log(`🎵  90s Radio API & WebSockets running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    const keyExists = !!process.env.YOUTUBE_API_KEY;
    const keyLength = process.env.YOUTUBE_API_KEY ? process.env.YOUTUBE_API_KEY.length : 0;
    console.log(`YouTube API key configured: ${keyExists}`);
    console.log(`YouTube API key length: ${keyLength}`);
    // Start server even without DB (for development)
    server.listen(PORT, '0.0.0.0', () => console.log(`🎵  90s Radio API & WebSockets (no DB) running on port ${PORT}`));
  });
