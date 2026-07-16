'use client';

import { useEffect, useRef, useState } from 'react';

interface UsePendingApprovalsOptions {
  /** ?range= value forwarded to the API. Defaults to 'all'. */
  range?: string;
  /** Poll interval in milliseconds. Defaults to 60 000 (60 s). */
  intervalMs?: number;
}

interface UsePendingApprovalsResult {
  count: number;
  isLoading: boolean;
}

/**
 * usePendingApprovals
 *
 * Fetches /api/assets/pending-approvals and polls on a configurable interval.
 * Uses native fetch — no SWR / React Query dependency needed.
 *
 * @example
 *   const { count } = usePendingApprovals({ range: 'month' });
 */
export function usePendingApprovals({
  range,
  intervalMs = 60_000,
}: UsePendingApprovalsOptions = {}): UsePendingApprovalsResult {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        const url = `/api/assets/pending-approvals${range && range !== 'all' ? `?range=${encodeURIComponent(range)}` : ''}`;
        const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });

        if (!res.ok) return;
        const json = await res.json();
        if (mounted && typeof json?.count === 'number') {
          setCount(json.count);
        }
      } catch {
        // ignore AbortError and network errors silently
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    const timer = setInterval(load, intervalMs);

    return () => {
      mounted = false;
      clearInterval(timer);
      abortRef.current?.abort();
    };
  }, [range, intervalMs]);

  return { count, isLoading };
}
