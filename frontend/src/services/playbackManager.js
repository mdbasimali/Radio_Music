// src/services/playbackManager.js
// Unified playback manager that abstracts DirectAudioProvider and YouTubeProvider
// Handles provider switching, play/pause routing, progress, seek, volume

let youtubeApiPromise = null;
function loadYouTubeAPI() {
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      console.log('[YT] API already loaded');
      resolve(window.YT);
      return;
    }
    window.onYouTubeIframeAPIReady = () => {
      console.log('[YT] API loaded via script');
      resolve(window.YT);
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  });
  return youtubeApiPromise;
}

class PlaybackManager {
  constructor() {
    this.currentTrack = null;
    this.providerType = null; // 'direct' or 'youtube' — null until first load
    this.isPlaying = false;
    this.volume = 0.8;
    this.isMuted = false;

    // Pending play request — set when play() is called before YT player is ready
    this._pendingPlay = false;

    this.callbacks = {
      onTimeUpdate: () => {},
      onDurationChange: () => {},
      onEnded: () => {},
      onLoadStart: () => {},
      onCanPlay: () => {},
      onError: () => {}
    };

    // HTML5 Audio element (singleton)
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this._setupAudioListeners();

    // YouTube state
    this.ytPlayer = null;
    this.ytReady = false;
    this.ytInterval = null;
    this._ytLoadedVideoId = null; // track which video ID is currently loaded
  }

  setCallbacks(cbs) {
    this.callbacks = { ...this.callbacks, ...cbs };
  }

  getAudio() {
    return this.audio;
  }

  // ── HTML5 Audio Listeners ──────────────────────────────────────

  _setupAudioListeners() {
    const audio = this.audio;
    audio.addEventListener('timeupdate', () => {
      if (this.providerType === 'direct') {
        this.callbacks.onTimeUpdate(audio.currentTime);
      }
    });
    audio.addEventListener('durationchange', () => {
      if (this.providerType === 'direct') {
        this.callbacks.onDurationChange(isFinite(audio.duration) ? audio.duration : 0);
      }
    });
    audio.addEventListener('ended', () => {
      if (this.providerType === 'direct') {
        this.callbacks.onEnded();
      }
    });
    audio.addEventListener('loadstart', () => {
      if (this.providerType === 'direct') {
        this.callbacks.onLoadStart();
      }
    });
    audio.addEventListener('canplay', () => {
      if (this.providerType === 'direct') {
        this.callbacks.onCanPlay();
      }
    });
    audio.addEventListener('error', (e) => {
      if (this.providerType === 'direct') {
        this.callbacks.onError(e);
      }
    });
  }

  // ── YouTube Container Management ───────────────────────────────

  _ensureContainer(visible) {
    let el = document.getElementById('youtube-player-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'youtube-player-container';
      document.body.appendChild(el);
    }

    // Rather than fixed bottom-right video box, we render it out-of-view (1x1 pixel offscreen)
    // to preserve audio playback while meeting technical IFrame embedding requirements.
    Object.assign(el.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      top: '-9999px',
      left: '-9999px',
      opacity: '0.001',
      zIndex: '-9999',
      pointerEvents: 'none',
      overflow: 'hidden'
    });
    
