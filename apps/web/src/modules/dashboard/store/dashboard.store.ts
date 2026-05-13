import { create } from 'zustand';
import type { AttendancePunch, DailySummary, WeeklySummary } from '@web/modules/attendance';
import { getCurrentWeekKey, getTodayKey } from '@web/lib/utils';

type ReportMode = 'daily' | 'weekly';

export interface ReportsState {
    mode: ReportMode;
    dateKey: string;
    weekKey: string;
    dailyData: DailySummary[];
    weeklyData: WeeklySummary[];
    loading: boolean;
    error: string | null;
}

export type ReportsAction =
    | { type: 'SET_MODE'; mode: ReportMode }
    | { type: 'SET_DATE'; dateKey: string }
    | { type: 'SET_WEEK'; weekKey: string }
    | { type: 'SET_DAILY_DATA'; data: DailySummary[] }
    | { type: 'SET_WEEKLY_DATA'; data: WeeklySummary[] }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'SET_ERROR'; error: string | null };

export interface PunchesState {
    punches: AttendancePunch[];
    loading: boolean;
    error: string | null;
    saving: boolean;
    editTarget: AttendancePunch | null;
    deleteTarget: AttendancePunch | null;
    historyTarget: AttendancePunch | null;
    editTimestamp: string;
    editReason: string;
    deleteReason: string;
    history: AttendancePunch[];
    historyLoading: boolean;
}

export type PunchesAction =
    | { type: 'SET_PUNCHES'; punches: AttendancePunch[] }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'SET_ERROR'; error: string | null }
    | { type: 'SET_SAVING'; saving: boolean }
    | { type: 'OPEN_EDIT'; target: AttendancePunch; timestamp: string }
    | { type: 'CLOSE_EDIT' }
    | { type: 'OPEN_DELETE'; target: AttendancePunch }
    | { type: 'CLOSE_DELETE' }
    | { type: 'OPEN_HISTORY'; target: AttendancePunch }
    | { type: 'CLOSE_HISTORY' }
    | { type: 'SET_EDIT_TIMESTAMP'; value: string }
    | { type: 'SET_EDIT_REASON'; value: string }
    | { type: 'SET_DELETE_REASON'; value: string }
    | { type: 'SET_HISTORY'; history: AttendancePunch[] }
    | { type: 'SET_HISTORY_LOADING'; loading: boolean };

function reportsReducer(state: ReportsState, action: ReportsAction): ReportsState {
    switch (action.type) {
        case 'SET_MODE':
            return { ...state, mode: action.mode };
        case 'SET_DATE':
            return { ...state, dateKey: action.dateKey };
        case 'SET_WEEK':
            return { ...state, weekKey: action.weekKey };
        case 'SET_DAILY_DATA':
            return { ...state, dailyData: action.data };
        case 'SET_WEEKLY_DATA':
            return { ...state, weeklyData: action.data };
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        case 'SET_ERROR':
            return { ...state, error: action.error };
        default:
            return state;
    }
}

function punchesReducer(state: PunchesState, action: PunchesAction): PunchesState {
    switch (action.type) {
        case 'SET_PUNCHES':
            return { ...state, punches: action.punches };
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        case 'SET_ERROR':
            return { ...state, error: action.error };
        case 'SET_SAVING':
            return { ...state, saving: action.saving };
        case 'OPEN_EDIT':
            return {
                ...state,
                editTarget: action.target,
                editTimestamp: action.timestamp,
                editReason: '',
            };
        case 'CLOSE_EDIT':
            return { ...state, editTarget: null, editTimestamp: '', editReason: '' };
        case 'OPEN_DELETE':
            return { ...state, deleteTarget: action.target, deleteReason: '' };
        case 'CLOSE_DELETE':
            return { ...state, deleteTarget: null, deleteReason: '' };
        case 'OPEN_HISTORY':
            return { ...state, historyTarget: action.target, history: [] };
        case 'CLOSE_HISTORY':
            return { ...state, historyTarget: null, history: [] };
        case 'SET_EDIT_TIMESTAMP':
            return { ...state, editTimestamp: action.value };
        case 'SET_EDIT_REASON':
            return { ...state, editReason: action.value };
        case 'SET_DELETE_REASON':
            return { ...state, deleteReason: action.value };
        case 'SET_HISTORY':
            return { ...state, history: action.history };
        case 'SET_HISTORY_LOADING':
            return { ...state, historyLoading: action.loading };
        default:
            return state;
    }
}

interface DashboardStore {
    reports: ReportsState;
    punches: PunchesState;
    dispatchReports: (action: ReportsAction) => void;
    dispatchPunches: (action: PunchesAction) => void;
    resetDashboard: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    reports: {
        mode: 'daily',
        dateKey: getTodayKey(),
        weekKey: getCurrentWeekKey(),
        dailyData: [],
        weeklyData: [],
        loading: false,
        error: null,
    },
    punches: {
        punches: [],
        loading: false,
        error: null,
        saving: false,
        editTarget: null,
        deleteTarget: null,
        historyTarget: null,
        editTimestamp: '',
        editReason: '',
        deleteReason: '',
        history: [],
        historyLoading: false,
    },
    dispatchReports: (action) => set({ reports: reportsReducer(get().reports, action) }),
    dispatchPunches: (action) => set({ punches: punchesReducer(get().punches, action) }),
    resetDashboard: () => set({
        reports: {
            mode: 'daily',
            dateKey: getTodayKey(),
            weekKey: getCurrentWeekKey(),
            dailyData: [],
            weeklyData: [],
            loading: false,
            error: null,
        },
        punches: {
            punches: [],
            loading: false,
            error: null,
            saving: false,
            editTarget: null,
            deleteTarget: null,
            historyTarget: null,
            editTimestamp: '',
            editReason: '',
            deleteReason: '',
            history: [],
            historyLoading: false,
        },
    }),
}));

export type { ReportMode };
