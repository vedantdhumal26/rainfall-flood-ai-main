import { api } from './client';
import type { DataSource } from '@/types';

export interface DataSourcesResponse {
  sources: DataSource[];
  active_sensors: number;
  throughput_mb_s: number;
  api_latency_ms: number;
  system_status: string;
}

export const dataSourcesApi = {
  getDataSources: () => api.get<DataSourcesResponse>('/api/data-sources'),
};
