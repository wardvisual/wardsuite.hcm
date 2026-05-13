import { apiRequest } from '@web/services/api.service';
import { AttendancePunch, AttendanceHistory, DailySummary } from '../types/attendance.types';

export interface AttendancePunchPage {
  items: AttendancePunch[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const attendanceApi = {
  punch: (timezone?: string) =>
    apiRequest.post<AttendancePunch>('/attendance/punch', { timezone, source: 'web' }),

  getTodayPunches: (timezone = 'Asia/Manila', limit?: number) => {
    const params = new URLSearchParams({ timezone });
    if (Number.isFinite(limit) && limit && limit > 0) {
      params.set('limit', String(limit));
    }
    return apiRequest.get<AttendancePunch[]>(`/attendance/today?${params.toString()}`);
  },

  getTodayPunchesPage: (timezone = 'Asia/Manila', limit = 20, cursor?: string | null) => {
    const params = new URLSearchParams({ timezone, limit: String(limit) });
    if (cursor) {
      params.set('cursor', cursor);
    }
    return apiRequest.getResponse<AttendancePunch[]>(`/attendance/today/page?${params.toString()}`)
      .then((response) => ({
        items: response.data,
        nextCursor: (response.meta?.nextCursor as string | null) ?? null,
        hasMore: Boolean(response.meta?.hasMore),
      }) satisfies AttendancePunchPage);
  },

  getEmployeePunchesPage: (userId: string, limit = 20, cursor?: string | null) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
      params.set('cursor', cursor);
    }
    return apiRequest.getResponse<AttendancePunch[]>(`/attendance/admin/employees/${userId}/punches/page?${params.toString()}`)
      .then((response) => ({
        items: response.data,
        nextCursor: (response.meta?.nextCursor as string | null) ?? null,
        hasMore: Boolean(response.meta?.hasMore),
      }) satisfies AttendancePunchPage);
  },

  getDailySummary: (dateKey: string) =>
    apiRequest.get<DailySummary | null>(`/attendance/daily-summary/${dateKey}`),

  getHistory: (limit = 30) =>
    apiRequest.get<DailySummary[]>(`/attendance/history?limit=${limit}`),

  getPunchHistory: (punchId: string) =>
    apiRequest.get<AttendanceHistory[]>(`/attendance/punches/${punchId}/history`),

  adminEditPunch: (punchId: string, timestamp: string, reason?: string) =>
    apiRequest.patch<AttendancePunch>(`/attendance/punches/${punchId}`, { timestamp, reason }),

  adminDeletePunch: (punchId: string, reason: string) =>
    apiRequest.delete<null>(`/attendance/punches/${punchId}`, { reason }),

  getAdminDailyReport: (dateKey: string) =>
    apiRequest.get<DailySummary[]>(`/attendance/admin/daily-report?dateKey=${dateKey}`),

  getAdminWeeklyReport: (weekKey: string) =>
    apiRequest.get<DailySummary[]>(`/attendance/admin/weekly-report?weekKey=${encodeURIComponent(weekKey)}`),
};
