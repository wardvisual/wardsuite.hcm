import { BarChart3, Clock, Moon, TrendingUp } from 'lucide-react';

export const FEATURES = [
    {
        Icon: Clock,
        iconBg: 'bg-[#f5f5f5]',
        iconColor: 'text-[#111111]',
        title: 'Real-Time Punch Tracking',
        description:
            'Employees punch in and out with a single tap. Every action is timestamped and synced instantly to the attendance log.',
    },
    {
        Icon: TrendingUp,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        title: 'Overtime Calculation',
        description:
            'Automatically compute regular hours and overtime beyond the scheduled shift — no manual math required.',
    },
    {
        Icon: Moon,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        title: 'Night Differential',
        description:
            'Hours worked between 22:00 and 06:00 are tracked separately and flagged for night differential pay.',
    },
    {
        Icon: BarChart3,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        title: 'Admin Reports',
        description:
            'Managers get a full view of team attendance, punch corrections, and daily summaries — all in one panel.',
    },
] as const;

export const STEPS = [
    {
        step: '01',
        title: 'Punch In',
        description:
            'Start your shift with one tap. The system records your exact time-in and begins computing your hours.',
    },
    {
        step: '02',
        title: 'Work Your Shift',
        description:
            'Regular time, overtime, and night differential are computed automatically in real time.',
    },
    {
        step: '03',
        title: 'Review Your Summary',
        description:
            'Check daily KPIs, your punch timeline, and weekly attendance chart right on your dashboard.',
    },
] as const;

export const MOCK_PUNCHES = [
    { id: 1, type: 'IN' as const, time: '08:02 AM' },
    { id: 2, type: 'OUT' as const, time: '12:00 PM' },
    { id: 3, type: 'IN' as const, time: '01:00 PM' },
    { id: 4, type: 'OUT' as const, time: '05:01 PM' },
] as const;

export const MOCK_KPIS = [
    { label: 'Worked', value: '7h 59m', bg: 'bg-[#f5f5f5]' },
    { label: 'Overtime', value: '0h 30m', bg: 'bg-emerald-50' },
    { label: 'Night Diff', value: '1h 00m', bg: 'bg-blue-50' },
    { label: 'Late / UT', value: '0m / 0m', bg: 'bg-amber-50' },
] as const;

export const STATS = [
    { value: 'Real-time', label: 'Punch Sync' },
    { value: 'OT + ND', label: 'Auto-computed' },
    { value: '22:00–06:00', label: 'Night Differential' },
    { value: 'RBAC', label: 'Admin & Employee Roles' },
] as const;

export const TRUST_BADGES = [
    'Real-time punch sync',
    'OT & Night Diff auto-calc',
    'Admin & Employee roles',
] as const;

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
