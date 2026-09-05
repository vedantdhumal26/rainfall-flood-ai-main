import { useEffect, useState } from 'react';
import { MapView } from '@/components/maps/MapView';
import { ForecastTimeline } from '@/components/ui/ForecastTimeline';
import { Waves, Timer, Map as MapIcon, Percent, Maximize, AlertCircle, ShieldAlert } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { predictionsApi, type LatestPredictionResponse } from '@/api/predictions';

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
  const [prediction, setPrediction] = useState<LatestPredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPrediction = () => {
      predictionsApi.getLatest()
        .then((data) => {
          if (isMounted) setPrediction(data);
        })
        .catch((err) => console.warn('[FloodPrediction] Backend prediction fetch fallback:', err))
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const extent = prediction?.flood_extent_km2 ?? 12.4;
  const maxDepth = prediction?.predicted_water_depth ?? 1.42;
  const arrival = prediction?.arrival_time_minutes ?? 42;
  const prob = prediction?.flood_probability ?? 89;
  const affected = prediction?.affected_area_km2 ?? 482;
  const riskLevel = prediction?.risk_level ?? 'severe';
  const confidence = prediction?.confidence ?? 91;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Top Banner with Model Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-base-900 border border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-accent-300 font-semibold">
            <ShieldAlert className="w-4 h-4 text-accent-400" />
            <span>MODEL: {prediction?.model_version || 'RainShield-FloodNet-v1.0'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Horizon: {prediction?.forecast_horizon || '0–6 hours'}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Confidence: <strong className="text-slate-200">{confidence}%</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase text-[10px]">Risk Categorization:</span>
          <span className={`badge uppercase font-bold ${riskLevel === 'severe' ? 'bg-risk-severe/20 text-risk-severe' : riskLevel === 'high' ? 'bg-risk-high/20 text-risk-high' : 'bg-risk-low/20 text-risk-low'}`}>
            {riskLevel}
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Flood Inundation Prediction</h1>
        <p className="text-sm text-slate-500 mt-1">Physics-guided neural hydrological modeling predicting flood arrival and depth</p>
      </div>

      {/* Dynamic Stats Cards from Backend */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={MapIcon} label="Predicted Inundation" value={extent} unit="km²" color="text-risk-severe" />
        <StatCard icon={Maximize} label="Max Water Depth" value={maxDepth} unit="m" color="text-risk-high" />
        <StatCard icon={Timer} label="Arrival Lead Time" value={arrival} unit="min" color="text-risk-severe" />
        <StatCard icon={Percent} label="Flood Probability" value={prob} unit="%" color="text-risk-severe" />
        <StatCard icon={Waves} label="Total Affected Catchment" value={affected} unit="km²" color="text-risk-high" />
      </div>

      {/* Map + Side panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          <div className="panel p-1 h-[500px]">
            <MapView height="100%" />
          </div>
          <ForecastTimeline />
        </div>

        {/* Dynamic Water Depth Legend & Zones */}
        <div className="xl:col-span-4 space-y-4">
          <div className="panel p-4">
            <h3 className="panel-title mb-4">Water Depth Categorization</h3>
            <div className="space-y-2">
              {[
                { label: '0.0 – 0.3 m', desc: 'Shallow — Pedestrian wading possible', color: '#22c55e' },
                { label: '0.3 – 0.8 m', desc: 'Moderate — Small vehicles stalled', color: '#eab308' },
                { label: '0.8 – 1.5 m', desc: 'Deep — Evacuation boats deployed', color: '#f97316' },
                { label: '1.5 m+', desc: 'Severe — High danger to life', color: '#ef4444' },
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
            <h3 className="panel-title mb-4">Predicted High-Risk Zones</h3>
            <div className="space-y-2">
              {(prediction?.flood_zones || [
                { zone: 'Mula River Basin', depth: '1.42 m', severity: 'severe' },
                { zone: 'Pawana River Bank', depth: '0.85 m', severity: 'high' },
                { zone: 'Mula-Mutha Confluence', depth: '0.55 m', severity: 'moderate' },
                { zone: 'Bavdhan Lowlands', depth: '0.28 m', severity: 'low' },
              ]).map((zone) => {
                const colors: Record<string, string> = {
                  severe: 'text-risk-severe',
                  high: 'text-risk-high',
                  moderate: 'text-risk-moderate',
                  low: 'text-risk-low',
                };
                return (
                  <div key={zone.zone} className="flex items-center justify-between p-2 rounded-md bg-white/3 border border-white/5">
                    <span className="text-xs text-slate-300">{zone.zone}</span>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-white tabular-nums">{zone.depth}</div>
                      <div className={`text-[9px] uppercase font-bold tracking-wider ${colors[zone.severity] || 'text-slate-400'}`}>
                        {zone.severity}
                      </div>
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
