import { api } from './client';
import type { ReportItem } from '@/types';

export const reportsApi = {
  getReports: () => api.get<ReportItem[]>('/api/reports'),
  generateReport: (title: string, type: string) =>
    api.post<ReportItem>('/api/reports/generate', { title, type }),
};
