import { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MapView } from '@/components/maps/MapView';
import { RAINFALL_NOWCAST, RAINFALL_SHORT_TERM, CUMULATIVE_RAINFALL, RAINFALL_PROBABILITY } from '@/data/mockData';
import { CloudRain, TrendingUp, Gauge, Map } from 'lucide-react';

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

  const shortTermSliced = RAINFALL_SHORT_TERM.filter((_, i) => i % 6 === 0).slice(0, 13);

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Rainfall Forecast</h1>
        <p className="text-sm text-slate-500 mt-1">AI-powered rainfall prediction with confidence intervals</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Current Rainfall', value: '35', unit: 'mm/h', icon: CloudRain, color: 'text-accent-400' },
          { label: 'Peak Predicted', value: '68', unit: 'mm/h', icon: TrendingUp, color: 'text-risk-high' },
          { label: '6h Accumulation', value: '210', unit: 'mm', icon: Gauge, color: 'text-risk-severe' },
          { label: 'Coverage Area', value: '482', unit: 'km²', icon: Map, color: 'text-accent-400' },
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
            <h3 className="panel-title mb-4">0–6 Hour Nowcast — Rainfall Intensity</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={RAINFALL_NOWCAST} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
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
                <Area type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={2.5} fill="url(#nowcastGrad)" name="Predicted" />
                <Line type="monotone" dataKey="observed" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} name="Observed" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="panel p-4">
            <h3 className="panel-title mb-4">Cumulative Rainfall</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={CUMULATIVE_RAINFALL} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
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
                <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} fill="url(#cumulGrad)" name="Cumulative" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'SHORT-TERM' && (
        <div className="space-y-4">
          <div className="panel p-4">
            <h3 className="panel-title mb-4">6–72 Hour Forecast — Rainfall Intensity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={shortTermSliced} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4' }} name="Predicted" />
                <Line type="monotone" dataKey="confidenceUpper" stroke="#0891b2" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Confidence Upper" />
                <Line type="monotone" dataKey="confidenceLower" stroke="#0891b2" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Confidence Lower" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="panel p-4">
            <h3 className="panel-title mb-4">Rainfall Probability</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={RAINFALL_PROBABILITY} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
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
