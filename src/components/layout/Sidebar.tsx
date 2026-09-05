import { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  CloudRain,
  Waves,
  ShieldAlert,
  Siren,
  MapPin,
  Navigation,
  FileText,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Smartphone,
} from 'lucide-react';
import type { PageId } from '@/types';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard },
  { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
  { id: 'rainfall', label: 'Rainfall Forecast', icon: CloudRain },
  { id: 'flood', label: 'Flood Prediction', icon: Waves },
  { id: 'risk', label: 'Risk & Impact', icon: ShieldAlert },
  { id: 'alerts', label: 'Alerts', icon: Siren },
  { id: 'safe-places', label: 'Safe Places', icon: MapPin },
  { id: 'evacuation', label: 'Evacuation', icon: Navigation },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'model', label: 'Model Performance', icon: Cpu },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-60'
      } shrink-0 bg-base-900 border-r border-white/5 flex flex-col transition-all duration-300 z-30`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/5 shrink-0">
        <div className="w-9 h-9 rounded-md bg-accent-500/15 border border-accent-500/30 flex items-center justify-center shrink-0">
          <Droplets className="w-5 h-5 text-accent-400" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white tracking-wide leading-tight">FLOOD AI</div>
            <div className="text-[10px] text-slate-500 tracking-widest uppercase">Intelligence Platform</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-item w-full ${active ? 'nav-item-active' : ''} ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-accent-400' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Citizen Mode */}
      <div className="px-2 py-3 border-t border-white/5">
        <button
          onClick={() => onNavigate('citizen')}
          className={`nav-item w-full ${activePage === 'citizen' ? 'nav-item-active' : ''} ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Citizen Emergency Mode' : undefined}
        >
          <Smartphone className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="truncate">Citizen Mode</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-10 flex items-center justify-center border-t border-white/5 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
