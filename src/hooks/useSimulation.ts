import { useState, useCallback, useEffect, useRef } from 'react';
import { SIMULATION_SCENARIOS } from '@/data/mockData';
import type { SimulationPhase } from '@/types';

export interface SimulationState {
  scenarioId: string;
  isRunning: boolean;
  phaseIndex: number;
  currentPhase: SimulationPhase | null;
  progress: number;
}

export function useSimulation() {
  const [scenarioId, setScenarioId] = useState('extreme');
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(3);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId)!;
  const currentPhase = scenario.phases[phaseIndex] ?? null;

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    stop();
    setPhaseIndex(0);
    setProgress(0);
    setIsRunning(true);
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setPhaseIndex(0);
    setProgress(0);
  }, [stop]);

  const pause = useCallback(() => {
    stop();
  }, [stop]);

  useEffect(() => {
    if (!isRunning) return;
    const phaseDuration = 2000;
    const tickInterval = 50;
    let phaseStart = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - phaseStart;
      const phaseProgress = Math.min((elapsed / phaseDuration) * 100, 100);
      setProgress(phaseProgress);

      if (phaseProgress >= 100) {
        if (phaseIndex < scenario.phases.length - 1) {
          setPhaseIndex((i) => i + 1);
          phaseStart = Date.now();
          setProgress(0);
        } else {
          stop();
          setProgress(100);
        }
      }
    }, tickInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, phaseIndex, scenario.phases.length, stop]);

  return {
    scenarioId,
    scenario,
    isRunning,
    phaseIndex,
    currentPhase,
    progress,
    setScenarioId,
    start,
    pause,
    reset,
  };
}
