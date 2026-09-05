import { useState, useCallback, useEffect, useRef } from 'react';
import { simulationApi, type BackendSimulationState } from '@/api/simulation';
import { SIMULATION_SCENARIOS } from '@/data/mockData';
import type { SimulationScenario, SimulationPhase } from '@/types';

export interface SimulationState {
  scenarioId: string;
  scenario: SimulationScenario;
  isRunning: boolean;
  phaseIndex: number;
  currentPhase: SimulationPhase | null;
  progress: number;
  isBackendConnected: boolean;
}

export function useSimulation() {
  const [scenarioId, setScenarioIdState] = useState('extreme');
  const [scenario, setScenario] = useState<SimulationScenario>(
    SIMULATION_SCENARIOS.find((s) => s.id === 'extreme') || SIMULATION_SCENARIOS[0]
  );
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(3);
  const [progress, setProgress] = useState(100);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = scenario.phases[phaseIndex] ?? scenario.phases[scenario.phases.length - 1] ?? null;

  // Sync state from backend response
  const syncFromBackend = useCallback((backendState: BackendSimulationState) => {
    setScenarioIdState(backendState.scenarioId);
    if (backendState.scenario) {
      setScenario(backendState.scenario);
    }
    setPhaseIndex(backendState.phaseIndex);
    setIsRunning(backendState.isRunning);
    setProgress(backendState.progress);
    setIsBackendConnected(true);
  }, []);

  // Fetch initial state from backend
  useEffect(() => {
    let mounted = true;
    simulationApi.getState()
      .then((state) => {
        if (mounted) syncFromBackend(state);
      })
      .catch((err) => {
        console.warn('[useSimulation] Falling back to local prototype scenario:', err);
        setIsBackendConnected(false);
      });
    return () => {
      mounted = false;
    };
  }, [syncFromBackend]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    simulationApi.pause().catch(() => {});
  }, []);

  const setScenarioId = useCallback((newId: string) => {
    setScenarioIdState(newId);
    const found = SIMULATION_SCENARIOS.find((s) => s.id === newId);
    if (found) {
      setScenario(found);
    }
    setPhaseIndex(0);
    setProgress(0);
    simulationApi.setScenario(newId, 0)
      .then(syncFromBackend)
      .catch(() => {});
  }, [syncFromBackend]);

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(true);
    setProgress(0);

    simulationApi.start(scenarioId)
      .then(syncFromBackend)
      .catch(() => {
        // Fallback local execution if backend is temporarily unreachable
        setPhaseIndex(0);
      });
  }, [scenarioId, syncFromBackend]);

  const pause = useCallback(() => {
    stop();
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setPhaseIndex(0);
    setProgress(0);
    simulationApi.reset()
      .then(syncFromBackend)
      .catch(() => {});
  }, [stop, syncFromBackend]);

  // Stepping loop when simulation is active
  useEffect(() => {
    if (!isRunning) return;

    const phaseDuration = 2500;
    const tickInterval = 50;
    let phaseStart = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - phaseStart;
      const phaseProgress = Math.min((elapsed / phaseDuration) * 100, 100);
      setProgress(phaseProgress);

      if (phaseProgress >= 100) {
        if (phaseIndex < scenario.phases.length - 1) {
          phaseStart = Date.now();
          setProgress(0);
          simulationApi.step()
            .then(syncFromBackend)
            .catch(() => {
              setPhaseIndex((prev) => prev + 1);
            });
        } else {
          stop();
          setProgress(100);
        }
      }
    }, tickInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, phaseIndex, scenario.phases.length, stop, syncFromBackend]);

  return {
    scenarioId,
    scenario,
    isRunning,
    phaseIndex,
    currentPhase,
    progress,
    isBackendConnected,
    setScenarioId,
    start,
    pause,
    reset,
  };
}
