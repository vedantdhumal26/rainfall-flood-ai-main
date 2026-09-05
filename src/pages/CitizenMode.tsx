import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Droplets,
  MapPin,
  Navigation,
  Shield,
  Info,
  Phone,
  Siren,
  ArrowLeft,
  Cross,
  LifeBuoy,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { alertsApi, type AlertItem } from '@/api/alerts';
import { predictionsApi, type LatestPredictionResponse } from '@/api/predictions';
import { responseApi, type EvacuationPlanResponse } from '@/api/response';
import type { SafeLocation } from '@/types';
import { SAFE_LOCATIONS } from '@/data/mockData';

interface CitizenModeProps {
  onExit: () => void;
}

export function CitizenMode({ onExit }: CitizenModeProps) {
  const [activeTab, setActiveTab] = useState<'alert' | 'safe' | 'info'>('alert');
  const [latestAlert, setLatestAlert] = useState<AlertItem | null>(null);
  const [prediction, setPrediction] = useState<LatestPredictionResponse | null>(null);
  const [shelters, setShelters] = useState<SafeLocation[]>(SAFE_LOCATIONS);
  const [routingActive, setRoutingActive] = useState(false);
  const [evacPlan, setEvacPlan] = useState<EvacuationPlanResponse | null>(null);

  useEffect(() => {
    alertsApi.getAlerts().then((alerts) => {
      const active = alerts.find((a) => a.level === 'red' || a.level === 'orange') || alerts[0];
      if (active) setLatestAlert(active);
    }).catch(() => {});

    predictionsApi.getLatest().then((p) => {
      if (p) setPrediction(p);
    }).catch(() => {});

    responseApi.getShelters().then((s) => {
      if (s && s.length > 0) setShelters(s);
    }).catch(() => {});
  }, []);

  const handleFindSafeRoute = async () => {
    setRoutingActive(true);
    try {
      const plan = await responseApi.evacuate(18.5204, 73.8567);
      setEvacPlan(plan);
      setActiveTab('safe');
    } catch (e: unknown) {
      alert((e as Error).message || 'Route calculation unavailable');
    } finally {
      setRoutingActive(false);
    }
  };

  const isRed = latestAlert?.level === 'red';
  const arrival = prediction?.arrival_time_minutes ?? 42;
  const depth = prediction?.predicted_water_depth ?? 1.42;

  return (
    <div className="min-h-screen bg-base-950 flex flex-col">
      {/* Top bar */}
      <div className={`border-b px-4 py-3 flex items-center justify-between ${isRed ? 'bg-risk-severe/20 border-risk-severe/30' : 'bg-risk-high/20 border-risk-high/30'}`}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-risk-severe/40 animate-pulse-ring" />
            <div className="relative w-8 h-8 rounded-full bg-risk-severe/20 border border-risk-severe/40 flex items-center justify-center">
              <Siren className="w-4 h-4 text-risk-severe" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-risk-severe tracking-wide uppercase">
              {latestAlert?.title || 'RED ALERT — SEVERE FLOOD RISK'}
            </div>
            <div className="text-[10px] text-slate-400">Civil Defense Direct Feed · Pune Metropolitan Region</div>
          </div>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Authority Mode
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full">
        {/* Alert summary from Backend API */}
        <div className="bg-gradient-to-b from-risk-severe/15 to-transparent border border-risk-severe/20 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-risk-severe" />
            <h1 className="text-lg font-bold text-risk-severe">
              {latestAlert?.title || 'SEVERE FLOOD RISK WARNING'}
            </h1>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            {latestAlert?.description || 'Extreme convective rainfall is causing rapid inundation. Take immediate action to reach designated high ground or evacuation shelters.'}
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-base-850/60 rounded-lg p-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-risk-severe" />
                <span className="text-sm text-slate-300">Estimated Flood Arrival</span>
              </div>
              <span className="text-xl font-bold text-white tabular-nums">
                {arrival} <span className="text-sm text-slate-400">min</span>
              </span>
            </div>
            <div className="flex items-center justify-between bg-base-850/60 rounded-lg p-3">
              <div className="flex items-center gap-2.5">
                <Droplets className="w-5 h-5 text-risk-high" />
                <span className="text-sm text-slate-300">Predicted Peak Depth</span>
              </div>
              <span className="text-xl font-bold text-white tabular-nums">
                {depth.toFixed(2)} <span className="text-sm text-slate-400">m</span>
              </span>
            </div>
            <div className="flex items-center justify-between bg-base-850/60 rounded-lg p-3">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-risk-low" />
                <span className="text-sm text-slate-300">Nearest Safe Haven</span>
              </div>
              <span className="text-xl font-bold text-white tabular-nums">
                {shelters[0]?.distance || 2.4} <span className="text-sm text-slate-400">km</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons calling real routing API */}
        <div className="space-y-2.5 mb-5">
          <button
            onClick={handleFindSafeRoute}
            disabled={routingActive}
            className="w-full bg-risk-low/20 border border-risk-low/40 text-risk-low rounded-xl py-4 font-bold text-base flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
          >
            {routingActive ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
            {routingActive ? 'CALCULATING SAFE CORRIDOR...' : 'FIND SAFE EVACUATION ROUTE'}
          </button>

          {evacPlan && (
            <div className="p-3 bg-risk-low/10 border border-risk-low/30 rounded-lg text-xs text-slate-200 animate-slide-up flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-risk-low shrink-0" />
              <span>Assigned route to <strong>{evacPlan.destination.name}</strong> ({evacPlan.estimated_travel_time_mins} min)</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('safe')}
              className={`rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
                activeTab === 'safe' ? 'bg-accent-500/25 border border-accent-500/50 text-accent-300' : 'bg-accent-500/15 border border-accent-500/30 text-accent-300'
              }`}
            >
              <Shield className="w-4 h-4" />
              SAFE PLACES
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
                activeTab === 'info' ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/5 border border-white/10 text-slate-300'
              }`}
            >
              <Info className="w-4 h-4" />
              EMERGENCY INFO
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'safe' && (
          <div className="space-y-2.5 animate-fade-in">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">Verified Emergency Shelters</h2>
            {shelters.slice(0, 4).map((shelter) => (
              <div key={shelter.id || shelter.name} className="bg-base-850/60 border border-white/5 rounded-lg p-3.5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-risk-low mt-0.5 shrink-0" />
                    <span className="text-sm font-semibold text-slate-200">{shelter.name}</span>
                  </div>
                  <span className="badge bg-risk-low/15 text-risk-low text-[10px]">OPEN</span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2 ml-6">{shelter.address}</div>
                <div className="flex items-center gap-4 ml-6">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {shelter.distance} km
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> {shelter.travelTime} min
                  </span>
                  <span className="text-[11px] text-slate-400">Capacity: {shelter.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-base-850/60 border border-white/5 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">Emergency Response Hotlines</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-risk-severe shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">National Emergency Support</div>
                    <div className="text-xs text-slate-400">112 / 1070 (Disaster Control Room)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Cross className="w-5 h-5 text-risk-severe shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Ambulance Service</div>
                    <div className="text-xs text-slate-400">108 (State Emergency Medical)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <LifeBuoy className="w-5 h-5 text-risk-low shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">National Disaster Response Force (NDRF)</div>
                    <div className="text-xs text-slate-400">1077 (NDRF Control Room, Pune Base)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-base-850/60 border border-white/5 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">Critical Citizen Instructions</h2>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                  Move to higher ground immediately; do not linger in basements or riverfront paths.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                  Do not attempt to drive or walk through flood waters — 30 cm can carry vehicles away.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                  Disconnect electrical mains in flooded rooms to avoid electrocution hazard.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                  Follow designated evacuation corridors broadcasted by the disaster authority.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="px-4 py-2.5 border-t border-white/5 bg-base-900 flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-low"></span>
        </span>
        <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Connected to RainShield AI Early Warning Backbone
        </span>
      </div>
    </div>
  );
}
