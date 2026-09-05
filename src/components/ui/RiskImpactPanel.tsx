import { INFRASTRUCTURE_BREAKDOWN } from '@/data/mockData';
import * as LucideIcons from 'lucide-react';

interface RiskImpactPanelProps {
  populationAtRisk: number;
  infrastructureAtRisk: number;
  onInfrastructureClick?: (type: string) => void;
}

export function RiskImpactPanel({ populationAtRisk, infrastructureAtRisk, onInfrastructureClick }: RiskImpactPanelProps) {
  return (
    <div className="panel p-4">
      <h3 className="panel-title mb-4">Risk & Impact</h3>

      {/* People at Risk */}
      <div className="rounded-md bg-risk-severe/10 border border-risk-severe/20 p-3 mb-3">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">People at Risk</div>
        <div className="text-3xl font-bold text-risk-severe tabular-nums">{populationAtRisk.toLocaleString('en-IN')}</div>
      </div>

      {/* Critical Infrastructure */}
      <div className="rounded-md bg-risk-high/10 border border-risk-high/20 p-3 mb-3">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Critical Infrastructure</div>
        <div className="text-3xl font-bold text-risk-high tabular-nums">{infrastructureAtRisk}</div>
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5">
        <div className="stat-label mb-2">Infrastructure Breakdown</div>
        {INFRASTRUCTURE_BREAKDOWN.map((item) => {
          const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[item.icon] ?? LucideIcons.Square;
          return (
            <button
              key={item.type}
              onClick={() => onInfrastructureClick?.(item.type)}
              className="flex items-center justify-between w-full px-2.5 py-2 rounded-md bg-white/3 hover:bg-white/5 border border-white/5 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs text-slate-300">{item.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200 tabular-nums">{item.count}</span>
                {item.atRisk > 0 && (
                  <span className="badge bg-risk-severe/15 text-risk-severe">{item.atRisk} at risk</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
