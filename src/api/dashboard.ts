import { api } from './client';
import type { KPICard, AlertLevel } from '@/types';

export interface DashboardSummary {
  system_status: string;
  active_alerts: number;
  critical_alerts: number;
  high_risk_zones: number;
  predicted_inundation_area: number;
  maximum_rainfall: number;
  population_at_risk: number;
  infrastructure_at_risk: number;
  risk_level: 'low' | 'moderate' | 'high' | 'severe';
  flood_probability: number;
  water_depth: number;
  arrival_time: number;
  kpis: KPICard[];
  active_banner: {
    level: AlertLevel;
    title: string;
    description: string;
    region: string;
    eta: string;
  } | null;
  is_simulation_mode: boolean;
  last_updated: string;
}

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/api/dashboard/summary'),
};
