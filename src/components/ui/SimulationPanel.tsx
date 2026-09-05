import { Play, Pause, RotateCcw } from 'lucide-react';
import { SIMULATION_SCENARIOS } from '@/data/mockData';
import { useSimulation } from '@/hooks/useSimulation';
import { alertColor, alertLabel } from '@/utils/risk';

interface SimulationPanelProps {
  simulation: ReturnType<typeof useSimulation>;
}

export function SimulationPanel({ simulation }: SimulationPanelProps) {
  const { scenarioId, scenario, isRunning, phaseIndex, currentPhase, progress, setScenarioId, start, pause, reset } = simulation;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="panel-title">Disaster Scenario Simulator</h3>
        <span className="text-[11px] text-slate-500 uppercase tracking-wider">Interactive</span>
      </div>

      {/* Scenario Dropdown */}
      <div className="mb-4">
        <label className="stat-label block mb-1.5">Select Scenario</label>
        <select
          value={scenarioId}
          onChange={(e) => {
            setScenarioId(e.target.value);
            reset();
          }}
          className="w-full bg-base-800 border border-white/10 rounded-md px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent-500/50 transition-colors cursor-pointer"
        >
          {SIMULATION_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id} className="bg-base-800">
              {s.name}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-slate-500 mt-1.5">{scenario.description}</p>
      </div>

      {/* Phase Progress */}
      {scenario.phases.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Simulation Progress</span>
            <span className="text-[11px] font-mono text-slate-400">
              Phase {phaseIndex + 1}/{scenario.phases.length}
            </span>
          </div>
          <div className="flex gap-1.5">
            {scenario.phases.map((phase, idx) => {
              const color = alertColor(phase.level);
              const isComplete = idx < phaseIndex;
              const isCurrent = idx === phaseIndex;
              return (
                <div
                  key={idx}
                  className="flex-1 h-2 rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{
                    background: isComplete || isCurrent ? color : 'rgba(255,255,255,0.06)',
                    opacity: isComplete ? 0.6 : isCurrent ? 1 : 0.3,
                  }}
                >
                  {isCurrent && isRunning && (
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%`, background: color, opacity: 0.8 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Phase Display */}
      {currentPhase && (
        <div
          className="rounded-md p-3 mb-4 border transition-all duration-300"
          style={{
            borderColor: `${alertColor(currentPhase.level)}40`,
            background: `${alertColor(currentPhase.level)}10`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-sm font-bold tracking-wider"
              style={{ color: alertColor(currentPhase.level) }}
            >
              {alertLabel(currentPhase.level)} — {currentPhase.label}
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: alertColor(currentPhase.level) }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Flood Prob.</div>
              <div className="text-lg font-bold text-white tabular-nums">{currentPhase.floodProbability}%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Rainfall</div>
              <div className="text-lg font-bold text-white tabular-nums">{currentPhase.rainfall}<span className="text-xs text-slate-500"> mm</span></div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Water Depth</div>
              <div className="text-lg font-bold text-white tabular-nums">{currentPhase.waterDepth}<span className="text-xs text-slate-500"> m</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={start}
          disabled={isRunning}
          className="btn btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Start Simulation'}
        </button>
        <button onClick={pause} disabled={!isRunning} className="btn btn-ghost disabled:opacity-40">
          <Pause className="w-4 h-4" />
        </button>
        <button onClick={reset} className="btn btn-ghost">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
