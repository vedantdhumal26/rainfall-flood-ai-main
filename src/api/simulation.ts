import { api } from './client';
import type { SimulationScenario, SimulationPhase } from '@/types';

export interface BackendSimulationState {
  scenarioId: string;
  scenario: SimulationScenario;
  phaseIndex: number;
  totalPhases: number;
  currentPhase: SimulationPhase | null;
  isRunning: boolean;
  progress: number;
  scenarios: SimulationScenario[];
}

export const simulationApi = {
  getState: () => api.get<BackendSimulationState>('/api/simulation/state'),
  setScenario: (scenarioId: string, phaseIndex: number = 0) =>
    api.post<BackendSimulationState>('/api/simulation/set-scenario', { scenario_id: scenarioId, phase_index: phaseIndex }),
  start: (scenarioId?: string) => api.post<BackendSimulationState>('/api/simulation/start', { scenario_id: scenarioId }),
  pause: () => api.post<BackendSimulationState>('/api/simulation/pause'),
  step: () => api.post<BackendSimulationState>('/api/simulation/step'),
  reset: () => api.post<BackendSimulationState>('/api/simulation/reset'),
};
