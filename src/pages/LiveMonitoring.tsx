import { Activity, Satellite, Radar, Eye, Cloud, Radio } from 'lucide-react';
import { DATA_SOURCES } from '@/data/mockData';
import { MapView } from '@/components/maps/MapView';

const SOURCE_ICONS: Record<string, typeof Activity> = {
  Satellite: Satellite,
  Radar: Radar,
  Observation: Eye,
  NWP: Cloud,
};

export function LiveMonitoring() {
  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Live Monitoring</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time data source monitoring and system health</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Data Sources */}
        <div className="xl:col-span-1 space-y-4">
          <div className="panel p-4">
            <h3 className="panel-title mb-4">Data Sources</h3>
            <div className="space-y-2">
              {DATA_SOURCES.map((source) => {
                const Icon = SOURCE_ICONS[source.type] ?? Radio;
                const statusColor = source.status === 'online' ? 'text-risk-low' : source.status === 'degraded' ? 'text-risk-moderate' : 'text-risk-severe';
                return (
                  <div key={source.id} className="flex items-center gap-3 p-2.5 rounded-md bg-white/3 border border-white/5">
                    <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{source.name}</div>
                      <div className="text-[10px] text-slate-500">{source.type} · Last sync {source.lastSync}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{source.status}</div>
                      <div className="text-[10px] text-slate-500 tabular-nums">{source.coverage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health */}
          <div className="panel p-4">
            <h3 className="panel-title mb-4">System Health</h3>
            <div className="space-y-3">
              {[
                { label: 'API Latency', value: '42ms', status: 'good' },
                { label: 'Model Inference', value: '1.2s', status: 'good' },
                { label: 'Data Throughput', value: '8.4 MB/s', status: 'good' },
                { label: 'Active Sensors', value: '1,247', status: 'good' },
                { label: 'Uptime', value: '99.97%', status: 'good' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 tabular-nums">{item.value}</span>
                    <span className="w-2 h-2 rounded-full bg-risk-low" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="xl:col-span-2">
          <div className="panel p-1 h-[600px]">
            <MapView height="100%" />
          </div>
        </div>
      </div>
    </div>
  );
}
