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
    this.playbackIntent = false; // Tracks explicit user intent (true = playing, false = paused)
    this._isChangingTrack = false; // Tracks whether a track swap is actively in progress
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
    this.audio.setAttribute('playsinline', '');
    this.audio.setAttribute('webkit-playsinline', '');
    this.audio.setAttribute('x-webkit-airplay', 'allow');
    this._setupAudioListeners();

    // YouTube state
    this.ytPlayer = null;
    this.ytReady = false;
    this.ytInterval = null;
    this._ytLoadedVideoId = null;
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
        this.isPlaying = false;
        this.playbackIntent = false;
        this.callbacks.onStateChange?.({ isPlaying: false, isLoading: false });
        this.callbacks.onEnded();
      }
    });
    audio.addEventListener('loadstart', () => {
      if (this.providerType === 'direct' && this.playbackIntent) {
        this.callbacks.onLoadStart();
      }
    });
    audio.addEventListener('playing', () => {
      if (this.providerType === 'direct') {
        this.isPlaying = true;
        this.playbackIntent = true;
        this.callbacks.onCanPlay();
        this.callbacks.onStateChange?.({ isPlaying: true, isLoading: false });
      }
    });
    audio.addEventListener('pause', () => {
      if (this.providerType === 'direct') {
        if (this._isChangingTrack && this.playbackIntent) {
          return; // Ignore transient pause during track swap
        }
        this.isPlaying = false;
        this.playbackIntent = false;
        this.callbacks.onCanPlay();
        this.callbacks.onStateChange?.({ isPlaying: false, isLoading: false });
      }
    });
    audio.addEventListener('canplay', () => {
      if (this.providerType === 'direct') {
        this.callbacks.onCanPlay();
      }
    });
    audio.addEventListener('error', (e) => {
      if (this.providerType === 'direct') {
        this.isPlaying = false;
        this.playbackIntent = false;
        this.callbacks.onCanPlay();
        this.callbacks.onStateChange?.({ isPlaying: false, isLoading: false });
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
    this.audio.load();
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
    this._isChangingTrack = true;

    // Synchronize isPlaying with explicit playbackIntent
    this.isPlaying = this.playbackIntent;

    console.log('[PM] load()', {
      provider: nextProvider,
      providerId: track.providerId,
      url: track.url,
      playbackIntent: this.playbackIntent,
    });

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

    if (this.playbackIntent) {
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

    console.log('[YT] Loading video:', videoId, 'intent:', this.playbackIntent);

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
      console.log('[YT] Reusing existing player, loading video:', videoId, 'intent:', this.playbackIntent);
      this._ytLoadedVideoId = videoId;
      this._applyYTVolume();
      if (this.playbackIntent) {
        this.ytPlayer.loadVideoById(videoId);
        try {
          this.ytPlayer.playVideo();
        } catch (e) {}
      } else {
        if (typeof this.ytPlayer.cueVideoById === 'function') {
          this.ytPlayer.cueVideoById(videoId);
        }
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
        autoplay: 0,
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
          console.log('[YT] onReady fired, intent:', this.playbackIntent);
          this.ytReady = true;
          this._applyYTVolume();
          this.callbacks.onCanPlay();

          if (this.playbackIntent || this._pendingPlay) {
            this._pendingPlay = false;
            console.log('[YT] Fulfilling playback in onReady');
            try {
              this.ytPlayer.playVideo();
            } catch (e) {
              console.error('[YT] Error calling playVideo on ready:', e);
              this.callbacks.onError(e);
            }
          } else {
            this.callbacks.onCanPlay();
          }
        },
        onStateChange: (event) => {
          const state = event.data;
          const stateNames = { [-1]: 'UNSTARTED', 0: 'ENDED', 1: 'PLAYING', 2: 'PAUSED', 3: 'BUFFERING', 5: 'CUED' };
          console.log('[YT STATE]', stateNames[state] || state, 'intent:', this.playbackIntent, 'isChangingTrack:', this._isChangingTrack);

          switch (state) {
            case window.YT.PlayerState.PLAYING:
              this._isChangingTrack = false;
              this.isPlaying = true;
              this.playbackIntent = true;
              this.callbacks.onCanPlay();
              this.callbacks.onDurationChange(this.ytPlayer.getDuration());
              this.callbacks.onStateChange?.({ isPlaying: true, isLoading: false });
              this._startTimeTracking();
              break;

            case window.YT.PlayerState.PAUSED:
              // Ignore transient PAUSED event during track swap if playback intent is active
              if (this._isChangingTrack && this.playbackIntent) {
                console.log('[YT STATE] Ignoring transient PAUSED during track change');
                break;
              }
              this.isPlaying = false;
              this.playbackIntent = false;
              this._stopTimeTracking();
              this.callbacks.onCanPlay();
              this.callbacks.onStateChange?.({ isPlaying: false, isLoading: false });
              break;

            case window.YT.PlayerState.ENDED:
              this._isChangingTrack = false;
              this.isPlaying = false;
              this.playbackIntent = false;
              this._stopTimeTracking();
              this.callbacks.onCanPlay();
              this.callbacks.onStateChange?.({ isPlaying: false, isLoading: false });
              this.callbacks.onEnded();
              break;

            case window.YT.PlayerState.BUFFERING:
              if (this.playbackIntent || this._pendingPlay) {
                this.callbacks.onLoadStart();
              }
              break;

            case window.YT.PlayerState.CUED:
            case window.YT.PlayerState.UNSTARTED:
              this.callbacks.onCanPlay();
              if (!this.playbackIntent) {
                this.isPlaying = false;
                this.callbacks.onStateChange?.({ isPlaying: false, isLoading: false });
              }
              break;
          }
        },
        onError: (event) => {
          console.error('[YT] Error code:', event.data);
          this._isChangingTrack = false;
          this.isPlaying = false;
          this.playbackIntent = false;
          this.callbacks.onCanPlay();
          this.callbacks.onStateChange?.({ isPlaying: false, isLoading: false });
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
