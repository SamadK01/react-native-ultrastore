/**
 * useUltraQuery — Persistent Async Data Fetching + Caching
 * The only React Native hook that caches API data in MMKV (survives app restarts)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { defaultStorage, StorageEngine } from '../storage';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UltraQueryOptions<T> {
  /** Time in ms before cached data is considered stale. Default: 5 minutes */
  staleTime?: number;
  /** Time in ms before cache is deleted entirely. Default: 10 minutes */
  cacheTime?: number;
  /** Refetch when component mounts, even if cache is fresh. Default: false */
  refetchOnMount?: boolean;
  /** Called when fetch succeeds */
  onSuccess?: (data: T) => void;
  /** Called when fetch fails */
  onError?: (error: Error) => void;
  /** Custom storage instance */
  storage?: StorageEngine;
  /** Disable the query from running. Default: false */
  enabled?: boolean;
}

export interface UltraQueryResult<T> {
  data: T | undefined;
  error: Error | undefined;
  status: QueryStatus;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  isStale: boolean;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

interface CachedEntry<T> {
  data: T;
  fetchedAt: number;
}

const CACHE_META_SUFFIX = '__ultraquery_meta';

/**
 * Persistent async data fetching hook backed by MMKV.
 * Unlike React Query / SWR, cache survives app restarts.
 *
 * @param queryKey - Unique cache key (stored in MMKV)
 * @param fetcher - Async function that returns data
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useUltraQuery(
 *   'user_profile',
 *   () => fetch('https://api.example.com/user').then(r => r.json()),
 *   { staleTime: 60_000 }
 * );
 * ```
 */
export function useUltraQuery<T>(
  queryKey: string,
  fetcher: () => Promise<T>,
  options: UltraQueryOptions<T> = {}
): UltraQueryResult<T> {
  const {
    staleTime = 5 * 60 * 1000,
    cacheTime = 10 * 60 * 1000,
    refetchOnMount = false,
    onSuccess,
    onError,
    storage = defaultStorage,
    enabled = true,
  } = options;

  const cacheKey = `__ultraquery__${queryKey}`;
  const metaKey = `${cacheKey}${CACHE_META_SUFFIX}`;

  const getCachedEntry = (): CachedEntry<T> | undefined => {
    return storage.get<CachedEntry<T>>(cacheKey);
  };

  const isStaleNow = (): boolean => {
    const entry = getCachedEntry();
    if (!entry) return true;
    return Date.now() - entry.fetchedAt > staleTime;
  };

  const [data, setData] = useState<T | undefined>(() => getCachedEntry()?.data);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [status, setStatus] = useState<QueryStatus>(() => {
    const entry = getCachedEntry();
    return entry ? 'success' : 'idle';
  });
  const [isFetching, setIsFetching] = useState(false);
  const [isStale, setIsStale] = useState(isStaleNow);

  const isMounted = useRef(true);
  const cacheTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleCacheEviction = useCallback(() => {
    if (cacheTimerRef.current) clearTimeout(cacheTimerRef.current);
    cacheTimerRef.current = setTimeout(() => {
      storage.delete(cacheKey);
      storage.delete(metaKey);
    }, cacheTime);
  }, [cacheKey, metaKey, cacheTime, storage]);

  const execute = useCallback(async () => {
    if (!enabled) return;
    setIsFetching(true);
    if (status === 'idle') setStatus('loading');

    try {
      const result = await fetcher();
      if (!isMounted.current) return;

      const entry: CachedEntry<T> = { data: result, fetchedAt: Date.now() };
      storage.set(cacheKey, entry);

      setData(result);
      setError(undefined);
      setStatus('success');
      setIsStale(false);
      onSuccess?.(result);
      scheduleCacheEviction();
    } catch (err) {
      if (!isMounted.current) return;
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      setStatus('error');
      onError?.(e);
    } finally {
      if (isMounted.current) setIsFetching(false);
    }
  }, [enabled, fetcher, cacheKey, storage, status, onSuccess, onError, scheduleCacheEviction]);

  const invalidate = useCallback(() => {
    storage.delete(cacheKey);
    storage.delete(metaKey);
    setIsStale(true);
  }, [cacheKey, metaKey, storage]);

  useEffect(() => {
    isMounted.current = true;

    if (!enabled) return;

    const entry = getCachedEntry();
    const stale = isStaleNow();

    if (!entry || stale || refetchOnMount) {
      execute();
    } else {
      scheduleCacheEviction();
    }

    return () => {
      isMounted.current = false;
      if (cacheTimerRef.current) clearTimeout(cacheTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, enabled]);

  return {
    data,
    error,
    status,
    isLoading: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'success',
    isFetching,
    isStale,
    refetch: execute,
    invalidate,
  };
}
