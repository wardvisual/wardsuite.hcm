export interface PunchDto {
  timezone?: string;
  source?: 'web' | 'mobile' | 'admin';
}

export interface AdminEditPunchDto {
  timestamp: string; // ISO string
  reason?: string;
}

export interface AdminPunchCorrectionDto {
  userId: string;
  punchId?: string;
  timestamp: string;
  punchType: 'IN' | 'OUT';
  reason?: string;
  isNew?: boolean;
}

export interface AdminDeletePunchDto {
  reason: string;
}

export interface GetAttendanceQuery {
  userId?: string;
  dateKey?: string;
  weekKey?: string;
  limit?: number;
  cursor?: string;
}

export interface GetReportQuery {
  dateKey?: string;
  weekKey?: string;
  userId?: string;
}
