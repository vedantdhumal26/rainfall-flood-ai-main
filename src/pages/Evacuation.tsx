import { useEffect, useState } from 'react';
import { MapView } from '@/components/maps/MapView';
import { EVACUATION_ROUTES } from '@/data/mockData';
import { Navigation, MapPin, Clock, Route, Shield, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { riskBgClass, riskLabel } from '@/utils/risk';
import { responseApi, type EvacuationPlanResponse } from '@/api/response';

export function Evacuation() {
  const [activeRoute, setActiveRoute] = useState('r1');
  const [backendPlan, setBackendPlan] = useState<EvacuationPlanResponse | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    responseApi.evacuate(18.5204, 73.8567)
      .then((data) => {
        if (isMounted) setBackendPlan(data);
      })
      .catch((err) => console.warn('[Evacuation] Fallback evacuation route plan:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const route = EVACUATION_ROUTES.find((r) => r.id === activeRoute) || EVACUATION_ROUTES[0];

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Emergency Evacuation Routing</h1>
        <p className="text-sm text-slate-500 mt-1">Autonomous flood-aware evacuation routing avoiding high water depths and blocked arterials</p>
      </div>

      {navigating && (
        <div className="p-4 rounded-lg bg-risk-low/15 border border-risk-low/40 flex items-center justify-between text-xs text-slate-200 animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-60"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-risk-low"></span>
            </span>
            <div>
              <span className="font-bold text-risk-low uppercase">Live Turn-by-Turn Navigation Active</span>
              <p className="text-slate-300 mt-0.5">Proceeding east along Shivaji Road towards designated shelter: {backendPlan?.destination?.name || 'Shivaji Nagar Community Hall'}.</p>
            </div>
          </div>
          <button
            onClick={() => setNavigating(false)}
            className="btn btn-ghost py-1 px-2.5 text-xs text-slate-400 hover:text-white"
          >
            End Navigation
          </button>
        </div>
      )}

      {/* Flow Diagram */}
      <div className="panel p-4">
        <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent-400" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Your Position (Pune Center)</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-risk-low/15 border border-risk-low/30 flex items-center justify-center">
              <Route className="w-5 h-5 text-risk-low" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Dynamic Safe Path</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-risk-low/15 border border-risk-low/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-risk-low" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              {backendPlan?.destination?.name ? backendPlan.destination.name.slice(0, 22) + '...' : 'Assigned Shelter'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map */}
        <div className="lg:col-span-8">
          <div className="panel p-1 h-[500px]">
            <MapView height="100%" />
          </div>
        </div>

        {/* Routes Panel */}
        <div className="lg:col-span-4 space-y-3">
          {EVACUATION_ROUTES.map((r) => {
            const isActive = activeRoute === r.id;
            const dist = backendPlan && r.routeType === 'recommended' ? backendPlan.destination.distance_km : r.distance;
            const dur = backendPlan && r.routeType === 'recommended' ? backendPlan.estimated_travel_time_mins : r.duration;

            return (
              <div
                key={r.id}
                onClick={() => setActiveRoute(r.id)}
                className={`panel p-4 cursor-pointer transition-all ${
                  isActive ? 'border-accent-500/30 bg-accent-500/5' : 'hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className={`w-4 h-4 ${r.routeType === 'recommended' ? 'text-risk-low' : 'text-accent-400'}`} />
                    <span className="text-sm font-semibold text-slate-200">{r.name}</span>
                  </div>
                  <span className={`badge ${riskBgClass(r.risk)}`}>
                    {riskLabel(r.risk)} RISK
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Distance</div>
                    <div className="text-xl font-bold text-white tabular-nums">
                      {dist} <span className="text-xs text-slate-400">km</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Duration</div>
                    <div className="text-xl font-bold text-white tabular-nums">
                      {dur} <span className="text-xs text-slate-400">min</span>
                    </div>
                  </div>
                </div>

                {r.routeType === 'recommended' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNavigating(true);
                    }}
                    className="btn btn-primary w-full"
                  >
                    <Navigation className="w-4 h-4" />
                    Start Navigation
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRoute(r.id);
                    }}
                    className="btn btn-ghost w-full"
                  >
                    <Route className="w-4 h-4" />
                    Use Alternate Route
                  </button>
                )}
              </div>
            );
          })}

          {/* Route Info */}
          <div className="panel p-4">
            <h3 className="panel-title mb-3">Route Safety Assessment</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Flood risk along corridor</span>
                <span className={`badge ${riskBgClass(route.risk)}`}>{riskLabel(route.risk)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Submerged points bypassed</span>
                <span className="text-xs font-semibold text-slate-200">3 intersections</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Target safe haven</span>
                <span className="text-xs font-semibold text-accent-300">
                  {backendPlan?.destination?.name || 'Shelter A — Shivaji Nagar'}
                </span>
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-md bg-risk-moderate/10 border border-risk-moderate/20 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-risk-moderate shrink-0 mt-0.5" />
              <span className="text-[10px] text-slate-400">
                Calculated by backend routing algorithm avoiding low-lying Mula river depression.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
