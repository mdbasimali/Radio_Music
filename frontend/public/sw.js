// sw.js — 90s Gaana Production Service Worker
// Strategy: Cache-first for static assets, network-only for everything dynamic.
// NEVER caches: API calls, Socket.IO, YouTube, audio streams.

const CACHE_NAME = '90sgaana-static-v1';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.png',
  '/og-image.jpg',
];

// URLs/patterns that must NEVER be cached — always go to the network
const NEVER_CACHE = [
  // Backend API
  'radio-music-hrmt.onrender.com',
  // Socket.IO
  '/socket.io/',
  // YouTube
  'youtube.com',
  'youtu.be',
  'ytimg.com',
  'googlevideo.com',
  'googleapis.com',
  // Audio streams
  '.mp3',
  '.m3u8',
  '.aac',
  '.ogg',
  // Google Fonts (handled by browser cache already)
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// ── Install: pre-cache static shell ─────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        // Don't fail install if some precache URLs are missing
        console.warn('[SW] Precache partial failure (non-fatal):', err);
      });
    })
  );
  // Activate new SW immediately without waiting for old clients to close
  self.skipWaiting();
});

// ── Activate: clean up old caches ───────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ── Fetch: smart routing ─────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests entirely
  if (request.method !== 'GET') return;

  // 2. Skip chrome-extension and non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // 3. Check against never-cache list — these always go straight to network
  const shouldNeverCache = NEVER_CACHE.some(
    (pattern) => request.url.includes(pattern)
  );
  if (shouldNeverCache) return; // browser handles it natively

  // 4. For navigation requests (HTML pages) — network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Update cache with fresh HTML
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Offline fallback — serve cached index.html
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // 5. For static assets (JS, CSS, images, fonts from own origin) — cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        // Not in cache — fetch and cache it
        return fetch(request).then((response) => {
          // Only cache successful responses for same-origin assets
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 6. Everything else (cross-origin) — network only, no caching
  // This covers CDN fonts, analytics, etc.
});
