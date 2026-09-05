import { ALERT_HISTORY } from '@/data/mockData';
import { alertColor } from '@/utils/risk';

export function AlertTimeline() {
  return (
    <div className="panel p-4">
      <h3 className="panel-title mb-4">Alert History</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10"></div>

        <div className="space-y-4">
          {ALERT_HISTORY.map((alert) => {
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
                    <span className="text-xs font-bold tracking-wider" style={{ color }}>
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
