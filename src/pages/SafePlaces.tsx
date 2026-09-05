import { MapView } from '@/components/maps/MapView';
import { SAFE_LOCATIONS } from '@/data/mockData';
import { MapPin, Users, Navigation, Clock, Shield } from 'lucide-react';
import { riskBgClass, riskLabel } from '@/utils/risk';
import { useState } from 'react';

export function SafePlaces() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedLoc = SAFE_LOCATIONS.find((s) => s.id === selected);

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Safe Places</h1>
        <p className="text-sm text-slate-500 mt-1">Nearest emergency shelters and safe locations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map */}
        <div className="lg:col-span-7">
          <div className="panel p-1 h-[600px]">
            <MapView height="100%" focusTarget={selectedLoc?.position ?? null} />
          </div>
        </div>

        {/* Safe Locations List */}
        <div className="lg:col-span-5">
          <div className="panel p-4">
            <h3 className="panel-title mb-4">Nearest Safe Locations</h3>
            <div className="space-y-3">
              {SAFE_LOCATIONS.map((loc) => {
                const occupancyPct = (loc.occupancy / loc.capacity) * 100;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelected(loc.id)}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      selected === loc.id
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
                      <span className={`badge ${riskBgClass(loc.risk)}`}>
                        {riskLabel(loc.risk)}
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
                        <span className="text-[9px] text-slate-500">Occupancy</span>
                        <span className="text-[9px] text-slate-400 tabular-nums">{loc.occupancy}/{loc.capacity}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${occupancyPct > 80 ? 'bg-risk-severe' : occupancyPct > 50 ? 'bg-risk-moderate' : 'bg-risk-low'}`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    <button className="btn btn-primary w-full mt-3 py-1.5 text-xs">
                      <Shield className="w-3.5 h-3.5" />
                      Get Safe Route
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
