"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/services/http";

export type ApiDataStatus = "loading" | "success" | "error";

/**
 * Fetches real data on mount/fetcher-change with no invented fallback —
 * callers render explicit loading/error/empty states instead of masking a
 * failed or empty response with placeholder numbers. `fetcher` must be
 * referentially stable (wrap it in `useCallback` at the call site) so this
 * doesn't refetch on every render.
 */
export function useApiData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ApiDataStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    // Deferred a tick so this doesn't set state synchronously from within
    // the effect that calls it on mount/fetcher-change.
    Promise.resolve().then(() => {
      setStatus("loading");
      setError(null);
    });
    fetcher()
      .then((res) => {
        setData(res);
        setStatus("success");
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't reach the server. Please try again.",
        );
        setStatus("error");
      });
  }, [fetcher]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, status, error, refetch };
}
