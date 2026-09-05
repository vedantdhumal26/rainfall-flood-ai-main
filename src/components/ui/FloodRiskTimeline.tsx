import { useEffect, useState } from 'react';
import { FLOOD_RISK_TIMELINE as FALLBACK_TIMELINE } from '@/data/mockData';
import { riskColor } from '@/utils/risk';
import { predictionsApi } from '@/api/predictions';
import type { FloodRiskPoint } from '@/types';

export function FloodRiskTimeline() {
  const [timeline, setTimeline] = useState<FloodRiskPoint[]>(FALLBACK_TIMELINE);

  useEffect(() => {
    let isMounted = true;
    const fetchTimeline = () => {
      predictionsApi.getTimeline()
        .then((res) => {
          if (isMounted && res?.timeline && res.timeline.length > 0) {
            setTimeline(res.timeline);
          }
        })
        .catch(() => {});
    };

    fetchTimeline();
    const interval = setInterval(fetchTimeline, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="panel-title">Flood Risk Evolution</h3>
        <span className="text-[11px] text-slate-500 uppercase tracking-wider">AI Forecast (Next 3h)</span>
      </div>

      <div className="flex items-stretch gap-2">
        {timeline.map((point, idx) => {
          const color = riskColor(point.level);
          return (
            <div key={idx} className="flex-1 group">
              <div
                className="rounded-md p-3 border transition-all hover:scale-[1.02] cursor-default"
                style={{
                  borderColor: `${color}40`,
                  background: `${color}12`,
                }}
              >
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{point.time}</div>
                <div className="text-lg font-bold tabular-nums" style={{ color }}>
                  {point.probability}%
                </div>
                <div className="text-[11px] font-semibold mt-0.5" style={{ color }}>
                  {point.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4 flex items-center gap-1">
        {timeline.map((point, idx) => (
          <div
            key={idx}
            className="h-1 flex-1 rounded-full transition-all"
            style={{ background: riskColor(point.level) }}
          />
        ))}
      </div>
    </div>
  );
}
