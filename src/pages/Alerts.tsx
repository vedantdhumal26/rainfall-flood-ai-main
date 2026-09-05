import { AlertTimeline } from '@/components/ui/AlertTimeline';
import { ALERT_HISTORY } from '@/data/mockData';
import { alertColor, alertLabel } from '@/utils/risk';
import { Bell, Send, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

export function Alerts() {
  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Alerts</h1>
        <p className="text-sm text-slate-500 mt-1">Active alerts, alert history, and notification management</p>
      </div>

      {/* Active Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Current Alert */}
          <div className="relative overflow-hidden rounded-lg border border-risk-severe/40 bg-gradient-to-r from-risk-severe/15 via-risk-severe/8 to-transparent">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-risk-severe animate-pulse-slow" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-risk-severe/30 animate-pulse-ring" />
                  <div className="relative w-10 h-10 rounded-full bg-risk-severe/20 border border-risk-severe/40 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-risk-severe" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-risk-severe tracking-wider uppercase">Red Alert — Severe Flood Risk</div>
                  <div className="text-xs text-slate-400">Active since 18:42 IST · Pune Region</div>
                </div>
              </div>
              <p className="text-sm text-slate-300">Extreme rainfall (92mm) and rapid inundation predicted. Flood arrival expected within 42 minutes. Immediate evacuation recommended for low-lying areas.</p>
              <div className="flex gap-2 mt-4">
                <button className="btn btn-danger">
                  <Send className="w-4 h-4" />
                  Broadcast Alert
                </button>
                <button className="btn btn-ghost">
                  <SettingsIcon className="w-4 h-4" />
                  Configure
                </button>
              </div>
            </div>
          </div>

          {/* Alert History */}
          <AlertTimeline />

          {/* Full History Table */}
          <div className="panel p-4">
            <h3 className="panel-title mb-4">Full Alert History</h3>
            <div className="space-y-1">
              {ALERT_HISTORY.map((alert) => {
                const color = alertColor(alert.level);
                return (
                  <div key={alert.id} className="flex items-center gap-4 p-2.5 rounded-md hover:bg-white/3 transition-colors">
                    <span className="text-[11px] font-mono text-slate-500 w-12 shrink-0">{alert.time}</span>
                    <span className="badge shrink-0" style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
                      {alertLabel(alert.level)}
                    </span>
                    <span className="text-xs text-slate-300 flex-1">{alert.description}</span>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <div className="panel p-4">
            <h3 className="panel-title mb-4">Notification Channels</h3>
            <div className="space-y-3">
              {[
                { label: 'SMS Alerts', status: 'Active', icon: Send },
                { label: 'Email Notifications', status: 'Active', icon: Bell },
                { label: 'Push Notifications', status: 'Active', icon: Bell },
                { label: 'Siren Integration', status: 'Active', icon: AlertTriangle },
                { label: 'Media Broadcast', status: 'Standby', icon: Send },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between p-2.5 rounded-md bg-white/3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-300">{item.label}</span>
                    </div>
                    <span className={`badge ${item.status === 'Active' ? 'bg-risk-low/15 text-risk-low' : 'bg-slate-500/15 text-slate-400'}`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="panel-title mb-4">Alert Thresholds</h3>
            <div className="space-y-3">
              {[
                { label: 'Yellow Alert', value: '30% flood probability', color: '#eab308' },
                { label: 'Orange Alert', value: '60% flood probability', color: '#f97316' },
                { label: 'Red Alert', value: '80% flood probability', color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-md bg-white/3 border border-white/5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
