import { api } from './client';

export interface GeoJsonFeature {
  type: 'Feature';
  id?: string;
  properties: {
    id?: string;
    name?: string;
    risk: 'low' | 'moderate' | 'high' | 'severe';
    flood_probability?: number;
    water_depth?: number;
    depth?: number;
    [key: string]: unknown;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export const riskZonesApi = {
  getGeoJson: () => api.get<GeoJsonFeatureCollection>('/api/risk-zones'),
  getById: (id: string) => api.get<GeoJsonFeature>(`/api/risk-zones/${id}`),
};
