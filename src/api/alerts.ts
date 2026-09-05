import { api } from './client';
import type { AlertLevel } from '@/types';

export interface AlertItem {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  region: string;
  eta: string;
  status: 'pending_approval' | 'approved' | 'broadcasted' | 'archived';
  approvedBy?: string;
  approvedAt?: string;
  broadcastedAt?: string;
  createdAt: string;
  time: string;
}

export const alertsApi = {
  getAlerts: () => api.get<AlertItem[]>('/api/alerts'),
  getAlertById: (id: string) => api.get<AlertItem>(`/api/alerts/${id}`),
  createAlert: (data: { level: AlertLevel; title: string; description: string; region?: string; eta?: string }) =>
    api.post<AlertItem>('/api/alerts', data),
  approveAlert: (id: string, approvedBy: string = 'Disaster Management Officer') =>
    api.post<AlertItem>(`/api/alerts/${id}/approve`, { approved_by: approvedBy }),
  broadcastAlert: (id: string) => api.post<AlertItem>(`/api/alerts/${id}/broadcast`),
};
