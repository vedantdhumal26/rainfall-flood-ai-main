import { api } from './client';

export interface HealthResponse {
  status: string;
  database: string;
  ml_service: string;
  models?: Record<string, string>;
  mode?: string;
  timestamp: string;
}

export const healthApi = {
  getHealth: () => api.get<HealthResponse>('/api/health'),
};
