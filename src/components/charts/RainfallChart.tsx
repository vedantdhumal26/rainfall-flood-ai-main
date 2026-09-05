import { useEffect, useState } from 'react';
import {
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { RAINFALL_NOWCAST as FALLBACK_NOWCAST } from '@/data/mockData';
import { rainfallApi } from '@/api/rainfall';
import type { ForecastPoint } from '@/types';

interface TooltipPayload {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-base-800 border border-white/10 rounded-md px-3 py-2 shadow-xl">
      <div className="text-[11px] text-slate-400 mb-1.5 font-medium">{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-slate-200 font-semibold tabular-nums">{entry.value} mm</span>
        </div>
      ))}
    </div>
  );
}

export function RainfallChart() {
  const [data, setData] = useState<ForecastPoint[]>(FALLBACK_NOWCAST);

  useEffect(() => {
    let isMounted = true;
    rainfallApi.getForecast()
      .then((res) => {
        if (isMounted && res?.nowcast && res.nowcast.length > 0) {
          setData(res.nowcast);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="panel-title">Rainfall Intensity Forecast (Nowcast 0–6h)</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-1 rounded-full bg-slate-500"></span>
            Observed
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-1 rounded-full bg-accent-400"></span>
            AI Prediction
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent-500/20 border border-accent-500/40"></span>
            Confidence Range
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="confGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="confidenceUpper"
            stroke="none"
            fill="url(#confGradient)"
            name="Confidence Upper"
            dot={false}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="confidenceLower"
            stroke="none"
            fill="#0a1020"
            name="Confidence Lower"
            dot={false}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="observed"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={{ r: 3, fill: '#94a3b8' }}
            name="Observed"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#06b6d4"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#06b6d4' }}
            name="AI Prediction"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
