import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resolveVideoData } from '../utils/data-resolver';

const VideoPlayerPage = () => {
  const { batchId, subjectId, lectureId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const shakaRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  const tapTimerRef = useRef(null);

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState(-1);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hlsError, setHlsError] = useState(null);
  const [shakaError, setShakaError] = useState(null);
  const [currentStreamType, setCurrentStreamType] = useState(null); // 'hls' or 'dash'
  const [seekIndicator, setSeekIndicator] = useState(null);
  const [sessionXP, setSessionXP] = useState(0);
  const xpIntervalRef = useRef(null);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setHlsError(null);

      try {
        const videoRes = await fetch(`https://api.pimaxer.in/video?batchId=${batchId}&subjectId=${subjectId}&childId=${lectureId}`);
        const videoData = await videoRes.json();

        if (videoData.success || videoData.data || videoData.hls) {
          const rawData = videoData.data || videoData;
          let decryptedData = null;

          // Check if data is already decrypted or needs resolution
          if (typeof rawData === 'object' && (rawData.hls || rawData.dash)) {
            console.log('[Security] Data already decrypted, skipping resolution.');
            decryptedData = rawData;
          } else {
            const shieldString = typeof rawData === 'string' ? rawData : (rawData.data || rawData.token || rawData.encrypted);
            if (shieldString && typeof shieldString === 'string' && shieldString.startsWith('PMXR_v2_')) {
               decryptedData = await resolveVideoData(shieldString);
            } else if (typeof rawData === 'object') {
               // Fallback: maybe it's already the manifest but doesn't have hls/dash at top level
               decryptedData = rawData;
            }
          }
          
          if (decryptedData) {
            console.log('[Debug] Decrypted Manifest:', decryptedData);
            
            if (decryptedData.success === false) {
              setError(`Server Error: ${decryptedData.error || 'Failed to fetch stream'}`);
              setLoading(false);
              return;
            }

            const data = decryptedData.data || decryptedData;
            setVideoData(decryptedData);
            setTopicTitle(data?.meta?.topic || decryptedData?.meta?.topic || 'Playing Video');
            
            // Determine stream type
            if (data.hls?.url) setCurrentStreamType('hls');
            else if (data.dash?.url) setCurrentStreamType('dash');
            else if (decryptedData.url?.includes('.m3u8')) setCurrentStreamType('hls');
            else if (decryptedData.url?.includes('.mpd')) setCurrentStreamType('dash');
            else if (data.url?.includes('.m3u8')) setCurrentStreamType('hls');
            else if (data.url?.includes('.mpd')) setCurrentStreamType('dash');
            
          } else {
            setError('Resolution Failed: Server is currently shielded. Please wait or try another lecture.');
          }
        } else {
          setError(videoData.error || videoData.message || 'Failed to load video');
        }
      } catch (err) {
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [batchId, subjectId, lectureId]);

  // ─── HLS Setup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentStreamType !== 'hls' || !videoRef.current) return;
    const data = videoData.data || videoData;
    const hlsUrl = data.hls?.url || videoData.url;
    if (!hlsUrl) return;
    const video = videoRef.current;
    if (!video) return;

    const initHls = async () => {
      const Hls = (await import('hls.js')).default;
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, backBufferLength: 90, maxBufferLength: 30, startLevel: -1 });
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setAvailableQualities(data.levels.map((l, i) => ({ index: i, label: l.height ? `${l.height}p` : `Level ${i}` })));
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
            else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
            else { setHlsError(`Playback error: ${data.details}`); hls.destroy(); }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
      }
    };

    initHls();
    return () => { if (hlsRef.current) hlsRef.current.destroy(); hlsRef.current = null; };
  }, [videoData, currentStreamType]);

  // ─── SHAKA (DASH/DRM) Setup ─────────────────────────────────────────────────
  useEffect(() => {
    if (currentStreamType !== 'dash' || !videoRef.current) return;
    const video = videoRef.current;
    const data = videoData.data || videoData;
    const dashUrl = data.dash?.url || videoData.url;
    const drm = data.dash?.drmDetails || data.drmDetails;

    const initShaka = async () => {
      const shaka = (await import('shaka-player/dist/shaka-player.ui.js')).default;
      await import('shaka-player/dist/controls.css');
      
      shaka.polyfill.installAll();
      if (!shaka.Player.isBrowserSupported()) {
        setShakaError('Browser not supported for DRM playback');
        return;
      }

      const player = new shaka.Player(video);
      shakaRef.current = player;

      if (drm) {
        player.configure({
          drm: {
            servers: { 'com.widevine.alpha': drm.licenseUrl },
            advanced: {
              'com.widevine.alpha': {
                videoRobustness: 'SW_SECURE_CRYPTO',
                audioRobustness: 'SW_SECURE_CRYPTO'
              }
            }
          }
        });

        if (drm.licenseToken) {
          player.getNetworkingEngine().registerRequestFilter((type, request) => {
            if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
              request.headers['Authorization'] = `Bearer ${drm.licenseToken}`;
              request.headers['pallycon-customdata-v2'] = drm.licenseToken; 
            }
          });
        }
      }

      try {
        await player.load(dashUrl);
        video.play().catch(() => {});
      } catch (e) {
        console.error('Shaka Load Error:', e);
        setShakaError(`Playback Error: ${e.code || e.message}`);
      }
    };

    initShaka();
    return () => { if (shakaRef.current) shakaRef.current.destroy(); };
  }, [videoData, currentStreamType]);

  // ─── Video Events ───────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1));
    };
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => { setVolume(video.volume); setMuted(video.muted); };
    const onFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement));
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
    };
  }, []);

  // ─── XP System (1 min = 1 XP) ────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying && !loading && !error) {
      xpIntervalRef.current = setInterval(() => {
        const currentXP = parseInt(localStorage.getItem('user_xp') || '0');
        const newXP = currentXP + 1;
        localStorage.setItem('user_xp', newXP.toString());
        setSessionXP(prev => prev + 1);
        
        // Dispatch custom event so other components (like headers) can update
        window.dispatchEvent(new Event('xpUpdate'));
      }, 60000); // 60 seconds
    } else {
      clearInterval(xpIntervalRef.current);
    }
    return () => clearInterval(xpIntervalRef.current);
  }, [isPlaying, loading, error]);

  // ─── Auto-hide Controls ─────────────────────────────────────────────────────
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3500);
  }, []);

  useEffect(() => { resetControlsTimer(); return () => clearTimeout(controlsTimerRef.current); }, [isPlaying]);

  // ─── Player Helpers ─────────────────────────────────────────────────────────
  const togglePlay = () => { const v = videoRef.current; if (v) v.paused ? v.play() : v.pause(); };
  const setVol = (e) => { const v = videoRef.current; if (!v) return; const val = parseFloat(e.target.value); v.volume = val; v.muted = val === 0; };
  const toggleMute = () => { const v = videoRef.current; if (v) v.muted = !v.muted; };

  const handleFullscreen = () => {
    // Use document.documentElement for maximum cross-browser compatibility
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
    if (!isFs) {
      const elem = document.documentElement;
      try {
        const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
        if (req) req.call(elem).then(() => {
          if (isMobile && screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});
        }).catch(console.warn);
      } catch(e) { console.warn(e); }
    } else {
      try {
        const ex = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (ex) ex.call(document).then(() => {
          if (screen.orientation?.unlock) try { screen.orientation.unlock(); } catch {}
        }).catch(console.warn);
      } catch(e) { console.warn(e); }
    }
  };

  const setQualityLevel = (i) => { if (hlsRef.current) { hlsRef.current.currentLevel = i; setQuality(i); } setShowQualityMenu(false); };
  const setSpeed = (s) => { const v = videoRef.current; if (v) v.playbackRate = s; setPlaybackRate(s); setShowSpeedMenu(false); };

  const skip = useCallback((secs) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + secs, duration));
    setSeekIndicator({ dir: secs > 0 ? 'forward' : 'backward', secs: Math.abs(secs) });
    clearTimeout(seekIndicator?.timer);
    const timer = setTimeout(() => setSeekIndicator(null), 800);
    setSeekIndicator(s => s ? { ...s, timer } : null);
  }, [duration]);

  // ─── Seek / Scrub ────────────────────────────────────────────────────────────
  const isDraggingRef = useRef(false);
  const progressBarRef = useRef(null);

  const getSeekTime = (clientX) => {
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect || !duration) return null;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  };

  const handleProgressMouseDown = (e) => {
    isDraggingRef.current = true;
    const t = getSeekTime(e.clientX);
    if (t !== null && videoRef.current) videoRef.current.currentTime = t;
    e.preventDefault();
  };

  const handleProgressTouchStart = (e) => {
    isDraggingRef.current = true;
    const t = getSeekTime(e.touches[0].clientX);
    if (t !== null && videoRef.current) videoRef.current.currentTime = t;
    e.stopPropagation(); // prevent double-tap handler
  };

  // Document-level drag handlers
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const t = getSeekTime(e.clientX);
      if (t !== null && videoRef.current) { videoRef.current.currentTime = t; setCurrentTime(t); }
      resetControlsTimer();
    };
    const onMouseUp = () => { isDraggingRef.current = false; };
    const onTouchMove = (e) => {
      if (!isDraggingRef.current) return;
      const t = getSeekTime(e.touches[0].clientX);
      if (t !== null && videoRef.current) { videoRef.current.currentTime = t; setCurrentTime(t); }
    };
    const onTouchEnd = () => { isDraggingRef.current = false; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [duration, resetControlsTimer]);

  const fmt = (s) => {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
  };

  // ─── Touch Double-Tap ───────────────────────────────────────────────────────
  const handleTouchEnd = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    const now = Date.now();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const timeSinceLast = now - lastTapTimeRef.current;

    if (timeSinceLast < 300 && timeSinceLast > 0) {
      e.preventDefault();
      clearTimeout(tapTimerRef.current);
      lastTapTimeRef.current = 0;
      if (x < rect.width / 2) skip(-10); else skip(10);
    } else {
      lastTapTimeRef.current = now;
      tapTimerRef.current = setTimeout(() => { resetControlsTimer(); togglePlay(); }, 300);
    }
  }, [skip, resetControlsTimer]);

  // ─── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowRight') skip(10);
      else if (e.key === 'ArrowLeft') skip(-10);
      else if (e.key === 'f') handleFullscreen();
      else if (e.key === 'm') toggleMute();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [duration, skip]);

  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full"
      style={{
        height: '100svh',
        touchAction: 'pan-y',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      onTouchEnd={handleTouchEnd}
    >
      {/* ─── Video Element ─── */}
      <video ref={videoRef} className="w-full h-full object-contain bg-black" playsInline />

      {/* ─── Loading ─── */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
          <div className="w-12 h-12 border-[3px] border-[#5A4BDA] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-sm font-semibold animate-pulse">Loading...</p>
        </div>
      )}

      {/* ─── Error ─── */}
      {(error || hlsError || shakaError) && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 text-center px-8">
          <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-white font-bold text-lg mb-2">Playback Error</p>
          <p className="text-gray-400 text-sm mb-6">{error || hlsError || shakaError}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-white/10 rounded-xl text-sm font-bold text-white active:scale-95 transition-transform">
              ← Go Back
            </button>
            <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-[#5A4BDA] rounded-xl text-sm font-bold text-white active:scale-95 transition-transform">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* ─── Seek Indicator ─── */}
      {seekIndicator && (
        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-30 ${seekIndicator.dir === 'forward' ? 'right-8' : 'left-8'}`}>
          <div className="bg-black/50 backdrop-blur-md rounded-2xl px-5 py-3 flex items-center gap-2 border border-white/10">
            {seekIndicator.dir === 'backward'
              ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
              : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
            }
            <span className="text-sm font-bold">{seekIndicator.secs}s</span>
          </div>
        </div>
      )}

      {/* ─── Controls Overlay ─── */}
      {!loading && !error && !hlsError && (
        <div
          className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 65%, rgba(0,0,0,0.9) 100%)' }}
        >
          {/* ── Top Bar ────────────────────────────────── */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 md:px-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 active:scale-90 transition-transform flex-shrink-0"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            {topicTitle && (
              <p className="flex-1 text-sm md:text-base font-bold text-white drop-shadow line-clamp-1">{topicTitle}</p>
            )}
          </div>

          {/* ── Center Area (tap to play/pause on desktop) ── */}
          <div
            className="flex-1 flex items-center justify-center"
            onClick={() => { resetControlsTimer(); if (!isMobile) togglePlay(); }}
          >
            {!isPlaying && (
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 pointer-events-none">
                <svg className="w-9 h-9 md:w-11 md:h-11 text-white ml-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            )}
          </div>

          {/* ── Bottom Controls ─────────────────────────── */}
          <div className="px-3 md:px-5 pb-4 md:pb-5 space-y-2">
            {/* Progress Bar — fully draggable */}
            <div
              ref={progressBarRef}
              className="group/prog relative flex items-center cursor-pointer select-none"
              style={{ height: '24px', touchAction: 'none' }}
              onMouseDown={handleProgressMouseDown}
              onTouchStart={handleProgressTouchStart}
            >
              <div className="absolute inset-y-0 flex items-center w-full">
                <div className="relative w-full h-1.5 group-hover/prog:h-3 transition-all duration-150 rounded-full bg-white/20">
                  <div className="absolute left-0 top-0 h-full bg-white/30 rounded-full" style={{ width: `${bufferedPct}%` }} />
                  <div className="absolute left-0 top-0 h-full bg-[#5A4BDA] rounded-full" style={{ width: `${progressPct}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover/prog:opacity-100 transition-opacity"
                    style={{ left: `calc(${progressPct}% - 8px)` }}
                  />
                </div>
              </div>
            </div>

            {/* Time row */}
            <div className="flex items-center justify-between text-xs font-mono text-gray-300/80 px-0.5">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center gap-1">

              {/* Play/Pause */}
              <button onClick={togglePlay} className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-xl active:bg-white/10 transition-colors flex-shrink-0">
                {isPlaying
                  ? <svg className="w-7 h-7 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  : <svg className="w-7 h-7 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              {/* Skip -10 */}
              <button onClick={() => skip(-10)} className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-xl active:bg-white/10 transition-colors flex-shrink-0">
                <svg className="w-7 h-7 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 3C8.36 3 4.86 5.68 3.56 9.4L5.5 9.4C6.68 6.78 9.37 5 12.5 5C16.64 5 20 8.36 20 12.5C20 16.64 16.64 20 12.5 20C8.36 20 5 16.64 5 12.5H3C3 17.75 7.25 22 12.5 22C17.75 22 22 17.75 22 12.5C22 7.25 17.75 3 12.5 3ZM7 10L3 6L7 2V10Z"/>
                  <text x="8.5" y="17" fontSize="6.5" fill="white" fontWeight="bold" fontFamily="sans-serif">10</text>
                </svg>
              </button>

              {/* Skip +10 */}
              <button onClick={() => skip(10)} className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-xl active:bg-white/10 transition-colors flex-shrink-0">
                <svg className="w-7 h-7 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.5 3C15.64 3 19.14 5.68 20.44 9.4L18.5 9.4C17.32 6.78 14.63 5 11.5 5C7.36 5 4 8.36 4 12.5C4 16.64 7.36 20 11.5 20C15.64 20 19 16.64 19 12.5H21C21 17.75 16.75 22 11.5 22C6.25 22 2 17.75 2 12.5C2 7.25 6.25 3 11.5 3ZM17 10L21 6L17 2V10Z"/>
                  <text x="7" y="17" fontSize="6.5" fill="white" fontWeight="bold" fontFamily="sans-serif">10</text>
                </svg>
              </button>

              {/* Volume - desktop only */}
              <div className="hidden md:flex items-center gap-2 ml-1">
                <button onClick={toggleMute} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
                  {(muted || volume === 0)
                    ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  }
                </button>
                <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={setVol} className="w-24 h-1 accent-[#5A4BDA] cursor-pointer" />
              </div>

              <div className="flex-1" />

              {/* Speed */}
              <div className="relative">
                <button
                  onClick={() => { setShowSpeedMenu(p => !p); setShowQualityMenu(false); }}
                  className="h-10 px-3 text-xs font-bold rounded-xl active:bg-white/10 transition-colors bg-white/5 border border-white/10"
                >
                  {playbackRate}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[90px] z-50">
                    {speeds.map(s => (
                      <button key={s} onClick={() => setSpeed(s)} className={`block w-full px-5 py-3 text-sm text-left hover:bg-white/5 active:bg-white/10 transition-colors ${playbackRate === s ? 'text-[#5A4BDA] font-bold' : 'text-gray-300'}`}>
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality */}
              {availableQualities.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowQualityMenu(p => !p); setShowSpeedMenu(false); }}
                    className="h-10 px-3 text-xs font-bold rounded-xl active:bg-white/10 transition-colors bg-white/5 border border-white/10"
                  >
                    {quality === -1 ? 'Auto' : (availableQualities.find(q => q.index === quality)?.label ?? 'Auto')}
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[90px] z-50">
                      <button onClick={() => setQualityLevel(-1)} className={`block w-full px-5 py-3 text-sm text-left hover:bg-white/5 active:bg-white/10 transition-colors ${quality === -1 ? 'text-[#5A4BDA] font-bold' : 'text-gray-300'}`}>
                        Auto
                      </button>
                      {[...availableQualities].reverse().map(q => (
                        <button key={q.index} onClick={() => setQualityLevel(q.index)} className={`block w-full px-5 py-3 text-sm text-left hover:bg-white/5 active:bg-white/10 transition-colors ${quality === q.index ? 'text-[#5A4BDA] font-bold' : 'text-gray-300'}`}>
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen / Landscape Lock */}
              <button
                onClick={handleFullscreen}
                className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-xl active:bg-white/10 transition-colors flex-shrink-0"
              >
                {isFullscreen
                  ? <svg className="w-6 h-6 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                  : (
                    isMobile
                      ? /* Rotate/landscape icon for mobile */
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 20.29 1.05 16 .05l.48 2.47zM21.48 13c-.34 3.76-2.93 7.04-6.31 8.44L16.2 24c4.69-1.84 8.01-6.32 8.28-11H21.48zm-6.15-6c0-2.51-1.51-4.78-4.01-5.42v2.06c1.41.92 2.01 2.07 2.01 3.36 0 3.59-4.84 5.05-7.59 2.75v-2.5h-1v5h5v-1H7.38c3.04 2.65 8.95.89 8.95-4.25zm-7 12.27v2.22c-4.28-1-7.99-4.8-7.99-10.5 0-2.05.56-3.73 1.55-5.18L7.89 8.3C7.01 9.48 6.49 10.91 6.49 12.49c0 4.11 2.52 7.54 5.84 8.78z"/>
                        </svg>
                      : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                  )
                }
              </button>

              {/* Mobile Volume Toggle */}
              <button onClick={toggleMute} className="md:hidden w-12 h-12 flex items-center justify-center rounded-xl active:bg-white/10 transition-colors flex-shrink-0">
                {(muted || volume === 0)
                  ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                  : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerPage;
