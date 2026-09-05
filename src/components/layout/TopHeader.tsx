import { useEffect, useState } from 'react';
import { Bell, UserCog, Radio, Activity } from 'lucide-react';
import { healthApi, type HealthResponse } from '@/api/health';

interface TopHeaderProps {
  title: string;
  subtitle: string;
}

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('Live');

  useEffect(() => {
    let isMounted = true;
    const checkHealth = () => {
      healthApi.getHealth()
        .then((data) => {
          if (!isMounted) return;
          setHealth(data);
          setIsOnline(data.status === 'healthy');
          const time = new Date(data.timestamp || Date.now());
          setLastUpdated(time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
        })
        .catch(() => {
          if (!isMounted) return;
          setIsOnline(false);
        });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-16 bg-base-900 border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
      <div>
        <h1 className="text-base font-bold text-white tracking-wide leading-tight">{title}</h1>
        <p className="text-[11px] text-slate-500 tracking-wide">{subtitle}</p>
      </div>

      <div className="flex items-center gap-5">
        {/* System Status from Backend */}
        <div className="hidden md:flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${
                isOnline ? 'bg-risk-low' : 'bg-risk-severe'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isOnline ? 'bg-risk-low' : 'bg-risk-severe'
              }`}
            />
          </span>
          <span
            className={`text-[11px] font-semibold tracking-wider uppercase ${
              isOnline ? 'text-risk-low' : 'text-risk-severe'
            }`}
          >
            {isOnline ? 'System Operational' : 'Offline / Degraded'}
          </span>
        </div>

        {/* Data Mode / Simulation Banner */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Mode</span>
          <span className="text-[11px] font-bold text-accent-400 flex items-center gap-1">
            <Activity className="w-3 h-3 animate-pulse" />
            SIMULATION
          </span>
        </div>

        {/* Last Updated from Backend */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Last Sync</span>
          <span className="text-[11px] font-semibold text-slate-300 font-mono">{lastUpdated}</span>
        </div>

        {/* Database & ML Status Badge */}
        {health?.database && (
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-low" />
            <span>DB: {health.database}</span>
            <span className="text-slate-600">|</span>
            <span>ML: {health.ml_service}</span>
          </div>
        )}

        {/* Header Icons */}
        <button
          className="relative w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title="Active Alerts"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-risk-severe" />
        </button>
        <button
          className="w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title="Surveillance Feeds"
        >
          <Radio className="w-[18px] h-[18px]" />
        </button>
        <button
          className="w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title="Operator Profile"
        >
          <UserCog className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
