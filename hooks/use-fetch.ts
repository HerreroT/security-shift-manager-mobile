import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { api, errorMessage } from '@/lib/api';

type FetchState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  /** Reloads showing the pull-to-refresh spinner. */
  refresh: () => void;
  /** Reloads silently (keeps the current data on screen). */
  reload: () => void;
};

/**
 * GETs an API path and reloads it every time the screen gets focus again, so lists are up to date
 * after creating or editing something in another screen. Pass null to skip the request.
 */
export function useFetch<T>(path: string | null): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(path !== null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRequestId = useRef(0);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      const requestId = ++lastRequestId.current;
      if (path === null) {
        setIsLoading(false);
        return;
      }
      if (mode === 'initial') setIsLoading(true);
      if (mode === 'refresh') setIsRefreshing(true);
      try {
        const result = await api.get<T>(path);
        // Ignore answers of older requests (e.g. the user changed the month quickly).
        if (requestId === lastRequestId.current) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        if (requestId === lastRequestId.current) {
          setError(errorMessage(e));
        }
      } finally {
        if (requestId === lastRequestId.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [path],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      void load('silent');
    }, [load]),
  );

  const refresh = useCallback(() => void load('refresh'), [load]);
  const reload = useCallback(() => void load('silent'), [load]);

  return { data, error, isLoading, isRefreshing, refresh, reload };
}