    return el;
  }

  // ── YouTube Time Tracking ──────────────────────────────────────

  _startTimeTracking() {
    this._stopTimeTracking();
    this.ytInterval = setInterval(() => {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.getCurrentTime === 'function') {
        this.callbacks.onTimeUpdate(this.ytPlayer.getCurrentTime());
      }
    }, 250);
  }

  _stopTimeTracking() {
    if (this.ytInterval) {
      clearInterval(this.ytInterval);
      this.ytInterval = null;
    }
  }

  // ── Stop the other provider ────────────────────────────────────

  _stopDirect() {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load(); // reset to empty
  }

  _stopYouTube() {
    this._stopTimeTracking();
    if (this.ytPlayer && this.ytReady) {
      try { this.ytPlayer.stopVideo(); } catch (e) { /* ignore */ }
    }
    this._ensureContainer(false);
  }

  // ── Main Load ──────────────────────────────────────────────────

  async load(track) {
    const prevProvider = this.providerType;
    const nextProvider = track.provider || 'direct';
    this.currentTrack = track;
    this._pendingPlay = false;

    console.log('[PM] load()', { provider: nextProvider, providerId: track.providerId, url: track.url, prevProvider });

    // Stop the PREVIOUS provider cleanly before switching
    if (prevProvider === 'direct' && nextProvider === 'youtube') {
      this._stopDirect();
    } else if (prevProvider === 'youtube' && nextProvider === 'direct') {
      this._stopYouTube();
    }

    this.providerType = nextProvider;

    if (nextProvider === 'youtube') {
      await this._loadYouTube(track);
    } else {
      this._loadDirect(track);
    }
  }

  // ── Direct Audio Loading ───────────────────────────────────────

  _loadDirect(track) {
    this._ensureContainer(false);

    if (!track.url) {
      console.warn('[PM] Direct track has no URL');
      this.callbacks.onError(new Error('No audioUrl for direct track'));
      return;
    }

    const absoluteUrl = track.url.startsWith('http') ? track.url : window.location.origin + track.url;
    console.log('[PM] Direct audio src:', absoluteUrl);

    if (this.audio.src !== absoluteUrl) {
      this.audio.src = track.url;
      this.audio.load();
    }

    // If play state is already active, start immediately
    if (this.isPlaying) {
      this.audio.play().catch((err) => {
        this.callbacks.onError(err);
      });
    }
  }

  // ── YouTube Loading ────────────────────────────────────────────

  async _loadYouTube(track) {
    const videoId = track.providerId;
    if (!videoId) {
      console.error('[YT] Missing providerId');
      this.callbacks.onError(new Error('Missing providerId for YouTube track'));
      return;
    }

    this.callbacks.onLoadStart();
    console.log('[YT] Loading video:', videoId);

    try {
      await loadYouTubeAPI();
    } catch (err) {
      console.error('[YT] Failed to load API:', err);
      this.callbacks.onError(err);
      return;
    }

    const container = this._ensureContainer(true);

    // If we already have a ready YT player, just swap the video
    if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.loadVideoById === 'function') {
      console.log('[YT] Reusing existing player, loading video:', videoId);
      this._ytLoadedVideoId = videoId;
      this._applyYTVolume();
      if (this.isPlaying) {
        this.ytPlayer.loadVideoById(videoId); // auto-plays
      } else {
        this.ytPlayer.cueVideoById(videoId);
        this.callbacks.onCanPlay();
      }
      return;
    }

    // First time — create the player
    this.ytReady = false;
    this._ytLoadedVideoId = videoId;
    container.innerHTML = '<div id="yt-player-placeholder" style="width:100%;height:100%;"></div>';

    console.log('[YT] Creating new Player instance for:', videoId);

    this.ytPlayer = new window.YT.Player('yt-player-placeholder', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0, // we control play ourselves
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          console.log('[YT] onReady fired');
          this.ytReady = true;
          this._applyYTVolume();
          this.callbacks.onCanPlay();

          // If play was requested while we were initializing, start now
          if (this.isPlaying || this._pendingPlay) {
            this._pendingPlay = false;
            console.log('[YT] Fulfilling pending play');
            this.ytPlayer.playVideo();
          }
        },
        onStateChange: (event) => {
          const state = event.data;
          const stateNames = { [-1]: 'UNSTARTED', 0: 'ENDED', 1: 'PLAYING', 2: 'PAUSED', 3: 'BUFFERING', 5: 'CUED' };
          console.log('[YT] State:', stateNames[state] || state);

          switch (state) {
            case window.YT.PlayerState.PLAYING:
              this.callbacks.onCanPlay();
              this.callbacks.onDurationChange(this.ytPlayer.getDuration());
              this._startTimeTracking();
              break;
            case window.YT.PlayerState.PAUSED:
              this._stopTimeTracking();
              // Don't call setPlaying(false) here — that would cause a loop.
              // The React side controls isPlaying; we only report time/duration/ended.
              break;
            case window.YT.PlayerState.ENDED:
              this._stopTimeTracking();
              this.callbacks.onEnded();
              break;
            case window.YT.PlayerState.BUFFERING:
              this.callbacks.onLoadStart();
              break;
            // CUED and UNSTARTED are informational — no action needed
          }
        },
        onError: (event) => {
          console.error('[YT] Error code:', event.data);
          // YT error codes: 2=invalid param, 5=HTML5 error, 100=not found, 101/150=not embeddable
          this.callbacks.onError(new Error(`YouTube error code: ${event.data}`));
        }
      }
    });
  }

  // ── Volume Helper for YouTube ──────────────────────────────────

  _applyYTVolume() {
    if (!this.ytPlayer || !this.ytReady) return;
    try {
      if (this.isMuted) {
        this.ytPlayer.mute();
      } else {
        this.ytPlayer.unMute();
        this.ytPlayer.setVolume(this.volume * 100);
      }
    } catch (e) { /* player might be in an intermediate state */ }
  }

  // ── Public API ─────────────────────────────────────────────────

  play() {
    this.isPlaying = true;
    this._pendingPlay = false;
    console.log('[PM] play() provider:', this.providerType);

    if (this.providerType === 'youtube') {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.playVideo === 'function') {
        this.ytPlayer.playVideo();
      } else {
        // Player not ready yet — queue the play for onReady
        console.log('[YT] Player not ready, queuing play');
        this._pendingPlay = true;
      }
    } else {
      if (this.audio.src) {
        this.audio.play().catch((err) => this.callbacks.onError(err));
      }
    }
  }

  pause() {
    this.isPlaying = false;
    this._pendingPlay = false;
    console.log('[PM] pause() provider:', this.providerType);

    if (this.providerType === 'youtube') {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
      this._stopTimeTracking();
    } else {
      this.audio.pause();
    }
  }

  seek(time) {
    if (this.providerType === 'youtube') {
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.seekTo === 'function') {
        this.ytPlayer.seekTo(time, true);
        this.callbacks.onTimeUpdate(time);
      }
    } else {
      if (isFinite(time)) {
        this.audio.currentTime = time;
      }
    }
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.providerType === 'youtube') {
      if (this.ytPlayer && this.ytReady) {
        this.ytPlayer.setVolume(this.isMuted ? 0 : vol * 100);
      }
    } else {
      this.audio.volume = this.isMuted ? 0 : vol;
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.providerType === 'youtube') {
      this._applyYTVolume();
    } else {
      this.audio.muted = muted;
      this.audio.volume = muted ? 0 : this.volume;
    }
  }
}

export const playbackManager = new PlaybackManager();
