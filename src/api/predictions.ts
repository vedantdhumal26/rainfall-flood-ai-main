import { api } from './client';
import type { RiskLevel, FloodRiskPoint, ModelMetric, ConfidenceFactor } from '@/types';

export interface LatestPredictionResponse {
  prediction_id: string;
  location: string;
  risk_level: RiskLevel;
  flood_probability: number;
  predicted_water_depth: number;
  predicted_inundation_area: number;
  population_at_risk: number;
  arrival_time_minutes: number;
  confidence: number;
  prediction_time: string;
  forecast_horizon: string;
  model_version: string;
  flood_extent_km2: number;
  affected_area_km2: number;
  flood_zones: {
    zone: string;
    depth: string;
    severity: string;
    probability: number;
  }[];
}

export interface PredictionTimelineResponse {
  timeline: FloodRiskPoint[];
}

export interface ModelMetricsResponse {
  metrics: ModelMetric[];
  confidence_factors: ConfidenceFactor[];
  overall_confidence: number;
}

export const predictionsApi = {
  getLatest: () => api.get<LatestPredictionResponse>('/api/predictions/latest'),
  getTimeline: () => api.get<PredictionTimelineResponse>('/api/predictions/timeline'),
  getMetrics: () => api.get<ModelMetricsResponse>('/api/predictions/metrics'),
  getById: (id: string) => api.get<LatestPredictionResponse>(`/api/predictions/${id}`),
};
