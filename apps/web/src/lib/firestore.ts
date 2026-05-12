import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import { firestore } from '@web/lib/firebase';

export function useRealtimeDoc<T extends DocumentData>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    const ref = doc(firestore, path);
    const unsub = onSnapshot(ref, (snap) => {
      setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null);
      setLoading(false);
    });
    return unsub;
  }, [path]);

  return { data, loading };
}

export function useRealtimeQuery<T extends DocumentData>(
  collectionPath: string | null,
  constraints: QueryConstraint[]
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  // Serialize constraints to a stable key so the effect only re-runs when the query actually changes
  const keyRef = useRef('');
  const newKey = collectionPath + JSON.stringify(constraints.map((c) => c.type));

  useEffect(() => {
    if (!collectionPath) {
      setLoading(false);
      return;
    }
    keyRef.current = newKey;
    const q = query(collection(firestore, collectionPath), ...constraints);
    const unsub = onSnapshot(q, (snap) => {
      setData(
        snap.docs
          .filter((d) => d.id !== '__schema__')
          .map((d) => ({ id: d.id, ...d.data() } as T))
      );
      setLoading(false);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newKey]);

  return { data, loading };
}

// Convenience: real-time today's punches for a user
export function useTodayPunches<T extends DocumentData>(userId: string | null, dateKey: string) {
  return useRealtimeQuery<T>(userId ? 'attendance' : null, [
    where('userId', '==', userId ?? ''),
    where('dateKey', '==', dateKey),
    orderBy('timestamp', 'asc'),
  ]);
}

// Convenience: real-time daily summary doc
export function useDailySummaryRealtime<T extends DocumentData>(
  userId: string | null,
  dateKey: string
) {
  return useRealtimeDoc<T>(userId ? `dailySummary/${userId}_${dateKey}` : null);
}

// Convenience: real-time history (last N daily summaries)
export function useHistoryRealtime<T extends DocumentData>(
  userId: string | null,
  limitCount = 30
) {
  return useRealtimeQuery<T>(userId ? 'dailySummary' : null, [
    where('userId', '==', userId ?? ''),
    orderBy('dateKey', 'desc'),
    limit(limitCount),
  ]);
}

export { where, orderBy, limit };
