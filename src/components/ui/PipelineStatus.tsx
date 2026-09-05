import { Check, Loader2, Circle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { PipelineStage } from '@/types';
import { ChevronRight } from 'lucide-react';

interface PipelineStatusProps {
  stages: PipelineStage[];
  isRunning?: boolean;
}

export function PipelineStatus({ stages, isRunning }: PipelineStatusProps) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="panel-title">AI Processing Pipeline</h3>
        <span className="text-[11px] text-slate-500 uppercase tracking-wider">Integrated Data Flow</span>
      </div>

      <div className="flex items-center overflow-x-auto pb-2 gap-0">
        {stages.map((stage, idx) => {
          const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[stage.icon] ?? LucideIcons.Circle;
          const isActive = isRunning && stage.status === 'processing';
          return (
            <div key={stage.id} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                <div
                  className={`relative w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                    stage.status === 'complete'
                      ? 'bg-risk-low/10 border-risk-low/30'
                      : stage.status === 'processing'
                        ? 'bg-accent-500/15 border-accent-500/40 shadow-glow-cyan'
                        : 'bg-white/5 border-white/10'
                  } ${isActive ? 'animate-pulse-slow' : ''}`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] ${
                      stage.status === 'complete'
                        ? 'text-risk-low'
                        : stage.status === 'processing'
                          ? 'text-accent-400'
                          : 'text-slate-600'
                    }`}
                  />
                  {stage.status === 'processing' && (
                    <Loader2 className="absolute -top-1 -right-1 w-3.5 h-3.5 text-accent-400 animate-spin" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-slate-300 text-center leading-tight">{stage.name}</span>
                <span
                  className={`text-[9px] uppercase tracking-wider font-semibold ${
                    stage.status === 'complete'
                      ? 'text-risk-low'
                      : stage.status === 'processing'
                        ? 'text-accent-400'
                        : 'text-slate-600'
                  }`}
                >
                  {stage.status === 'complete' ? 'Complete' : stage.status === 'processing' ? 'Processing' : 'Waiting'}
                </span>
              </div>
              {idx < stages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-700 mx-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
