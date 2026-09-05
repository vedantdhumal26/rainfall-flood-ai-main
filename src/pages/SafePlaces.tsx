import { MapView } from '@/components/maps/MapView';
import { MapPin, Users, Navigation, Clock, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { riskBgClass, riskLabel } from '@/utils/risk';
import { useState, useEffect } from 'react';
import { responseApi, type EvacuationPlanResponse } from '@/api/response';
import type { SafeLocation } from '@/types';
import { SAFE_LOCATIONS } from '@/data/mockData';

export function SafePlaces() {
  const [shelters, setShelters] = useState<SafeLocation[]>(SAFE_LOCATIONS);
  const [selected, setSelected] = useState<string | null>(null);
  const [routingShelterId, setRoutingShelterId] = useState<string | null>(null);
  const [evacPlan, setEvacPlan] = useState<EvacuationPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    responseApi.getShelters()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setShelters(data);
          setSelected(data[0].id);
        }
      })
      .catch((err) => console.warn('[SafePlaces] Using local shelter cache:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedLoc = shelters.find((s) => s.id === selected) || shelters[0];

  const handleGetRoute = async (loc: SafeLocation) => {
    setSelected(loc.id);
    setRoutingShelterId(loc.id);
    try {
      // Default Pune user location coordinates [18.5204, 73.8567]
      const plan = await responseApi.evacuate(18.5204, 73.8567);
      setEvacPlan(plan);
    } catch (e: unknown) {
      alert((e as Error).message || 'Failed to calculate evacuation plan');
    } finally {
      setRoutingShelterId(null);
    }
  };

  const shelterPos: [number, number] | null = selectedLoc
    ? selectedLoc.position ?? (selectedLoc.lat != null && selectedLoc.lon != null ? [selectedLoc.lat, selectedLoc.lon] : null)
    : null;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Designated Emergency Shelters</h1>
        <p className="text-sm text-slate-500 mt-1">Verified safe locations with live capacity and automated routing from the disaster control center</p>
      </div>

      {evacPlan && (
        <div className="p-3.5 rounded-lg bg-risk-low/10 border border-risk-low/30 text-xs text-slate-200 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-risk-low shrink-0" />
            <div>
              <span className="font-semibold text-risk-low">Route Calculated to {evacPlan.destination.name}:</span>
              <span className="text-slate-300 ml-1.5">
                Distance: {evacPlan.destination.distance_km} km | Est. Travel Time: {evacPlan.estimated_travel_time_mins} minutes
              </span>
            </div>
          </div>
          <span className="badge bg-risk-low/20 text-risk-low border border-risk-low/40 uppercase font-bold">OPTIMAL</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map */}
        <div className="lg:col-span-7">
          <div className="panel p-1 h-[600px]">
            <MapView
              height="100%"
              focusTarget={shelterPos}
              customRouteCoordinates={evacPlan?.route_coordinates}
              routeBounds={evacPlan?.route_coordinates}
              origin={evacPlan ? { position: [18.5204, 73.8567], label: 'Your Position (Pune Center)' } : undefined}
              destination={shelterPos ? {
                position: shelterPos,
                label: selectedLoc.name,
              } : undefined}
            />
          </div>
        </div>

        {/* Safe Locations List from Backend */}
        <div className="lg:col-span-5">
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="panel-title">Active Shelters ({shelters.length})</h3>
              <span className="text-[11px] text-slate-500">Live occupancy</span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {shelters.map((loc) => {
                const occupancyPct = loc.capacity > 0 ? (loc.occupancy / loc.capacity) * 100 : 0;
                const isSelected = selected === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelected(loc.id)}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-accent-500/10 border-accent-500/30'
                        : 'bg-white/3 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-risk-low mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-slate-200">{loc.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{loc.address}</div>
                        </div>
                      </div>
                      <span className={`badge ${riskBgClass(loc.risk || 'low')}`}>
                        {riskLabel(loc.risk || 'low')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-slate-500" />
                        <div>
                          <div className="text-xs font-semibold text-slate-200 tabular-nums">{loc.distance} km</div>
                          <div className="text-[9px] text-slate-500">Distance</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <div>
                          <div className="text-xs font-semibold text-slate-200 tabular-nums">{loc.travelTime} min</div>
                          <div className="text-[9px] text-slate-500">Travel</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <div>
                          <div className="text-xs font-semibold text-slate-200 tabular-nums">{loc.capacity}</div>
                          <div className="text-[9px] text-slate-500">Capacity</div>
                        </div>
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-slate-500">Capacity Utilization</span>
                        <span className="text-[9px] text-slate-400 tabular-nums">
                          {loc.occupancy} / {loc.capacity} ({Math.round(occupancyPct)}%)
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyPct > 80 ? 'bg-risk-severe' : occupancyPct > 50 ? 'bg-risk-moderate' : 'bg-risk-low'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetRoute(loc);
                      }}
                      disabled={routingShelterId === loc.id}
                      className="btn btn-primary w-full mt-3 py-1.5 text-xs flex items-center justify-center gap-1.5"
                    >
                      {routingShelterId === loc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Shield className="w-3.5 h-3.5" />
                      )}
                      Request AI Safe Evacuation Route
                    </button>
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
