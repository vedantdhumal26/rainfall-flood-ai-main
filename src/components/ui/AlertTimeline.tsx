import { useEffect, useState } from 'react';
import { ALERT_HISTORY as FALLBACK_HISTORY } from '@/data/mockData';
import { alertColor } from '@/utils/risk';
import { alertsApi, type AlertItem } from '@/api/alerts';

export function AlertTimeline() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAlerts = () => {
      alertsApi.getAlerts()
        .then((data) => {
          if (isMounted && data && data.length > 0) {
            setAlerts(data.slice(0, 5));
          }
        })
        .catch(() => {});
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const displayAlerts = alerts.length > 0 ? alerts : FALLBACK_HISTORY;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="panel-title">System Alert History</h3>
        <span className="text-[10px] text-slate-500 font-mono">Live Timeline</span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10"></div>

        <div className="space-y-4">
          {displayAlerts.map((alert) => {
            const color = alertColor(alert.level);
            return (
              <div key={alert.id} className="relative flex gap-3 items-start">
                <div
                  className="relative w-3.5 h-3.5 rounded-full border-2 border-base-850 shrink-0 mt-0.5 z-10"
                  style={{ background: color }}
                >
                  {alert.level === 'red' && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-40"
                      style={{ background: color }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">{alert.time}</span>
                    <span className="text-xs font-bold tracking-wider uppercase" style={{ color }}>
                      {alert.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{alert.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
