import { Bell, UserCog, Radio } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  subtitle: string;
}

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  return (
    <header className="h-16 bg-base-900 border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
      <div>
        <h1 className="text-base font-bold text-white tracking-wide leading-tight">{title}</h1>
        <p className="text-[11px] text-slate-500 tracking-wide">{subtitle}</p>
      </div>

      <div className="flex items-center gap-5">
        {/* System Status */}
        <div className="hidden md:flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-low"></span>
          </span>
          <span className="text-[11px] font-semibold text-risk-low tracking-wider uppercase">System Online</span>
        </div>

        {/* Data Mode */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Data Mode</span>
          <span className="text-[11px] font-semibold text-accent-300">DEMO</span>
        </div>

        {/* Last Updated */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Last Updated</span>
          <span className="text-[11px] font-semibold text-slate-300 font-mono">18:42 IST</span>
        </div>

        {/* Icons */}
        <button className="relative w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-risk-severe"></span>
        </button>
        <button className="w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
          <Radio className="w-[18px] h-[18px]" />
        </button>
        <button className="w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
          <UserCog className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
