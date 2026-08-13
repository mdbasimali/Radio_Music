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

export default function ProgressBar({ className = '' }) {
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
    <div className={`flex items-center gap-3 w-full ${className}`}>
      <span className="text-xs font-body text-paper-dark tabular-nums w-8 text-right flex-shrink-0">
        {formatTime(currentTime)}
      </span>

      <div className="relative flex-1 flex items-center group h-4">
        {/* Track background */}
        <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
          <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            {/* Filled portion */}
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{ width: `${pct}%`, background: currentStation?.color || '#d48c36' }}
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
          className="range-amber relative z-10 w-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Seek position"
        />
      </div>

      <span className="text-xs font-body text-paper-dark tabular-nums w-8 flex-shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
}
