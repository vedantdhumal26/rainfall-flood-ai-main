import { api } from './client';
import type { SafeLocation, InfrastructureItem } from '@/types';

export interface ResponseTeam {
  id: string;
  name: string;
  type: string;
  membersCount: number;
  status: 'deployed' | 'active' | 'standby' | 'demobilized';
  assignedZone: string;
  lat: number;
  lon: number;
  contact: string;
}

export interface InfrastructureResponse {
  items: InfrastructureItem[];
  summary: Record<string, { total: number; atRisk: number }>;
  breakdown: { type: string; count: number; atRisk: number; icon: string; color: string }[];
}

export interface EvacuationPlanResponse {
  status: string;
  origin: { lat: number; lon: number };
  destination: SafeLocation & { distance_km: number };
  route_coordinates: [number, number][];
  estimated_travel_time_mins: number;
}

export const responseApi = {
  getTeams: () => api.get<ResponseTeam[]>('/api/response/teams'),
  updateTeamStatus: (id: string, status: string, assignedZone?: string) =>
    api.patch<ResponseTeam>(`/api/response/teams/${id}`, { status, assigned_zone: assignedZone }),
  getShelters: () => api.get<SafeLocation[]>('/api/response/shelters'),
  getInfrastructure: () => api.get<InfrastructureResponse>('/api/infrastructure'),
  evacuate: (lat: number, lon: number) => api.post<EvacuationPlanResponse>('/api/routing/evacuate', { lat, lon }),
};
