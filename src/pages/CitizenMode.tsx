import { useState } from 'react';
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
} from 'lucide-react';

interface CitizenModeProps {
  onExit: () => void;
}

export function CitizenMode({ onExit }: CitizenModeProps) {
  const [activeTab, setActiveTab] = useState<'alert' | 'safe' | 'info'>('alert');

  return (
    <div className="min-h-screen bg-base-950 flex flex-col">
      {/* Top bar */}
      <div className="bg-risk-severe/20 border-b border-risk-severe/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-risk-severe/40 animate-pulse-ring" />
            <div className="relative w-8 h-8 rounded-full bg-risk-severe/20 border border-risk-severe/40 flex items-center justify-center">
              <Siren className="w-4 h-4 text-risk-severe" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-risk-severe tracking-wide">RED ALERT</div>
            <div className="text-[10px] text-slate-400">Severe Flood Risk · Pune Region</div>
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
        {/* Alert summary */}
        <div className="bg-gradient-to-b from-risk-severe/15 to-transparent border border-risk-severe/20 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-risk-severe" />
            <h1 className="text-lg font-bold text-risk-severe">SEVERE FLOOD RISK</h1>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            Extreme rainfall is causing rapid flooding in your area. Take immediate action to reach safety.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-base-850/60 rounded-lg p-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-risk-severe" />
                <span className="text-sm text-slate-300">Flood arrival</span>
              </div>
              <span className="text-xl font-bold text-white tabular-nums">42<span className="text-sm text-slate-400"> min</span></span>
            </div>
            <div className="flex items-center justify-between bg-base-850/60 rounded-lg p-3">
              <div className="flex items-center gap-2.5">
                <Droplets className="w-5 h-5 text-risk-high" />
                <span className="text-sm text-slate-300">Water depth</span>
              </div>
              <span className="text-xl font-bold text-white tabular-nums">1.4<span className="text-sm text-slate-400"> m</span></span>
            </div>
            <div className="flex items-center justify-between bg-base-850/60 rounded-lg p-3">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-risk-low" />
                <span className="text-sm text-slate-300">Nearest safe place</span>
              </div>
              <span className="text-xl font-bold text-white tabular-nums">2.4<span className="text-sm text-slate-400"> km</span></span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5 mb-5">
          <button className="w-full bg-risk-low/20 border border-risk-low/40 text-risk-low rounded-xl py-4 font-bold text-base flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform">
            <Navigation className="w-5 h-5" />
            FIND SAFE ROUTE
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('safe')}
              className="bg-accent-500/15 border border-accent-500/30 text-accent-300 rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Shield className="w-4 h-4" />
              SAFE PLACES
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className="bg-white/5 border border-white/10 text-slate-300 rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Info className="w-4 h-4" />
              INFO
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'safe' && (
          <div className="space-y-2.5 animate-fade-in">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">Nearest Safe Locations</h2>
            {[
              { name: 'Shelter A — Shivaji Nagar', distance: '2.4 km', time: '8 min', capacity: '500' },
              { name: 'Shelter B — Kothrud', distance: '3.1 km', time: '11 min', capacity: '800' },
              { name: 'Shelter C — Baner', distance: '4.8 km', time: '16 min', capacity: '1200' },
            ].map((shelter) => (
              <div key={shelter.name} className="bg-base-850/60 border border-white/5 rounded-lg p-3.5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-risk-low mt-0.5" />
                    <span className="text-sm font-semibold text-slate-200">{shelter.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-6">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {shelter.distance}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {shelter.time}
                  </span>
                  <span className="text-[11px] text-slate-400">Cap: {shelter.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-base-850/60 border border-white/5 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">Emergency Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-risk-severe shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Emergency Hotline</div>
                    <div className="text-xs text-slate-400">1070 / 112</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Cross className="w-5 h-5 text-risk-severe shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Ambulance</div>
                    <div className="text-xs text-slate-400">108</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <LifeBuoy className="w-5 h-5 text-risk-low shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Rescue Team</div>
                    <div className="text-xs text-slate-400">NDRF: 1077</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-base-850/60 border border-white/5 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">Safety Instructions</h2>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                  Move to higher ground immediately
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                  Do not walk or drive through flood water
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                  Stay away from rivers, drains, and low-lying areas
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                  Keep your phone charged and carry emergency contacts
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low mt-1.5 shrink-0" />
                  Follow official instructions from authorities
                </li>
              </ul>
            </div>

            <p className="text-[10px] text-slate-600 text-center px-4">
              Data shown is simulated for demonstration purposes. This is a prototype for Smart India Hackathon 2026.
            </p>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="px-4 py-2.5 border-t border-white/5 bg-base-900 flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-low"></span>
        </span>
        <span className="text-[10px] font-semibold text-slate-400 tracking-wider">SYSTEM ONLINE · DEMO DATA</span>
      </div>
    </div>
  );
}
