import { api } from './client';
import type { ForecastPoint } from '@/types';

export interface RainfallStation {
  station_id: string;
  station_name: string;
  lat: number;
  lon: number;
  rainfall_mm: number;
  intensity_mm_hr: number;
  temperature_c: number;
  humidity_percent: number;
  quality_score: number;
}

export interface RainfallCircle {
  center: [number, number];
  radius: number;
  intensity: number;
}

export interface CurrentRainfallResponse {
  timestamp: string;
  maximum_intensity_mm_hr: number;
  average_rainfall_mm: number;
  locations: RainfallStation[];
  rainfall_circles: RainfallCircle[];
}

export interface RainfallForecastResponse {
  current_rainfall: number;
  peak_predicted: number;
  accumulation_6h: number;
  coverage_area_sqkm: number;
  nowcast: ForecastPoint[];
  shortTerm: ForecastPoint[];
  cumulative: { time: string; hour: number; value: number }[];
  probability: { time: string; hour: number; value: number }[];
}

export const rainfallApi = {
  getCurrent: () => api.get<CurrentRainfallResponse>('/api/rainfall/current'),
  getForecast: () => api.get<RainfallForecastResponse>('/api/rainfall/forecast'),
  getHistory: () => api.get<{ history: { timestamp: string; rainfall_mm: number }[] }>('/api/rainfall/history'),
  getRadarLatest: () => api.get<Record<string, unknown>>('/api/radar/latest'),
  getSatelliteLatest: () => api.get<Record<string, unknown>>('/api/satellite/latest'),
};
