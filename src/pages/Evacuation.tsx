import { useEffect, useState } from 'react';
import { MapView } from '@/components/maps/MapView';
import { EVACUATION_ROUTES } from '@/data/mockData';
import {
  Navigation,
  MapPin,
  Clock,
  Route,
  Shield,
  ChevronRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Target,
  Milestone,
  Compass,
} from 'lucide-react';
import { riskBgClass, riskLabel } from '@/utils/risk';
import { responseApi, type EvacuationPlanResponse } from '@/api/response';

export function Evacuation() {
  const [activeRoute, setActiveRoute] = useState('r1');
  const [backendPlan, setBackendPlan] = useState<EvacuationPlanResponse | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);

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

  // Active path and destination for map visualization
  const activePath: [number, number][] = route.path;
  const destinationPos: [number, number] = route.destinationPos || route.path[route.path.length - 1];
  const destinationLabel =
    route.destinationName ||
    (activeRoute === 'r3'
      ? 'Kothrud Emergency Relief Center (Shelter B)'
      : 'Shivaji Nagar Community Hall (Shelter A)');

  const handleStartNavigation = (routeId: string) => {
    setActiveRoute(routeId);
    setNavigating(true);
    setFocusTarget(null);
  };

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
              <span className="font-bold text-risk-low uppercase">Live Navigation Active: {route.name}</span>
              <p className="text-slate-300 mt-0.5">
                Following marked corridor checkpoints towards designated safe haven: <strong className="text-white">{destinationLabel}</strong>.
              </p>
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
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Marked Safe Path</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-risk-low/15 border border-risk-low/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-risk-low" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              {destinationLabel.slice(0, 32)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map & Turn Checklist */}
        <div className="lg:col-span-8 space-y-4">
          <div className="panel p-1 h-[520px]">
            <MapView
              height="100%"
              activeRouteId={activeRoute}
              routeBounds={activePath}
              focusTarget={focusTarget}
              focusZoom={15}
              navigating={navigating}
              origin={{
                position: [18.5204, 73.8567],
                label: 'Your Position (Pune Center)',
              }}
              destination={{
                position: destinationPos,
                label: destinationLabel,
              }}
              onSelectRoute={(id) => handleStartNavigation(id)}
            />
          </div>

          {/* Marked Waypoint Checklist & Step-by-Step Directions */}
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Marked Route Checkpoints & Directions — {route.name}
                </h3>
              </div>
              {focusTarget && (
                <button
                  onClick={() => setFocusTarget(null)}
                  className="btn btn-ghost py-1 px-2.5 text-xs text-accent-300 hover:text-white flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5" />
                  Reset to Full Corridor View
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {route.waypoints && route.waypoints.length > 0 ? (
                route.waypoints.map((wp, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === route.waypoints!.length - 1;
                  const isTargeted =
                    focusTarget &&
                    focusTarget[0] === wp.position[0] &&
                    focusTarget[1] === wp.position[1];

                  return (
                    <div
                      key={wp.id}
                      onClick={() => setFocusTarget(wp.position)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isTargeted
                          ? 'bg-accent-500/15 border-accent-500/50 shadow-md'
                          : 'bg-base-900/60 border-white/5 hover:border-white/15 hover:bg-base-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                            isFirst
                              ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                              : isLast
                              ? 'bg-risk-low/20 text-risk-low border border-risk-low/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {isFirst ? 'A' : isLast ? <CheckCircle2 className="w-4 h-4" /> : idx}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{wp.label}</span>
                            <span className="text-[10px] text-slate-500">{wp.distanceFromStart}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{wp.instruction}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-risk-low/10 text-risk-low border border-risk-low/20">
                              <Shield className="w-2.5 h-2.5" />
                              {wp.safetyStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFocusTarget(wp.position);
                        }}
                        className={`shrink-0 p-1.5 rounded text-xs transition-colors ${
                          isTargeted
                            ? 'text-accent-300 bg-accent-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                        title="Focus map on this checkpoint"
                      >
                        <Target className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 italic">No intermediate waypoints specified for this route.</div>
              )}
            </div>
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
                onClick={() => {
                  setActiveRoute(r.id);
                  setFocusTarget(null);
                }}
                className={`panel p-4 cursor-pointer transition-all ${
                  isActive ? 'border-accent-500/40 bg-accent-500/5 shadow-lg' : 'hover:border-white/10'
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

                <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                  <Milestone className="w-3.5 h-3.5 text-accent-400 shrink-0" />
                  <span className="truncate">Destination: <strong className="text-slate-200">{r.destinationName || 'Safe Shelter'}</strong></span>
                </div>

                {isActive && navigating ? (
                  <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-risk-low/20 border border-risk-low/40 text-risk-low font-semibold text-xs animate-pulse">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigating Corridor (Active)</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartNavigation(r.id);
                    }}
                    className={`btn w-full ${r.routeType === 'recommended' ? 'btn-primary' : 'btn-ghost border border-white/10 hover:border-accent-400'}`}
                  >
                    <Navigation className="w-4 h-4" />
                    Navigate This Route
                  </button>
                )}
              </div>
            );
          })}

          {/* Route Safety Assessment */}
          <div className="panel p-4">
            <h3 className="panel-title mb-3">Route Safety Assessment</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Flood risk along corridor</span>
                <span className={`badge ${riskBgClass(route.risk)}`}>{riskLabel(route.risk)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Marked waypoints & checkpoints</span>
                <span className="text-xs font-semibold text-accent-300">
                  {route.waypoints?.length || 0} designated stops
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Assigned safe haven</span>
                <span className="text-xs font-semibold text-risk-low truncate max-w-[180px]">
                  {destinationLabel}
                </span>
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-md bg-risk-moderate/10 border border-risk-moderate/20 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-risk-moderate shrink-0 mt-0.5" />
              <span className="text-[10px] text-slate-400">
                Calculated by flood routing algorithm avoiding low-lying river depressions and submerged culverts.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

