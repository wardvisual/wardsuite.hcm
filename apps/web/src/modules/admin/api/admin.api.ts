import { apiRequest } from '@web/services/api.service';
import { DailySummary } from '@web/modules/attendance';
import { WeeklySummary } from '../types/admin.types';

export const adminApi = {
  getDailyReport: (dateKey: string) =>
    apiRequest<DailySummary[]>(`/attendance/admin/daily-report?dateKey=${dateKey}`),

  getWeeklyReport: (weekKey: string) =>
    apiRequest<WeeklySummary[]>(
      `/attendance/admin/weekly-report?weekKey=${encodeURIComponent(weekKey)}`
    ),

  editPunch: (punchId: string, timestamp: string, reason?: string) =>
    apiRequest<{ id: string }>(`/attendance/punches/${punchId}`, {
      method: 'PATCH',
      body: { timestamp, reason },
    }),

  deletePunch: (punchId: string, reason: string) =>
    apiRequest<null>(`/attendance/punches/${punchId}`, {
      method: 'DELETE',
      body: { reason },
    }),

  getUsers: () => apiRequest<{ id: string; name: string; email: string; role: string; employeeCode: string; status: string; schedule: unknown }[]>('/users'),

  updateUser: (id: string, body: Record<string, unknown>) =>
    apiRequest<unknown>(`/users/${id}`, { method: 'PATCH', body }),
};
