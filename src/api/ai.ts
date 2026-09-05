import { api } from './client';

export interface AiInsightsResponse {
  summary: string;
  risk_factors: { factor: string; contribution: number }[];
  recommendations: string[];
  model_version: string;
  confidence_score: number;
}

export const aiApi = {
  getInsights: () => api.get<AiInsightsResponse>('/api/ai/insights'),
};
