import { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MapView } from '@/components/maps/MapView';
import { rainfallApi, type RainfallForecastResponse } from '@/api/rainfall';
import { RAINFALL_NOWCAST, RAINFALL_SHORT_TERM, CUMULATIVE_RAINFALL, RAINFALL_PROBABILITY } from '@/data/mockData';
import { CloudRain, TrendingUp, Gauge, Map, Loader2 } from 'lucide-react';

const TABS = ['NOWCAST', 'SHORT-TERM', 'SPATIAL'] as const;
type Tab = typeof TABS[number];

function ChartTooltip({ active, payload, label, unit = 'mm' }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string; unit?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-base-800 border border-white/10 rounded-md px-3 py-2 shadow-xl">
      <div className="text-[11px] text-slate-400 mb-1.5 font-medium">{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-slate-200 font-semibold tabular-nums">{entry.value} {unit}</span>
        </div>
      ))}
    </div>
  );
}

export function RainfallForecast() {
  const [tab, setTab] = useState<Tab>('NOWCAST');
  const [forecast, setForecast] = useState<RainfallForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    rainfallApi.getForecast()
      .then((data) => {
        if (isMounted) setForecast(data);
      })
      .catch((err) => console.warn('[RainfallForecast] Using local fallback curve:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const nowcastData = forecast?.nowcast || RAINFALL_NOWCAST;
  const shortTermData = (forecast?.shortTerm || RAINFALL_SHORT_TERM).filter((_, i) => i % 6 === 0).slice(0, 13);
  const cumulativeData = forecast?.cumulative || CUMULATIVE_RAINFALL;
  const probabilityData = forecast?.probability || RAINFALL_PROBABILITY;

  const currentRain = forecast?.current_rainfall ?? 35;
  const peakRain = forecast?.peak_predicted ?? 68;
  const accum6h = forecast?.accumulation_6h ?? 210;
  const coverageArea = forecast?.coverage_area_sqkm ?? 482;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Precipitation Nowcasting & Forecasting</h1>
        <p className="text-sm text-slate-500 mt-1">Numerical Weather Prediction fused with IMD Doppler Radar and satellite telemetry</p>
      </div>

      {/* Dynamic Stats Row from Backend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Current Rainfall Rate', value: String(currentRain), unit: 'mm/h', icon: CloudRain, color: 'text-accent-400' },
          { label: 'Peak Predicted Rate', value: String(peakRain), unit: 'mm/h', icon: TrendingUp, color: 'text-risk-high' },
          { label: '6h Cumulative Total', value: String(accum6h), unit: 'mm', icon: Gauge, color: 'text-risk-severe' },
          { label: 'Radar Coverage Area', value: String(coverageArea), unit: 'km²', icon: Map, color: 'text-accent-400' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="stat-label">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white tabular-nums">{stat.value}</span>
                <span className="text-sm text-slate-400">{stat.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold tracking-wide transition-colors relative ${
              tab === t ? 'text-accent-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-400" />}
          </button>
        ))}
      </div>

      {tab === 'NOWCAST' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-4">
            <h3 className="panel-title mb-4">0–6 Hour Nowcast — Rainfall Intensity (Backend Generated)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={nowcastData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="nowcastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={2.5} fill="url(#nowcastGrad)" name="AI Predicted" />
                <Line type="monotone" dataKey="observed" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} name="Radar Observed" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="panel p-4">
            <h3 className="panel-title mb-4">Cumulative Precipitation Curve (mm)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumulGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} fill="url(#cumulGrad)" name="Cumulative Total" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'SHORT-TERM' && (
        <div className="space-y-4">
          <div className="panel p-4">
            <h3 className="panel-title mb-4">6–72 Hour NWP Model Forecast with Confidence Bands</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={shortTermData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4' }} name="Predicted" />
                <Line type="monotone" dataKey="confidenceUpper" stroke="#0891b2" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Upper Bound (90%)" />
                <Line type="monotone" dataKey="confidenceLower" stroke="#0891b2" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Lower Bound (10%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="panel p-4">
            <h3 className="panel-title mb-4">Hourly Rainfall Probability</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={probabilityData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip unit="%" />} />
                <Bar dataKey="value" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Probability" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'SPATIAL' && (
        <div className="panel p-1 h-[600px]">
          <MapView height="100%" />
        </div>
      )}
    </div>
  );
}
