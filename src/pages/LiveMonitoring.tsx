import { useEffect, useState } from 'react';
import { Activity, Satellite, Radar, Eye, Cloud, Radio, Loader2 } from 'lucide-react';
import { DATA_SOURCES } from '@/data/mockData';
import { MapView } from '@/components/maps/MapView';
import { dataSourcesApi, type DataSourcesResponse } from '@/api/dataSources';

const SOURCE_ICONS: Record<string, typeof Activity> = {
  Satellite: Satellite,
  Radar: Radar,
  Observation: Eye,
  NWP: Cloud,
};

export function LiveMonitoring() {
  const [data, setData] = useState<DataSourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSources = () => {
      dataSourcesApi.getDataSources()
        .then((res) => {
          if (isMounted) setData(res);
        })
        .catch((err) => console.warn('[LiveMonitoring] Using local source fallback:', err))
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchSources();
    const interval = setInterval(fetchSources, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const sources = data?.sources || DATA_SOURCES;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Live Meteorological Surveillance</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time surveillance feeds, Doppler radar telemetry, and sensor network synchronization</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Data Sources */}
        <div className="xl:col-span-1 space-y-4">
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="panel-title">Active Data Ingestion Feeds</h3>
              <span className="text-[10px] uppercase font-bold text-risk-low">Online ({sources.length})</span>
            </div>

            <div className="space-y-2">
              {sources.map((source) => {
                const Icon = SOURCE_ICONS[source.type] ?? Radio;
                const statusColor = source.status === 'online' ? 'text-risk-low' : source.status === 'degraded' ? 'text-risk-moderate' : 'text-risk-severe';
                return (
                  <div key={source.id} className="flex items-center gap-3 p-2.5 rounded-md bg-white/3 border border-white/5">
                    <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{source.name}</div>
                      <div className="text-[10px] text-slate-500">{source.type} · Sync: {source.lastSync}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{source.status}</div>
                      <div className="text-[10px] text-slate-500 tabular-nums">{source.coverage}% coverage</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health */}
          <div className="panel p-4">
            <h3 className="panel-title mb-4">Pipeline Telemetry & Health</h3>
            <div className="space-y-3">
              {[
                { label: 'API Processing Latency', value: `${data?.api_latency_ms || 42}ms`, status: 'good' },
                { label: 'ML Inference Execution', value: '1.1s', status: 'good' },
                { label: 'Data Throughput Rate', value: `${data?.throughput_mb_s || 8.4} MB/s`, status: 'good' },
                { label: 'Active Weather Sensors', value: `${data?.active_sensors || 1247}`, status: 'good' },
                { label: 'Platform Availability Uptime', value: '99.98%', status: 'good' },
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
