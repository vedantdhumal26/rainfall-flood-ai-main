import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { POPULATION_RISK, AREA_RISK, INFRASTRUCTURE_BREAKDOWN } from '@/data/mockData';
import { Users, Building2, Ambulance, Car, Siren } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-base-800 border border-white/10 rounded-md px-3 py-2 shadow-xl">
      <div className="text-[11px] text-slate-400 mb-1">{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-slate-200 font-semibold tabular-nums">{entry.value?.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
}

export function RiskImpact() {
  const infraChart = INFRASTRUCTURE_BREAKDOWN.map((i) => ({ name: i.type, total: i.count, atRisk: i.atRisk }));

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Risk & Impact Assessment</h1>
        <p className="text-sm text-slate-500 mt-1">Comprehensive analysis of population, infrastructure, and area at risk</p>
      </div>

      {/* Section Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Population', icon: Users, value: '24,680', color: 'text-risk-severe' },
          { label: 'Infrastructure', icon: Building2, value: '43', color: 'text-risk-high' },
          { label: 'Transportation', icon: Car, value: '21', color: 'text-risk-moderate' },
          { label: 'Healthcare', icon: Ambulance, value: '3', color: 'text-risk-severe' },
          { label: 'Emergency Services', icon: Siren, value: '7', color: 'text-risk-high' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="panel p-4">
              <Icon className={`w-5 h-5 ${item.color} mb-2`} />
              <div className="text-2xl font-bold text-white tabular-nums">{item.value}</div>
              <div className="stat-label mt-1">{item.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Population by Risk */}
        <div className="panel p-4">
          <h3 className="panel-title mb-4">Population by Risk Level</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={POPULATION_RISK} dataKey="count" nameKey="level" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {POPULATION_RISK.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {POPULATION_RISK.map((item) => (
                <div key={item.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-slate-400">{item.level}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 tabular-nums">{item.count.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Affected Area */}
        <div className="panel p-4">
          <h3 className="panel-title mb-4">Affected Area by Risk (km²)</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={AREA_RISK} dataKey="area" nameKey="level" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {AREA_RISK.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {AREA_RISK.map((item) => (
                <div key={item.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-slate-400">{item.level}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 tabular-nums">{item.area} km²</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infrastructure by Risk */}
        <div className="panel p-4">
          <h3 className="panel-title mb-4">Infrastructure by Risk</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={infraChart} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="total" fill="#283a68" radius={[3, 3, 0, 0]} name="Total" />
              <Bar dataKey="atRisk" fill="#ef4444" radius={[3, 3, 0, 0]} name="At Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Infrastructure Detail */}
        <div className="panel p-4">
          <h3 className="panel-title mb-4">Infrastructure Breakdown</h3>
          <div className="space-y-2.5">
            {INFRASTRUCTURE_BREAKDOWN.map((item) => {
              const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[item.icon] ?? LucideIcons.Square;
              const pct = item.count > 0 ? (item.atRisk / item.count) * 100 : 0;
              return (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-xs text-slate-300">{item.type}</span>
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums">{item.atRisk}/{item.count} at risk</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-risk-severe transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
