import { MapView } from '@/components/maps/MapView';
import { ForecastTimeline } from '@/components/ui/ForecastTimeline';
import { Waves, Timer, Gauge, Map as MapIcon, Percent, Maximize } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

function StatCard({ icon: Icon, label, value, unit, color }: { icon: typeof Waves; label: string; value: number; unit: string; color: string }) {
  const animated = useCountUp(value, 700);
  const display = Number.isInteger(value) ? Math.round(animated).toString() : animated.toFixed(2);
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="stat-label">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white tabular-nums">{display}</span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

export function FloodPrediction() {
  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Flood Prediction</h1>
        <p className="text-sm text-slate-500 mt-1">AI-driven inundation modeling and flood extent prediction</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={MapIcon} label="Flood Extent" value={12.4} unit="km²" color="text-risk-severe" />
        <StatCard icon={Maximize} label="Max Water Depth" value={1.42} unit="m" color="text-risk-high" />
        <StatCard icon={Timer} label="Arrival Time" value={42} unit="min" color="text-risk-severe" />
        <StatCard icon={Percent} label="Flood Probability" value={89} unit="%" color="text-risk-severe" />
        <StatCard icon={Waves} label="Affected Area" value={482} unit="km²" color="text-risk-high" />
      </div>

      {/* Map + Side panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          <div className="panel p-1 h-[500px]">
            <MapView height="100%" />
          </div>
          <ForecastTimeline />
        </div>

        {/* Water Depth Legend */}
        <div className="xl:col-span-4 space-y-4">
          <div className="panel p-4">
            <h3 className="panel-title mb-4">Water Depth Legend</h3>
            <div className="space-y-2">
              {[
                { label: '0.0 – 0.3 m', desc: 'Shallow — Wading possible', color: '#22c55e' },
                { label: '0.3 – 0.8 m', desc: 'Moderate — Vehicle risk', color: '#eab308' },
                { label: '0.8 – 1.5 m', desc: 'Deep — Evacuation needed', color: '#f97316' },
                { label: '1.5 m+', desc: 'Severe — Life-threatening', color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-2 rounded-md bg-white/3 border border-white/5">
                  <span className="w-4 h-4 rounded-sm mt-0.5 shrink-0" style={{ background: item.color }} />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="panel-title mb-4">Flood Zones</h3>
            <div className="space-y-2">
              {[
                { zone: 'Mula River Basin', depth: '1.42 m', severity: 'severe' },
                { zone: 'Pawana River Bank', depth: '0.85 m', severity: 'high' },
                { zone: 'Mula-Mutha Confluence', depth: '0.55 m', severity: 'moderate' },
                { zone: 'Bavdhan Lowlands', depth: '0.28 m', severity: 'low' },
              ].map((zone) => {
                const colors: Record<string, string> = { severe: 'text-risk-severe', high: 'text-risk-high', moderate: 'text-risk-moderate', low: 'text-risk-low' };
                return (
                  <div key={zone.zone} className="flex items-center justify-between p-2 rounded-md bg-white/3 border border-white/5">
                    <span className="text-xs text-slate-300">{zone.zone}</span>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-white tabular-nums">{zone.depth}</div>
                      <div className={`text-[9px] uppercase font-bold tracking-wider ${colors[zone.severity]}`}>{zone.severity}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
