import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { KPICard as KPICardType } from '@/types';
import { riskTextClass } from '@/utils/risk';
import { useCountUp } from '@/hooks/useCountUp';

interface KpiCardProps {
  kpi: KPICardType;
}

export function KpiCard({ kpi }: KpiCardProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[kpi.icon] ?? LucideIcons.Activity;

  const numericValue = parseFloat(kpi.value.replace(/,/g, ''));
  const isNumeric = !isNaN(numericValue) && kpi.value !== '—';
  const animated = useCountUp(isNumeric ? numericValue : 0, 600);

  const displayValue = isNumeric
    ? kpi.value.includes(',')
      ? Math.round(animated).toLocaleString('en-IN')
      : Number.isInteger(numericValue)
        ? Math.round(animated).toString()
        : animated.toFixed(2)
    : kpi.value;

  return (
    <div className="panel p-4 hover:border-white/10 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-accent-400 transition-colors" />
          </div>
          <span className="stat-label">{kpi.label}</span>
        </div>
        {kpi.riskLevel && (
          <span className={`w-2 h-2 rounded-full ${riskTextClass(kpi.riskLevel).replace('text-', 'bg-')}`}></span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="stat-value text-3xl count-up">{displayValue}</span>
        {kpi.unit && <span className="text-sm text-slate-400 font-medium">{kpi.unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">{kpi.sublabel}</span>
        {kpi.trend !== undefined && kpi.trendDirection && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-semibold ${
              kpi.trendDirection === 'up' ? 'text-risk-severe' : 'text-risk-low'
            }`}
          >
            {kpi.trendDirection === 'up' ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {kpi.trend}%
          </span>
        )}
      </div>
    </div>
  );
}
