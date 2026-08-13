require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('./models/Station');
const Track = require('./models/Track');

const STATIONS_DATA = [
  {
    id: 'hindi',
    name: 'Hindi 90s Classics',
    language: 'Hindi',
    description: 'Lata, Kishore, Rafi — the golden voices reborn',
    color: '#d48c36',
    streamUrl: '',
    isActive: true
  },
  {
    id: 'bengali',
    name: 'Bengali 90s Classics',
    language: 'Bengali',
    description: 'Bengali soul from the golden nineties',
    color: '#4ecdc4',
    streamUrl: '',
    isActive: true
  },
  {
    id: 'bhojpuri',
    name: 'Bhojpuri Top Hits',
    language: 'Bhojpuri',
    description: 'Earthen beats from the heartland',
    color: '#e07b39',
    streamUrl: '',
    isActive: true
  },
  {
    id: 'mixed',
    name: 'Mixed Radio',
    language: 'Mixed',
    description: 'The full 90s Indian experience rotation',
    color: '#9b59b6',
    streamUrl: '',
    isActive: true
  }
];

const TRACKS_DATA = [
  // Hindi
  {
    title: 'SoundHelix Song 1 (Direct)',
    artist: 'SoundHelix',
    album: 'SoundHelix Release',
    year: '2023',
    language: 'Hindi',
    artwork: '🎵',
    provider: 'direct',
    audioUrl: '/audio/legal-demo.mp3',
    station: 'hindi'
  },
  {
    title: 'Faded (YouTube)',
    artist: 'Alan Walker',
    album: 'YouTube',
    year: '2015',
    language: 'Hindi',
    artwork: '📻',
    provider: 'youtube',
    providerId: '60ItHLz5WEA',
    audioUrl: '',
    station: 'hindi'
  },
  // Bengali
  {
    title: 'SoundHelix Song 1 (Direct)',
    artist: 'SoundHelix',
    album: 'SoundHelix Release',
    year: '2023',
    language: 'Bengali',
    artwork: '🌿',
    provider: 'direct',
    audioUrl: '/audio/legal-demo.mp3',
    station: 'bengali'
  },
  {
    title: 'Faded (YouTube)',
    artist: 'Alan Walker',
    album: 'YouTube',
    year: '2015',
    language: 'Bengali',
    artwork: '📻',
    provider: 'youtube',
    providerId: '60ItHLz5WEA',
    audioUrl: '',
    station: 'bengali'
  },
  // Bhojpuri
  {
    title: 'SoundHelix Song 1 (Direct)',
    artist: 'SoundHelix',
    album: 'SoundHelix Release',
    year: '2023',
    language: 'Bhojpuri',
    artwork: '🌾',
    provider: 'direct',
    audioUrl: '/audio/legal-demo.mp3',
    station: 'bhojpuri'
  },
  {
    title: 'Faded (YouTube)',
    artist: 'Alan Walker',
    album: 'YouTube',
    year: '2015',
    language: 'Bhojpuri',
    artwork: '📻',
    provider: 'youtube',
    providerId: '60ItHLz5WEA',
    audioUrl: '',
    station: 'bhojpuri'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    await Station.deleteMany({});
    await Track.deleteMany({});
    console.log('🧹 Cleaned existing database entries');

    await Station.insertMany(STATIONS_DATA);
    await Track.insertMany(TRACKS_DATA);
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
