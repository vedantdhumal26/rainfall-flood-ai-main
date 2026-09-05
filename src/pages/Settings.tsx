import { useState } from 'react';
import { Bell, Globe, Database, Shield, Download, Map, Sliders } from 'lucide-react';

export function Settings() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dataMode, setDataMode] = useState('demo');

  return (
    <div className="p-6 space-y-4 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">System configuration and preferences</p>
      </div>

      {/* General */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-accent-400" />
          <h3 className="panel-title">General</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-200">Auto Refresh</div>
              <div className="text-[11px] text-slate-500">Automatically update map and data every 30 seconds</div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoRefresh ? 'bg-accent-500/40' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-200">Push Notifications</div>
              <div className="text-[11px] text-slate-500">Receive alerts for all risk level changes</div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-accent-500/40' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div>
            <div className="text-sm text-slate-200 mb-1.5">Data Mode</div>
            <div className="text-[11px] text-slate-500 mb-2">Select data source mode for the platform</div>
            <div className="flex gap-2">
              {['demo', 'live', 'archive'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDataMode(mode)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                    dataMode === mode ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30' : 'bg-white/5 text-slate-400 border border-white/5'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Settings */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-4 h-4 text-accent-400" />
          <h3 className="panel-title">Map Settings</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-200 block mb-1.5">Default Map Style</label>
            <select className="w-full bg-base-800 border border-white/10 rounded-md px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent-500/50">
              <option>Dark (CARTO)</option>
              <option>Satellite</option>
              <option>Streets</option>
              <option>Terrain</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-200 block mb-1.5">Default Region</label>
            <select className="w-full bg-base-800 border border-white/10 rounded-md px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent-500/50">
              <option>Pune, Maharashtra</option>
              <option>Mumbai, Maharashtra</option>
              <option>Chennai, Tamil Nadu</option>
              <option>Kolkata, West Bengal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-accent-400" />
          <h3 className="panel-title">Data Source Configuration</h3>
        </div>
        <div className="space-y-2">
          {[
            { name: 'INSAT-3DR Satellite', interval: '15 min' },
            { name: 'IMD Doppler Radar', interval: '10 min' },
            { name: 'AWS Network', interval: '5 min' },
            { name: 'WRF NWP Model', interval: '60 min' },
          ].map((source) => (
            <div key={source.name} className="flex items-center justify-between p-2.5 rounded-md bg-white/3 border border-white/5">
              <span className="text-xs text-slate-300">{source.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">Update: {source.interval}</span>
                <span className="badge bg-risk-low/15 text-risk-low">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-accent-400" />
          <h3 className="panel-title">About</h3>
        </div>
        <div className="text-xs text-slate-400 space-y-2">
          <p><span className="text-slate-500">Platform:</span> AI Flood Intelligence v1.0.0</p>
          <p><span className="text-slate-500">Project:</span> Smart India Hackathon 2026</p>
          <p><span className="text-slate-500">Data:</span> All data shown is simulated for demonstration purposes</p>
        </div>
      </div>
    </div>
  );
}
