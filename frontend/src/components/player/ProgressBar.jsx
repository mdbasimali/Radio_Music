// src/components/player/ProgressBar.jsx
import { useCallback } from 'react';
import { useRadio } from '../../context/RadioContext';
import { seekAudio } from '../../hooks/useRadioPlayer';

function formatTime(secs) {
  if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ProgressBar({ className = '', compact = false, showTime = false }) {
  const { currentTime, duration, currentStation, setCurrentTime } = useRadio();

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback(
    (e) => {
      const t = parseFloat(e.target.value);
      seekAudio(t);
      setCurrentTime(t);
    },
    [setCurrentTime]
  );

  return (
    <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-3'} w-full ${className}`}>
      {(showTime || !compact) && (
        <span className={`${compact ? 'text-[8.5px]' : 'text-xs'} font-mono text-paper-dark/80 tabular-nums flex-shrink-0`} style={{ color: 'var(--theme-muted, #a09070)' }}>
          {formatTime(currentTime)}
        </span>
      )}

      <div className={`relative flex-1 flex items-center group ${compact ? 'h-2.5' : 'h-4'}`}>
        {/* Track background */}
        <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
          <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            {/* Filled portion */}
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{ width: `${pct}%`, background: currentStation?.color || 'var(--theme-accent, #d48c36)' }}
            />
          </div>
        </div>
        {/* Seek input */}
        <input
          type="range"
          id="progress-bar"
          min={0}
          max={duration || 100}
          step={0.5}
          value={currentTime}
          onChange={handleSeek}
          className="range-amber relative z-10 w-full opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer touch-action-manipulation"
          aria-label="Seek position"
        />

      </div>

      {(showTime || !compact) && (
        <span className={`${compact ? 'text-[8.5px]' : 'text-xs'} font-mono text-paper-dark/80 tabular-nums flex-shrink-0`} style={{ color: 'var(--theme-muted, #a09070)' }}>
          {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
