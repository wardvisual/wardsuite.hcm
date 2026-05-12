import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '@web/lib/firebase';
import type { AttendancePunch, DailySummary } from '@web/modules/attendance/types/attendance.types';

// ── Generic real-time doc ────────────────────────────────────────────────────
export function useRealtimeDoc<T extends DocumentData>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(firestore, path);
    try {
      const unsub = onSnapshot(
        ref,
        (snap) => {
          setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as T) : null);
          setLoading(false);
        },
        (err) => {
          console.error('[firestore] doc error:', path, err);
          setLoading(false);
        },
      );
      return unsub;
    } catch (err) {
      console.error('[firestore] doc listen error:', path, err);
      setLoading(false);
      return;
    }
  }, [path]);

  return { data, loading };
}

// ── Today's punches (real-time) ──────────────────────────────────────────────
export function useTodayPunches(userId: string | null, dateKey: string) {
  const [data, setData] = useState<AttendancePunch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(firestore, 'attendance'),
      where('userId', '==', userId),
      where('dateKey', '==', dateKey),
      orderBy('timestamp', 'asc'),
    );
    try {
      const unsub = onSnapshot(
        q,
        (snap) => {
          setData(
            snap.docs
              .filter((d) => d.id !== '_schema')
              .map((d) => ({ id: d.id, ...d.data() } as unknown as AttendancePunch)),
          );
          setLoading(false);
        },
        (err) => {
          console.error('[firestore] today-punches error:', err);
          setLoading(false);
        },
      );
      return unsub;
    } catch (err) {
      console.error('[firestore] today-punches listen error:', err);
      setLoading(false);
      return;
    }
  }, [userId, dateKey]);

  return { data, loading };
}

// ── Daily summary (real-time) ────────────────────────────────────────────────
export function useDailySummaryRealtime(userId: string | null, dateKey: string) {
  const [data, setData] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(firestore, `dailySummary/${userId}_${dateKey}`);
    try {
      const unsub = onSnapshot(
        ref,
        (snap) => {
          setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as DailySummary) : null);
          setLoading(false);
        },
        (err) => {
          console.error('[firestore] daily-summary error:', err);
          setLoading(false);
        },
      );
      return unsub;
    } catch (err) {
      console.error('[firestore] daily-summary listen error:', err);
      setLoading(false);
      return;
    }
  }, [userId, dateKey]);

  return { data, loading };
}

// ── History (last N daily summaries, real-time) ──────────────────────────────
export function useHistoryRealtime(userId: string | null, limitCount = 30) {
  const [data, setData] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }
    if (!Number.isFinite(limitCount) || limitCount <= 0) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(firestore, 'dailySummary'),
      where('userId', '==', userId),
      orderBy('dateKey', 'desc'),
      limit(limitCount),
    );
    try {
      const unsub = onSnapshot(
        q,
        (snap) => {
          setData(
            snap.docs
              .filter((d) => d.id !== '_schema')
              .map((d) => ({ id: d.id, ...d.data() } as unknown as DailySummary)),
          );
          setLoading(false);
        },
        (err) => {
          console.error('[firestore] history error:', err);
          setLoading(false);
        },
      );
      return unsub;
    } catch (err) {
      console.error('[firestore] history listen error:', err);
      setLoading(false);
      return;
    }
  }, [userId, limitCount]);

  return { data, loading };
}

export { where, orderBy, limit };
