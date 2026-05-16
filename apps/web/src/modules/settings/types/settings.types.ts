export interface ScheduleSettings {
  start: string;
  end: string;
  breakMinutes: number;
  graceMinutes: number;
}

export interface UpdateProfilePayload {
  name?: string;
  timezone?: string;
  schedule?: Partial<ScheduleSettings>;
  canPunch?: boolean;
}
