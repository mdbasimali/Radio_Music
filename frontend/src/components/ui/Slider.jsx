// src/components/ui/Slider.jsx
// Reusable styled range slider with fill track
import { useCallback } from 'react';

export default function Slider({
  value = 0,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  color = '#e8a045',
  className = '',
  ariaLabel = 'slider',
}) {
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e) => onChange?.(parseFloat(e.target.value)),
    [onChange]
  );

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Filled track background */}
      <div className="absolute inset-y-0 left-0 flex items-center w-full pointer-events-none">
        <div className="w-full h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-label={ariaLabel}
        className="range-amber relative z-10 w-full"
        style={{ '--thumb-color': color }}
      />
    </div>
  );
}
