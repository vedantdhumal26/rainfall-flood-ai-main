import { CONFIDENCE_FACTORS } from '@/data/mockData';
import { useEffect, useState } from 'react';
import { useCountUp } from '@/hooks/useCountUp';

export function ModelConfidence() {
  const [animatedBars, setAnimatedBars] = useState(false);
  const confidenceValue = useCountUp(91, 800);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedBars(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="panel p-4">
      <h3 className="panel-title mb-4">AI Prediction Confidence</h3>

      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(confidenceValue / 100) * 264} 264`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white tabular-nums">{Math.round(confidenceValue)}%</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-accent-300">HIGH CONFIDENCE</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Based on 6 data sources</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {CONFIDENCE_FACTORS.map((factor) => (
          <div key={factor.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">{factor.label}</span>
              <span className="text-[11px] font-semibold text-slate-300 tabular-nums">{factor.percentage}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: animatedBars ? `${factor.percentage}%` : '0%',
                  background: factor.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
