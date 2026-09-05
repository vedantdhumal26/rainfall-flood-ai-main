import { TIMELINE_MARKERS } from '@/data/mockData';
import { useState } from 'react';

interface ForecastTimelineProps {
  onHourChange?: (hour: number) => void;
}

export function ForecastTimeline({ onHourChange }: ForecastTimelineProps) {
  const [selected, setSelected] = useState(0);

  const handleClick = (hour: number) => {
    setSelected(hour);
    onHourChange?.(hour);
  };

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="panel-title">Forecast Timeline</h3>
        <span className="text-[11px] text-slate-500">Click to preview</span>
      </div>

      <div className="relative">
        {/* Track */}
        <div className="absolute top-[14px] left-0 right-0 h-0.5 bg-white/8 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-accent-500 to-risk-severe rounded-full transition-all duration-500"
            style={{ width: `${(selected / 24) * 100}%` }}
          />
        </div>

        {/* Markers */}
        <div className="relative flex justify-between">
          {TIMELINE_MARKERS.map((marker) => {
            const isActive = selected === marker.hour;
            const isPast = selected > marker.hour;
            return (
              <button
                key={marker.hour}
                onClick={() => handleClick(marker.hour)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-500 border-accent-400 scale-110 shadow-glow-cyan'
                      : isPast
                        ? 'bg-accent-500/20 border-accent-500/40'
                        : 'bg-base-800 border-white/15 group-hover:border-white/30'
                  }`}
                >
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse-slow" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-wider transition-colors ${
                    isActive ? 'text-accent-300' : isPast ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {marker.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
