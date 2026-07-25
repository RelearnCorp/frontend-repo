import { useEffect, useState } from "react";
import { tokenStore } from "@/services/http";

export type LiveDataStatus = "idle" | "loading" | "live" | "error";

export function useLiveData<T>(
  fetcher: () => Promise<T | null>,
  fallbackData: T,
) {
  const [data, setData] = useState<T>(fallbackData);
  const [status, setStatus] = useState<LiveDataStatus>("idle");

  useEffect(() => {
    if (!tokenStore.getAccessToken()) return;

    const abortController = new AbortController();

    // Deferred a tick so the "loading" transition happens in a promise
    // callback rather than synchronously in the effect body.
    Promise.resolve().then(() => {
      if (!abortController.signal.aborted) setStatus("loading");
    });

    fetcher()
      .then((res) => {
        if (abortController.signal.aborted) return;
        if (res) {
          setData(res);
          setStatus("live");
        } else {
          setStatus("idle");
        }
      })
      .catch(() => {
        if (!abortController.signal.aborted) setStatus("error");
      });

    return () => abortController.abort();
  }, [fetcher]);

  return { data, isLive: status === "live", status };
}
