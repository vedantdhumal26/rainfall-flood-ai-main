import { useState, useEffect, useCallback } from 'react';
import { AlertTimeline } from '@/components/ui/AlertTimeline';
import { alertsApi, type AlertItem } from '@/api/alerts';
import { alertColor, alertLabel } from '@/utils/risk';
import { Bell, Send, Settings as SettingsIcon, AlertTriangle, CheckCircle, Plus, Loader2 } from 'lucide-react';

export function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAlerts = useCallback(() => {
    alertsApi.getAlerts()
      .then((data) => {
        setAlerts(data);
      })
      .catch((err) => {
        console.warn('[Alerts] Failed to load alerts from backend:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const activeAlert = alerts.find((a) => a.level === 'red' || a.level === 'orange') || alerts[0];

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await alertsApi.approveAlert(id, 'Officer On Duty');
      setActionSuccess('Alert approved successfully by authority.');
      fetchAlerts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (e: unknown) {
      alert((e as Error).message || 'Failed to approve alert');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBroadcast = async (id: string) => {
    setActionLoading(id);
    try {
      await alertsApi.broadcastAlert(id);
      setActionSuccess('Emergency broadcast dispatched to SMS, sirens, and media gateways!');
      fetchAlerts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (e: unknown) {
      alert((e as Error).message || 'Failed to broadcast alert');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Alerts & Warning Dissemination</h1>
        <p className="text-sm text-slate-500 mt-1">Active emergency alerts, authorization workflow, and multi-channel broadcast management</p>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-lg bg-risk-low/15 border border-risk-low/30 text-xs text-risk-low flex items-center gap-2 animate-slide-up">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Active Alert Banner Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {activeAlert ? (
            <div className="relative overflow-hidden rounded-lg border border-risk-severe/40 bg-gradient-to-r from-risk-severe/15 via-risk-severe/8 to-transparent">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-risk-severe animate-pulse-slow" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-risk-severe/30 animate-pulse-ring" />
                      <div className="relative w-10 h-10 rounded-full bg-risk-severe/20 border border-risk-severe/40 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-risk-severe" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-risk-severe tracking-wider uppercase">
                        {activeAlert.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        Status: <span className="font-semibold uppercase text-slate-200">{activeAlert.status}</span> · {activeAlert.region} · Expected: {activeAlert.eta}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${activeAlert.status === 'broadcasted' ? 'bg-risk-severe/20 text-risk-severe border border-risk-severe/40' : 'bg-risk-high/20 text-risk-high'}`}>
                    {activeAlert.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-slate-300 mb-4">{activeAlert.description}</p>

                {/* Real Action Buttons calling backend */}
                <div className="flex flex-wrap gap-2">
                  {activeAlert.status !== 'approved' && activeAlert.status !== 'broadcasted' && (
                    <button
                      onClick={() => handleApprove(activeAlert.id)}
                      disabled={actionLoading === activeAlert.id}
                      className="btn btn-primary"
                    >
                      {actionLoading === activeAlert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve Alert
                    </button>
                  )}

                  <button
                    onClick={() => handleBroadcast(activeAlert.id)}
                    disabled={actionLoading === activeAlert.id}
                    className="btn btn-danger"
                  >
                    {actionLoading === activeAlert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Broadcast Live Warning
                  </button>

                  <button className="btn btn-ghost">
                    <SettingsIcon className="w-4 h-4" />
                    Configure Channels
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel p-6 text-center text-slate-500 text-sm">
              No active flood alerts at this moment.
            </div>
          )}

          {/* Alert History Timeline */}
          <AlertTimeline />

          {/* Full History Table from Backend */}
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="panel-title">System Alert History Log</h3>
              <span className="text-xs text-slate-500">{alerts.length} total logged</span>
            </div>

            {loading ? (
              <div className="p-4 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading alerts from backend...
              </div>
            ) : (
              <div className="space-y-1">
                {alerts.map((alert) => {
                  const color = alertColor(alert.level);
                  return (
                    <div key={alert.id} className="flex items-center gap-4 p-2.5 rounded-md hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                      <span className="text-[11px] font-mono text-slate-500 w-12 shrink-0">{alert.time}</span>
                      <span className="badge shrink-0" style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
                        {alertLabel(alert.level)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200">{alert.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{alert.description}</div>
                      </div>
                      <span className="badge text-[10px] uppercase bg-white/5 text-slate-400">{alert.status}</span>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <div className="panel p-4">
            <h3 className="panel-title mb-4">Notification Channels</h3>
            <div className="space-y-3">
              {[
                { label: 'SMS Cell Broadcast', status: 'Active', icon: Send },
                { label: 'Civil Defense Siren Network', status: 'Armed', icon: AlertTriangle },
                { label: 'Mobile App Push Gateways', status: 'Active', icon: Bell },
                { label: 'State Emergency Hotline (1070/112)', status: 'Active', icon: Bell },
                { label: 'Public TV & Radio Crawl', status: 'Standby', icon: Send },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between p-2.5 rounded-md bg-white/3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-300">{item.label}</span>
                    </div>
                    <span className={`badge ${item.status === 'Active' || item.status === 'Armed' ? 'bg-risk-low/15 text-risk-low' : 'bg-slate-500/15 text-slate-400'}`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="panel-title mb-4">Alert Trigger Thresholds</h3>
            <div className="space-y-3">
              {[
                { label: 'Yellow Alert (Watch)', value: '>= 30% flood probability or > 20mm/hr rain', color: '#eab308' },
                { label: 'Orange Alert (Warning)', value: '>= 60% flood probability or > 45mm/hr rain', color: '#f97316' },
                { label: 'Red Alert (Critical)', value: '>= 80% flood probability or > 70mm/hr rain', color: '#ef4444' },
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
