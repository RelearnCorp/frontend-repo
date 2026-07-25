"use client";

import { useCallback, useSyncExternalStore } from "react";

import { authApi } from "@/services/api";
import type { ApiUser } from "@/types/api";

const listeners = new Set<() => void>();

// useSyncExternalStore requires a stable reference when the underlying data
// hasn't changed — JSON.parse-ing on every call would return a new object
// each render and trigger an infinite re-render loop.
let cachedRaw: string | null = null;
let cachedUser: ApiUser | null = null;

function getClientSnapshot(): ApiUser | null {
  const raw = localStorage.getItem("relearn.user");
  if (raw === cachedRaw) return cachedUser;

  cachedRaw = raw;
  try {
    cachedUser = raw ? (JSON.parse(raw) as ApiUser) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

function getServerSnapshot(): ApiUser | null {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

/** Client-side auth state backed by the backend's JWT session. */
export function useAuth() {
  const user = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem("relearn.user", JSON.stringify(data.user));
    emit();
    return data.user;
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      const data = await authApi.register({
        email,
        password,
        full_name: fullName,
      });
      localStorage.setItem("relearn.user", JSON.stringify(data.user));
      emit();
      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    localStorage.removeItem("relearn.user");
    emit();
  }, []);

  return { user, login, register, logout };
}
